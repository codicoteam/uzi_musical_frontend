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

    return config;
  },
  (error) => Promise.reject(error)
);

// 🔥 RESPONSE INTERCEPTOR FOR IMPROVED ERRORS
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Error:", error);

    if (error.response) {
      throw new Error(error.response.data?.message || `Server error: ${error.response.status}`);
    } else if (error.request) {
      throw new Error("Network error: Unable to connect to payment service");
    } else {
      throw new Error("Request configuration error");
    }
  }
);

// 🔥 FINAL PAYMENT SERVICE WITH AUTHENTICATION
const PaymentsService = {
  /** Create a purchase (standard flow) */
  createPurchase: async (payload: any) => {
    const response = await api.post("/purchase", payload);
    return response.data;
  },

  /** Create a purchase (seamless flow) */
  createPurchaseSeamless: async (payload: any) => {
    const response = await api.post("/purchase-seamless", payload);
    return response.data;
  },

  /** Create a purchase (redirect flow) */
  createPurchaseRedirect: async (payload: any) => {
    const response = await api.post("/purchase-redirect", payload);
    return response.data;
  },

  /** Get payment status by reference number */
  getStatus: async (referenceNumber: string) => {
    const response = await api.get(`/status/${referenceNumber}`);
    return response.data;
  },

  /** Poll payment status */
  pollStatus: async () => {
    const response = await api.get("/poll-status");
    return response.data;
  },

  /** Handle Pesepay callback */
  pesepayCallback: async (payload: any) => {
    const response = await api.post("/pesepay/callback", payload);
    return response.data;
  },
};

export default PaymentsService;