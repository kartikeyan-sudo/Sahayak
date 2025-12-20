# 🚀 Quick Start Guide - Sahayak

## Prerequisites Check
- ✅ Node.js installed (v16+)
- ✅ npm installed
- ⚠️ MongoDB (optional for prototype - works with LocalStorage only)

---

## Step 1: Install Backend Dependencies

```powershell
cd backend
npm install
```

**Installed packages:**
- express
- mongoose
- cors
- nodemon (dev dependency)
- dotenv

---

## Step 2: Install Frontend Dependencies

```powershell
cd frontend
npm install
```

**Installed packages:**
- React 18
- Vite
- All Vite/React dependencies

---

## Step 3: Start Backend Server

```powershell
cd backend
npm run dev
```

**Expected output:**
```
🚀 Sahayak Backend running on http://localhost:5000
✅ MongoDB connected successfully (if MongoDB is running)
```

**Note:** If MongoDB is not installed, the app will still work with frontend LocalStorage only.

---

## Step 4: Start Frontend Server

Open a **new terminal**:

```powershell
cd frontend
npm run dev
```

**Expected output:**
```
VITE v7.3.0  ready in XXX ms
➜  Local:   http://localhost:5173/
```

---

## Step 5: Access the Application

1. Open browser: **http://localhost:5173**
2. Login with:
   - **Username:** `demo`
   - **Password:** `sahayak2024`

---

## 🎯 What You Can Do Now

### ✅ Already Working (LocalStorage Mode)
- Login/Logout with session management
- Browse all 5 pages (Overview, Schemes Hub, FIR, Resources, Copilot)
- View government schemes catalog
- Bookmark schemes
- Create and save FIR drafts
- View activity logs
- See real-time scam alerts
- All data persists in browser LocalStorage

### 🔄 Backend API Ready (Optional)
If MongoDB is connected, these APIs work:
- GET/POST/PATCH/DELETE schemes
- GET/POST/PATCH/DELETE FIR drafts
- GET/POST/PATCH/DELETE alerts

---

## 📁 Project Files Created

### Backend
```
backend/
├── models/
│   ├── Scheme.js          # Mongoose schema for schemes
│   ├── FIRDraft.js        # Mongoose schema for FIR drafts
│   └── Alert.js           # Mongoose schema for alerts
├── routes/
│   ├── schemes.js         # CRUD routes for schemes
│   ├── fir.js             # CRUD routes for FIR drafts
│   └── alerts.js          # CRUD routes for alerts
├── index.js               # Express server with CORS
├── package.json           # Dependencies and scripts
├── .env                   # Environment variables
└── .env.example           # Environment template
```

### Frontend
```
frontend/
├── src/
│   ├── components/
│   │   ├── Login.jsx          # Login page with session
│   │   ├── Topbar.jsx         # Navigation bar
│   │   ├── AlertTicker.jsx    # Scam alerts ticker
│   │   └── SchemeModal.jsx    # Scheme details modal
│   ├── pages/
│   │   ├── Overview.jsx       # Dashboard with stats
│   │   ├── SchemesHub.jsx     # Schemes catalog
│   │   ├── FIRPage.jsx        # FIR draft creation
│   │   ├── Resources.jsx      # Learning resources
│   │   └── Copilot.jsx        # AI assistant (placeholder)
│   ├── utils/
│   │   ├── localStorage.js    # LocalStorage helpers
│   │   └── api.js             # API call functions
│   ├── data/
│   │   └── mockData.js        # Schemes, alerts, tips data
│   ├── App.jsx                # Main app with routing
│   └── main.jsx               # Entry point
├── package.json
├── .env
└── .env.example
```

---

## 🐛 Troubleshooting

### Backend won't start
**Error:** `EADDRINUSE: address already in use`

**Solution:**
```powershell
# Change PORT in backend/.env to different port
PORT=5001

# Update frontend/.env VITE_API_BASE_URL accordingly
VITE_API_BASE_URL=http://localhost:5001
```

### MongoDB connection error
**Error:** `MongoDB connection error`

**Solution:** App works fine without MongoDB! All data uses LocalStorage.

If you want to use MongoDB:
```powershell
# Option 1: Install MongoDB locally
# Option 2: Use MongoDB Atlas (free tier)
# Update MONGODB_URI in backend/.env
```

### Frontend can't connect to backend
**Check:**
1. Backend is running on http://localhost:5000
2. CORS is configured (already done)
3. .env file exists in frontend/ with correct API URL

---

## 📊 Test the Application

### 1. Test LocalStorage Features
- Create FIR draft → Check browser DevTools → Application → LocalStorage
- Bookmark a scheme → Verify persistence on page reload
- View activity log → All actions should be logged

### 2. Test Navigation
- Click all 5 navigation items
- Logout and login again
- Session should persist until logout

### 3. Test Backend APIs (if MongoDB connected)
```powershell
# Test backend health
curl http://localhost:5000

# Get all schemes
curl http://localhost:5000/api/schemes

# Get all alerts
curl http://localhost:5000/api/alerts
```

---

## 🎨 Key Features to Demonstrate

1. **Privacy-First Design**
   - All data stays in browser
   - No external tracking
   - Clear local storage indicators

2. **Government Scheme Discovery**
   - 5 pre-loaded schemes
   - Filter by government tag
   - Detailed process steps

3. **FIR Draft Creation**
   - Structured form fields
   - Local draft saving
   - Progress tracking UI

4. **Calm, Trustworthy UI**
   - Minimal design
   - Official color scheme
   - Clear call-to-actions

---

## 🚀 Next Steps After Demo

1. **Connect to Real Backend**
   - Replace mock data with API calls
   - Enable user registration

2. **Add PDF Export**
   - Generate FIR in government format
   - Downloadable offline

3. **API Setu Integration**
   - Live government scheme updates
   - Real-time policy changes

4. **Multi-language Support**
   - Hindi, Tamil, Bengali
   - Regional language UI

---

## 📞 Support

If servers won't start:
1. Check if ports 5000 and 5173 are free
2. Run `npm install` in both directories
3. Restart terminals

**Both servers must run simultaneously for full functionality!**

---

**Happy Demo! 🎉**
