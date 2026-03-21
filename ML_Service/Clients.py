# clients.py
# ─────────────────────────────────────────────────────────
# All HTTP calls to your Spring Boot services live here.
# Nothing else in the project makes HTTP calls directly —
# only this file does.
#
# We use httpx (not requests) because httpx supports async.
# async means: while waiting for a response from one service,
# Python can go do something else — like fire another request.
# This is how we fetch all drivers in parallel instead of
# one by one.
#
# asyncio.gather() is the key function — it fires multiple
# async calls at the same time and waits for ALL of them
# to complete before continuing.
# ─────────────────────────────────────────────────────────

import asyncio
import httpx
from typing import List, Optional, Tuple

from Shemas import ShipmentData, BidData, DriverData, VehicleData

# ── Service base URLs ─────────────────────────────────────
# Change these if your Spring Boot services run on
# different ports or hosts (e.g. in Docker).
SHIPMENT_SERVICE_URL = "http://localhost:8081"
USER_SERVICE_URL     = "http://localhost:8080"

# How long to wait for a response before giving up (seconds)
TIMEOUT = 10.0


# ── Shipment Service calls ────────────────────────────────

async def fetch_shipment(shipment_id: str) -> ShipmentData:
    """
    GET /api/shipments/{id}
    Returns the full shipment object.
    Raises an exception if shipment not found (404) or
    service is down — FastAPI will return a 500 to the client.
    """
    async with httpx.AsyncClient(timeout=TIMEOUT) as client:
        response = await client.get(
            f"{SHIPMENT_SERVICE_URL}/api/shipments/{shipment_id}"
        )
        response.raise_for_status() # throws if status is 4xx or 5xx
        return ShipmentData(**response.json())


async def fetch_bids_for_shipment(shipment_id: str) -> List[BidData]:
    """
    GET /api/bids/shipment/{shipmentId}/pending
    We fetch only PENDING bids — no point scoring bids
    that are already accepted, rejected, or withdrawn.
    """
    async with httpx.AsyncClient(timeout=TIMEOUT) as client:
        response = await client.get(
            f"{SHIPMENT_SERVICE_URL}/api/bids/shipment/{shipment_id}/pending"
        )
        response.raise_for_status()
        bids_json = response.json()
        return [BidData(**b) for b in bids_json]


async def fetch_shipment_and_bids(
    shipment_id: str,
) -> Tuple[ShipmentData, List[BidData]]:
    """
    Fetches the shipment AND its bids in parallel.
    Both calls only need the shipmentId, so there's no reason
    to wait for one before starting the other.

    asyncio.gather() fires both coroutines simultaneously
    and returns both results when both are done.
    Total time = max(shipment_time, bids_time)
    instead of shipment_time + bids_time.
    """
    shipment, bids = await asyncio.gather(
        fetch_shipment(shipment_id),
        fetch_bids_for_shipment(shipment_id),
    )
    return shipment, bids


# ── User Service calls ────────────────────────────────────

async def fetch_driver(driver_id: str) -> Optional[DriverData]:
    """
    GET /api/drivers/{id}
    Returns None if driver not found instead of crashing —
    we'll just skip that bid during feature building.
    """
    try:
        async with httpx.AsyncClient(timeout=TIMEOUT) as client:
            response = await client.get(
                f"{USER_SERVICE_URL}/api/drivers/{driver_id}"
            )
            response.raise_for_status()
            return DriverData(**response.json())
    except httpx.HTTPStatusError:
        # Driver not found or service error — skip this driver
        return None


async def fetch_vehicles_for_driver(driver_id: str) -> List[VehicleData]:
    """
    GET /api/vehicles/driver/{driverId}
    Returns a list — a driver can have multiple vehicles.
    We'll take the first one during feature building.
    Returns empty list on error instead of crashing.
    """
    try:
        async with httpx.AsyncClient(timeout=TIMEOUT) as client:
            response = await client.get(
                f"{USER_SERVICE_URL}/api/vehicles/driver/{driver_id}"
            )
            response.raise_for_status()
            vehicles_json = response.json()
            return [VehicleData(**v) for v in vehicles_json]
    except httpx.HTTPStatusError:
        return []


async def fetch_driver_with_vehicle(
    driver_id: str,
) -> Tuple[Optional[DriverData], Optional[VehicleData]]:
    """
    Fetches driver AND their vehicle in parallel.
    Returns (driver, vehicle) — either can be None on failure.
    """
    driver_data, vehicles = await asyncio.gather(
        fetch_driver(driver_id),
        fetch_vehicles_for_driver(driver_id),
    )
    # Take first vehicle if any exist
    vehicle = vehicles[0] if vehicles else None
    return driver_data, vehicle


async def fetch_all_drivers_and_vehicles(
    driver_ids: List[str],
) -> List[Tuple[str, Optional[DriverData], Optional[VehicleData]]]:
    """
    Fetches driver + vehicle for ALL driver IDs simultaneously.

    If you have 8 bids, this fires 16 HTTP calls at once
    (8 driver fetches + 8 vehicle fetches) and waits for
    all 16 to complete.

    Returns a list of (driver_id, driver, vehicle) tuples
    so we can match results back to their original driver IDs.
    """
    tasks = [fetch_driver_with_vehicle(driver_id) for driver_id in driver_ids]
    results = await asyncio.gather(*tasks)

    # Zip driver_ids back in so we know which result belongs to which bid
    return [
        (driver_id, driver, vehicle)
        for driver_id, (driver, vehicle) in zip(driver_ids, results)
    ]