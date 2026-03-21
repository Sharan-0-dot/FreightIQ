# schemas.py
# ─────────────────────────────────────────────────────────
# Pydantic models — these are exactly like DTOs in Spring Boot.
# FastAPI uses these to validate incoming requests and to
# serialize outgoing responses automatically.
#
# Pydantic also gives you automatic error responses if the
# request body is missing a field or has the wrong type —
# just like @Valid in Spring Boot.
# ─────────────────────────────────────────────────────────

from pydantic import BaseModel
from typing import List


# ── Inbound ──────────────────────────────────────────────

class RecommendRequest(BaseModel):
    """
    What the React frontend sends.
    Just the shipmentId — FastAPI fetches everything else.
    """
    shipmentId: str


# ── What we receive from Shipment Service ────────────────

class ShipmentData(BaseModel):
    """
    Mirrors the Shipment entity from your Spring Boot
    Shipment Service. Only the fields we actually need.
    We use 'None' defaults for optional fields so the
    model doesn't crash if a field is missing.
    """
    id: str
    companyId: str
    weightKg: float
    budgetAmount: float
    priorityType: str        # "SAFETY", "SPEED", or "COST"
    requiresRefrigeration: bool = False
    isHazardous: bool = False
    fragile: bool = False
    cargoType: str = "GENERAL"
    distanceKm: float = 500.0


class BidData(BaseModel):
    """
    Mirrors the Bid entity from Shipment Service.
    Only PENDING bids should be scored.
    """
    id: str
    shipmentId: str
    driverId: str
    bidAmount: float
    estimatedDeliveryDays: float
    status: str              # we filter to PENDING only


# ── What we receive from User Service ────────────────────

class DriverData(BaseModel):
    """
    Mirrors the Driver entity from User Service.
    """
    id: str
    ratingAverage: float = 0.0
    experienceYears: int = 0
    totalCompletedTrips: int = 0
    totalAcceptedTrips: int = 0
    totalCancelledTrips: int = 0
    totalDelayedTrips: int = 0
    incidentCount: int = 0


class VehicleData(BaseModel):
    """
    Mirrors the Vehicle entity from User Service.
    A driver may have multiple vehicles — we take the first one.
    In a future version you'd let the driver select which
    vehicle they're using for a specific bid.
    """
    id: str
    driverId: str
    capacityKg: float
    vehicleAgeYears: int = 0
    isRefrigerated: bool = False
    isHazardousSupported: bool = False
    vehicleType: str = "TRUCK_14FT"


# ── Outbound ─────────────────────────────────────────────

class DriverRecommendation(BaseModel):
    """
    One entry in the recommendation response.
    score is 0–100 (probability × 100, rounded to 1 decimal).
    """
    driverId: str
    score: float
    rank: int


class RecommendResponse(BaseModel):
    """
    The full response back to React.
    recommendations is a list of top 3 (or fewer if < 3 bids).
    shipmentId is echoed back so the frontend can verify.
    """
    shipmentId: str
    recommendations: List[DriverRecommendation]
    totalBidsEvaluated: int