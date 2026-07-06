import React, { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { authFetch, logout } from "../utils/api";

const STATUSES = ["PENDING", "PREPARING", "READY", "SERVED", "PAID", "CANCELLED"];
const STATUS_COLORS = {
  PENDING:   "bg-yellow-100 text-yellow-800 border-yellow-300",
  PREPARING: "bg-blue-100 text-blue-800 border-blue-300",
  READY:     "bg-purple-100 text-purple-800 border-purple-300",
  SERVED:    "bg-green-100 text-green-800 border-green-300",
  PAID:      "bg-emerald-100 text-emerald-800 border-emerald-300",
  CANCELLED: "bg-red-100 text-red-800 border-red-300",
};

export default function AdminDashboard() {
  const [orders, setOrders] = useState([]);
  const [menu, setMenu] = useState([]);
  const [tab, setTab] = useState("orders");
  const [filter, setFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);

  const emptyForm = {
    name: "", nameHi: "", nameTa: "",
    description: "", descriptionHi: "", descriptionTa: "",
    price: "", imageUrl: "", category: "Starters",
    isAvailable: true, isVeg: true,
  };
  const [menuForm, setMenuForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);

  const loadOrders = async () => {
    const res = await authFetch("/orders");
    if (!res) return;
    const data = await res.json();
    setOrders(data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
  };

  const loadMenu = async () => {
    const res = await authFetch("/menu");
    if (!res) return;
    setMenu(await res.json());
  };

  useEffect(() => {
    (async () => {
      await Promise.all([loadOrders(), loadMenu()]);
      setLoading(false);
    })();
    const interval = setInterval(loadOrders, 8000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateStatus = async (id, status) => {
    await authFetch(`/orders/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
    loadOrders();
  };

  const saveMenuItem = async (e) => {
    e.preventDefault();
    const payload = { ...menuForm, price: parseFloat(menuForm.price) };
    const path = editingId ? `/menu/${editingId}` : "/menu";
    const method = editingId ? "PUT" : "POST";
    await authFetch(path, { method, body: JSON.stringify(payload) });
    setMenuForm(emptyForm);
    setEditingId(null);
    loadMenu();
  };

  const editItem = (item) => {
    setEditingId(item.id);
    setMenuForm({
      name: item.name || "",
      nameHi: item.nameHi || "",
      nameTa: item.nameTa || "",
      description: item.description || "",
      descriptionHi: item.descriptionHi || "",
      descriptionTa: item.descriptionTa || "",
      price: item.price || "",
      imageUrl: item.imageUrl || "",
      category: item.category || "Starters",
      isAvailable: item.isAvailable ?? true,
      isVeg: item.isVeg ?? true,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const deleteItem = async (id) => {
    if (!window.confirm("Delete this menu item?")) return;
    await authFetch(`/menu/${id}`, { method: "DELETE" });
    loadMenu();
  };

  const filteredOrders = useMemo(
    () => filter === "ALL" ? orders : orders.filter((o) => o.status === filter),
    [orders, filter]
  );

  const stats = useMemo(() => {
    const today = new Date().toDateString();
    const todays = orders.filter((o) => new Date(o.createdAt).toDateString() === today);
    return {
      total: orders.length,
      today: todays.length,
      revenue: todays.filter((o) => ["PAID", "SERVED"].includes(o.status))
        .reduce((s, o) => s + Number(o.grandTotal || 0), 0),
      pending: orders.filter((o) => ["PENDING", "PREPARING", "READY"].includes(o.status)).length,
    };
  }, [orders]);

  if (loading) return <div className="min-h-screen flex items-center justify-center text-gray-500">Loading admin...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center text-white font-bold">🍽️</div>
            <div>
              <h1 className="text-xl font-bold">Admin Dashboard</h1>
              <p className="text-xs text-gray-500">Manage orders, menu &amp; QR codes</p>
            </div>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Link to="/kitchen" className="bg-purple-600 text-white px-4 py-2 rounded-xl font-semibold hover:bg-purple-700">Kitchen Display</Link>
            <Link to="/admin/qr" className="bg-gray-900 text-white px-4 py-2 rounded-xl font-semibold hover:bg-gray-700">QR Codes</Link>
            <Link to="/" className="border border-gray-300 px-4 py-2 rounded-xl font-semibold hover:bg-gray-100">View Menu</Link>
            <button onClick={logout} className="border border-red-300 text-red-600 px-4 py-2 rounded-xl font-semibold hover:bg-red-50">Logout</button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-6 grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Orders" value={stats.total} color="from-blue-500 to-indigo-500" />
        <StatCard label="Today's Orders" value={stats.today} color="from-orange-500 to-red-500" />
        <StatCard label="Today's Revenue" value={`₹${stats.revenue.toFixed(2)}`} color="from-green-500 to-emerald-500" />
        <StatCard label="Active Orders" value={stats.pending} color="from-purple-500 to-pink-500" />
      </div>

      <div className="max-w-7xl mx-auto px-6">
        <div className="flex gap-2 border-b">
          {["orders", "menu"].map((tt) => (
            <button key={tt} onClick={() => setTab(tt)}
              className={`px-5 py-3 font-semibold capitalize border-b-2 transition ${
                tab === tt ? "border-red-600 text-red-600" : "border-transparent text-gray-500 hover:text-gray-900"
              }`}>
              {tt}
            </button>
          ))}
        </div>
      </div>

      {tab === "orders" && (
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex gap-2 overflow-x-auto pb-3 no-scrollbar">
            {["ALL", ...STATUSES].map((s) => (
              <button key={s} onClick={() => setFilter(s)}
                className={`whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-semibold border ${
                  filter === s ? "bg-gray-900 text-white border-gray-900" : "bg-white text-gray-700 border-gray-200"
                }`}>
                {s} {s !== "ALL" && `(${orders.filter((o) => o.status === s).length})`}
              </button>
            ))}
          </div>

          {filteredOrders.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl shadow">
              <div className="text-5xl mb-3">📋</div>
              <p className="text-gray-500">No orders in this filter.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredOrders.map((o) => (
                <div key={o.id} className="bg-white rounded-2xl shadow p-5 border border-gray-100">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-bold text-lg">Order #{o.id}</h3>
                      <p className="text-xs text-gray-500">{new Date(o.createdAt).toLocaleString()}</p>
                    </div>
                    <span className={`text-xs font-bold px-3 py-1 rounded-full border ${STATUS_COLORS[o.status] || "bg-gray-100"}`}>{o.status}</span>
                  </div>

                  <div className="text-sm text-gray-700 space-y-0.5 mb-3">
                    {o.customerName && <p><strong>Customer:</strong> {o.customerName}</p>}
                    {o.customerPhone && <p><strong>Phone:</strong> {o.customerPhone}</p>}
                    {o.customerEmail && <p><strong>Email:</strong> {o.customerEmail}</p>}
                    {o.tableNumber && <p><strong>Table:</strong> {o.tableNumber}</p>}
                    {o.paymentId && <p className="text-emerald-600"><strong>Paid:</strong> {o.paymentId}</p>}
                  </div>

                  <div className="border-t pt-3 space-y-1 text-sm">
                    {(o.items || []).map((i) => (
                      <div key={i.id} className="flex justify-between">
                        <span>{i.name} × {i.quantity}</span>
                        <span>₹{(Number(i.price) * i.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>

                  <div className="border-t mt-3 pt-3 flex justify-between font-bold">
                    <span>Total</span>
                    <span className="text-red-600">₹{Number(o.grandTotal).toFixed(2)}</span>
                  </div>

                  <select value={o.status} onChange={(e) => updateStatus(o.id, e.target.value)}
                    className="mt-3 w-full border rounded-xl px-3 py-2 text-sm font-semibold focus:ring-2 focus:ring-red-400 outline-none">
                    {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === "menu" && (
        <div className="max-w-7xl mx-auto px-6 py-6">
          <form onSubmit={saveMenuItem} className="bg-white rounded-2xl shadow p-6 mb-8 grid grid-cols-1 md:grid-cols-2 gap-3">
            <h3 className="md:col-span-2 font-bold text-lg">{editingId ? "Edit Menu Item" : "Add Menu Item"}</h3>
            <input required placeholder="Name (English)" value={menuForm.name}
              onChange={(e) => setMenuForm({ ...menuForm, name: e.target.value })}
              className="border rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-red-400 outline-none" />
            <input required type="number" step="0.01" placeholder="Price (₹)" value={menuForm.price}
              onChange={(e) => setMenuForm({ ...menuForm, price: e.target.value })}
              className="border rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-red-400 outline-none" />
            <input placeholder="Name (हिन्दी)" value={menuForm.nameHi}
              onChange={(e) => setMenuForm({ ...menuForm, nameHi: e.target.value })}
              className="border rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-red-400 outline-none" />
            <input placeholder="Name (தமிழ்)" value={menuForm.nameTa}
              onChange={(e) => setMenuForm({ ...menuForm, nameTa: e.target.value })}
              className="border rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-red-400 outline-none" />
            <textarea placeholder="Description" value={menuForm.description}
              onChange={(e) => setMenuForm({ ...menuForm, description: e.target.value })}
              rows={2}
              className="border rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-red-400 outline-none md:col-span-2" />
            <input placeholder="Image URL" value={menuForm.imageUrl}
              onChange={(e) => setMenuForm({ ...menuForm, imageUrl: e.target.value })}
              className="border rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-red-400 outline-none md:col-span-2" />
            <select value={menuForm.category}
              onChange={(e) => setMenuForm({ ...menuForm, category: e.target.value })}
              className="border rounded-xl px-4 py-2.5">
              {["Starters", "Main Course", "Beverages", "Desserts"].map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <div className="flex gap-4 items-center border rounded-xl px-4 py-2.5">
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={menuForm.isAvailable}
                  onChange={(e) => setMenuForm({ ...menuForm, isAvailable: e.target.checked })} />
                Available
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={menuForm.isVeg}
                  onChange={(e) => setMenuForm({ ...menuForm, isVeg: e.target.checked })} />
                Veg
              </label>
            </div>
            <div className="md:col-span-2 flex gap-3">
              <button className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl py-2.5">
                {editingId ? "Update Item" : "Add Item"}
              </button>
              {editingId && (
                <button type="button" onClick={() => { setEditingId(null); setMenuForm(emptyForm); }}
                  className="px-6 border rounded-xl font-semibold hover:bg-gray-100">Cancel</button>
              )}
            </div>
          </form>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {menu.map((m) => (
              <div key={m.id} className="bg-white rounded-2xl shadow overflow-hidden">
                <img src={m.imageUrl} alt={m.name} className="h-40 w-full object-cover"
                  onError={(e) => (e.currentTarget.src = "https://via.placeholder.com/400x300?text=Dish")} />
                <div className="p-4">
                  <div className="flex justify-between items-start">
                    <h4 className="font-bold">{m.name}</h4>
                    <span className="font-bold text-red-600">₹{m.price}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {m.category} {!m.isAvailable && "• Unavailable"} {m.isVeg ? "• 🟢 Veg" : "• 🔴 Non-Veg"}
                  </p>
                  <p className="text-sm text-gray-600 mt-2 line-clamp-2">{m.description}</p>
                  <div className="flex gap-2 mt-3">
                    <button onClick={() => editItem(m)}
                      className="flex-1 bg-gray-900 text-white rounded-lg py-1.5 text-sm hover:bg-gray-700">Edit</button>
                    <button onClick={() => deleteItem(m.id)}
                      className="flex-1 bg-red-600 text-white rounded-lg py-1.5 text-sm hover:bg-red-700">Delete</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, color }) {
  return (
    <div className={`bg-gradient-to-br ${color} text-white rounded-2xl p-5 shadow`}>
      <p className="text-white/80 text-sm">{label}</p>
      <p className="text-2xl font-bold mt-1">{value}</p>
    </div>
  );
}
