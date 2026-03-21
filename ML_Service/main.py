# main.py
# ─────────────────────────────────────────────────────────
# FastAPI application entry point.
# This file only wires things together — it doesn't contain
# business logic, HTTP call details, or feature math.
# Those live in clients.py, features.py respectively.
#
# To run:
#   uvicorn main:app --reload --port 8000
#
# --reload means: restart automatically when you save a file.
# Use this during development, remove it in production.
# ─────────────────────────────────────────────────────────

import joblib
import logging
from contextlib import asynccontextmanager
from typing import List

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from Shemas import RecommendRequest, RecommendResponse, DriverRecommendation
from Clients import fetch_shipment_and_bids, fetch_all_drivers_and_vehicles
from feature import build_feature_matrix

# ── Logging setup ─────────────────────────────────────────
# Python's built-in logger — prints to console with timestamps.
# In Spring Boot you'd use @Slf4j — this is the equivalent.
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s  %(levelname)s  %(message)s",
)
log = logging.getLogger(__name__)


# ── Model state ───────────────────────────────────────────
# We store the model here at module level so it's loaded
# once when the server starts, not on every request.
# Loading model.pkl on every request would be very slow.
#
# This is a plain dict — we'll populate it in the lifespan
# function below.
ml = {
    "model":    None,
    "features": None,  # list of column names in training order
    "roc_auc":  None,
}


# ── Lifespan: startup and shutdown logic ──────────────────
# @asynccontextmanager is FastAPI's way of running code at
# startup (before first request) and shutdown (on Ctrl+C).
# In Spring Boot you'd use @PostConstruct or ApplicationRunner.
#
# Everything before 'yield' runs at startup.
# Everything after 'yield' runs at shutdown.
@asynccontextmanager
async def lifespan(app: FastAPI):
    # ── STARTUP ───────────────────────────────────────────
    log.info("Loading model.pkl...")
    try:
        data = joblib.load("model.pkl")
        ml["model"]    = data["model"]
        ml["features"] = data["features"]
        ml["roc_auc"]  = data["roc_auc"]
        log.info(f"Model loaded. ROC-AUC = {ml['roc_auc']}")
        log.info(f"Feature columns ({len(ml['features'])}): {ml['features']}")
    except FileNotFoundError:
        # If model.pkl is missing the server still starts,
        # but every /api/recommend call will return a 503.
        log.error("model.pkl not found — place it in the same folder as main.py")

    yield  # server is now running and accepting requests

    # ── SHUTDOWN ──────────────────────────────────────────
    log.info("Shutting down ML Service")


# ── FastAPI app ───────────────────────────────────────────
app = FastAPI(
    title="FreightIQ ML Service",
    description="Driver recommendation engine for freight shipments",
    version="1.0.0",
    lifespan=lifespan,
)

# ── CORS middleware ───────────────────────────────────────
# Allows your React frontend (localhost:5173) to call this
# service directly from the browser.
# Without this, the browser blocks cross-origin requests.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # React dev server
    allow_methods=["POST", "GET"],
    allow_headers=["*"],
)


# ── Health check endpoint ─────────────────────────────────
# GET /health → { "status": "ok", "model_loaded": true }
# Useful to verify the service is up before debugging issues.
# Your Spring Boot services have similar actuator endpoints.
@app.get("/health")
async def health():
    return {
        "status":       "ok",
        "model_loaded": ml["model"] is not None,
        "roc_auc":      ml["roc_auc"],
    }


# ── Main recommendation endpoint ─────────────────────────
@app.post("/api/recommend", response_model=RecommendResponse)
async def recommend(request: RecommendRequest):
    """
    Given a shipmentId, fetches all pending bids, fetches
    driver + vehicle data for each bidder, builds the feature
    matrix, runs the model, and returns the top 3 drivers
    ranked by their predicted suitability score.
    """

    # Guard: model must be loaded
    if ml["model"] is None:
        raise HTTPException(
            status_code=503,
            detail="ML model not loaded. Check that model.pkl exists.",
        )

    shipment_id = request.shipmentId
    log.info(f"Recommendation request for shipment: {shipment_id}")

    # ── Step 1: Fetch shipment + all pending bids (parallel) ──
    # Both calls only need shipment_id, so they run simultaneously.
    try:
        shipment, bids = await fetch_shipment_and_bids(shipment_id)
    except Exception as e:
        log.error(f"Failed to fetch shipment/bids: {e}")
        raise HTTPException(
            status_code=502,
            detail=f"Could not reach Shipment Service: {str(e)}",
        )

    log.info(f"Shipment fetched. Pending bids: {len(bids)}")

    # Guard: need at least 1 bid to score
    if not bids:
        raise HTTPException(
            status_code=404,
            detail=f"No pending bids found for shipment {shipment_id}",
        )

    # ── Step 2: Fetch all drivers + vehicles (parallel) ───────
    # Extract unique driver IDs from bids first.
    # Then fire all driver/vehicle fetches simultaneously.
    driver_ids = list({bid.driverId for bid in bids})  # deduplicate

    try:
        driver_vehicle_results = await fetch_all_drivers_and_vehicles(driver_ids)
    except Exception as e:
        log.error(f"Failed to fetch driver data: {e}")
        raise HTTPException(
            status_code=502,
            detail=f"Could not reach User Service: {str(e)}",
        )

    # Build a dict for O(1) lookup: { driver_id: (driver, vehicle) }
    # This is used in features.py to build each row efficiently
    driver_vehicle_map = {
        driver_id: (driver, vehicle)
        for driver_id, driver, vehicle in driver_vehicle_results
    }

    log.info(f"Driver data fetched. Valid drivers: {len(driver_vehicle_map)}")

    # ── Step 3: Build feature matrix ──────────────────────────
    # features.py combines all the fetched data into a DataFrame.
    # Rows = one per valid bid. Columns = 14 features in training order.
    feature_matrix, valid_driver_ids = build_feature_matrix(
        bids=bids,
        driver_vehicle_map=driver_vehicle_map,
        shipment=shipment,
        model_feature_columns=ml["features"],
    )

    log.info(f"Feature matrix shape: {feature_matrix.shape}")

    # Guard: need at least 1 valid row to score
    if feature_matrix.empty:
        raise HTTPException(
            status_code=422,
            detail="Could not build features — driver or vehicle data missing for all bids",
        )

    # ── Step 4: Model prediction ───────────────────────────────
    # predict_proba returns shape (N, 2):
    #   column 0 = probability of NOT being selected
    #   column 1 = probability of being selected ← we want this
    #
    # We pass the whole matrix at once — XGBoost scores all N
    # drivers in a single call, not one by one.
    scores = ml["model"].predict_proba(feature_matrix)[:, 1]

    log.info(f"Scores computed. Range: {scores.min():.3f} – {scores.max():.3f}")

    # ── Step 5: Sort and return top 3 ─────────────────────────
    # zip scores with their driver IDs, sort descending by score.
    # Take top 3 — or all of them if fewer than 3 bids exist.
    scored = sorted(
        zip(valid_driver_ids, scores),
        key=lambda x: x[1],
        reverse=True,
    )

    top_n = scored[:3]  # slice top 3 (or all if len < 3)

    recommendations: List[DriverRecommendation] = [
        DriverRecommendation(
            driverId=driver_id,
            score=round(float(score * 100), 1),  # 0–100 scale
            rank=rank,
        )
        for rank, (driver_id, score) in enumerate(top_n, start=1)
    ]

    log.info(
        f"Top {len(recommendations)} drivers: "
        + ", ".join(f"{r.driverId}={r.score}" for r in recommendations)
    )

    return RecommendResponse(
        shipmentId=shipment_id,
        recommendations=recommendations,
        totalBidsEvaluated=len(valid_driver_ids),
    )