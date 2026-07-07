import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { authClient, logout } from "../utils/api";

const REFRESH_MS = 5000;
const COLUMNS = [
  { key: "PENDING", title: "New Orders", color: "from-yellow-400 to-orange-500", next: "PREPARING" },
  { key: "PREPARING", title: "In Kitchen", color: "from-blue-500 to-indigo-600", next: "READY" },
  { key: "READY", title: "Ready to Serve", color: "from-purple-500 to-pink-600", next: "SERVED" },
];

const timeAgo = (iso) => {
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  return m < 60 ? `${m}m ago` : `${Math.floor(m / 60)}h ${m % 60}m`;
};
const urgencyRing = (iso) => {
  const mins = (Date.now() - new Date(iso).getTime()) / 60000;
  if (mins > 15) return "ring-4 ring-red-500 animate-pulse";
  if (mins > 8) return "ring-2 ring-orange-400";
  return "";
};

export default function KitchenDisplay() {
  const [orders, setOrders] = useState([]);
  const [soundOn, setSoundOn] = useState(true);
  const [lastCount, setLastCount] = useState(0);
  const [clock, setClock] = useState(new Date().toLocaleTimeString());

  const load = async () => {
    try {
      const { data } = await authClient.get("/orders");
      const active = data.filter((o) => ["PENDING", "PREPARING", "READY"].includes(o.status));
      const pending = active.filter((o) => o.status === "PENDING").length;
      if (soundOn && pending > lastCount) {
        try {
          const ctx = new (window.AudioContext || window.webkitAudioContext)();
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain); gain.connect(ctx.destination);
          osc.frequency.value = 880; gain.gain.value = 0.2;
          osc.start(); setTimeout(() => { osc.stop(); ctx.close(); }, 200);
        } catch {}
      }
      setLastCount(pending); setOrders(active);
    } catch {}
  };

  useEffect(() => {
    load();
    const t = setInterval(load, REFRESH_MS);
    const c = setInterval(() => setClock(new Date().toLocaleTimeString()), 1000);
    return () => { clearInterval(t); clearInterval(c); };
  }, [soundOn]);

  const advance = async (order, nextStatus) => {
    await authClient.patch(`/orders/${order.id}/status`, { status: nextStatus });
    load();
  };

  const grouped = COLUMNS.map((c) => ({
    ...c,
    orders: orders.filter((o) => o.status === c.key).sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)),
  }));

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <header className="bg-black/40 backdrop-blur border-b border-white/10 sticky top-0 z-20">
        <div className="max-w-full px-6 py-3 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center text-xl">👨‍🍳</div>
            <div><h1 className="text-xl font-bold">Kitchen Display</h1><p className="text-xs text-gray-400">Live queue • refreshes every {REFRESH_MS / 1000}s</p></div>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <button onClick={() => setSoundOn((s) => !s)} className={`px-3 py-1.5 rounded-full text-sm font-semibold ${soundOn ? "bg-green-500" : "bg-gray-600"}`}>🔊 Sound {soundOn ? "On" : "Off"}</button>
            <div className="text-sm text-gray-300 font-mono">{clock}</div>
            <Link to="/admin" className="text-gray-300 hover:text-white text-sm font-semibold">Admin</Link>
            <button onClick={logout} className="text-red-400 hover:text-red-300 text-sm font-semibold">Logout</button>
          </div>
        </div>
      </header>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 p-4">
        {grouped.map((col) => (
          <div key={col.key} className="bg-white/5 border border-white/10 rounded-2xl p-4">
            <div className={`bg-gradient-to-r ${col.color} rounded-xl px-4 py-3 mb-4 flex justify-between items-center`}>
              <h2 className="font-bold text-lg">{col.title}</h2>
              <span className="bg-black/30 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">{col.orders.length}</span>
            </div>
            <div className="space-y-3 max-h-[calc(100vh-220px)] overflow-y-auto pr-1">
              {col.orders.length === 0 ? <div className="text-center text-gray-500 py-8">No orders</div>
              : col.orders.map((o) => (
                <div key={o.id} className={`bg-white/10 rounded-xl p-4 ${urgencyRing(o.createdAt)}`}>
                  <div className="flex justify-between items-start mb-2">
                    <div><h3 className="font-bold text-lg">#{String(o.id).slice(0, 6)}</h3>{o.tableNumber && <span className="text-xs bg-red-500/80 rounded-full px-2 py-0.5">Table {o.tableNumber}</span>}</div>
                    <div className="text-right text-xs text-gray-300"><div>{timeAgo(o.createdAt)}</div><div className="text-gray-500">{new Date(o.createdAt).toLocaleTimeString()}</div></div>
                  </div>
                  <ul className="space-y-1 mb-3">
                    {(o.items || []).map((i) => (
                      <li key={i.id} className="flex justify-between text-sm bg-black/20 rounded-lg px-2.5 py-1.5"><span className="font-semibold">{i.name}</span><span className="text-orange-300 font-bold">×{i.quantity}</span></li>
                    ))}
                  </ul>
                  {o.customerName && <p className="text-xs text-gray-400">👤 {o.customerName}</p>}
                  <button onClick={() => advance(o, col.next)} className={`w-full mt-3 bg-gradient-to-r ${col.color} font-bold py-2 rounded-lg hover:opacity-90`}>
                    {col.key === "PENDING" && "▶ Start Preparing"}
                    {col.key === "PREPARING" && "🔔 Mark Ready"}
                    {col.key === "READY" && "✅ Mark Served"}
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
