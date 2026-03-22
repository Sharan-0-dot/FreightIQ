import axios from "axios";

const ML_BASE = "/api/ml";

export const getMLRecommendations = (shipmentId) =>
  axios.post(`${ML_BASE}/recommend`, { shipmentId });