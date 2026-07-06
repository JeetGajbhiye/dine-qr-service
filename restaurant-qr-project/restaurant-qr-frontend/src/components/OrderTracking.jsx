import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { publicFetch } from "../utils/api";

const STEPS = [
  { key: "PENDING",   label: "Order Placed",  icon: "📝" },
  { key: "PREPARING", label: "Preparing",     icon: "👨‍🍳" },
  { key: "READY",     label: "Ready",         icon: "🔔" },
  { key: "SERVED",    label: "Served",        icon: "✅" },
];

export default function OrderTracking() {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [error, setError] = useState("");

  const load = async () => {
    try {
      const res = await publicFetch(`/orders/${orderId}`);
      if (!res.ok) throw new Error("Order not found");
      setOrder(await res.json());
    } catch (e) { setError(e.message); }
  };

  useEffect(() => {
    load();
    const t = setInterval(load, 10000);
    return () => clearInterval(t);
  }, [orderId]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
        <div className="bg-white rounded-2xl shadow p-8 text-center max-w-md">
          <div className="text-5xl mb-3">😔</div>
          <h2 className="font-bold text-xl">{error}</h2>
          <Link to="/" className="mt-4 inline-block text-red-600 font-semibold">Back to Menu</Link>
        </div>
      </div>
    );
  }
  if (!order) return <div className="min-h-screen flex items-center justify-center text-gray-500">Loading order...</div>;

  const cancelled = order.status === "CANCELLED";
  const paid = order.status === "PAID";
  const currentIdx = STEPS.findIndex((s) => s.key === order.status);
  const progress = paid ? 3 : currentIdx;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 p-6">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-500">Order</p>
              <h1 className="text-2xl font-bold">#{order.id}</h1>
            </div>
            <span className={`px-4 py-1.5 rounded-full text-sm font-bold ${
              cancelled ? "bg-red-100 text-red-700" :
              paid ? "bg-emerald-100 text-emerald-700" :
              "bg-green-100 text-green-700"
            }`}>
              {order.status}
            </span>
          </div>
          <div className="text-sm text-gray-500 mt-2">{new Date(order.createdAt).toLocaleString()}</div>
          {order.tableNumber && <div className="mt-2 text-sm"><strong>Table:</strong> {order.tableNumber}</div>}
          {order.paymentId && <div className="text-sm text-emerald-600"><strong>Payment ID:</strong> {order.paymentId}</div>}
        </div>

        {!cancelled && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <div className="flex justify-between relative">
              <div className="absolute top-6 left-6 right-6 h-1 bg-gray-200 z-0" />
              <div
                className="absolute top-6 left-6 h-1 bg-gradient-to-r from-red-500 to-orange-500 z-0 transition-all duration-500"
                style={{ width: `calc(${(Math.max(progress, 0) / (STEPS.length - 1)) * 100}% - 24px)` }}
              />
              {STEPS.map((s, idx) => {
                const active = idx <= progress;
                return (
                  <div key={s.key} className="relative z-10 flex flex-col items-center">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl ${
                      active ? "bg-gradient-to-br from-red-500 to-orange-500 text-white shadow-lg" : "bg-gray-200"
                    }`}>{s.icon}</div>
                    <p className={`text-xs mt-2 font-semibold text-center ${active ? "text-gray-900" : "text-gray-400"}`}>{s.label}</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <h3 className="font-bold mb-4">Your Items</h3>
          <div className="space-y-2 text-sm">
            {(order.items || []).map((i) => (
              <div key={i.id} className="flex justify-between border-b last:border-0 pb-2 last:pb-0">
                <span>{i.name} × {i.quantity}</span>
                <span className="font-semibold">₹{(Number(i.price) * i.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>
          <div className="flex justify-between border-t mt-3 pt-3 font-bold text-lg">
            <span>Total</span>
            <span className="text-red-600">₹{Number(order.grandTotal).toFixed(2)}</span>
          </div>
        </div>

        <div className="text-center">
          <Link to="/" className="text-red-600 font-semibold hover:underline">← Back to Menu</Link>
        </div>
      </div>
    </div>
  );
}
