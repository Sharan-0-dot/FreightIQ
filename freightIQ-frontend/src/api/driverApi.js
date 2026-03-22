import axios from "axios";

const ROOT_URL = "/api/user";

const DRIVER_BASE = `${ROOT_URL}/drivers`;
const VEHICLE_BASE = `${ROOT_URL}/vehicles`;

export const registerDriver = (data) => axios.post(DRIVER_BASE, data);
export const loginDriver = (phone) => axios.post(`${DRIVER_BASE}/login/${phone}`);
export const getDriverById = (id) => axios.get(`${DRIVER_BASE}/${id}`);
export const getAllDrivers = () => axios.get(DRIVER_BASE);
export const updateDriver = (id, data) => axios.put(`${DRIVER_BASE}/${id}`, data);
export const deleteDriver = (id) => axios.delete(`${DRIVER_BASE}/${id}`);

export const addVehicle = (data) => axios.post(VEHICLE_BASE, data);
export const getVehiclesByDriver = (driverId) => axios.get(`${VEHICLE_BASE}/driver/${driverId}`);
export const deleteVehicle = (id) => axios.delete(`${VEHICLE_BASE}/${id}`);