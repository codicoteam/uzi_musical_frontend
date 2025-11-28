import axios from "axios";

const API_URL = "/api/profiles";

// ✅ Get authentication token from localStorage
const getAuthHeader = () => {
  const token = localStorage.getItem("token");
  console.log("🔐 Token from localStorage:", token);
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// ✅ Create a New Account
const createAccount = async (accountData: any) => {
  try {
    const headers = getAuthHeader();
    console.log("📝 Creating account with data:", accountData);
    console.log("📋 Request headers:", headers);
    
    const response = await axios.post(`${API_URL}`, accountData, {
      headers: headers,
    });
    console.log("✅ Account created successfully:", response.data);
    return response.data;
  } catch (error: any) {
    console.error("❌ Account creation failed:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      headers: error.config?.headers
    });
    throw error;
  }
};

// ✅ Get Current User Profile (/api/profiles/me)
const getMyProfile = async () => {
  try {
    const headers = getAuthHeader();
    console.log("🔍 Fetching profile from:", `${API_URL}/me`);
    console.log("📋 Request headers:", headers);

    const response = await axios.get(`${API_URL}/me`, {
      headers: headers,
    });

    console.log("✅ Profile fetched successfully:", response.data);
    console.log("📊 Profile data structure:", {
      hasFirstName: !!response.data.firstName,
      hasLastName: !!response.data.lastName,
      firstName: response.data.firstName,
      lastName: response.data.lastName,
      fullData: response.data
    });

    return {
      success: true,
      profile: response.data
    };
  } catch (error: any) {
    console.error("❌ Profile fetch failed:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      headers: error.config?.headers
    });

    // Return structured error response that can be handled by the component
    throw error;
  }
};

// ✅ Update Current User Profile (/api/profiles/me)
const updateMyProfile = async (profileData: any) => {
  try {
    const headers = getAuthHeader();
    console.log("🔄 Updating profile with data:", profileData);
    console.log("📋 Request headers:", headers);
    
    const response = await axios.put(`${API_URL}/me`, profileData, {
      headers: headers,
    });
    console.log("✅ Profile updated successfully:", response.data);
    return response.data;
  } catch (error: any) {
    console.error("❌ Profile update failed:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      headers: error.config?.headers
    });
    throw error;
  }
};

// ✅ Delete Current User Profile (/api/profiles/me)
const deleteMyProfile = async () => {
  try {
    const headers = getAuthHeader();
    console.log("🗑️ Deleting profile...");
    console.log("📋 Request headers:", headers);
    
    const response = await axios.delete(`${API_URL}/me`, {
      headers: headers,
    });
    console.log("✅ Profile deleted successfully:", response.data);
    return response.data;
  } catch (error: any) {
    console.error("❌ Profile deletion failed:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      headers: error.config?.headers
    });
    throw error;
  }
};

// ✅ Get Profile by ID (/api/profiles/{id})
const getProfileById = async (id: string) => {
  try {
    const headers = getAuthHeader();
    console.log("🔍 Fetching profile by ID:", id);
    console.log("📋 Request headers:", headers);
    
    const response = await axios.get(`${API_URL}/${id}`, {
      headers: headers,
    });
    console.log("✅ Profile by ID fetched successfully:", response.data);
    return response.data;
  } catch (error: any) {
    console.error("❌ Profile by ID fetch failed:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      headers: error.config?.headers
    });
    throw error;
  }
};

const profileService = {
  createAccount,
  getMyProfile,
  updateMyProfile,
  deleteMyProfile,
  getProfileById,
};

export default profileService;