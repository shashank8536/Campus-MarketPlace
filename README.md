# Campus Marketplace 🎓

A modern, full-stack web application that enables college students to **buy**, **sell**, and **exchange** items within their campus community. Built with a focus on trust, real-time engagement, and user safety.

## ✨ Key Features

- **🛍️ Buy & Sell** - Browse and list items available for purchase with support for multiple image uploads.
- **🔄 Barter / Exchange Engine** - A dedicated engine for proposing trades. Users can bid their own active items in exchange for others. Includes a transaction state machine that automatically links items when a trade is accepted.
- **💬 Real-Time Chat** - Integrated Socket.io messaging allows students to negotiate and discuss listings instantly. Includes unread message counts and online notifications.
- **🔐 Closed-Loop Campus Trust** - Registration is strictly limited to university students via `@gla.ac.in` email domain validation, backed by an active email verification lifecycle using Nodemailer.
- **⭐ Reviews & Ratings** - A post-transaction review system. Users can rate buyers/sellers, and average ratings are dynamically calculated using MongoDB aggregation pipelines.
- **🛡️ Gender-Based Privacy System** - Safety-first design: phone numbers of female users are strictly hidden server-side from all other users. Contact is restricted to email and in-app chat for privacy.
- **📱 Premium Mobile-First UI** - Modern glassmorphism, gradient designs, and responsive layouts built without heavy UI frameworks.

## 🚀 Tech Stack

### Frontend
- **React** - UI library
- **Vite** - Build tool
- **React Router** - Navigation
- **Socket.io-client** - Real-time bidirectional event-based communication
- **Modern CSS** - Custom styling, glassmorphism & gradient design

### Backend
- **Node.js** - Runtime environment
- **Express** - Web framework
- **MongoDB & Mongoose** - Database and ODM
- **Socket.io** - Real-time chat backend with authenticated sessions
- **Multer** - Multipart/form-data middleware for image uploads
- **Nodemailer** - SMTP email service for verification tokens
- **bcryptjs** - Password hashing
- **express-session & connect-mongo** - Persistent session management

## 📁 Project Structure

```
campus-marketplace/
├── backend/
│   ├── config/              # MongoDB connection
│   ├── middleware/          # Auth and Upload (Multer) middleware
│   ├── models/              # Mongoose schemas (User, Listing, Message, ExchangeRequest, Review)
│   ├── routes/              # Express API endpoints
│   ├── utils/               # Nodemailer email service
│   ├── server.js            # Express & Socket.io server entry point
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/      # Reusable UI components (Navbar, ExchangeCard, ChatWidget, etc.)
│   │   ├── context/         # React Contexts (AuthContext, SocketContext)
│   │   ├── pages/           # Route views (Home, Profile, ListingDetails, etc.)
│   │   ├── App.jsx          # Main application routing
│   │   └── main.jsx         # React DOM entry
│   ├── package.json
│   └── vite.config.js
│
└── README.md
```

## 🛠️ Installation & Setup

### Prerequisites
- **Node.js** (v14 or higher)
- **MongoDB** (running locally OR MongoDB Atlas account)
- **SMTP Account** (e.g., Gmail App Password) for sending emails

### Step 1: Clone the Project
```bash
git clone https://github.com/shashank8536/Campus-MarketPlace.git
cd campus-marketplace
```

### Step 2: Backend Setup

```bash
# Navigate to backend folder
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env
```

**Configure `.env` in backend:**
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/campus-marketplace
SESSION_SECRET=your_super_secret_session_key
FRONTEND_URL=http://localhost:5173

# Email Config (Gmail example)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
SMTP_FROM_NAME=Campus Marketplace
```

Start the backend:
```bash
npm run dev
```

### Step 3: Frontend Setup

Open a **new terminal** window:

```bash
# Navigate to frontend folder
cd frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```

Frontend will run on **http://localhost:5173**


## 🗄️ Database Schema Overview

- **User**: Name, Email (verified), Password (hashed), Campus ID, Gender, Phone Number, Ratings.
- **Listing**: Title, Description, Type (buy/sell/exchange), Price, Category, Images, Status, Seller.
- **ExchangeRequest**: Requester, RequestedItem, OfferedItem, Status, Messages.
- **Message**: Sender, Receiver, Listing, Content, Read status.
- **Review**: Reviewer, Reviewee, Listing, Rating, Comment.

## 🔐 Security Features

- Passwords hashed using `bcryptjs`.
- Session-based authentication stored securely in MongoDB via `connect-mongo`.
- Socket.io connections authenticated via shared session middleware.
- API endpoints protected by auth middleware.
- Server-side stripping of sensitive fields (e.g., hiding female users' phone numbers at the API level).
- Strict email domain validation for exclusive campus access.

## 👨‍💻 Author

Built for campus marketplace demo by **Shashank Shekhar**.

---

**Ready to run!** Follow the installation steps above and you'll have a fully functional campus marketplace in minutes. Perfect for hackathon demos! 🎉
