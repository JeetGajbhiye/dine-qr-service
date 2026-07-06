import i18n from "i18next";
import { initReactI18next } from "react-i18next";

const resources = {
  en: {
    translation: {
      restaurantName: "Spice Garden",
      tagline: "Scan • Order • Enjoy",
      welcome: "Welcome to our Menu",
      subtitle: "Freshly prepared dishes, delivered straight to your table. Browse the menu, add favourites to your cart, and checkout via WhatsApp or online payment.",
      addToCart: "Add to Cart",
      cart: "Cart",
      yourOrder: "Your Order",
      remove: "Remove",
      grandTotal: "Grand Total",
      whatsappCheckout: "Send Order via WhatsApp",
      payOnline: "Pay Online (Razorpay)",
      emptyCart: "Your cart is empty",
      viewCart: "View Cart",
      itemsInCart: "item(s) in cart",
      name: "Your Name",
      phone: "Phone Number",
      email: "Email (optional)",
      table: "Table Number (Optional)",
      secureCheckout: "Secure checkout. You can also pay at the counter.",
      loadingMenu: "Loading menu...",
      noItems: "No items in this category yet.",
      categories: {
        All: "All", Starters: "Starters", "Main Course": "Main Course",
        Beverages: "Beverages", Desserts: "Desserts"
      },
    },
  },
  hi: {
    translation: {
      restaurantName: "स्पाइस गार्डन",
      tagline: "स्कैन • ऑर्डर • आनंद लें",
      welcome: "हमारे मेनू में आपका स्वागत है",
      subtitle: "ताज़ा तैयार व्यंजन, सीधे आपकी टेबल पर। मेनू देखें, पसंदीदा आइटम कार्ट में जोड़ें।",
      addToCart: "कार्ट में जोड़ें",
      cart: "कार्ट",
      yourOrder: "आपका ऑर्डर",
      remove: "हटाएं",
      grandTotal: "कुल योग",
      whatsappCheckout: "व्हाट्सएप के माध्यम से भेजें",
      payOnline: "ऑनलाइन भुगतान करें (Razorpay)",
      emptyCart: "आपका कार्ट खाली है",
      viewCart: "कार्ट देखें",
      itemsInCart: "आइटम कार्ट में",
      name: "आपका नाम",
      phone: "फ़ोन नंबर",
      email: "ईमेल (वैकल्पिक)",
      table: "टेबल नंबर (वैकल्पिक)",
      secureCheckout: "सुरक्षित चेकआउट। आप काउंटर पर भी भुगतान कर सकते हैं।",
      loadingMenu: "मेनू लोड हो रहा है...",
      noItems: "इस श्रेणी में अभी कोई आइटम नहीं।",
      categories: {
        All: "सभी", Starters: "स्टार्टर", "Main Course": "मुख्य भोजन",
        Beverages: "पेय", Desserts: "मिठाई"
      },
    },
  },
  ta: {
    translation: {
      restaurantName: "ஸ்பைஸ் கார்டன்",
      tagline: "ஸ்கான் • ஆர்டர் • என்ஜாய்",
      welcome: "எங்கள் மெனுவிற்கு வரவேற்கிறோம்",
      subtitle: "புதிதாக தயாரிக்கப்பட்ட உணவுகள், நேரடியாக உங்கள் மேசைக்கு வழங்கப்படுகின்றன.",
      addToCart: "கூடையில் சேர்க்கவும்",
      cart: "கூடை",
      yourOrder: "உங்கள் ஆர்டர்",
      remove: "நீக்கு",
      grandTotal: "மொத்த தொகை",
      whatsappCheckout: "WhatsApp வழியாக அனுப்பவும்",
      payOnline: "ஆன்லைனில் செலுத்தவும்",
      emptyCart: "உங்கள் கூடை காலியாக உள்ளது",
      viewCart: "கூடையை பார்",
      itemsInCart: "பொருட்கள் கூடையில்",
      name: "உங்கள் பெயர்",
      phone: "தொலைபேசி எண்",
      email: "மின்னஞ்சல் (விருப்பம்)",
      table: "மேசை எண் (விருப்பம்)",
      secureCheckout: "பாதுகாப்பான செக்கவ். கௌண்டரில் கூட செலுத்தலாம்.",
      loadingMenu: "மெனு லோட் ஆகிறது...",
      noItems: "இந்த வகையில் விறையானவை இல்லை.",
      categories: {
        All: "அனைத்தும்", Starters: "தொடக்கம்", "Main Course": "முக்கிய உணவு",
        Beverages: "பானங்கள்", Desserts: "இனிப்புகள்"
      },
    },
  },
};

i18n.use(initReactI18next).init({
  resources,
  lng: localStorage.getItem("lang") || "en",
  fallbackLng: "en",
  interpolation: { escapeValue: false },
});

export default i18n;
