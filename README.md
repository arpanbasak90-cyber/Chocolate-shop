# 🍫 ZORA SHOP — Production Homemade Chocolate E-Commerce Platform

> *"Sweetness in Every Bite!"*

**ZORA SHOP** is a production-grade, secure, chocolate-themed e-commerce platform built for an artisanal homemade chocolate business. It features a complete Node.js/Express REST backend, dual PostgreSQL & persistent database engine, Prisma ORM, Dual-OTP authentication (Email + Mobile SMS), Razorpay payment gateway integration, server-side price verification, automated WhatsApp dispatch, and an intuitive Shopkeeper operations console.

---

## 🏗️ Architecture Overview

```
demo website/
├── server/                     # Production Node.js & Express REST Backend
│   ├── config/                 # Environment validation & Razorpay configuration
│   ├── controllers/            # Auth, Product, Cart, Order, Payment & Admin logic
│   ├── middleware/             # JWT auth verification, rate limiters, error handler
│   ├── prisma/                 # Prisma PostgreSQL schema (12 models) and seeder
│   ├── routes/                 # Express API routes (/api/*)
│   ├── services/               # DB adapter, Nodemailer, SMS (Twilio/Fast2SMS), WhatsApp
│   └── index.js                # Server entry point (port 5000)
├── src/                        # Production React (Vite) Frontend
│   ├── api/client.js           # Production API client with HTTP-only credentials
│   ├── components/             # Dual-OTP login cards, Navigation, Cart, Footer
│   ├── context/ShopContext.jsx # React context consuming live backend APIs
│   ├── pages/                  # Shop, Checkout, Order Tracking, Customer & Admin Portals
│   └── utils/razorpay.js       # Dynamic Razorpay Checkout SDK loader
├── package.json                # Frontend package scripts
└── vite.config.js              # Vite server & backend API proxy (/api -> localhost:5000)
```

---

## ✨ Production Features

### 🔐 1. Dual-OTP Authentication (Email + Mobile)
- **Zero Mock Data:** Replaces simulated authentication with a 2-step verification system.
- **Customer Sign In & Registration:** Full Name, Email, and Mobile number. Backend dispatches separate cryptographic 6-digit OTPs to both destinations. Verification of **both** codes is mandatory to establish an authenticated session.
- **Shopkeeper Authentication:** Protected owner email verification requiring dual OTP verification. Public registration is blocked; only authorized owners can access administrative controls.
- **Session Security:** JSON Web Tokens (JWT) issued inside secure, `HttpOnly`, `SameSite=Lax` cookies, protecting against XSS token theft.
- **Brute-Force Protection:** Rate limiting (3 OTP attempts per 15-minute window), 5-minute cryptographic expiration, and single-use invalidation.

### 💳 2. Payment Gateway & Server-Side Security
- **Server-Side Price Recalculation:** Client-submitted prices are strictly untrusted. The backend recalculates item costs directly from the product catalog, applies delivery thresholds, and computes the exact grand total.
- **Razorpay Integration:** Full support for UPI (Google Pay, PhonePe, Paytm), Credit/Debit Cards, and Net Banking.
- **HMAC-SHA256 Signature Verification:** Razorpay payment captures are verified on the server using `crypto.createHmac('sha256', secret)` before orders are marked as `Paid`.
- **Cash on Delivery (COD):** Seamless COD option with server-side address validation and instant order generation.

### 📊 3. Real Accounting & Revenue Analytics
- **Collected Revenue:** Filtered strictly from verified transactions (`Paid` online orders and `Delivered` COD orders). Pending, unpaid, or cancelled orders do not inflate the revenue metrics.
- **Live Pipeline:** Real-time order fulfillment pipeline (*Order Placed → Confirmed → Preparing → Out for Delivery → Delivered → Rejected*).
- **Public & Customer Order Tracking:** Real-time status lookup by Order Number or ID (`/track`) with visual stage timestamps.

### 📱 4. WhatsApp Order Dispatch
- **Click-to-Chat Generator:** Formats complete itemized orders with customer details, delivery address, and order totals into direct WhatsApp links targeting the kitchen phone number (`+91 98980 14090`).
- **Cloud API Ready:** Pluggable WhatsApp Business Cloud API integration ready for automated push notifications.

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js** (v18 or higher recommended)
- **npm** (v9 or higher)
- **PostgreSQL** (optional for production; an automated local persistent engine runs out of the box for local development)

### 2. Environment Configuration
Create your environment file in the `server` directory:
```bash
cp server/.env.example server/.env
```

Fill in your real production credentials:
- `DATABASE_URL`: PostgreSQL connection string (e.g., `postgresql://postgres:pass@localhost:5432/zorashop`)
- `RAZORPAY_KEY_ID` & `RAZORPAY_KEY_SECRET`: Razorpay API keys from dashboard
- `SMTP_USER` & `SMTP_PASS`: Gmail App Password or SMTP provider for real email OTPs
- `FAST2SMS_API_KEY` or `TWILIO_*`: SMS provider credentials for real mobile OTPs
- `JWT_SECRET`: Random 64-character secret key

*(Note: In development without external SMTP/SMS keys, the server securely displays the generated 6-digit OTP codes in the server terminal for testing.)*

### 3. Run Locally

**Start the Backend Server (Port 5000):**
```bash
cd server
npm install
npm run seed     # Seeds 52 authentic Zora Shop chocolate varieties
npm run dev      # or node index.js
```

**Start the Frontend Dev Server (Port 5173):**
```bash
# In the root project folder
npm install
npm run dev
```

Visit **`http://localhost:5173`** in your browser.

---

## 🛡️ Production Deployment

### Building for Production
```bash
npm run build
```

### PostgreSQL Migration (with Prisma)
When deploying to Render, Railway, AWS RDS, or Supabase:
```bash
cd server
npx prisma db push
npx prisma db seed
```

---

## 📜 License
Developed for **ZORA SHOP** — Handcrafted Homemade Chocolates.
Tagline: *"Sweetness in Every Bite!"*
