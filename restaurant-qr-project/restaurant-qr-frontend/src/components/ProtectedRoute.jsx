import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { API_BASE } from "../utils/api";

export default function ProtectedRoute({ children }) {
  const [ok, setOk] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (!token) { setOk(false); return; }
    fetch(`${API_BASE}/auth/me`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => setOk(r.ok))
      .catch(() => setOk(false));
  }, []);

  if (ok === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-red-500 border-t-transparent"></div>
      </div>
    );
  }
  return ok ? children : <Navigate to="/admin/login" replace />;
}
