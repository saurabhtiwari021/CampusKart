# CampusKart 🛍️

**Your campus marketplace — buy, sell, rent, and chat, right from your college email.**

CampusKart is a full-stack campus marketplace platform that enables college students to buy, sell, rent, donate, and exchange textbooks, bicycles, electronics, and other essentials within their campus community. The platform features secure campus-only authentication, real time messaging, wishlists, ratings and reviews, product search and filtering, and a modern responsive interface designed to simplify student to student transactions.

Live demo: https://campus-kart-one.vercel.app/#/

---

## 📸 Screenshots

**Landing page**
![Landing page](screenshots/01-landing.png)

**Login / Sign up (KIIT email only)**
![Auth page](screenshots/02-auth.png)

**Marketplace with filters**
![Marketplace](screenshots/03-marketplace.png)

**User dashboard**
![Dashboard](screenshots/04-dashboard.png)

---

## ✨ Features

- **Campus-only auth** — sign-up restricted to `@kiit.ac.in` emails, JWT-based sessions
- **Listings** — create, edit, delete listings across Sell / Rent / Donate / Exchange, with multi-image upload via Cloudinary
- **Search & filters** — full-text relevance search, category/type/condition/price filters, all server-side
- **Wishlist** — save listings for later, one tap
- **Real-time chat** — Socket.io-powered private conversations per listing, with typing indicators, seen receipts, and in-chat image sharing
- **Notifications** — live updates for new messages, wishlist saves, and reviews
- **Reviews & ratings** — buyers can review sellers after a completed sale/rental; seller rating updates automatically
- **Rent calendar** — date-range availability and booking for rental listings
- **Fraud detection** — new listings priced far below category average are automatically flagged for admin review
- **Admin panel** — user management (ban/unban), listing moderation, report resolution, and platform stats
- **Reporting** — users can report suspicious listings or other users

---

## 🛠️ Tech Stack

**Frontend**
- React 18 (Vite)
- React Router
- Tailwind CSS
- Socket.io Client

**Backend**
- Node.js + Express
- MongoDB + Mongoose
- Socket.io
- JWT authentication
- Cloudinary (image storage)
- Multer (file uploads)

---

## 📁 Project Structure

```
campuskart/
├── backend/
│   ├── src/
│   │   ├── config/         # DB + Cloudinary setup
│   │   ├── controllers/    # Route handlers
│   │   ├── middleware/     # Auth, admin guard, error handling
│   │   ├── models/         # Mongoose schemas
│   │   ├── routes/         # Express routers
│   │   ├── socket/         # Socket.io server + event handlers
│   │   └── utils/          # ApiError, ApiResponse, asyncHandler, notify
│   └── server.js
│
└── frontend/
    ├── src/
    │   ├── *.jsx            # Page + feature components
    │   ├── AppContext.jsx   # Global state (auth, listings, wishlist, socket)
    │   └── api.js           # Backend API client
    └── vite.config.js
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- A MongoDB Atlas cluster (or local MongoDB)
- A free Cloudinary account

### 1. Clone the repo
```bash
git clone https://github.com/<your-username>/campuskart.git
cd campuskart
```

### 2. Backend setup
```bash
cd backend
npm install
cp .env.example .env   # fill in the values below
npm run dev
```

**Backend `.env` variables:**

| Variable | Description |
|---|---|
| `PORT` | Port for the Express server (default `5000`) |
| `MONGODB_URI` | MongoDB Atlas connection string |
| `JWT_SECRET` | Long random string for signing JWTs |
| `JWT_EXPIRES_IN` | Token lifetime (e.g. `7d`) |
| `FRONTEND_URL` | Frontend origin(s), comma-separated, for CORS + Socket.io |
| `ALLOWED_EMAIL_DOMAINS` | Comma-separated list of allowed sign-up email domains |
| `CLOUDINARY_CLOUD_NAME` | From your Cloudinary dashboard |
| `CLOUDINARY_API_KEY` | From your Cloudinary dashboard |
| `CLOUDINARY_API_SECRET` | From your Cloudinary dashboard |

### 3. Frontend setup
```bash
cd frontend
npm install
cp .env.example .env   # fill in the values below
npm run dev
```

**Frontend `.env` variables:**

| Variable | Description |
|---|---|
| `VITE_API_URL` | Backend API base URL, e.g. `http://localhost:5000/api` |
| `VITE_SOCKET_URL` | Backend base URL for Socket.io, e.g. `http://localhost:5000` |

The app will be running at `http://localhost:5173` (frontend) and `http://localhost:5000` (backend API).

---

## 🧭 API Overview

| Resource | Base route |
|---|---|
| Auth | `/api/auth` |
| Listings | `/api/listings` |
| Wishlist | `/api/wishlist` |
| Chats & messages | `/api/chats` |
| Reviews | `/api/reviews` |
| Notifications | `/api/notifications` |
| Reports | `/api/reports` |
| Bookings (rentals) | `/api/bookings` |
| Admin | `/api/admin` |

All protected routes require a `Bearer <token>` header, obtained from `/api/auth/login`.

---

## 🔌 Real-Time Events (Socket.io)

| Event | Direction | Purpose |
|---|---|---|
| `join_chat` | client → server | Join a private chat room, marks messages seen |
| `send_message` | client → server | Send a text message |
| `new_message` | server → client | New message broadcast to both participants |
| `typing` | both | Typing indicator, throttled client-side |
| `messages_seen` | server → client | Seen-receipt update |
| `notification:new` | server → client | Live notification (new message, wishlist, review) |

---

## 🗺️ Roadmap / Possible Extensions

- Payment integration for completed sales
- Email verification and password reset flow
- Push notifications (mobile)
- Order history and transaction records

---

## 👤 Author

**Saurabh Tiwari** — Final-year B.Tech CSE, KIIT University

Built as a full-stack academic project focused on real-world campus commerce, emphasizing scalable architecture, real-time communication, secure authentication, and modern web development practices.
---

## 📄 License

**All Rights Reserved.** This project and its source code are proprietary — no part of it may be copied, modified, deployed, or used commercially without explicit written permission. See [LICENSE](LICENSE) for full terms.

