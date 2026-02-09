# Campus Marketplace 🎓

A modern, full-stack web application that enables college students to **buy**, **sell**, and **exchange** items within their campus community.

## ✨ Features

- **🛍️ Buy** - Browse items available for purchase
- **💰 Sell** - List items you want to sell
- **🔄 Exchange** - Trade items with other students
- **🔍 Search & Filter** - Find items by keyword and type
- **🔐 Campus Authentication** - Secure login with campus ID verification
- **📱 Responsive Design** - Works seamlessly on mobile and desktop

## 🚀 Tech Stack

### Frontend
- **React** - UI library
- **Vite** - Build tool
- **React Router** - Navigation
- **Modern CSS** - Glassmorphism & gradient design

### Backend
- **Node.js** - Runtime environment
- **Express** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **bcryptjs** - Password hashing
- **express-session** - Session management

## 📁 Project Structure

```
campus-marketplace/
├── backend/
│   ├── config/
│   │   └── db.js              # MongoDB connection
│   ├── middleware/
│   │   └── auth.js            # Authentication middleware
│   ├── models/
│   │   ├── User.js            # User schema
│   │   └── Listing.js         # Listing schema
│   ├── routes/
│   │   ├── auth.js            # Auth endpoints
│   │   └── listings.js        # Listing CRUD endpoints
│   ├── .env.example           # Environment variables template
│   ├── package.json
│   └── server.js              # Express server
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── ListingCard.jsx
│   │   │   └── PostItemForm.jsx
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   └── MyListings.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   ├── App.jsx
│   │   ├── App.css
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
│
└── README.md
```

## 🛠️ Installation & Setup

### Prerequisites
- **Node.js** (v14 or higher)
- **MongoDB** (running locally OR MongoDB Atlas account)
- **npm** or **yarn**

### Step 1: Clone/Navigate to Project
```bash
cd campus-marketplace
```

### Step 2: Backend Setup

```bash
# Navigate to backend folder
cd backend

# Install dependencies
npm install

# Create .env file from example
copy .env.example .env

# Edit .env file with your MongoDB connection string
# For local MongoDB: mongodb://localhost:27017/campus-marketplace
# For MongoDB Atlas: your connection string

# Start the backend server
npm run dev
```

Backend will run on **http://localhost:5000**

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

### Step 4: MongoDB Setup

**Option A: Local MongoDB**
- Ensure MongoDB is installed and running on your machine
- No additional configuration needed if using default port 27017

**Option B: MongoDB Atlas (Cloud)**
1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster
3. Get your connection string
4. Replace `MONGODB_URI` in `.env` file

## 📚 API Documentation

### Authentication Endpoints

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@campus.edu",
  "password": "password123",
  "campusId": "CS2024001"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@campus.edu",
  "password": "password123"
}
```

#### Get Current User
```http
GET /api/auth/me
```

#### Logout
```http
POST /api/auth/logout
```

### Listing Endpoints

#### Get All Listings
```http
GET /api/listings
GET /api/listings?type=sell
GET /api/listings?search=laptop
```

#### Get My Listings
```http
GET /api/listings/my
```

#### Create Listing
```http
POST /api/listings
Content-Type: application/json

{
  "title": "iPhone 13 Pro",
  "description": "Excellent condition, 128GB",
  "type": "sell",
  "price": 45000,
  "category": "Electronics",
  "imageUrl": "https://example.com/image.jpg"
}
```

#### Update Listing
```http
PUT /api/listings/:id
Content-Type: application/json

{
  "title": "Updated Title",
  "price": 40000
}
```

#### Delete Listing
```http
DELETE /api/listings/:id
```

## 🗄️ Database Schema

### User Schema
```javascript
{
  name: String (required),
  email: String (required, unique),
  password: String (required, hashed),
  campusId: String (required),
  timestamps: true
}
```

### Listing Schema
```javascript
{
  title: String (required, max 100 chars),
  description: String (required, max 500 chars),
  type: String (enum: 'buy', 'sell', 'exchange'),
  price: Number (optional for exchange),
  category: String (enum: Electronics, Books, Clothing, etc.),
  imageUrl: String (default placeholder),
  seller: ObjectId (ref: User),
  isActive: Boolean (default: true),
  timestamps: true
}
```

## 🎨 Features Breakdown

### User Features
- ✅ Register with campus ID
- ✅ Secure login/logout
- ✅ Session persistence

### Listing Features
- ✅ Create listings (Buy/Sell/Exchange)
- ✅ Edit own listings
- ✅ Delete own listings
- ✅ View all active listings
- ✅ Filter by type (Buy/Sell/Exchange)
- ✅ Search by keywords

### UI Features
- ✅ Modern gradient design
- ✅ Glassmorphism effects
- ✅ Smooth animations
- ✅ Hover effects
- ✅ Fully responsive
- ✅ Mobile-friendly navigation

## 🔐 Security Features

- Password hashing with bcryptjs
- Session-based authentication
- Protected API routes
- CORS configuration
- Input validation

## 🌐 Environment Variables

Create a `.env` file in the `backend` directory:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/campus-marketplace
SESSION_SECRET=your_super_secret_session_key_change_this
NODE_ENV=development
```

## 🧪 Testing the Application

1. **Register a new user** with campus ID
2. **Login** with credentials
3. **Post an item** (try all types: buy, sell, exchange)
4. **Browse listings** on home page
5. **Filter** by type using tabs
6. **Search** for items
7. **Edit/Delete** your own listings from "My Listings" page
8. **Logout** and verify session cleared

## 📱 Screenshots

The application features:
- Hero section with gradient text
- Filter tabs for Buy/Sell/Exchange
- Card-based listing grid
- Modal forms with animations
- Responsive navbar

## 🚧 Future Enhancements (Not Implemented)

This is a hackathon-ready MVP. Possible future additions:
- User profiles
- Direct messaging
- Image uploads
- Email verification
- Rating system
- Transaction history

## 📝 License

MIT License - Free to use for educational purposes

## 👨‍💻 Author

Built for campus marketplace demo

---

**Ready to run!** Follow the installation steps above and you'll have a fully functional campus marketplace in minutes. Perfect for hackathon demos! 🎉
