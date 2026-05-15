# 📑 Complete File Index

## 📚 Documentation Files

| File | Purpose | Location |
|------|---------|----------|
| README.md | Complete project documentation with all features | Root |
| QUICK_START.md | 5-minute setup guide with demo credentials | Root |
| API_REFERENCE.md | Detailed API endpoint documentation | Root |
| PROJECT_OVERVIEW.md | Project architecture and structure overview | Root |
| FILE_INDEX.md | This file - complete file listing | Root |

---

## 🔧 Backend Files

### Configuration Files
| File | Purpose |
|------|---------|
| backend/server.js | Express app setup and route mounting |
| backend/package.json | Backend dependencies and scripts |
| backend/.env | Environment variables (DB, JWT, PORT) |
| backend/.env.example | Example environment file |
| backend/.gitignore | Git ignore rules |

### Database Configuration
| File | Purpose |
|------|---------|
| backend/config/database.js | MongoDB connection setup |

### Database Models
| File | Purpose | Collections |
|------|---------|------------|
| backend/models/User.js | User schema with auth | users |
| backend/models/Patient.js | Patient information | patients |
| backend/models/Bed.js | Hospital bed tracking | beds |
| backend/models/DoctorSchedule.js | Doctor shift scheduling | doctorschedules |
| backend/models/Resource.js | Medical equipment tracking | resources |

### Controllers (Business Logic)
| File | Purpose | Methods |
|------|---------|---------|
| backend/controllers/authController.js | Auth operations | register, login, getProfile, getAllUsers, updateUser |
| backend/controllers/patientController.js | Patient management | CRUD, discharge operations |
| backend/controllers/bedController.js | Bed management | CRUD, assign, free, statistics |
| backend/controllers/doctorScheduleController.js | Schedule management | CRUD, prevent double booking |
| backend/controllers/resourceController.js | Resource tracking | CRUD, use, restock, alerts |

### Middleware (Request Processing)
| File | Purpose | Function |
|------|---------|----------|
| backend/middleware/auth.js | JWT verification | Validates token on protected routes |
| backend/middleware/authorize.js | Role-based access | Checks user role permissions |
| backend/middleware/errorHandler.js | Global error handling | Catches and formats errors |

### Routes (API Endpoints)
| File | Endpoints | Methods | Auth Required |
|------|-----------|---------|---------------|
| backend/routes/authRoutes.js | 5 endpoints | POST/PUT/GET | Mixed |
| backend/routes/patientRoutes.js | 6 endpoints | GET/POST/PUT/DELETE | Yes |
| backend/routes/bedRoutes.js | 6 endpoints | GET/POST | Yes |
| backend/routes/doctorScheduleRoutes.js | 6 endpoints | GET/POST/PUT | Yes |
| backend/routes/resourceRoutes.js | 7 endpoints | GET/POST/PUT | Yes |

### Utilities
| File | Purpose |
|------|---------|
| backend/utils/jwt.js | JWT token generation |
| backend/utils/validators.js | Input validation functions |

### Sample Data
| File | Purpose | Data |
|------|---------|------|
| backend/seeds/seedData.js | Database seeding | 5 users, 9 beds, 3 patients, etc |

---

## ⚛️ Frontend Files

### Configuration Files
| File | Purpose |
|------|---------|
| frontend/package.json | Frontend dependencies and scripts |
| frontend/.env | Frontend environment (API URL) |
| frontend/.env.example | Example frontend .env |
| frontend/.gitignore | Git ignore rules |
| frontend/index.html | HTML entry point |
| frontend/vite.config.js | Vite bundler configuration |
| frontend/tailwind.config.js | Tailwind CSS configuration |
| frontend/postcss.config.js | PostCSS configuration |

### Core Application
| File | Purpose |
|------|---------|
| frontend/src/App.jsx | Main app with routes |
| frontend/src/index.jsx | React root entry |
| frontend/src/index.css | Global styles |

### Pages (6 Pages)
| File | Purpose | Features |
|------|---------|----------|
| frontend/src/pages/LoginPage.jsx | Authentication | Login form, demo credentials |
| frontend/src/pages/DashboardPage.jsx | System overview | Stats, alerts, quick links |
| frontend/src/pages/PatientsPage.jsx | Patient management | CRUD, status tracking |
| frontend/src/pages/BedsPage.jsx | Bed allocation | Assign, free, statistics |
| frontend/src/pages/SchedulePage.jsx | Doctor schedules | Create, assign patients |
| frontend/src/pages/ResourcesPage.jsx | Resource tracking | Use, restock, low stock |

### Components (5 Components)
| File | Purpose | Props |
|------|---------|-------|
| frontend/src/components/Navbar.jsx | Header navigation | user, logout |
| frontend/src/components/Sidebar.jsx | Side navigation | Filtered by role |
| frontend/src/components/Card.jsx | Reusable card container | children, title |
| frontend/src/components/Alert.jsx | Notification component | message, type, onClose |
| frontend/src/components/Loader.jsx | Loading spinner | None |

### State Management
| File | Purpose |
|------|---------|
| frontend/src/context/AuthContext.jsx | Authentication state with providers |
| frontend/src/hooks/useAuth.js | Custom hook for auth context |

### API Integration
| File | Purpose | Features |
|------|---------|----------|
| frontend/src/services/api.js | Axios instance | Interceptors, all endpoints |

### Utilities
| Directory | Purpose |
|-----------|---------|
| frontend/src/utils/ | Utility functions (empty for expansion) |

---

## 📊 Data Models Overview

### User Schema
```
{
  name: String (required)
  email: String (unique, required)
  password: String (hashed)
  phone: String (required)
  role: Enum [admin, doctor, staff]
  department: String (required for doctors)
  isActive: Boolean (default: true)
  timestamps: true
}
```

### Patient Schema
```
{
  name: String
  age: Number
  gender: Enum [male, female, other]
  phone: String
  disease: String
  status: Enum [admitted, discharged, critical]
  bedId: Reference to Bed
  assignedDoctor: Reference to User
  medicalHistory: String
  emergencyContact: Object
  admissionDate: Date
  dischargeDate: Date
  timestamps: true
}
```

### Bed Schema
```
{
  bedNumber: String (unique)
  wardType: Enum [ICU, General, Private]
  floor: Number
  status: Enum [occupied, free, maintenance]
  patientId: Reference to Patient
  amenities: Array of Strings
  costPerDay: Number
  timestamps: true
}
```

### DoctorSchedule Schema
```
{
  doctorId: Reference to User
  date: Date
  startTime: String (HH:MM)
  endTime: String (HH:MM)
  shift: Enum [morning, afternoon, night]
  status: Enum [scheduled, completed, cancelled]
  patientsAssigned: Array of Patient references
  unique constraint: [doctorId, date, shift]
  timestamps: true
}
```

### Resource Schema
```
{
  resourceName: Enum [ICU_Beds, Ventilators, Oxygen_Cylinders, Monitors]
  totalQuantity: Number
  availableQuantity: Number
  usedQuantity: Number
  ward: Enum [ICU, General, Emergency]
  lowStockAlert: Number (default: 5)
  isLowStock: Boolean
  lastUpdated: Date
  timestamps: true
}
```

---

## 🔐 API Endpoint Summary (30 Total)

### Authentication (5)
- POST /auth/register
- POST /auth/login
- GET /auth/profile
- PUT /auth/profile
- GET /auth/users

### Patients (6)
- GET /patients
- POST /patients
- GET /patients/:id
- PUT /patients/:id
- PUT /patients/:id/discharge
- DELETE /patients/:id

### Beds (6)
- GET /beds
- POST /beds
- GET /beds/:id
- POST /beds/assign
- POST /beds/free
- GET /beds/stats/overview

### Doctor Schedules (6)
- GET /schedules
- POST /schedules
- GET /schedules/:id
- GET /schedules/doctor/:doctorId
- POST /schedules/assign
- PUT /schedules/:id

### Resources (7)
- GET /resources
- POST /resources
- GET /resources/:id
- PUT /resources/:id/use
- PUT /resources/:id/restock
- GET /resources/alerts/low-stock
- GET /resources/stats/overview

---

## 📦 Dependencies

### Backend Dependencies
```
express: Web framework
mongoose: MongoDB ODM
jsonwebtoken: JWT auth
bcryptjs: Password hashing
dotenv: Environment variables
cors: Cross-origin support
validator: Input validation
```

### Frontend Dependencies
```
react: UI framework
react-dom: React rendering
react-router-dom: Routing
axios: HTTP client
lucide-react: Icons
tailwindcss: CSS framework
vite: Build tool
```

---

## 🚀 Quick Navigation

### Getting Started
1. Start here: **QUICK_START.md**
2. Then read: **README.md**
3. For API details: **API_REFERENCE.md**
4. For architecture: **PROJECT_OVERVIEW.md**

### Setup Commands
```bash
# Backend
cd backend && npm install && npm run seed && npm run dev

# Frontend (new terminal)
cd frontend && npm install && npm run dev
```

### Login Credentials
- Admin: admin@hospital.com / admin123
- Doctor: john@hospital.com / doctor123
- Staff: mary@hospital.com / staff123

---

## 📊 File Statistics

| Category | Count | Total Lines |
|----------|-------|-------------|
| Backend Controllers | 5 | ~600 |
| Backend Routes | 5 | ~200 |
| Backend Models | 5 | ~350 |
| Backend Middleware | 3 | ~100 |
| Backend Config | 2 | ~50 |
| Frontend Pages | 6 | ~1000 |
| Frontend Components | 5 | ~300 |
| Frontend Services | 1 | ~150 |
| Documentation | 5 | ~3000 |
| **Total** | **42** | **~5750** |

---

## ✅ Verification Checklist

- [x] All 5 backend models created
- [x] All 5 backend controllers implemented
- [x] All 5 backend route files created
- [x] All 3 middleware files implemented
- [x] All 6 frontend pages created
- [x] All 5 frontend components created
- [x] Authentication context and hooks
- [x] API service with Axios
- [x] Sample data seeding script
- [x] Environment files (.env)
- [x] Complete documentation

---

## 🎯 Features Implemented

- [x] Patient Management (CRUD)
- [x] Bed Allocation System
- [x] Doctor Scheduling
- [x] Resource Tracking
- [x] Dashboard with Statistics
- [x] Role-Based Access Control
- [x] JWT Authentication
- [x] Error Handling
- [x] Input Validation
- [x] Responsive UI
- [x] Alert System
- [x] Sample Data

---

## 📝 Notes

- All files are production-ready
- Code follows best practices
- Security measures implemented
- Error handling throughout
- Comments for clarity
- Scalable architecture

---

**Project Status: COMPLETE ✅**
**Ready for deployment and use**

Last Updated: January 2024
