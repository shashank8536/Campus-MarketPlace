# Campus Marketplace - Quick Start Guide

## Prerequisites Check
- [ ] Node.js installed (v14+)
- [ ] MongoDB installed locally OR MongoDB Atlas account
- [ ] Terminal/Command Prompt ready

## Installation Steps

### 1. Backend Setup
```bash
cd backend
npm install
# Backend dependencies will be installed
```

### 2. Configure Database
Edit `backend/.env` file:
- For **local MongoDB**: Use `mongodb://localhost:27017/campus-marketplace`
- For **MongoDB Atlas**: Replace with your connection string

### 3. Frontend Setup
```bash
cd frontend
npm install
# Frontend dependencies will be installed
```

## Running the Application

### Start Backend (Terminal 1)
```bash
cd backend
npm run dev
# Server will start on http://localhost:5000
```

### Start Frontend (Terminal 2)
```bash
cd frontend
npm run dev
# App will open on http://localhost:5173
```

## First-Time Usage

1. Open **http://localhost:5173** in your browser
2. Click **Sign Up** to create an account
3. Fill in your details with a campus ID
4. Login with your credentials
5. Click **Post Item** to create your first listing
6. Browse, search, and filter listings

## Common Issues

### MongoDB Connection Error
- Make sure MongoDB is running locally
- OR use MongoDB Atlas connection string

### Port Already in Use
- Backend: Change PORT in .env file
- Frontend: Will auto-assign different port

### Dependencies Not Found
- Run `npm install` in both backend and frontend folders

---

**You're all set!** 🚀
