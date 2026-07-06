# 🍽️ Restaurant QR Menu & Ordering App

A complete, production-ready restaurant ordering system with QR code scanning, live order tracking, admin dashboard, kitchen display, multi-language support, and payment integration.

## 🚀 Tech Stack

- **Frontend:** React 18 (Vite) + Tailwind CSS + React Router + i18next
- **Backend:** Spring Boot 3.3 + Spring Security (JWT) + Spring Data JPA
- **Database:** MySQL 8
- **Integrations:** Razorpay, WhatsApp Web, Twilio SMS, Gmail SMTP

## ✨ Features

### Customer
- 📱 Scan QR at table → auto-fills table number
- 🍲 Beautiful responsive menu with veg/non-veg indicators
- 🛒 Cart with quantity controls
- 💬 WhatsApp checkout with formatted order summary
- 💳 Razorpay online payment
- 📜 Live order status tracking (auto-refresh every 10s)
- 🌐 Multi-language: English, Hindi, Tamil

### Admin
- 🔐 JWT-secured login (default: `admin` / `admin@123`)
- 📊 Dashboard with today's stats & revenue
- 📋 Live orders board with status management
- 🍲 Menu CRUD (multi-language, veg toggle, availability)
- 📱 QR code generator per table (download + print)
- 👨‍🍳 Kitchen Display System (Kanban-style, sound alerts, urgency rings)
- 📧 Email + SMS notifications on order/status changes

## 📁 Project Structure

```
restaurant-qr-project/
├── docker-compose.yml
├── README.md
├── restaurant-qr-backend/
│   ├── pom.xml
│   ├── Dockerfile
│   └── src/main/
│       ├── java/com/restaurant/qrmenu/
│       │   ├── QrMenuApplication.java
│       │   ├── config/       (CORS, DataSeeder)
│       │   ├── controller/   (Menu, Order, Table, Auth)
│       │   ├── dto/          (OrderRequest)
│       │   ├── entity/       (MenuItem, Order, OrderItem, RestaurantTable, AdminUser)
│       │   ├── repository/
│       │   ├── security/     (JwtUtil, JwtFilter, SecurityConfig)
│       │   └── service/      (Menu, Order, Notification)
│       └── resources/application.properties
└── restaurant-qr-frontend/
    ├── package.json
    ├── vite.config.js
    ├── tailwind.config.js
    ├── index.html
    ├── Dockerfile
    ├── nginx.conf
    ├── .env.example
    └── src/
        ├── main.jsx
        ├── i18n.js
        ├── index.css
        ├── utils/api.js
        └── components/
            ├── MenuApp.jsx
            ├── OrderTracking.jsx
            ├── AdminLogin.jsx
            ├── AdminDashboard.jsx
            ├── QRGenerator.jsx
            ├── KitchenDisplay.jsx
            ├── LanguageSwitcher.jsx
            └── ProtectedRoute.jsx
```

## 🚀 Quick Start

### Option A — Docker (Recommended)

```bash
cd restaurant-qr-project
docker-compose up --build
```

Wait for MySQL to be healthy, then:
- **Menu (customer):** http://localhost:5173
- **Admin:** http://localhost:5173/admin/login  (admin / admin@123)
- **Kitchen:** http://localhost:5173/kitchen
- **QR generator:** http://localhost:5173/admin/qr
- **API:** http://localhost:8080/api

### Option B — Manual (Local Dev)

**1. MySQL** (needs to be running on `localhost:3306`)
```sql
CREATE DATABASE restaurant_qr_db;
```
Update `restaurant-qr-backend/src/main/resources/application.properties` with your MySQL credentials.

**2. Backend**
```bash
cd restaurant-qr-backend
mvn spring-boot:run
# API on http://localhost:8080
```

**3. Frontend**
```bash
cd restaurant-qr-frontend
cp .env.example .env      # update with your keys
npm install
npm run dev
# App on http://localhost:5173
```

## 🔑 Configuration

### Backend environment variables (`application.properties` or Docker env)

| Variable | Default | Description |
|---|---|---|
| `DB_HOST` | localhost | MySQL host |
| `DB_PORT` | 3306 | MySQL port |
| `DB_NAME` | restaurant_qr_db | Database name |
| `DB_USER` | root | MySQL user |
| `DB_PASSWORD` | root | MySQL password |
| `JWT_SECRET` | (change me!) | JWT signing key (≥32 chars) |
| `ADMIN_USER` | admin | Default admin username |
| `ADMIN_PASS` | admin@123 | Default admin password |
| `MAIL_USER` | your-email@gmail.com | Gmail SMTP user |
| `MAIL_PASS` | your-app-password | Gmail app password |
| `TWILIO_SID` | ACxxxx... | Twilio account SID |
| `TWILIO_TOKEN` | your_token | Twilio auth token |
| `TWILIO_FROM` | +1234567890 | Twilio verified number |
| `NOTIFICATIONS_ENABLED` | false | Enable email/SMS |

### Frontend (`.env`)

| Variable | Default | Description |
|---|---|---|
| `VITE_API_BASE` | http://localhost:8080/api | Backend base URL |
| `VITE_PUBLIC_URL` | http://localhost:5173 | Public URL encoded in QRs |
| `VITE_WHATSAPP` | 919999999999 | Restaurant WhatsApp number |
| `VITE_RAZORPAY_KEY` | rzp_test_YOUR_KEY_ID | Razorpay public key |

## 🌐 API Endpoints

### Public
- `GET  /api/menu` — List all menu items (optional `?category=Starters`)
- `POST /api/orders` — Place order
- `GET  /api/orders/{id}` — Get single order (for tracking)
- `POST /api/auth/login` — Admin login → returns JWT
- `GET  /api/auth/me` — Verify JWT

### Admin (Bearer token required)
- `POST /api/menu`, `PUT /api/menu/{id}`, `DELETE /api/menu/{id}`
- `GET  /api/orders`, `PATCH /api/orders/{id}/status`
- `GET/POST/PUT/DELETE /api/tables`

## 🔄 Order Status Flow

```
PENDING → PREPARING → READY → SERVED
   ↓                                ↑
   └─ CANCELLED       PAID (via Razorpay)
```

Status changes automatically trigger email + SMS if `NOTIFICATIONS_ENABLED=true`.

## 🎯 QR Flow

1. Admin creates tables in `/admin/qr` → unique QR encoding `?table=T1`
2. Print QR → place on physical table
3. Customer scans → lands on `/?table=T1` → table auto-filled in cart
4. Order placed → tracked at `/track/{orderId}`

## 💬 WhatsApp Message Format

```
*New Order - Spice Garden*
*Order ID:* #12
--------------------------------
*Customer:* Rahul
*Phone:* 9876543210
*Table No:* T1
*Time:* 12/10/2025, 8:30 PM
--------------------------------
*Order Summary:*
1. Butter Chicken  x2  -  ₹698.00
2. Naan  x3  -  ₹135.00
--------------------------------
*Grand Total: ₹833.00*
```

## 🎨 UI Screens

| Route | Access | Purpose |
|---|---|---|
| `/` | Public | Customer menu (auto table from QR) |
| `/track/:orderId` | Public | Live order status tracking |
| `/admin/login` | Public | JWT admin login |
| `/admin` | 🔒 Admin | Dashboard — orders + menu CRUD + stats |
| `/admin/qr` | 🔒 Admin | QR generator (download + print per table) |
| `/kitchen` | 🔒 Admin | Kitchen Display Screen (Kanban) |

## 🧪 Testing the API

```bash
# Login and grab token
TOKEN=$(curl -s -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin@123"}' | jq -r .token)

# Fetch orders
curl http://localhost:8080/api/orders -H "Authorization: Bearer $TOKEN"

# Add menu item
curl -X POST http://localhost:8080/api/menu \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Naan","price":45,"category":"Main Course","isAvailable":true,"isVeg":true,"imageUrl":"https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800"}'
```

## 🛡️ Security Notes

- Change `JWT_SECRET` and `ADMIN_PASS` before production.
- Configure HTTPS via a reverse proxy (nginx/traefik) in production.
- Restrict CORS origins in `CorsConfig.java` for production.
- Use environment variables for all secrets (never commit them).

## 📧 Setting Up Notifications

**Gmail:**
1. Enable 2FA on your Google account.
2. Generate an [App Password](https://myaccount.google.com/apppasswords).
3. Set `MAIL_USER` and `MAIL_PASS`.

**Twilio SMS:**
1. Sign up at [twilio.com](https://twilio.com), get free trial credits.
2. Get a verified number.
3. Set `TWILIO_SID`, `TWILIO_TOKEN`, `TWILIO_FROM`.

**Razorpay:**
1. Sign up at [razorpay.com](https://razorpay.com).
2. Get test keys from Dashboard → Settings → API Keys.
3. Set `VITE_RAZORPAY_KEY` in frontend `.env`.

## 🛠️ Troubleshooting

**Backend won't start:** Check MySQL is running and credentials match.

**JWT errors:** Ensure `JWT_SECRET` is at least 32 characters.

**Notifications not sending:** Set `NOTIFICATIONS_ENABLED=true` and configure Mail/Twilio credentials.

**CORS errors:** Update allowed origins in `CorsConfig.java`.

**Razorpay "key not found":** Sign up at razorpay.com and use your test key.

## 📄 License

MIT — Free for commercial use.

---

**Built with ❤️ for local restaurants • v1.0**
