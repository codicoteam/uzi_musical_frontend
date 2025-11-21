import axios from "axios";

const API_URL = "http://13.61.185.238:5000/api/albums";

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

const albumService = {
  getAllAlbums,
  getAlbumById,
};

export default albumService;