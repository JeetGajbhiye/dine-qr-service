export const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8080/api";
export const PUBLIC_MENU_URL = import.meta.env.VITE_PUBLIC_URL || "http://localhost:5173";
export const WHATSAPP_NUMBER = import.meta.env.VITE_WHATSAPP || "919999999999"; // country code + number, no '+'
export const RAZORPAY_KEY = import.meta.env.VITE_RAZORPAY_KEY || "rzp_test_YOUR_KEY_ID";

export const authFetch = async (path, options = {}) => {
  const token = localStorage.getItem("adminToken");
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });
  if (res.status === 401) {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminUser");
    if (!window.location.pathname.startsWith("/admin/login")) {
      window.location.href = "/admin/login";
    }
  }
  return res;
};

export const publicFetch = async (path, options = {}) => {
  return fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });
};

export const logout = () => {
  localStorage.removeItem("adminToken");
  localStorage.removeItem("adminUser");
  window.location.href = "/admin/login";
};
