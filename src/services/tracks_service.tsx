import axios from "axios";

const API_URL = "/api/tracks";

// Get All Tracks
const getAllTracks = async () => {
  try {
    const response = await axios.get(`${API_URL}`);
    return response.data;
  } catch (error: any) {
    console.error("Error fetching all tracks:", error.response?.data || error.message);
    throw new Error(
      error.response?.data?.message || "Failed to fetch tracks. Please try again later."
    );
  }
};

// ✅ Get Tracks by Album ID
const getTracksByAlbumId = async (albumId: any) => {
  try {
    const response = await axios.get(`${API_URL}/album/${albumId}`);
    return response.data;
  } catch (error: any) {
    console.error(`Error fetching tracks for album ${albumId}:`, error.response?.data || error.message);
    throw new Error(
      error.response?.data?.message ||
        "Failed to fetch tracks for this album. Please try again later."
    );
  }
};

const trackService = {
  getAllTracks,
  getTracksByAlbumId,
};

export default trackService;
