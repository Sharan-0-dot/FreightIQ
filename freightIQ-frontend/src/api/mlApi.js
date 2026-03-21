import axios from "axios";

const ML_BASE = "http://localhost:8000";

export const getMLRecommendations = (shipmentId) =>
  axios.post(`${ML_BASE}/api/recommend`, { shipmentId });