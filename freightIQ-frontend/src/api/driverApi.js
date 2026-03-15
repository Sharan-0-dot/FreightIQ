import axios from "axios";

const BASE = "http://localhost:8080/api/drivers";

export const registerDriver = (data) => axios.post(BASE, data);
export const loginDriver = (phone) => axios.post(`${BASE}/login/${phone}`);
export const getDriverById = (id) => axios.get(`${BASE}/${id}`);
export const getAllDrivers = () => axios.get(BASE);
export const updateDriver = (id, data) => axios.put(`${BASE}/${id}`, data);
export const deleteDriver = (id) => axios.delete(`${BASE}/${id}`);

export const addVehicle = (data) => axios.post("http://localhost:8080/api/vehicles", data);
export const getVehiclesByDriver = (driverId) => axios.get(`http://localhost:8080/api/vehicles/driver/${driverId}`);
export const deleteVehicle = (id) => axios.delete(`http://localhost:8080/api/vehicles/${id}`);