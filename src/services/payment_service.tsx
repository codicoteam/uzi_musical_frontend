import axios from "axios";

const BASE_URL = "http://13.61.185.238:5000/api/payments";

// CREATE AXIOS INSTANCE
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

// 🔥 ADD AUTH TOKEN TO EVERY REQUEST
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }

    // Safely stringify config.data for logging
    const requestData =
      typeof config.data === "object" && config.data !== null
        ? JSON.stringify(config.data)
        : config.data;

    console.log("📡 Config Dataa:", requestData);

    console.log("➡️ REQUEST:", {
      url: config.url,
      method: config.method,
      data: requestData,
    });

    return config;
  },
  (error) => Promise.reject(error)
);

// 🔥 RESPONSE INTERCEPTOR FOR IMPROVED ERRORS
api.interceptors.response.use(
  (response) => {
    console.log("⬅️ RESPONSE:", response.data);
    return response;
  },
  (error) => {
    console.error("🔥 API Error:", error);

    if (error.response) {
      console.error("📩 Error Response:", error.response.data);
      throw new Error(
        error.response.data?.message ||
        `Server error: ${error.response.status}`
      );
    } else if (error.request) {
      throw new Error("Network error: Unable to connect to payment service");
    } else {
      throw new Error("Request configuration error");
    }
  }
);

// helper for wrapping service calls
const handleRequest = async (callback: Function, label: string) => {
  try {
    console.log(`🟦 Executing: ${label}`);
    const result = await callback();
    console.log(`🟩 Success: ${label}`, result);
    return result;
  } catch (error: any) {
    console.error(`🟥 Error in ${label}:`, error.message);
    throw error;
  }
};

// 🔥 FINAL PAYMENT SERVICE WITH AUTHENTICATION
const PaymentsService = {
  /** Create a purchase (standard flow) */
  createPurchase: async (payload: any) =>
    handleRequest(
      () => api.post("/purchase", payload).then((res) => res.data),
      "createPurchase"
    ),

  /** Create a purchase (seamless flow) */
  createPurchaseSeamless: async (payload: any) =>
    handleRequest(
      () => api.post("/purchase-seamless", payload).then((res) => res.data),
      "createPurchaseSeamless"
    ),

  /** Create a purchase (redirect flow) */
  createPurchaseRedirect: async (payload: any) =>
    handleRequest(
      () => api.post("/purchase-redirect", payload).then((res) => res.data),
      "createPurchaseRedirect"
    ),

  /** Get payment status by reference number */
  getStatus: async (referenceNumber: string) =>
    handleRequest(
      () => api.get(`/status/${referenceNumber}`).then((res) => res.data),
      "getStatus"
    ),

  /** Poll payment status */
  pollStatus: async () =>
    handleRequest(
      () => api.get("/poll-status").then((res) => res.data),
      "pollStatus"
    ),

  /** Handle Pesepay callback */
  pesepayCallback: async (payload: any) =>
    handleRequest(
      () => api.post("/pesepay/callback", payload).then((res) => res.data),
      "pesepayCallback"
    ),

  /** 🔥 Get all purchases (albums / plaques) for the authenticated user */
  getPurchases: async () =>
    handleRequest(
      () => api.get("/purchases").then((res) => res.data),
      "getPurchases"
    ),
};

export default PaymentsService;
