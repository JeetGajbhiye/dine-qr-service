import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./index.css";
import "./i18n";

import MenuApp from "./components/MenuApp";
import OrderTracking from "./components/OrderTracking";
import AdminLogin from "./components/AdminLogin";
import AdminDashboard from "./components/AdminDashboard";
import QRGenerator from "./components/QRGenerator";
import KitchenDisplay from "./components/KitchenDisplay";
import ProtectedRoute from "./components/ProtectedRoute";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MenuApp />} />
        <Route path="/track/:orderId" element={<OrderTracking />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/qr" element={<ProtectedRoute><QRGenerator /></ProtectedRoute>} />
        <Route path="/kitchen" element={<ProtectedRoute><KitchenDisplay /></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
