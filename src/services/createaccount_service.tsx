import axios from "axios";

const API_URL = "https://uzi-muscal-backend.onrender.com/api/auth"; 

// Register new user
const register = async (userData: any) => {
  try {
    const payload = {
      userName: userData.userName,
      email: userData.email,
      password: userData.password,
      role: userData.role
    };

    const response = await axios.post(`${API_URL}/register`, payload, {
      headers: { "Content-Type": "application/json" }
    });

    return response.data;
  } catch (error: any) {
    console.error("Registration Axios error:", error.response?.data || error.message);
    throw error;
  }
};

// Verify email
const verifyEmail = async (verificationData: { email: string; code: string }) => {
  try {
    const response = await axios.post(`${API_URL}/verify-email`, verificationData, {
      headers: { "Content-Type": "application/json" }
    });

    return response.data;
  } catch (error: any) {
    console.error("Email verification Axios error:", error.response?.data || error.message);
    throw error;
  }
};

const userService = { register, verifyEmail };
export default userService;
