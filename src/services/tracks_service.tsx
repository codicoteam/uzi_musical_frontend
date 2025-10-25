import axios from "axios";

const API_URL = "https://uzi-muscal-backend.onrender.com/api/tracks";

// Get All Tracks
const getAllTracks = async () => {
  const response = await axios.get(`${API_URL}`);
  return response.data;
};

// ✅ Get Tracks by Album ID
const getTracksByAlbumId = async (albumId: any) => {
  const response = await axios.get(`${API_URL}/album/${albumId}`);
  return response.data;
};

const trackService = {
  getAllTracks,
  getTracksByAlbumId,
};

export default trackService;
