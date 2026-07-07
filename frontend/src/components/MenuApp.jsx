import React, { useState, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "./LanguageSwitcher";
import { publicClient, WHATSAPP_NUMBER, RAZORPAY_KEY } from "../utils/api";

const CATEGORIES = ["All", "Starters", "Main Course", "Beverages", "Desserts"];

export default function MenuApp() {
  const { t, i18n } = useTranslation();
  const [menu, setMenu] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("All");
  const [cart, setCart] = useState({});
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [customer, setCustomer] = useState({ name: "", phone: "", email: "", table: "" });
  const [placing, setPlacing] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const table = params.get("table");
    if (table) setCustomer((c) => ({ ...c, table }));
  }, []);

  useEffect(() => {
    publicClient.get("/menu").then((r) => setMenu(r.data)).catch(() => setMenu([])).finally(() => setLoading(false));
  }, []);

  const displayName = (m) => (i18n.language === "hi" && m.nameHi) || (i18n.language === "ta" && m.nameTa) || m.name;
  const displayDesc = (m) => (i18n.language === "hi" && m.descriptionHi) || (i18n.language === "ta" && m.descriptionTa) || m.description;

  const addToCart = (item) => setCart((prev) => {
    const existing = prev[item.id];
    return { ...prev, [item.id]: { item, qty: existing ? existing.qty + 1 : 1 } };
  });
  const changeQty = (id, delta) => setCart((prev) => {
    const existing = prev[id];
    if (!existing) return prev;
    const newQty = existing.qty + delta;
    if (newQty <= 0) { const { [id]: _, ...rest } = prev; return rest; }
    return { ...prev, [id]: { ...existing, qty: newQty } };
  });
  const removeFromCart = (id) => setCart((prev) => { const { [id]: _, ...rest } = prev; return rest; });

  const cartItems = Object.values(cart);
  const grandTotal = useMemo(() => cartItems.reduce((s, ci) => s + ci.item.price * ci.qty, 0), [cartItems]);
  const totalQty = cartItems.reduce((s, ci) => s + ci.qty, 0);
  const filteredMenu = useMemo(() => activeCategory === "All" ? menu : menu.filter((m) => m.category === activeCategory), [menu, activeCategory]);

  const buildWhatsAppMessage = (orderId) => {
    const lines = [];
    lines.push(`*New Order - ${t("restaurantName")}*`);
    if (orderId) lines.push(`*Order ID:* #${orderId}`);
    lines.push(`--------------------------------`);
    if (customer.name) lines.push(`*Customer:* ${customer.name}`);
    if (customer.phone) lines.push(`*Phone:* ${customer.phone}`);
    if (customer.email) lines.push(`*Email:* ${customer.email}`);
    if (customer.table) lines.push(`*Table No:* ${customer.table}`);
    lines.push(`*Time:* ${new Date().toLocaleString()}`);
    lines.push(`--------------------------------`);
    lines.push(`*Order Summary:*`);
    cartItems.forEach((ci, idx) => {
      lines.push(`${idx + 1}. ${ci.item.name}  x${ci.qty}  -  ₹${(ci.item.price * ci.qty).toFixed(2)}`);
    });
    lines.push(`--------------------------------`);
    lines.push(`*Grand Total: ₹${grandTotal.toFixed(2)}*`);
    return encodeURIComponent(lines.join("\n"));
  };

  const saveOrder = async (paymentId = null, paymentMethod = "CASH") => {
    const res = await publicClient.post("/orders", {
      customerName: customer.name, customerPhone: customer.phone, customerEmail: customer.email,
      tableNumber: customer.table, grandTotal, paymentId, paymentMethod,
      items: cartItems.map((ci) => ({ menuItemId: ci.item.id, name: ci.item.name, price: ci.item.price, quantity: ci.qty })),
    });
    return res.data;
  };

  const checkoutViaWhatsApp = async () => {
    if (cartItems.length === 0 || placing) return;
    if (!customer.name || !customer.phone) { alert("Please enter name and phone."); return; }
    setPlacing(true);
    try {
      const created = await saveOrder(null, "WHATSAPP");
      window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${buildWhatsAppMessage(created.id)}`, "_blank");
      setCart({}); setIsCartOpen(false);
      window.location.href = `/track/${created.id}`;
    } catch { alert("Could not place order."); } finally { setPlacing(false); }
  };

  const checkoutRazorpay = () => {
    if (cartItems.length === 0 || placing) return;
    if (!customer.name || !customer.phone) { alert("Please enter name and phone."); return; }
    if (typeof window.Razorpay === "undefined") { alert("Razorpay SDK not loaded."); return; }
    const options = {
      key: RAZORPAY_KEY, amount: Math.round(grandTotal * 100), currency: "INR",
      name: t("restaurantName"), description: `Order for ${totalQty} item(s)`,
      handler: async (response) => {
        try {
          const created = await saveOrder(response.razorpay_payment_id, "RAZORPAY");
          setCart({}); setIsCartOpen(false);
          window.location.href = `/track/${created.id}`;
        } catch { alert("Payment recorded but save failed."); }
      },
      prefill: { name: customer.name, contact: customer.phone, email: customer.email },
      notes: { table: customer.table }, theme: { color: "#dc2626" },
    };
    const rzp = new window.Razorpay(options);
    rzp.on("payment.failed", (r) => alert(`Payment failed: ${r.error.description}`));
    rzp.open();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50">
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md shadow-sm border-b border-orange-100">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center text-white text-xl font-bold shadow-md">🍽️</div>
            <div>
              <h1 className="text-lg md:text-2xl font-bold text-gray-900">{t("restaurantName")}</h1>
              <p className="text-xs text-gray-500">{t("tagline")}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <button data-testid="cart-button" onClick={() => setIsCartOpen(true)}
              className="relative flex items-center gap-2 bg-gradient-to-r from-red-500 to-orange-500 text-white px-3 md:px-4 py-2 rounded-full font-semibold shadow-md hover:shadow-lg transition-all hover:scale-105">
              🛒 <span className="hidden sm:inline">{t("cart")}</span>
              {totalQty > 0 && (
                <span className="absolute -top-2 -right-2 bg-white text-red-600 text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center shadow">{totalQty}</span>
              )}
            </button>
          </div>
        </div>
      </header>

      <section className="max-w-7xl mx-auto px-4 py-6 md:py-10">
        <div className="rounded-2xl bg-gradient-to-r from-red-500 via-orange-500 to-amber-500 text-white p-6 md:p-10 shadow-lg">
          <h2 className="text-2xl md:text-4xl font-bold mb-2">{t("welcome")}</h2>
          <p className="text-white/90 text-sm md:text-base max-w-2xl">{t("subtitle")}</p>
          {customer.table && (
            <div className="mt-4 inline-block bg-white/20 backdrop-blur px-4 py-2 rounded-full text-sm font-semibold">📜 Table: {customer.table}</div>
          )}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 pb-4">
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
          {CATEGORIES.map((cat) => (
            <button key={cat} data-testid={`cat-${cat}`} onClick={() => setActiveCategory(cat)}
              className={`whitespace-nowrap px-5 py-2 rounded-full text-sm font-semibold border transition-all ${
                activeCategory === cat ? "bg-gray-900 text-white border-gray-900 shadow-md" : "bg-white text-gray-700 border-gray-200 hover:border-gray-400"
              }`}>
              {t(`categories.${cat}`)}
            </button>
          ))}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 pb-32">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden shadow animate-pulse">
                <div className="h-48 bg-gray-200" />
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-2/3" />
                  <div className="h-3 bg-gray-200 rounded w-full" />
                  <div className="h-8 bg-gray-200 rounded mt-3" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredMenu.length === 0 ? (
          <div className="text-center py-20 text-gray-500">{t("noItems")}</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filteredMenu.map((item) => (
              <article key={item.id} data-testid={`menu-item-${item.id}`}
                className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl border border-gray-100 transition-all duration-300 hover:-translate-y-1">
                <div className="relative h-48 overflow-hidden">
                  <img src={item.imageUrl} alt={displayName(item)}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    onError={(e) => (e.currentTarget.src = "https://via.placeholder.com/600x400?text=Dish")} />
                  <span className="absolute top-3 left-3 bg-white/95 text-gray-800 text-xs font-semibold px-2.5 py-1 rounded-full shadow">{t(`categories.${item.category}`)}</span>
                  {typeof item.isVeg === "boolean" && (
                    <span className={`absolute top-3 right-3 w-6 h-6 rounded border-2 flex items-center justify-center bg-white ${item.isVeg ? "border-green-600" : "border-red-600"}`}>
                      <span className={`w-3 h-3 rounded-full ${item.isVeg ? "bg-green-600" : "bg-red-600"}`}></span>
                    </span>
                  )}
                </div>
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-bold text-gray-900 text-lg leading-tight">{displayName(item)}</h3>
                    <span className="text-red-600 font-extrabold whitespace-nowrap">₹{item.price}</span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1 line-clamp-2">{displayDesc(item)}</p>
                  <button data-testid={`add-${item.id}`} onClick={() => addToCart(item)} disabled={item.isAvailable === false}
                    className="mt-4 w-full bg-gray-900 hover:bg-red-600 text-white font-semibold py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-50">
                    + {t("addToCart")}
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {totalQty > 0 && !isCartOpen && (
        <button onClick={() => setIsCartOpen(true)}
          className="fixed bottom-4 left-4 right-4 md:hidden bg-gradient-to-r from-red-500 to-orange-500 text-white font-bold py-3.5 rounded-2xl shadow-2xl flex items-center justify-between px-5 z-30">
          <span>{totalQty} {t("itemsInCart")}</span>
          <span>{t("viewCart")} • ₹{grandTotal.toFixed(2)}</span>
        </button>
      )}

      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsCartOpen(false)} />
          <aside className="relative w-full sm:max-w-md bg-white h-full shadow-2xl flex flex-col animate-slide-in">
            <div className="p-5 border-b flex items-center justify-between">
              <h3 className="text-xl font-bold">{t("yourOrder")}</h3>
              <button onClick={() => setIsCartOpen(false)} className="w-9 h-9 rounded-full hover:bg-gray-100 flex items-center justify-center text-2xl">×</button>
            </div>
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {cartItems.length === 0 ? (
                <div className="text-center text-gray-500 py-20">
                  <div className="text-5xl mb-3">🛒</div>{t("emptyCart")}
                </div>
              ) : cartItems.map((ci) => (
                <div key={ci.item.id} className="flex gap-3 border-b pb-4">
                  <img src={ci.item.imageUrl} alt={displayName(ci.item)} className="w-20 h-20 rounded-xl object-cover" />
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <h4 className="font-semibold">{displayName(ci.item)}</h4>
                      <button onClick={() => removeFromCart(ci.item.id)} className="text-gray-400 hover:text-red-500 text-sm">{t("remove")}</button>
                    </div>
                    <p className="text-sm text-gray-500">₹{ci.item.price} each</p>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center border rounded-full overflow-hidden">
                        <button onClick={() => changeQty(ci.item.id, -1)} className="px-3 py-1 hover:bg-gray-100">−</button>
                        <span className="px-3 font-semibold">{ci.qty}</span>
                        <button onClick={() => changeQty(ci.item.id, +1)} className="px-3 py-1 hover:bg-gray-100">+</button>
                      </div>
                      <span className="font-bold text-red-600">₹{(ci.item.price * ci.qty).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              ))}
              {cartItems.length > 0 && (
                <div className="pt-2 space-y-3">
                  <input data-testid="cust-name" type="text" placeholder={t("name")} value={customer.name} onChange={(e) => setCustomer({ ...customer, name: e.target.value })} className="w-full border rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-red-400" />
                  <input data-testid="cust-phone" type="tel" placeholder={t("phone")} value={customer.phone} onChange={(e) => setCustomer({ ...customer, phone: e.target.value })} className="w-full border rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-red-400" />
                  <input type="email" placeholder={t("email")} value={customer.email} onChange={(e) => setCustomer({ ...customer, email: e.target.value })} className="w-full border rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-red-400" />
                  <input type="text" placeholder={t("table")} value={customer.table} onChange={(e) => setCustomer({ ...customer, table: e.target.value })} className="w-full border rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-red-400" />
                </div>
              )}
            </div>
            {cartItems.length > 0 && (
              <div className="border-t p-5 bg-gray-50 space-y-3">
                <div className="flex justify-between text-lg font-bold">
                  <span>{t("grandTotal")}</span><span className="text-red-600">₹{grandTotal.toFixed(2)}</span>
                </div>
                <button data-testid="whatsapp-checkout" onClick={checkoutViaWhatsApp} disabled={placing}
                  className="w-full bg-green-500 hover:bg-green-600 disabled:opacity-60 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 shadow-md transition">
                  💬 {placing ? "..." : t("whatsappCheckout")}
                </button>
                <button data-testid="razorpay-checkout" onClick={checkoutRazorpay} disabled={placing}
                  className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 disabled:opacity-60 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 shadow-md transition">
                  💳 {t("payOnline")}
                </button>
                <p className="text-xs text-gray-500 text-center">{t("secureCheckout")}</p>
              </div>
            )}
          </aside>
        </div>
      )}
    </div>
  );
}
