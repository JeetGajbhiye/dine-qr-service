import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE } from "../utils/api";

export default function AdminLogin() {
  const [creds, setCreds] = useState({ username: "", password: "" });
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();

  useEffect(() => {
    if (localStorage.getItem("adminToken")) nav("/admin");
  }, [nav]);

  const submit = async (e) => {
    e.preventDefault();
    setErr(""); setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(creds),
      });
      if (!res.ok) throw new Error("Invalid credentials");
      const data = await res.json();
      localStorage.setItem("adminToken", data.token);
      localStorage.setItem("adminUser", data.username);
      nav("/admin");
    } catch (e) { setErr(e.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-500 to-orange-500 p-6">
      <form onSubmit={submit} className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-6">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center text-3xl">🍽️</div>
          <h1 className="text-2xl font-bold mt-3">Admin Login</h1>
          <p className="text-gray-500 text-sm">Sign in to manage your restaurant</p>
        </div>
        {err && <div className="bg-red-50 text-red-700 px-4 py-2 rounded-xl text-sm mb-4">{err}</div>}
        <input required placeholder="Username" value={creds.username}
          onChange={(e) => setCreds({ ...creds, username: e.target.value })}
          className="w-full border rounded-xl px-4 py-3 mb-3 focus:ring-2 focus:ring-red-400 outline-none" />
        <input required type="password" placeholder="Password" value={creds.password}
          onChange={(e) => setCreds({ ...creds, password: e.target.value })}
          className="w-full border rounded-xl px-4 py-3 mb-4 focus:ring-2 focus:ring-red-400 outline-none" />
        <button disabled={loading}
          className="w-full bg-gradient-to-r from-red-500 to-orange-500 text-white font-bold py-3 rounded-xl hover:opacity-90 disabled:opacity-50">
          {loading ? "Signing in..." : "Sign In"}
        </button>
        <p className="text-xs text-gray-400 mt-4 text-center">Default: admin / admin@123</p>
      </form>
    </div>
  );
}
