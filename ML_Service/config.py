from dotenv import load_dotenv
import os

load_dotenv()  # only used in local dev — Docker injects env vars directly

USER_SERVICE_URL = os.getenv("USER_SERVICE_URL", "http://localhost:8080")
SHIPMENT_SERVICE_URL = os.getenv("SHIPMENT_SERVICE_URL", "http://localhost:8081")
ML_SERVICE_PORT = int(os.getenv("ML_SERVICE_PORT", 8000))