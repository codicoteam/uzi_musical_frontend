import axios from "axios";

const AUTH_API_URL = "/api/auth";
const USER_API_URL = "/api/users";

// ✅ Register (No Token)
const register = async (userData: {
  userName: string;
  email: string;
  password: string;
  role: string;
}) => {
  try {
    const payload = {
      userName: userData.userName,
      email: userData.email,
      password: userData.password,
      role: userData.role,
    };

    // 👇 No token used here
    const response = await axios.post(`${USER_API_URL}`, payload, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (response.data) {
      console.log("Registration Response Data:", response.data);

      // Store full response in localStorage
      localStorage.setItem("userRegister", JSON.stringify(response.data));

      // Store token separately if available
      if (response.data.token) {
        localStorage.setItem("token", response.data.token);
        console.log("Token stored:", response.data.token);
      }
    }

    return response.data;
  } catch (error: any) {
    console.error("Registration Axios error:", error.response?.data || error.message);
    throw error;
  }
};

// ✅ Login
const login = async (userData: { email: string; password: string }) => {
  try {
    const response = await axios.post(`${AUTH_API_URL}/login`, userData);

    if (response.data) {
      console.log("Login Response Data:", response.data);

      localStorage.setItem("userLogin", JSON.stringify(response.data));

      // Store token separately if available
      if (response.data.token) {
        localStorage.setItem("token", response.data.token);
        console.log("Token stored:", response.data.token);
      }

      console.log("Login attempt with:", {
        email: userData.email,
        password: "***", // Mask password for security
      });
    }

    return response.data;
  } catch (error: any) {
    console.error("Login Axios error:", error.response?.data || error.message);
    throw error;
  }
};

// ✅ Verify Email
const verifyEmail = async (email: string, otp: string) => {
  try {
    const token = localStorage.getItem("token");

    if (!token) {
      throw new Error("No token found. Please log in first.");
    }

    const payload = { email, otp };

    const response = await axios.post(`${AUTH_API_URL}/verify-email`, payload, {
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
        "accept": "*/*",
      },
    });

    console.log("Verify Email Response Data:", response.data);

    return response.data;
  } catch (error: any) {
    console.error("Verify Email Axios error:", error.response?.data || error.message);
    throw error;
  }
};

const userService = {
  register,
  login,
  verifyEmail,
};

export default userService;
