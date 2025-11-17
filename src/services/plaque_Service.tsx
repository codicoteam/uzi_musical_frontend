import axios from "axios";

const API_URL = "http://13.61.185.238:5000/api/plaques";

// Get authentication token from localStorage
const getAuthHeader = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Get All Plaques
const getAllPlaques = async () => {
  const response = await axios.get(`${API_URL}`);
  return response.data;
};

// Get Plaques by User ID
const getPlaquesByUser = async (userId: string) => {
  const response = await axios.get(`${API_URL}/user/${userId}`);
  return response.data;
};

// Get Plaque by ID
const getPlaqueById = async (id: string) => {
  const response = await axios.get(`${API_URL}/${id}`);
  return response.data;
};

// Purchase a Plaque
const createPlaque = async (plaqueData: any) => {
  const response = await axios.post(`${API_URL}`, plaqueData, {
    headers: getAuthHeader(),
  });
  return response.data;
};

// Update Plaque Purchase
const updatePlaque = async (id: string, updateData: any) => {
  const response = await axios.put(`${API_URL}/${id}`, updateData, {
    headers: getAuthHeader(),
  });
  return response.data;
};

// Delete Plaque Purchase
const deletePlaque = async (id: string) => {
  const response = await axios.delete(`${API_URL}/${id}`, {
    headers: getAuthHeader(),
  });
  return response.data;
};

const plaqueService = {
  getAllPlaques,
  getPlaquesByUser,
  getPlaqueById,
  createPlaque,
  updatePlaque,
  deletePlaque,
};

export default plaqueService;
