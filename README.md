# 🏥 Hospital Resource Management System

A full-stack MERN application for managing hospital resources, patients, beds, doctor schedules, and equipment tracking.

---

## ✨ Features

### 1. **Patient Management**
- Add, edit, delete patients
- Store patient details (name, age, disease, admission date, emergency contact)
- Track patient status (admitted, discharged, critical)
- Assign doctors to patients

### 2. **Bed Allocation System**
- Assign beds to patients
- Track bed availability (Occupied / Free)
- ICU / General Ward / Private classification
- Real-time bed statistics and occupancy percentage

### 3. **Doctor Scheduling**
- Assign doctors to shifts
- Prevent double booking (unique constraint: doctor + date + shift)
- View schedule calendar
- Assign patients to doctor schedules

### 4. **Resource Tracking**
- Track ICU beds, ventilators, oxygen cylinders, monitors
- Real-time availability updates
- Low stock alerts
- Restock functionality

### 5. **Dashboard**
- Total patients count
- Available beds
- ICU occupancy percentage
- Emergency alerts
- Quick action links

### 6. **Role-Based Access Control**
- **Admin**: Full control over all resources
- **Doctor**: View patients, manage schedules, view resources
- **Staff**: Manage beds and resources

### 7. **Alerts System**
- Notify when ICU occupancy > 80%
- Notify when resources are running low
- Visual indicators for warnings

---

## 🛠️ Tech Stack

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose ORM
- **JWT** for authentication
- **Bcrypt** for password hashing
- **CORS** for cross-origin requests

### Frontend
- **React.js** (v18)
- **Tailwind CSS** for styling
- **Axios** for API calls
- **React Router** for navigation
- **Lucide React** for icons

---

## 📁 Project Structure

```
fsd-domain/
├── backend/
│   ├── config/
│   │   └── database.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Patient.js
│   │   ├── Bed.js
│   │   ├── DoctorSchedule.js
│   │   └── Resource.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── patientController.js
│   │   ├── bedController.js
│   │   ├── doctorScheduleController.js
│   │   └── resourceController.js
│   ├── middleware/
│   │   ├── auth.js
│   │   ├── authorize.js
│   │   └── errorHandler.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── patientRoutes.js
│   │   ├── bedRoutes.js
│   │   ├── doctorScheduleRoutes.js
│   │   └── resourceRoutes.js
│   ├── utils/
│   │   ├── jwt.js
│   │   └── validators.js
│   ├── seeds/
│   │   └── seedData.js
│   ├── server.js
│   ├── package.json
│   ├── .env
│   └── .gitignore
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── Navbar.jsx
    │   │   ├── Sidebar.jsx
    │   │   ├── Loader.jsx
    │   │   ├── Alert.jsx
    │   │   └── Card.jsx
    │   ├── pages/
    │   │   ├── LoginPage.jsx
    │   │   ├── DashboardPage.jsx
    │   │   ├── PatientsPage.jsx
    │   │   ├── BedsPage.jsx
    │   │   ├── SchedulePage.jsx
    │   │   └── ResourcesPage.jsx
    │   ├── services/
    │   │   └── api.js
    │   ├── hooks/
    │   │   └── useAuth.js
    │   ├── context/
    │   │   └── AuthContext.jsx
    │   ├── utils/
    │   ├── App.jsx
    │   ├── index.jsx
    │   └── index.css
    ├── public/
    ├── index.html
    ├── vite.config.js
    ├── tailwind.config.js
    ├── postcss.config.js
    ├── package.json
    ├── .env
    └── .gitignore
```

---

## 🚀 Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (installed and running on localhost:27017)
- npm or yarn

### Step 1: Clone/Setup Repository

```bash
cd fsd-domain
```

---

### Step 2: Backend Setup

#### 2.1 Navigate to Backend
```bash
cd backend
```

#### 2.2 Install Dependencies
```bash
npm install
```

#### 2.3 Configure Environment
The `.env` file is already created with the following:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/hospital_management
JWT_SECRET=hospital_secret_jwt_key_2024_change_this
JWT_EXPIRE=7d
NODE_ENV=development
```

**Note:** Change `JWT_SECRET` in production!

#### 2.4 Seed Database with Sample Data
```bash
npm run seed
```

This will create:
- 1 Admin user
- 2 Doctor users
- 2 Staff users
- 9 Beds (3 ICU, 4 General, 2 Private)
- 3 Patients with assignments
- 3 Doctor schedules
- 4 Resources

#### 2.5 Start Backend Server
```bash
npm run dev
```

Server should run on: `http://localhost:5000`

**API Endpoints available:**
- `http://localhost:5000/api/health` - Health check
- `http://localhost:5000/api/auth/...` - Authentication
- `http://localhost:5000/api/patients/...` - Patients
- `http://localhost:5000/api/beds/...` - Beds
- `http://localhost:5000/api/schedules/...` - Doctor Schedules
- `http://localhost:5000/api/resources/...` - Resources

---

### Step 3: Frontend Setup

#### 3.1 Open New Terminal, Navigate to Frontend
```bash
cd frontend
```

#### 3.2 Install Dependencies
```bash
npm install
```

#### 3.3 Configure Environment
The `.env` file is already created with:
```
VITE_API_URL=http://localhost:5000/api
```

#### 3.4 Start Frontend Server
```bash
npm run dev
```

Frontend should run on: `http://localhost:3000`

---

## 👥 Demo Login Credentials

Use these credentials to test the application:

### Admin Account
```
Email: admin@hospital.com
Password: admin123
Role: Admin
```

### Doctor Account
```
Email: john@hospital.com
Password: doctor123
Role: Doctor
Department: Cardiology
```

### Staff Account
```
Email: mary@hospital.com
Password: staff123
Role: Staff
```

---

## 📊 API Documentation

### Authentication Endpoints

#### Register User
```
POST /api/auth/register
Body: { name, email, password, phone, role, department }
```

#### Login User
```
POST /api/auth/login
Body: { email, password }
Returns: { token, user }
```

#### Get User Profile
```
GET /api/auth/profile
Headers: { Authorization: Bearer TOKEN }
```

---

### Patient Endpoints

#### Get All Patients
```
GET /api/patients?status=admitted
```

#### Add Patient
```
POST /api/patients
Body: { name, age, gender, phone, disease, medicalHistory, emergencyContact }
```

#### Update Patient
```
PUT /api/patients/:id
Body: { name, age, phone, disease, status, medicalHistory }
```

#### Discharge Patient
```
PUT /api/patients/:id/discharge
```

#### Delete Patient
```
DELETE /api/patients/:id
```

---

### Bed Endpoints

#### Get All Beds
```
GET /api/beds?wardType=ICU&status=free
```

#### Assign Bed to Patient
```
POST /api/beds/assign
Body: { bedId, patientId }
```

#### Free Bed
```
POST /api/beds/free
Body: { bedId }
```

#### Get Bed Statistics
```
GET /api/beds/stats/overview
Returns: { totalBeds, occupiedBeds, freeBeds, icuOccupancyPercentage }
```

---

### Doctor Schedule Endpoints

#### Get All Schedules
```
GET /api/schedules?shift=morning&date=2024-01-15
```

#### Add Schedule
```
POST /api/schedules
Body: { doctorId, date, startTime, endTime, shift }
```

#### Assign Patient to Schedule
```
POST /api/schedules/assign
Body: { scheduleId, patientId }
```

---

### Resource Endpoints

#### Get All Resources
```
GET /api/resources?ward=ICU
```

#### Add Resource
```
POST /api/resources
Body: { resourceName, totalQuantity, ward, lowStockAlert }
```

#### Use Resource
```
PUT /api/resources/:id/use
Body: { quantityUsed }
```

#### Restock Resource
```
PUT /api/resources/:id/restock
Body: { quantityAdded }
```

#### Get Low Stock Resources
```
GET /api/resources/alerts/low-stock
```

---

## 🔐 Security Features

✅ Password hashing with bcrypt
✅ JWT-based authentication
✅ Role-based access control
✅ Protected API routes
✅ Input validation
✅ Error handling middleware
✅ CORS enabled

---

## 📱 Frontend Pages

1. **Login Page** - User authentication
2. **Dashboard** - System overview with statistics
3. **Patient Management** - CRUD operations for patients
4. **Bed Allocation** - Manage and assign beds
5. **Doctor Schedule** - Create and manage doctor shifts
6. **Resource Tracking** - Monitor hospital resources

---

## 🧪 Testing the System

### 1. Login with Admin
- Use credentials: `admin@hospital.com` / `admin123`
- Navigate to Dashboard

### 2. Add a New Patient
- Go to Patients page
- Click "Add Patient"
- Fill in the form
- Click "Add Patient"

### 3. Assign Bed
- Go to Beds page
- Select a free bed
- Choose a patient from the dropdown
- Bed should become occupied

### 4. Check Resources
- Go to Resources page
- Use resources by entering quantity and clicking "Use"
- Restock by entering quantity and clicking "Restock"

### 5. View Alerts
- Dashboard shows alerts when:
  - ICU occupancy > 80%
  - Resources running low

---

## 🐛 Troubleshooting

### MongoDB Connection Error
- Ensure MongoDB is running: `mongod`
- Check `MONGODB_URI` in `.env`

### Port Already in Use
```bash
# Kill process on port 5000 (backend)
lsof -ti:5000 | xargs kill -9

# Kill process on port 3000 (frontend)
lsof -ti:3000 | xargs kill -9
```

### Module Not Found
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

---

## 📈 Future Enhancements

- [ ] Email notifications
- [ ] SMS alerts
- [ ] Advanced analytics/reports
- [ ] Patient discharge billing
- [ ] Medical records attachment
- [ ] Pharmacy inventory management
- [ ] Lab test tracking
- [ ] Insurance integration
- [ ] Mobile app (React Native)

---

## 📝 License

This project is open source and available under the MIT License.

---

## 👨‍💻 Author

Hospital Management System v1.0
Built with ❤️ using MERN Stack

---

## 📞 Support

For issues, questions, or contributions, please contact or submit an issue on the repository.

---

**Happy coding! 🚀**
