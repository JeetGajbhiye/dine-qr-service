import React, { useEffect, useState } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { Link } from "react-router-dom";
import { authClient, PUBLIC_MENU_URL } from "../utils/api";

export default function QRGenerator() {
  const [tables, setTables] = useState([]);
  const [form, setForm] = useState({ tableNumber: "", label: "" });
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try { const { data } = await authClient.get("/tables"); setTables(data); }
    catch {} finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const createTable = async (e) => {
    e.preventDefault();
    const qrUrl = `${PUBLIC_MENU_URL}/?table=${encodeURIComponent(form.tableNumber)}`;
    try {
      await authClient.post("/tables", { ...form, qrUrl, isActive: true });
      setForm({ tableNumber: "", label: "" }); load();
    } catch (err) {
      alert(err.response?.data?.detail || "Failed to create table");
    }
  };

  const deleteTable = async (id) => {
    if (!window.confirm("Delete this table?")) return;
    await authClient.delete(`/tables/${id}`); load();
  };

  const downloadQR = (tableNumber) => {
    const canvas = document.getElementById(`qr-${tableNumber}`);
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = `table-${tableNumber}-qr.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  const printQR = (table) => {
    const canvas = document.getElementById(`qr-${table.tableNumber}`);
    if (!canvas) return;
    const dataUrl = canvas.toDataURL("image/png");
    const w = window.open("", "_blank");
    w.document.write(`<html><head><title>Table ${table.tableNumber} QR</title>
      <style>body{font-family:sans-serif;text-align:center;padding:40px;}
      .card{border:2px dashed #dc2626;padding:40px;max-width:400px;margin:0 auto;border-radius:20px;}
      h1{color:#dc2626;margin:0 0 8px;} p{color:#666;margin-bottom:20px;}</style></head>
      <body><div class="card"><h1>Scan to Order</h1>
      <p>Table <strong>${table.tableNumber}</strong>${table.label ? " • " + table.label : ""}</p>
      <img src="${dataUrl}" style="width:280px;height:280px;"/>
      <p style="margin-top:20px;font-size:12px;">Point your camera at the QR code</p>
      </div><script>window.onload=()=>window.print();<\/script></body></html>`);
    w.document.close();
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8 flex-wrap gap-3">
          <div><h1 className="text-3xl font-bold text-gray-900">QR Code Generator</h1><p className="text-gray-500 mt-1">Create unique QR codes for each table</p></div>
          <Link to="/admin" className="text-red-600 font-semibold hover:underline">← Back to Admin</Link>
        </div>
        <form onSubmit={createTable} className="bg-white rounded-2xl shadow p-6 mb-8 grid grid-cols-1 md:grid-cols-4 gap-3">
          <input data-testid="table-number" required placeholder="Table Number (e.g. T1)" value={form.tableNumber} onChange={(e) => setForm({ ...form, tableNumber: e.target.value })} className="border rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-red-400 outline-none" />
          <input placeholder="Label (optional)" value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} className="border rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-red-400 outline-none md:col-span-2" />
          <button data-testid="add-table" className="bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl py-2.5">+ Add Table</button>
        </form>
        {loading ? <div className="text-center py-10 text-gray-500">Loading...</div>
        : tables.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl shadow"><div className="text-5xl mb-3">📱</div><p className="text-gray-500">No tables yet. Add one to generate its QR code.</p></div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {tables.map((t) => (
              <div key={t.id} className="bg-white rounded-2xl shadow p-6 flex flex-col items-center">
                <div className="w-full flex justify-between items-start mb-3">
                  <div><h3 className="font-bold text-lg">Table {t.tableNumber}</h3>{t.label && <p className="text-sm text-gray-500">{t.label}</p>}</div>
                  <button onClick={() => deleteTable(t.id)} className="text-gray-400 hover:text-red-500 text-sm">✕</button>
                </div>
                <div className="p-3 bg-white border-2 border-dashed border-gray-200 rounded-xl">
                  <QRCodeCanvas id={`qr-${t.tableNumber}`} value={t.qrUrl || `${PUBLIC_MENU_URL}/?table=${t.tableNumber}`} size={200} level="H" includeMargin />
                </div>
                <p className="text-xs text-gray-400 mt-3 break-all text-center">{t.qrUrl}</p>
                <div className="flex gap-2 mt-4 w-full">
                  <button onClick={() => downloadQR(t.tableNumber)} className="flex-1 bg-gray-900 text-white rounded-lg py-2 text-sm font-semibold hover:bg-gray-700">⬇ Download</button>
                  <button onClick={() => printQR(t)} className="flex-1 bg-red-600 text-white rounded-lg py-2 text-sm font-semibold hover:bg-red-700">🖨 Print</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
