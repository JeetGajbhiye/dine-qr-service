import axios from "axios";

export const API_BASE = `${process.env.REACT_APP_BACKEND_URL}/api`;
export const PUBLIC_MENU_URL = window.location.origin;
export const WHATSAPP_NUMBER = process.env.REACT_APP_WHATSAPP || "919999999999";
export const RAZORPAY_KEY = process.env.REACT_APP_RAZORPAY_KEY || "rzp_test_YOUR_KEY_ID";

export const publicClient = axios.create({
  baseURL: API_BASE,
  headers: { "Content-Type": "application/json" },
});

export const authClient = axios.create({
  baseURL: API_BASE,
  headers: { "Content-Type": "application/json" },
});

authClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("adminToken");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

authClient.interceptors.response.use(
  (r) => r,
  (err) => {
    if (err.response && err.response.status === 401) {
      localStorage.removeItem("adminToken");
      localStorage.removeItem("adminUser");
      if (!window.location.pathname.startsWith("/admin/login")) {
        window.location.href = "/admin/login";
      }
    }
    return Promise.reject(err);
  }
);

export const logout = () => {
  localStorage.removeItem("adminToken");
  localStorage.removeItem("adminUser");
  window.location.href = "/admin/login";
};
