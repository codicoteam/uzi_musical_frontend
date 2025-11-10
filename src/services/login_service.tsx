import axios from "axios";

const API_URL = "https://uzi-muscal-backend.onrender.com/api/auth";

// Login
const login = async (userData: { email: string; password: string }) => {
  const response = await axios.post(`${API_URL}/login`, userData);

  if (response.data) {
    console.log("Login Response Data:", response.data);
    
    localStorage.setItem("userLogin", JSON.stringify(response.data));
    // Add this line to store token separately
    if (response.data.token) {
      localStorage.setItem("token", response.data.token);
      console.log("Token stored:", response.data.token);
    }
    
    // Also log the user data that was sent
    console.log("Login attempt with:", { 
      email: userData.email, 
      password: "***" // Masking password for security
    });
  }

  return response.data;
};

const userService = {
  login,
};

export default userService;