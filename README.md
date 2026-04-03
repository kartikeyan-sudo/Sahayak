# Sahayak – Scam Prevention & Government Policy Navigator

**Sahayak** is a privacy-first, citizen-assistance platform built with a React + Node.js + Neon PostgreSQL stack that helps people understand government policies, prepare FIR drafts, and navigate cyber-fraud situations with confidence.

---

## 🎯 Key Features

- **Privacy-First Design**: All data stored locally in browser (LocalStorage)
- **Government Policy Discovery**: Structured, searchable scheme catalog
- **FIR Draft Preparation**: Police-ready complaint drafts with guided forms
- **Real-time Scam Alerts**: Awareness feed for ongoing fraud patterns
- **AI Copilot (Planned)**: Simplified policy explanation and FIR assistance
- **Multi-language Support (Planned)**: Regional language accessibility

---

## 🛠️ Tech Stack

### Frontend
- **React 18** with Vite for fast development
- **Vanilla CSS** for calm, trustworthy UI
- **LocalStorage** for privacy-first data persistence

### Backend
- **Node.js** with Express
- **Neon PostgreSQL** with `pg`
- **CORS** for secure cross-origin requests

---

## 📁 Project Structure

```
sahayak-2.0/
├── backend/
│   ├── models/          # Legacy mongoose schemas (not used in Neon setup)
│   ├── routes/          # API routes (schemes, fir, alerts)
│   ├── db.js            # Neon PostgreSQL client and schema init
│   ├── index.js         # Express server entry point
│   ├── package.json
│   └── .env.example
│
├── frontend/
│   ├── src/
│   │   ├── components/  # Reusable components (Login, Topbar, AlertTicker, etc.)
│   │   ├── pages/       # Main pages (Overview, SchemesHub, FIRPage, Resources, Copilot)
│   │   ├── utils/       # LocalStorage, API helpers
│   │   ├── data/        # Mock data for schemes and alerts
│   │   ├── App.jsx      # Main app component
│   │   └── main.jsx     # Entry point
│   ├── package.json
│   └── .env.example
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v16 or higher)
- **Neon PostgreSQL database**
- **npm** or **yarn**

### 1. Clone the Repository

```bash
git clone <repository-url>
cd sahayak-2.0
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create .env file (copy from .env.example)
cp .env.example .env

# Update Neon database URL in .env
# DATABASE_URL=postgresql://USER:PASSWORD@YOUR_NEON_HOST/YOUR_DB?sslmode=require

# Start backend server
npm run dev
```

Backend will run on **http://localhost:5000**

### 3. Frontend Setup

Open a new terminal:

```bash
cd frontend

# Install dependencies
npm install

# Create .env file (copy from .env.example)
cp .env.example .env

# Start frontend dev server
npm run dev
```

Frontend will run on **http://localhost:5173**

### 4. Access the Application

1. Open browser: **http://localhost:5173**
2. Login with demo credentials:
   - **Username**: `demo`
   - **Password**: `sahayak2024`

---

## 📋 Available Scripts

### Backend

```bash
npm start          # Run server (production)
npm run dev        # Run server with nodemon (development)
```

### Frontend

```bash
npm run dev        # Start Vite dev server
npm run build      # Build for production
npm run preview    # Preview production build
```

---

## 🗂️ API Endpoints

### Schemes API

```
GET    /api/schemes          # Get all schemes
GET    /api/schemes/:id      # Get scheme by ID
POST   /api/schemes          # Create new scheme
PATCH  /api/schemes/:id      # Update scheme
DELETE /api/schemes/:id      # Delete scheme
```

### FIR Drafts API

```
GET    /api/fir/user/:userId     # Get all drafts for user
GET    /api/fir/:id              # Get draft by ID
POST   /api/fir                  # Create new draft
PATCH  /api/fir/:id              # Update draft
DELETE /api/fir/:id              # Delete draft
POST   /api/fir/:id/submit       # Submit draft (change status)
```

### Alerts API

```
GET    /api/alerts           # Get all active alerts
POST   /api/alerts           # Create new alert
PATCH  /api/alerts/:id       # Update alert
DELETE /api/alerts/:id       # Delete alert
```

---

## 🎨 UI/UX Design Principles

1. **Calm & Minimal**: Reduces panic during high-stress incidents
2. **Government-style Clarity**: Official, trustworthy appearance
3. **Progressive Disclosure**: Show details only when needed
4. **Privacy Awareness**: Clear indicators of local-only storage
5. **Offline-Ready**: Works without constant server connection

---

## 📦 Key Pages

### 1. Overview Page
- Citizen confidence dashboard with stats
- Activity log
- National impact snapshot
- Safety tips

### 2. Schemes Hub
- Searchable scheme catalog
- Bookmark functionality
- Detailed scheme information modals

### 3. Cyber & FIR Page
- FIR intake form with structured fields
- Draft saving and management
- Application progress tracker

### 4. Resources Page
- Digital safety playbook
- Scheme navigation tips
- Emergency helplines

### 5. AI Copilot (Future)
- Conversational policy assistance
- FIR narrative refinement
- Voice-based guidance

---

## 🔒 Privacy & Data Handling

- **No personal data transmitted** in current prototype
- All user data stored in **browser LocalStorage**
- No external tracking or analytics
- Future backend integration will maintain privacy-first approach

---

## 🛣️ Roadmap

### Phase 1 (Current)
- ✅ Full frontend prototype
- ✅ MERN backend structure
- ✅ LocalStorage-based persistence

### Phase 2 (Next)
- [ ] FIR PDF export with government format
- [ ] API Setu integration for live scheme updates
- [ ] User authentication with JWT
- [ ] Backend data sync with privacy controls

### Phase 3 (Future)
- [ ] AI-powered policy explanation
- [ ] Multi-language support (Hindi, Tamil, Bengali)
- [ ] Voice-based FIR assistance
- [ ] SMS/IVR for offline access

---

## 🤝 Contributing

This project is part of a hackathon/demo prototype. Contributions welcome for:
- Additional government schemes
- Regional language translations
- UX improvements
- Accessibility enhancements

---

## 📄 License

This project is developed for demonstration and educational purposes.

---

## 👨‍💻 Developer Notes

### Login Credentials (Demo)
- Username: `demo`
- Password: `sahayak2024`

### Neon Setup (Required)
Use your Neon project connection string in backend/.env:
```bash
DATABASE_URL=postgresql://USER:PASSWORD@YOUR_NEON_HOST/YOUR_DB?sslmode=require
```

### Environment Variables

**Backend (.env)**
```
PORT=5000
DATABASE_URL=postgresql://USER:PASSWORD@YOUR_NEON_HOST/YOUR_DB?sslmode=require
FRONTEND_URL=http://localhost:5173
JWT_SECRET=your_secret_key
NODE_ENV=development
```

**Frontend (.env)**
```
VITE_API_BASE_URL=http://localhost:5000
VITE_APP_NAME=Sahayak
VITE_APP_VERSION=1.0.0
```

---

## 🐛 Known Issues

1. **Index.css styling**: May need manual cleanup for production
2. **Database setup required for APIs**: Set `DATABASE_URL` before starting backend
3. **CORS**: Ensure backend CORS is configured for your frontend URL

---

## 📞 Support

For questions or issues:
- Create an issue in the repository
- Contact: [Your Contact Information]

---

**Sahayak is not just a website — it is a procedural companion for citizens navigating one of the most stressful situations of their lives.**

Built with ❤️ for citizen empowerment
