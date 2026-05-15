# Quick Start Guide

This guide will help you get the Hospital Management System up and running in minutes.

## Prerequisites
- Node.js v14+
- MongoDB running locally
- A code editor (VS Code recommended)

## 🎯 Quick Setup (5 minutes)

### Step 1: Start MongoDB
```bash
mongod
```

### Step 2: Backend Setup (Terminal 1)
```bash
cd backend
npm install
npm run seed
npm run dev
```

Expected output:
```
✅ Server running on port 5000
📧 MongoDB: mongodb://localhost:27017/hospital_management
✅ Database seeding completed!
```

### Step 3: Frontend Setup (Terminal 2)
```bash
cd frontend
npm install
npm run dev
```

Expected output:
```
VITE v4.4.5  ready in XXX ms

➜  Local:   http://localhost:3000/
```

### Step 4: Access the Application
Open browser: `http://localhost:3000`

Login with:
- Email: `admin@hospital.com`
- Password: `admin123`

---

## 🎨 Default Sample Data

After running `npm run seed`, the database contains:

### Users
- 1 Admin User
- 2 Doctors (Cardiology, Neurology)
- 2 Staff Members

### Beds
- 3 ICU Beds (Floor 3)
- 4 General Ward Beds (Floor 2)
- 2 Private Beds (Floor 4)

### Patients
- 3 Admitted Patients with various conditions

### Resources
- ICU Beds, Ventilators, Oxygen Cylinders, Monitors

---

## 📱 Testing Workflow

### 1. Login as Admin
```
admin@hospital.com / admin123
```

### 2. View Dashboard
- See total patients: 3
- Available beds: 6 (3 occupied)
- ICU occupancy: 67%

### 3. Manage Patients
- Add new patient
- Edit patient details
- Discharge patient

### 4. Allocate Beds
- Assign free beds to patients
- Free occupied beds

### 5. Manage Resources
- Use resources (click "Use")
- Restock resources (click "Restock")

### 6. Check Schedules
- View doctor schedules
- Add new schedules

---

## 🔑 User Roles

### Admin
```
admin@hospital.com / admin123
Access: Full control over all modules
```

### Doctor
```
john@hospital.com / doctor123
Department: Cardiology
Access: View patients, manage schedules, view resources
```

### Staff
```
mary@hospital.com / staff123
Access: Manage beds and resources
```

---

## 📊 Dashboard Statistics

The dashboard shows:
- **Total Patients**: Count of all admitted patients
- **Available Beds**: Free beds ready for assignment
- **ICU Occupancy %**: Percentage of occupied ICU beds
- **Low Stock Items**: Count of resources running low

---

## 🚨 Alert System

Alerts appear when:

### ⚠️ ICU Occupancy Alert
- Triggers when ICU beds > 80% occupied
- Example: "ICU Occupancy is 85%"

### 📦 Low Stock Alert
- Triggers when resources <= low stock threshold
- Shows count of low stock resources

---

## 🔒 Authentication Flow

1. User enters email and password
2. Backend verifies credentials
3. JWT token is generated
4. Token stored in localStorage
5. Token included in all API requests

### Token Structure
```json
{
  "userId": "user_mongodb_id",
  "role": "admin|doctor|staff",
  "exp": 1234567890
}
```

---

## 📡 API Response Format

### Success Response
```json
{
  "message": "Operation successful",
  "data": { ... }
}
```

### Error Response
```json
{
  "message": "Error description"
}
```

---

## 🛠️ Common Tasks

### Add New Patient
1. Go to Patients page
2. Click "Add Patient"
3. Fill all required fields
4. Click "Add Patient"

### Assign Bed
1. Go to Beds page
2. Find free bed
3. Select patient from dropdown
4. Bed status changes to "occupied"

### Use Resource
1. Go to Resources page
2. Enter quantity to use
3. Click "Use"
4. Available quantity decreases

### Restock Resource
1. Go to Resources page
2. Enter quantity to restock
3. Click "Restock"
4. Available quantity increases

---

## 💡 Tips

- Refresh page after operations (some updates may not reflect immediately)
- Use Chrome DevTools to inspect network requests
- Check terminal console for backend logs
- Use different browser tabs for different users

---

## 🐛 Common Issues & Solutions

### Issue: Cannot connect to MongoDB
**Solution:**
```bash
mongod
```

### Issue: Port 5000 already in use
**Solution:**
```bash
# Kill process on port 5000
lsof -ti:5000 | xargs kill -9
```

### Issue: Page shows loading forever
**Solution:**
- Check if backend is running
- Check console for errors (F12)
- Clear localStorage and login again

### Issue: API calls fail
**Solution:**
- Verify backend URL in `.env`
- Check network tab in DevTools
- Verify API endpoint exists

---

## 📚 Next Steps

1. Explore the dashboard
2. Try all user roles
3. Test all features
4. Review the full README.md
5. Check API documentation

---

## 🎓 Learning Resources

### Concepts to Understand
- JWT Authentication
- Role-Based Access Control (RBAC)
- RESTful API Design
- React Hooks & Context API
- Mongoose Schemas
- Error Handling Middleware

### Files to Study
1. Backend: `server.js` - Server setup
2. Backend: `models/` - Database schemas
3. Backend: `middleware/auth.js` - Authentication
4. Frontend: `context/AuthContext.jsx` - Auth state
5. Frontend: `App.jsx` - Routing

---

**You're all set! Happy managing! 🏥**
