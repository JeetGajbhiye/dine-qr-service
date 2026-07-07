import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./App.css";
import "./i18n";

import MenuApp from "./components/MenuApp";
import OrderTracking from "./components/OrderTracking";
import AdminLogin from "./components/AdminLogin";
import AdminDashboard from "./components/AdminDashboard";
import QRGenerator from "./components/QRGenerator";
import KitchenDisplay from "./components/KitchenDisplay";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
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
  );
}

export default App;
