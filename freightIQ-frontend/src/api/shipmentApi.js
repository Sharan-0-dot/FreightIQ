import axios from "axios";

const BASE = "/api/shipment/api";

export const postShipment = (data) => axios.post(`${BASE}/shipments`, data);
export const getAllShipments = () => axios.get(`${BASE}/shipments`);
export const getShipmentById = (id) => axios.get(`${BASE}/shipments/${id}`);
export const getShipmentsByCompany = (companyId) => axios.get(`${BASE}/shipments/company/${companyId}`); 
export const getShipmentsByStatus = (status) => axios.get(`${BASE}/shipments/status/${status}`);
export const updateShipmentStatus = (id, status) => axios.patch(`${BASE}/shipments/${id}/status?status=${status}`);
export const assignDriver = (shipmentId, driverId) => axios.patch(`${BASE}/shipments/${shipmentId}/assign-driver/${driverId}`);
export const deleteShipment = (id) => axios.delete(`${BASE}/shipments/${id}`);

export const placeBid = (data) => axios.post(`${BASE}/bids`, data);
export const getBidsForShipment = (shipmentId) => axios.get(`${BASE}/bids/shipment/${shipmentId}`);
export const getPendingBids = (shipmentId) => axios.get(`${BASE}/bids/shipment/${shipmentId}/pending`);
export const getBidsByDriver = (driverId) => axios.get(`${BASE}/bids/driver/${driverId}`);
export const acceptBid = (bidId) => axios.patch(`${BASE}/bids/${bidId}/accept`);
export const withdrawBid = (bidId) => axios.patch(`${BASE}/bids/${bidId}/withdraw`);

export const submitReview = (data) => axios.post(`${BASE}/reviews`, data);
export const getReviewsByDriver = (driverId) => axios.get(`${BASE}/reviews/driver/${driverId}`);
export const getReviewByShipment = (shipmentId) => axios.get(`${BASE}/reviews/shipment/${shipmentId}`);