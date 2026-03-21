import axios from "axios";

const ML_BASE = `${import.meta.env.VITE_ML_SERVICE_URL}/api`;

export const getMLRecommendations = (shipmentId) =>
  axios.post(`${ML_BASE}/api/recommend`, { shipmentId }); 