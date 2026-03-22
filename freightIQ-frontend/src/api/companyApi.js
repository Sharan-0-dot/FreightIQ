import axios from "axios";

const BASE = "/api/user/companies";

export const registerCompany = (data) => axios.post(BASE, data);
export const loginCompany = (email) => axios.post(`${BASE}/login/${email}`);
export const getCompanyById = (id) => axios.get(`${BASE}/${id}`);
export const getAllCompanies = () => axios.get(BASE);
export const updateCompany = (id, data) => axios.put(`${BASE}/${id}`, data);
export const deleteCompany = (id) => axios.delete(`${BASE}/${id}`);