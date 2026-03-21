# features.py
# ─────────────────────────────────────────────────────────
# Pure feature engineering — no FastAPI, no HTTP calls.
# Takes the raw data objects fetched by clients.py and
# produces a pandas DataFrame ready to feed into the model.
#
# The column names and order here MUST match exactly what
# was used in training_data.csv. The model.pkl stores the
# feature list — we validate against it in main.py.
#
# "Pure functions" means: same input always gives same output,
# no side effects, no network calls. This makes it easy to
# unit test independently.
# ─────────────────────────────────────────────────────────

import pandas as pd
from typing import List, Tuple, Optional

from Shemas import ShipmentData, BidData, DriverData, VehicleData


def compute_on_time_rate(driver: DriverData) -> float:
    """
    on_time_rate = completed / (completed + delayed)
    Guards against division by zero — if driver has no trips,
    return 0.5 as a neutral default (neither good nor bad).
    """
    total = driver.totalCompletedTrips + driver.totalDelayedTrips
    if total == 0:
        return 0.5
    return driver.totalCompletedTrips / total


def compute_cancellation_rate(driver: DriverData) -> float:
    """
    cancellation_rate = cancelled / accepted
    Guards against division by zero.
    """
    if driver.totalAcceptedTrips == 0:
        return 0.0
    return driver.totalCancelledTrips / driver.totalAcceptedTrips


def compute_cargo_type_match(
    vehicle: VehicleData,
    shipment: ShipmentData,
) -> int:
    """
    Returns 1 if the vehicle can physically handle this cargo.
    Returns 0 if there is a mismatch (e.g. non-refrigerated
    truck bidding on a perishable shipment).
    """
    if shipment.requiresRefrigeration and not vehicle.isRefrigerated:
        return 0
    if shipment.isHazardous and not vehicle.isHazardousSupported:
        return 0
    return 1


def compute_capacity_ratio(
    vehicle: VehicleData,
    shipment: ShipmentData,
) -> float:
    """
    capacity_ratio = vehicle capacity / shipment weight
    A ratio of 2.0 means the vehicle can carry twice the
    shipment weight — comfortable headroom.
    Guards against division by zero.
    """
    if shipment.weightKg == 0:
        return 1.0
    return vehicle.capacityKg / shipment.weightKg


def compute_bid_to_budget_ratio(
    bid: BidData,
    shipment: ShipmentData,
) -> float:
    """
    bid_to_budget_ratio = bid amount / shipment budget
    < 1.0 means driver bid under budget (good for company)
    > 1.0 means driver bid over budget
    Guards against zero budget.
    """
    if shipment.budgetAmount == 0:
        return 1.0
    return bid.bidAmount / shipment.budgetAmount


def build_feature_row(
    bid: BidData,
    driver: DriverData,
    vehicle: VehicleData,
    shipment: ShipmentData,
) -> dict:
    """
    Builds one feature dictionary for a single (bid, driver) pair.
    This becomes one row in the feature matrix.

    Column names must exactly match training_data.csv.
    Order doesn't matter here — we reorder to match training
    columns in build_feature_matrix() below.
    """
    priority = shipment.priorityType  # "SAFETY", "SPEED", or "COST"

    return {
        # Driver features
        "rating_average":        driver.ratingAverage,
        "experience_years":      driver.experienceYears,
        "on_time_rate":          compute_on_time_rate(driver),
        "cancellation_rate":     compute_cancellation_rate(driver),
        "incident_count":        driver.incidentCount,
        "total_completed":       driver.totalCompletedTrips,
        "vehicle_age_years":     vehicle.vehicleAgeYears,

        # Compatibility features
        "bid_to_budget_ratio":      compute_bid_to_budget_ratio(bid, shipment),
        "capacity_ratio":           compute_capacity_ratio(vehicle, shipment),
        "cargo_type_match":         compute_cargo_type_match(vehicle, shipment),
        "estimated_delivery_days":  bid.estimatedDeliveryDays,

        # Priority one-hot encoding
        # Same as training: three binary columns, exactly one is 1
        "priority_safety": 1 if priority == "SAFETY" else 0,
        "priority_speed":  1 if priority == "SPEED"  else 0,
        "priority_cost":   1 if priority == "COST"   else 0,
    }


def build_feature_matrix(
    bids: List[BidData],
    driver_vehicle_map: dict,   # { driver_id: (DriverData, VehicleData) }
    shipment: ShipmentData,
    model_feature_columns: List[str],
) -> Tuple[pd.DataFrame, List[str]]:
    """
    Main function called by main.py.

    Takes all the fetched data, builds one row per valid bid,
    and returns a DataFrame with columns in the exact order
    the model expects.

    Also returns the list of driver_ids in the same order as
    the rows — needed to match model scores back to drivers.

    Skips bids where driver or vehicle data is missing
    (fetch failed in clients.py).

    model_feature_columns comes from model.pkl — it's the
    authoritative column order from training time.
    """
    rows = []
    valid_driver_ids = []

    for bid in bids:
        driver_id = bid.driverId

        # Skip if we couldn't fetch this driver's data
        if driver_id not in driver_vehicle_map:
            continue

        driver, vehicle = driver_vehicle_map[driver_id]

        # Skip if driver or vehicle fetch failed
        if driver is None or vehicle is None:
            continue

        row = build_feature_row(bid, driver, vehicle, shipment)
        rows.append(row)
        valid_driver_ids.append(driver_id)

    if not rows:
        # No valid bids — return empty DataFrame
        return pd.DataFrame(columns=model_feature_columns), []

    # Build DataFrame and reorder columns to match training exactly
    # This is critical — wrong column order = garbage predictions
    df = pd.DataFrame(rows)
    df = df[model_feature_columns]  # reorder to match model

    return df, valid_driver_ids