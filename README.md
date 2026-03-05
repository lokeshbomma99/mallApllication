# 🛍️ SuperMall — Full-Stack MERN E-Commerce Platform

A complete, enterprise-grade shopping mall web application built with the **MERN stack** (MongoDB, Express, React, Node.js) featuring 3 user modules, real-time features, AI recommendations, and much more.

---

## 🚀 Tech Stack

| Layer     | Technology                                         |
|-----------|----------------------------------------------------|
| Frontend  | React 18 + Vite + Tailwind CSS                     |
| Backend   | Node.js + Express.js                               |
| Database  | MongoDB + Mongoose                                 |
| Auth      | JWT (JSON Web Tokens)                              |
| Real-time | Socket.IO                                          |
| Charts    | Recharts                                           |
| i18n      | react-i18next (EN / AR / HI / GU)                  |

---

## 📁 Project Structure

```
supermall/
├── backend/
│   ├── config/
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── productController.js   ← AI recommendations, search
│   │   └── orderController.js     ← COD, loyalty points
│   ├── middleware/
│   │   └── auth.js                ← JWT + role protection
│   ├── models/
│   │   ├── User.js
│   │   ├── Shop.js
│   │   ├── Product.js
│   │   ├── Order.js
│   │   └── index.js               ← Review, Cart, Wishlist, Coupon,
│   │                                 Chat, Category, Banner, Return, Notification
│   ├── routes/                    ← 15 route files
│   ├── utils/
│   └── server.js                  ← Express + Socket.IO
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── common/
    │   │   │   ├── ProductCard.jsx       ← Wishlist, cart, rating
    │   │   │   └── FlashSaleTimer.jsx    ← Live countdown
    │   │   ├── admin/
    │   │   │   └── AdminLayout.jsx
    │   │   ├── shopowner/
    │   │   │   └── ShopOwnerLayout.jsx
    │   │   └── customer/
    │   │       └── CustomerLayout.jsx   ← Full navbar, notifications
    │   ├── context/
    │   │   ├── AuthContext.jsx
    │   │   └── CartContext.jsx
    │   ├── pages/
    │   │   ├── auth/        LoginPage, RegisterPage
    │   │   ├── customer/    HomePage, ShopPage, ProductDetailPage, CartPage,
    │   │   │                CheckoutPage, WishlistPage, OrdersPage, OrderDetailPage,
    │   │   │                ProfilePage, SearchPage, ComparePage
    │   │   ├── shopowner/   ShopDashboard, ShopProducts, ShopOrders, ShopAnalytics,
    │   │   │                ShopSetup, ShopCoupons, ShopReturns
    │   │   └── admin/       AdminDashboard, AdminUsers, AdminShops, AdminAnalytics,
    │   │                    AdminCategories, AdminBanners
    │   └── utils/
    │       ├── api.js        ← Axios instance with JWT interceptor
    │       └── i18n.js       ← Multi-language config
    ├── tailwind.config.js
    └── vite.config.js
```

---

## 🧩 Modules & Features

### 👤 Customer Module
- Home page: Hero banner, categories, flash sales, trending products
- Smart search with filters (category, price, flash sale, sort)
- Product detail with reviews, recommendations, recently viewed
- Cart management (add/remove/update quantities)
- Checkout with COD + coupon code validation
- Wishlist (toggle heart button per product)
- Order tracking with status history timeline
- Loyalty points system (earn points per purchase)
- Product comparison (side-by-side)
- Social sharing (WhatsApp, Instagram)
- Profile management + address book
- Multi-language: English / Arabic / Hindi / Gujarati

### 🏪 Shop Owner Module
- Shop registration & admin approval workflow
- Dashboard with key metrics
- Add/Edit products with images, flash sale toggle, variants
- Order management (confirm/ship/deliver orders)
- Sales analytics with charts (daily revenue, top products)
- Coupon creation & management
- Return & refund request handling
- PDF revenue report export

### 🔐 Admin Module
- Platform-wide dashboard with stats & charts
- User management: ban/unban customers & shop owners
- Shop approval/rejection workflow
- Platform analytics (revenue, categories, trends)
- Category & icon management
- Hero banner management

### 🚀 Extra Features
- ⚡ Flash sales with live countdown timers
- 🤖 AI-style product recommendations (by category + tags)
- 💬 Real-time chat (customer ↔ shop owner) via Socket.IO
- 🔔 Real-time notifications (order updates, promos)
- 📧 Email notifications (Nodemailer)
- 🔔 Browser push notifications (Web Push API)
- 🎯 Loyalty points & rewards
- 🏷️ Coupon & discount codes (% or fixed)
- ↩️ Return & refund management
- 🌐 Multi-language (EN/AR/HI/GU with RTL support)
- 📊 Revenue reports (PDF export via PDFKit)
- 🔍 Full-text search with MongoDB text index

---

## ⚡ Quick Start

### Prerequisites
- Node.js v18+
- MongoDB (local or Atlas)

### 1. Clone & Setup Backend
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your MongoDB URI and secrets
npm run dev
```

### 2. Setup Frontend
```bash
cd frontend
npm install
npm run dev
```

### 3. Open in Browser
- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:5000/api/health

---

## 🔑 API Endpoints

| Method | Endpoint                      | Description                  | Auth    |
|--------|-------------------------------|------------------------------|---------|
| POST   | /api/auth/register            | Register new user            | Public  |
| POST   | /api/auth/login               | Login                        | Public  |
| GET    | /api/products                 | Get products (search/filter) | Public  |
| GET    | /api/products/:id/recommendations | AI recommendations       | Public  |
| POST   | /api/cart/add                 | Add to cart                  | Customer|
| POST   | /api/orders                   | Place order (COD)            | Customer|
| GET    | /api/orders/my                | My orders                    | Customer|
| POST   | /api/wishlist/toggle/:id      | Toggle wishlist              | Customer|
| POST   | /api/reviews                  | Submit review                | Customer|
| POST   | /api/coupons/validate         | Validate coupon code         | Customer|
| GET    | /api/shops/my                 | Get my shop                  | ShopOwner|
| GET    | /api/orders/analytics/:shopId | Shop analytics               | ShopOwner|
| GET    | /api/users                    | All users                    | Admin   |
| PUT    | /api/users/:id/ban            | Ban user                     | Admin   |
| PUT    | /api/shops/:id/approve        | Approve shop                 | Admin   |

---

## 🌐 Environment Variables

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/supermall
JWT_SECRET=your_secret_here
JWT_EXPIRE=7d
CLIENT_URL=http://localhost:5173
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
VAPID_PUBLIC_KEY=...
VAPID_PRIVATE_KEY=...
```

---

## 🎨 Design System

- **Primary Color:** Blue 600 (`#2563eb`)
- **Font:** Plus Jakarta Sans
- **Theme:** Modern & Clean White/Blue
- **Fully Responsive:** Mobile-first design with Tailwind CSS
- **Animations:** Fade-in, slide-up transitions throughout

---

Built with ❤️ — SuperMall MERN Stack Project
