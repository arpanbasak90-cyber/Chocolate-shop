# 🍫 ZORA SHOP — Premium Homemade Chocolate E-Commerce Platform

> *"Sweetness in Every Bite!"*

**ZORA SHOP** is a modern, responsive, chocolate-themed e-commerce prototype crafted for an artisanal homemade chocolate business. It features dual role-based access for Customers and Shopkeepers, interactive piece/box packaging selectors, simulated checkout with Cash on Delivery and UPI QR, dynamic analytics, and complete catalog management for 52 chocolate varieties.

---

## ✨ Key Features

### 🛍️ Customer Experience
- **Dual Gateway Entry:** Choose between Customer Shopping and Shopkeeper Admin consoles.
- **52 Chocolate Varieties:** Handcrafted classics, roasted nuts, authentic Indian festive fusion (*Rasmalai, Gulkand, Kaju Katli, Paan*), crunchy cookies (*Oreo, Biscoff, KitKat*), and luxury gift hampers.
- **Flexible Packaging:** Select between individual pieces or luxury 250g/500g boxes with live price calculation.
- **Interactive Shopping Cart:** Real-time quantity adjustments, subtotal calculation, free shipping tracker, and promo code support (`SWEET10`, `ZORA100`, `FESTIVE15`).
- **Streamlined Checkout:** Customer contact info, detailed delivery address, and simulated payment methods (Cash on Delivery & instant UPI QR simulation).
- **Direct WhatsApp Ordering:** Prefilled WhatsApp message generator linking directly to the kitchen phone number (`+91 98980 14090`).
- **Fail-Safe Image System:** Built-in vector chocolate fallback artwork ensuring zero broken image icons even on slow networks.

### 🏪 Shopkeeper Admin Console
- **Demo Credentials:** `admin@zorashop.demo` / `demo123` (with 1-click auto-fill).
- **6 Real-time KPI Cards:** Registered Customers, Login Events, Total Orders, Pending Preparation, Completed Orders, and Completed Revenue.
- **Live Order Management:** Status pipeline switcher (*Order Placed → Confirmed → Preparing → Out for Delivery → Delivered → Rejected*).
- **Customer Directory:** Registered customer records with order history count.
- **Product Catalog Management:** Edit per-piece and 250g box prices, toggle in-stock/sold-out status, and add new varieties.
- **Revenue & Analytics:** Breakdown by payment method (COD vs UPI) and average order value.

---

## 🛠️ Tech Stack

- **Framework:** [React 18](https://react.dev/) + [Vite](https://vitejs.dev/)
- **Routing:** [React Router v6](https://reactrouter.com/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/) with custom chocolate palette (`chocolate`, `caramel`, `cream`, `gold`)
- **Icons:** [Lucide React](https://lucide.dev/)
- **State & Storage:** React Context API + LocalStorage persistence

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v16 or higher)
- [npm](https://www.npmjs.com/)

### Installation & Run

```bash
# 1. Clone the repository
git clone https://github.com/arpanbasak90-cyber/Chocolate-shop.git
cd Chocolate-shop

# 2. Install dependencies
npm install

# 3. Start local development server
npm run dev

# 4. Build for production
npm run build
```

The application will be running at `http://localhost:5173/`.

---

## 📄 License
This project is open-source under the [MIT License](LICENSE).
