import axios from "axios";

const ROOT_URL = import.meta.env.VITE_USER_SERVICE_URL;

const DRIVER_BASE = `${ROOT_URL}/api/drivers`;
const VEHICLE_BASE = `${ROOT_URL}/api/vehicles`;

export const registerDriver = (data) => axios.post(DRIVER_BASE, data);
export const loginDriver = (phone) => axios.post(`${DRIVER_BASE}/login/${phone}`);
export const getDriverById = (id) => axios.get(`${DRIVER_BASE}/${id}`);
export const getAllDrivers = () => axios.get(DRIVER_BASE);
export const updateDriver = (id, data) => axios.put(`${DRIVER_BASE}/${id}`, data);
export const deleteDriver = (id) => axios.delete(`${DRIVER_BASE}/${id}`);

export const addVehicle = (data) => axios.post(VEHICLE_BASE, data);
export const getVehiclesByDriver = (driverId) => axios.get(`${VEHICLE_BASE}/driver/${driverId}`);
export const deleteVehicle = (id) => axios.delete(`${VEHICLE_BASE}/${id}`);