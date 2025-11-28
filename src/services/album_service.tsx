import axios from "axios";

const API_URL = "/api/albums";

// ✅ Get All Albums
const getAllAlbums = async () => {
  try {
    const response = await axios.get(`${API_URL}`);
    console.log("📀 All Albums Response:", response.data); // Console log for all albums
    return response.data;
  } catch (error: any) {
    console.error("Error fetching all albums:", error.response?.data || error.message);
    throw new Error(
      error.response?.data?.message || "Failed to fetch albums. Please try again later."
    );
  }
};

// ✅ Get Album by ID (with Authorization header)
const getAlbumById = async (albumId: string, token: string) => {
  try {
    const response = await axios.get(`${API_URL}/${albumId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "*/*",
      },
    });
    console.log(`🎵 Album ${albumId} Details:`, response.data); // Console log for specific album
    return response.data;
  } catch (error: any) {
    console.error(`Error fetching album ${albumId}:`, error.response?.data || error.message);
    throw new Error(
      error.response?.data?.message ||
        "Failed to fetch album details. Please try again later."
    );
  }
};

// ✅ Get New/Featured Albums
const getNewAlbums = async (limit: number = 5) => {
  try {
    const response = await axios.get(`${API_URL}/newest?limit=${limit}`, {
      headers: {
        Accept: "*/*",
      },
    });
    console.log("🌟 New/Featured Albums Response:", response.data); // Console log for new albums
    return response.data;
  } catch (error: any) {
    console.error("Error fetching new albums:", error.response?.data || error.message);
    throw new Error(
      error.response?.data?.message || "Failed to fetch new albums. Please try again later."
    );
  }
};

const albumService = {
  getAllAlbums,
  getAlbumById,
  getNewAlbums,
};

export default albumService;