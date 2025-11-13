import axios from "axios";

const USERS_API_URL = "https://uzi-muscal-backend.onrender.com/api/users";
const AUTH_API_URL = "https://uzi-muscal-backend.onrender.com/api/auth";

// Register new user (uses /api/users)
const register = async (userData: any) => {
  try {
    // Get token stored from login
    const token = localStorage.getItem("token");

    const payload = {
      userName: userData.userName,
      email: userData.email,
      password: userData.password,
      role: userData.role,
      
    };

    const headers: any = {
      "Content-Type": "application/json",
    };

    // Include Authorization header if token exists
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await axios.post(`${USERS_API_URL}`, payload, { headers });

    return response.data;
  } catch (error: any) {
    console.error("Registration Axios error:", error.response?.data || error.message);
    throw error;
  }
};

// Verify email (uses /api/auth)
const verifyEmail = async (verificationData: { email: string; code: string }) => {
  try {
    const response = await axios.post(
      `${AUTH_API_URL}/verify-email`,
      verificationData,
      {
        headers: { "Content-Type": "application/json" },
      }
    );

    return response.data;
  } catch (error: any) {
    console.error("Email verification Axios error:", error.response?.data || error.message);
    throw error;
  }
};

const userService = { register, verifyEmail };
export default userService;
