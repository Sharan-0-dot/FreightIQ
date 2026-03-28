# FreightIQ

FreightIQ is a freight marketplace and driver-matching platform built for the Indian logistics market. The core idea came from observing how truck drivers in India typically depend on brokers and middlemen to find work — paying commissions, having no reputation system, and no direct relationship with the companies shipping goods. On the other side, companies have no real visibility into driver reliability before assigning a shipment.

FreightIQ removes that middleman. Companies post shipments, drivers place bids, and a machine learning model evaluates all the bids and recommends the top three drivers ranked by suitability — factoring in their history, vehicle fit, bid price, and the company's stated priority (safety, speed, or cost).

The project is built as a microservices system using Java Spring Boot, Python FastAPI, and a React frontend.

**Live:** [https://freightiq.duckdns.org](https://freightiq.duckdns.org)

---

## How it works

A company registers and posts a shipment with details like origin, destination, cargo type, weight, budget, deadline, and a priority type. Drivers browse open shipments and place bids with their price and estimated delivery time. Once bids come in, the company can request an AI recommendation — the ML service evaluates every pending bid and returns a ranked list of the top three drivers with a match score out of 100. The company reviews the recommendation and accepts a bid directly from the UI. From there, the shipment moves through statuses — Assigned, In Transit, Delivered — and the company submits a review at the end. Those reviews feed back into each driver's profile stats, which the model uses in future recommendations.

---

## Architecture

The system is split into four independent services:

```
FreightIQ/
├── User_Service/       Java Spring Boot — port 8080
├── Shipment_Service/   Java Spring Boot — port 8081
├── ML_Service/         Python FastAPI   — port 8000
├── frontend/           React + Vite     — port 3000 (Docker) / 5173 (local dev)
├── docker-compose.yml
└── .env
```

Services communicate over HTTP. The Shipment Service calls the User Service via a Feign client to validate companies and drivers and to update trip counters. The ML Service calls both Spring Boot services using async HTTP to fetch everything it needs for scoring.

---

## Services

### User Service — port 8080

Handles all user data. There are three entities — Driver, Company, and Vehicle — each with their own controllers.

Drivers register with their name, age, experience, and license details. After registration, their profile accumulates stats over time: completed trips, accepted trips, cancelled trips, delayed trips, incidents, and an average rating. These stats are updated by the Shipment Service as deliveries complete and reviews come in. Companies register with their business details including GST number, industry, and location.

Vehicles are stored separately and linked to a driver. A driver can have multiple vehicles. Each vehicle has a type, capacity in kg, and flags for whether it supports refrigerated or hazardous cargo.

Supported vehicle types: MINI_TRUCK, PICKUP_TRUCK, TRUCK_14FT, TRUCK_17FT, TRUCK_20FT, CONTAINER_32FT, FLATBED_TRUCK, REFRIGERATED_TRUCK, TANKER_TRUCK, TRAILER_TRUCK.

---

### Shipment Service — port 8081

Handles shipments, bids, and reviews.

A shipment carries the full delivery context: origin and destination city, distance, cargo type, weight in kg, flags for fragile/hazardous/refrigerated requirements, deadline, budget, and a priority type (SAFETY, SPEED, or COST). The priority type is the company's way of telling the system what matters most for this particular shipment.

Shipments follow a strict status lifecycle:

```
OPEN → ASSIGNED → IN_TRANSIT → DELIVERED
                              ↘ CANCELLED (allowed from OPEN, ASSIGNED, IN_TRANSIT)
```

DELIVERED and CANCELLED are terminal — no further transitions.

Bids are placed by drivers against open shipments. A bid includes the amount, estimated delivery days, and an optional note. Once a company accepts a bid, the shipment is marked ASSIGNED and all other bids are implicitly rejected. The Feign client in this service calls User Service on key events — incrementing accepted trips when a driver is assigned, completed trips when delivered, cancelled trips when cancelled.

Reviews are submitted after delivery. Each review captures a rating, whether a delay occurred, whether damage was reported, and comments. The User Service recalculates the driver's average rating based on new reviews.

Supported cargo types: GENERAL, FRAGILE, PERISHABLE, HAZARDOUS, REFRIGERATED, HEAVY_MACHINERY, LIQUID, ELECTRONICS, FURNITURE, PHARMACEUTICALS.

---

### ML Service — port 8000

This is the recommendation engine. It is a standalone FastAPI service that exposes one main endpoint.

**POST /api/recommend**

The frontend sends only a shipmentId. The ML service handles all data fetching itself — it calls the Shipment Service for the shipment details and all pending bids, then concurrently fetches the driver profile and vehicle for every bidder from the User Service. It builds a feature matrix with one row per bidder and runs the trained XGBoost model to score each driver. The top three are returned ranked by score.

```json
Request:  { "shipmentId": "abc-123" }

Response: {
  "shipmentId": "abc-123",
  "recommendations": [
    { "driverId": "driver_42", "score": 87.4, "rank": 1 },
    { "driverId": "driver_17", "score": 74.1, "rank": 2 },
    { "driverId": "driver_9",  "score": 61.8, "rank": 3 }
  ],
  "totalBidsEvaluated": 7
}
```

The score is the model's predicted probability (0–1) scaled to 100. A score of 87.4 means the model is 87.4% confident this driver would have been selected for this shipment based on historical patterns.

The service is structured as follows:

```
ML_Service/
├── main.py        FastAPI app and recommendation handler
├── schemas.py     Pydantic request and response models
├── clients.py     All async HTTP calls to Spring Boot services
├── features.py    Feature matrix builder — pure functions, no HTTP
├── model.pkl      Serialised XGBoost model loaded once at startup
└── requirements.txt
```

The model is loaded into memory once at startup and reused across all requests. All outbound HTTP calls use httpx with asyncio.gather so driver and vehicle fetches happen in parallel.

---

## The ML Model

The model is an XGBoost binary classifier trained to predict whether a given driver would be selected for a shipment. The training data is synthetic — generated by a script that simulates realistic driver histories, shipments, and bidding behavior based on logical rules (experienced drivers with high ratings are more likely to be selected, low bids relative to budget improve chances, and so on). This is a common approach when historical data is not available and the rules governing selection are well understood.

**Training summary:**

| Property | Value |
|---|---|
| Algorithm | XGBoost binary classifier |
| Training rows | 69,718 |
| Features | 14 |
| Target | selected (1 if this driver won the shipment) |
| Test ROC-AUC | 0.9119 |
| Cross-validation ROC-AUC | 0.9132 ± 0.0027 |
| n_estimators | 200 |
| max_depth | 4 |
| learning_rate | 0.1 |
| scale_pos_weight | 5 |

`scale_pos_weight` is set to 5 because the dataset has roughly a 1:5 class imbalance — for every shipment there are multiple bidders but only one winner.

**The 14 features used:**

| Feature | Source | Notes |
|---|---|---|
| rating_average | Driver profile | Overall average from all past reviews |
| experience_years | Driver profile | Years of driving experience |
| on_time_rate | Derived | completedTrips / (completedTrips + delayedTrips) |
| cancellation_rate | Derived | cancelledTrips / acceptedTrips |
| incident_count | Driver profile | Complaints and reported incidents |
| total_completed | Driver profile | Volume of completed deliveries |
| vehicle_age_years | Vehicle | Age of the driver's vehicle |
| bid_to_budget_ratio | Derived | bidAmount / shipment budgetAmount |
| capacity_ratio | Derived | vehicle capacityKg / shipment weightKg |
| cargo_type_match | Derived | 1 if vehicle can handle the cargo requirements, else 0 |
| estimated_delivery_days | Bid | Driver's promised delivery time |
| priority_safety | Derived | 1 if shipment priority is SAFETY, else 0 |
| priority_speed | Derived | 1 if shipment priority is SPEED, else 0 |
| priority_cost | Derived | 1 if shipment priority is COST, else 0 |

The three priority features are a one-hot encoding of the shipment's priority type. This means the same set of drivers bidding on two different shipments — one prioritizing safety and one prioritizing cost — will receive different scores. A driver with a high rating and zero incidents scores better for safety-priority shipments. A driver with a competitive bid scores better for cost-priority shipments. The model learns these relationships from the training data rather than applying fixed weights.

**Feature importance (top 5):**

1. rating_average — 32.2%
2. experience_years — 15.9%
3. priority_cost — 15.7%
4. bid_to_budget_ratio — 13.4%
5. total_completed — 7.5%

---

## Frontend

The frontend is a React application built with Vite and styled with Tailwind CSS. It has a dark theme throughout with orange used for company-facing UI and blue for driver-facing UI.

There are two separate user flows — one for companies and one for drivers — with role-based routing handled through an AuthContext that stores the user object and role in localStorage.

**Company flow:** Register, post shipments with full cargo details and priority selection, view all shipments by status, open a shipment to see all bids received, request an AI recommendation, accept a bid, advance the shipment status through to delivered, and submit a review.

**Driver flow:** Register with a vehicle, browse all open shipments with search and filter, view shipment details and place a bid, track ongoing shipments and confirm pickup and delivery, view all bids placed with their current status.

The recommendation UI in the shipment detail page shows each ranked driver with their stats, bid amount, estimated delivery, and match score. The company can accept a bid directly from the recommendation card without going back to the full bid list.

---

## Tech Stack

| Layer | Technology |
|---|---|
| User Service | Java 17, Spring Boot, Spring Data JPA, PostgreSQL |
| Shipment Service | Java 17, Spring Boot, Spring Data JPA, OpenFeign, PostgreSQL |
| ML Service | Python 3.11, FastAPI, Uvicorn, XGBoost, scikit-learn, httpx, joblib |
| Frontend | React 18, Vite, React Router v6, Axios, Tailwind CSS, Lucide React |
| Containerisation | Docker, Docker Compose |
| Database | PostgreSQL |

---

## Deployment

The full stack is deployed on AWS using Docker Compose with an SSL certificate. The application is live at **[https://freightiq.duckdns.org](https://freightiq.duckdns.org)**.

### Docker Hub images

All images are published under `sharansc/` on Docker Hub.

| Image | Tag |
|---|---|
| sharansc/user-service | latest |
| sharansc/shipment-service | latest |
| sharansc/ml-service | latest |
| sharansc/freight-frontend | latest |


### Resource limits

Each service runs with explicit CPU and memory caps to stay within EC2 instance constraints.

| Service | CPU limit | Memory limit |
|---|---|---|
| user-service | 0.5 cores | 400 MB |
| shipment-service | 0.5 cores | 400 MB |
| ml-service | 0.7 cores | 500 MB |
| frontend | 0.3 cores | 200 MB |

All services use `restart: unless-stopped` and JSON file logging with rotation (10 MB per file, 3 files max).


### Key notes about networking

All services communicate on the `freightiq-net` bridge network. Inter-service calls (Feign client, ML httpx) use Docker service names as hostnames: `http://user-service:8080`, `http://shipment-service:8081`. The frontend container runs on port 3000 on the host (mapped from Nginx port 80 inside the container). `VITE_*` env vars are baked into the React build at image build time and point to the public domain.

### Start the stack

```bash
docker compose up -d
```

### Stop the stack

```bash
docker compose down
```

### Pull latest images and restart

```bash
docker compose pull && docker compose up -d
```

---

## Running locally

Services must be started in this order because of the Feign client dependency between them.

```
1. User Service      →  mvn spring-boot:run          (port 8080)
2. Shipment Service  →  mvn spring-boot:run          (port 8081)
3. ML Service        →  uvicorn main:app --reload --port 8000
4. Frontend          →  npm run dev                  (port 5173)
```

All service URLs and database credentials are configured through a single `.env` file at the project root. Copy `.env.example` to `.env` and fill in your values before starting anything.

---

## Port reference

| Service | Local dev | Docker (AWS) |
|---|---|---|
| User Service | 8080 | 8080 |
| Shipment Service | 8081 | 8081 |
| ML Service | 8000 | 8000 |
| Frontend | 5173 | 3000 |

---

## Current status

### Completed ✓

- User Service (Spring Boot) ✓
- Shipment Service (Spring Boot) ✓
- ML Service (FastAPI + XGBoost, ROC-AUC 0.91) ✓
- Frontend — all company + driver pages ✓
- AI recommendation wired end to end ✓
- Docker — all 4 services containerised ✓
- Docker Hub — all images pushed under sharansc/ ✓
- docker-compose.yml — full stack runs with single command ✓
- Deployed on AWS with SSL certificate ✓
- Live at https://freightiq.duckdns.org ✓

### Planned

- Kafka notification service
- Gemini insight service (explains why a driver was ranked #1)
- API Gateway — Spring Cloud Gateway