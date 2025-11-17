import axios from "axios";

const API_URL = "http://13.61.185.238:5000/api/news";

// Create axios instance with timeout and better error handling
const axiosInstance = axios.create({
  timeout: 30000, // 30 second timeout (Render free tier can be slow to wake up)
  headers: {
    "Content-Type": "application/json",
  },
});

// ✅ Get All News (optional pagination + category)
const getAllNews = async (page = 1, limit = 10, category?: string) => {
  try {
    const params: any = { page, limit };
    if (category) params.category = category;

    const response = await axiosInstance.get(API_URL, { params });
    return response.data;
  } catch (error: any) {
    // Better error handling for CORS and network issues
    if (error.code === "ERR_NETWORK" || error.message === "Network Error") {
      console.error("Network error - possible CORS issue or backend is down");
      throw new Error(
        "Unable to connect to server. The backend may be waking up (this can take 30-60 seconds on free hosting)."
      );
    }

    if (error.response?.status === 502) {
      throw new Error(
        "Server is temporarily unavailable. Please wait a moment and try again."
      );
    }

    console.error(
      "Error fetching news:",
      error.response?.data || error.message
    );
    throw new Error(
      error.response?.data?.message ||
        "Failed to fetch news. Please try again later."
    );
  }
};

// ✅ Get News by Category
const getNewsByCategory = async (category: string, page = 1, limit = 10) => {
  try {
    const response = await axios.get(`${API_URL}/category/${category}`, {
      params: { page, limit },
    });
    return response.data;
  } catch (error: any) {
    console.error(
      `Error fetching news in category ${category}:`,
      error.response?.data || error.message
    );
    throw new Error(
      error.response?.data?.message ||
        "Failed to fetch news by category. Please try again later."
    );
  }
};

// ✅ Get News by ID
const getNewsById = async (newsId: string) => {
  try {
    const response = await axios.get(`${API_URL}/${newsId}`);
    return response.data;
  } catch (error: any) {
    console.error(
      `Error fetching news ${newsId}:`,
      error.response?.data || error.message
    );
    throw new Error(
      error.response?.data?.message ||
        "Failed to fetch news details. Please try again later."
    );
  }
};

// ✅ Get News Statistics
const getNewsStats = async () => {
  try {
    const response = await axios.get(`${API_URL}/stats`);
    return response.data;
  } catch (error: any) {
    console.error(
      "Error fetching news statistics:",
      error.response?.data || error.message
    );
    throw new Error(
      error.response?.data?.message ||
        "Failed to fetch news statistics. Please try again later."
    );
  }
};

// ✅ Create News (Admin only)
const createNews = async (newsData: any, token: string) => {
  try {
    const response = await axios.post(API_URL, newsData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    return response.data;
  } catch (error: any) {
    console.error(
      "Error creating news:",
      error.response?.data || error.message
    );
    throw new Error(
      error.response?.data?.message ||
        "Failed to create news. Please try again later."
    );
  }
};

// ✅ Update News (Admin only)
const updateNews = async (newsId: string, newsData: any, token: string) => {
  try {
    const response = await axios.put(`${API_URL}/${newsId}`, newsData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    return response.data;
  } catch (error: any) {
    console.error(
      `Error updating news ${newsId}:`,
      error.response?.data || error.message
    );
    throw new Error(
      error.response?.data?.message ||
        "Failed to update news. Please try again later."
    );
  }
};

// ✅ Delete News (Admin only)
const deleteNews = async (newsId: string, token: string) => {
  try {
    const response = await axios.delete(`${API_URL}/${newsId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error: any) {
    console.error(
      `Error deleting news ${newsId}:`,
      error.response?.data || error.message
    );
    throw new Error(
      error.response?.data?.message ||
        "Failed to delete news. Please try again later."
    );
  }
};

const newsService = {
  getAllNews,
  getNewsByCategory,
  getNewsById,
  getNewsStats,
  createNews,
  updateNews,
  deleteNews,
};

export default newsService;
