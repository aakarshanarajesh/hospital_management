# API Reference Guide

Complete documentation of all Hospital Management System API endpoints.

## Base URL
```
http://localhost:5000/api
```

## Headers Required
```
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json
```

---

## 🔐 Authentication Endpoints

### 1. Register User
```
POST /auth/register
```

**Request Body:**
```json
{
  "name": "Dr. John",
  "email": "john@hospital.com",
  "password": "securePassword123",
  "phone": "1234567890",
  "role": "doctor",
  "department": "Cardiology"
}
```

**Response (201):**
```json
{
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "userid_mongo",
    "name": "Dr. John",
    "email": "john@hospital.com",
    "role": "doctor"
  }
}
```

---

### 2. Login User
```
POST /auth/login
```

**Request Body:**
```json
{
  "email": "admin@hospital.com",
  "password": "admin123"
}
```

**Response (200):**
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "userid_mongo",
    "name": "Admin User",
    "email": "admin@hospital.com",
    "role": "admin"
  }
}
```

---

### 3. Get User Profile
```
GET /auth/profile
```

**Required Headers:**
```
Authorization: Bearer JWT_TOKEN
```

**Response (200):**
```json
{
  "_id": "userid_mongo",
  "name": "Admin User",
  "email": "admin@hospital.com",
  "phone": "9876543210",
  "role": "admin",
  "isActive": true
}
```

---

### 4. Update User Profile
```
PUT /auth/profile
```

**Request Body:**
```json
{
  "name": "Admin User Updated",
  "phone": "9876543211",
  "department": "Administration"
}
```

**Response (200):**
```json
{
  "message": "User updated successfully",
  "user": { ... }
}
```

---

### 5. Get All Users (Admin Only)
```
GET /auth/users?role=doctor
```

**Query Parameters:**
- `role` (optional): Filter by role - admin, doctor, staff

**Response (200):**
```json
[
  {
    "_id": "id1",
    "name": "Dr. John",
    "email": "john@hospital.com",
    "role": "doctor",
    "department": "Cardiology"
  },
  ...
]
```

---

## 👥 Patient Endpoints

### 1. Get All Patients
```
GET /patients?status=admitted
```

**Query Parameters:**
- `status` (optional): admitted, discharged, critical

**Response (200):**
```json
[
  {
    "_id": "patientid",
    "name": "Raj Kumar",
    "age": 45,
    "gender": "male",
    "phone": "9999999999",
    "disease": "Heart Attack",
    "status": "admitted",
    "admissionDate": "2024-01-15T10:30:00Z",
    "bedId": {
      "_id": "bedid",
      "bedNumber": "ICU-101"
    },
    "assignedDoctor": {
      "_id": "doctorid",
      "name": "Dr. John Smith"
    }
  },
  ...
]
```

---

### 2. Get Patient by ID
```
GET /patients/:patientId
```

**Response (200):**
```json
{
  "_id": "patientid",
  "name": "Raj Kumar",
  "age": 45,
  ...
}
```

---

### 3. Add New Patient
```
POST /patients
```

**Required Role:** doctor, admin

**Request Body:**
```json
{
  "name": "Arjun Singh",
  "age": 55,
  "gender": "male",
  "phone": "7777777777",
  "disease": "Pneumonia",
  "medicalHistory": "High Blood Pressure",
  "emergencyContact": {
    "name": "Priya Singh",
    "phone": "7777777776",
    "relation": "Wife"
  }
}
```

**Response (201):**
```json
{
  "message": "Patient added successfully",
  "patient": { ... }
}
```

---

### 4. Update Patient
```
PUT /patients/:patientId
```

**Required Role:** doctor, admin

**Request Body:**
```json
{
  "name": "Arjun Singh Updated",
  "disease": "Pneumonia (Recovering)",
  "status": "admitted"
}
```

**Response (200):**
```json
{
  "message": "Patient updated successfully",
  "patient": { ... }
}
```

---

### 5. Discharge Patient
```
PUT /patients/:patientId/discharge
```

**Required Role:** doctor, admin

**Response (200):**
```json
{
  "message": "Patient discharged successfully",
  "patient": {
    "_id": "patientid",
    "status": "discharged",
    "dischargeDate": "2024-01-20T14:30:00Z",
    "bedId": null
  }
}
```

---

### 6. Delete Patient
```
DELETE /patients/:patientId
```

**Required Role:** admin

**Response (200):**
```json
{
  "message": "Patient deleted successfully"
}
```

---

## 🛏️ Bed Endpoints

### 1. Get All Beds
```
GET /beds?wardType=ICU&status=free
```

**Query Parameters:**
- `wardType` (optional): ICU, General, Private
- `status` (optional): occupied, free, maintenance

**Response (200):**
```json
[
  {
    "_id": "bedid",
    "bedNumber": "ICU-101",
    "wardType": "ICU",
    "floor": 3,
    "status": "occupied",
    "costPerDay": 5000,
    "patientId": {
      "_id": "patientid",
      "name": "Raj Kumar"
    }
  },
  ...
]
```

---

### 2. Get Bed by ID
```
GET /beds/:bedId
```

**Response (200):**
```json
{
  "_id": "bedid",
  "bedNumber": "ICU-101",
  ...
}
```

---

### 3. Add New Bed
```
POST /beds
```

**Required Role:** admin

**Request Body:**
```json
{
  "bedNumber": "ICU-104",
  "wardType": "ICU",
  "floor": 3,
  "amenities": ["Ventilator", "Monitor", "Oxygen"],
  "costPerDay": 5000
}
```

**Response (201):**
```json
{
  "message": "Bed added successfully",
  "bed": { ... }
}
```

---

### 4. Assign Bed to Patient
```
POST /beds/assign
```

**Required Role:** staff, admin

**Request Body:**
```json
{
  "bedId": "bedid_to_assign",
  "patientId": "patientid"
}
```

**Response (200):**
```json
{
  "message": "Bed assigned successfully",
  "bed": { ... },
  "patient": { ... }
}
```

---

### 5. Free Bed
```
POST /beds/free
```

**Required Role:** staff, admin

**Request Body:**
```json
{
  "bedId": "bedid_to_free"
}
```

**Response (200):**
```json
{
  "message": "Bed freed successfully",
  "bed": {
    "_id": "bedid",
    "status": "free",
    "patientId": null
  }
}
```

---

### 6. Get Bed Statistics
```
GET /beds/stats/overview
```

**Response (200):**
```json
{
  "totalBeds": 9,
  "occupiedBeds": 3,
  "freeBeds": 6,
  "maintenanceBeds": 0,
  "occupancyPercentage": 33,
  "icuOccupancyPercentage": 67
}
```

---

## 📅 Doctor Schedule Endpoints

### 1. Get All Schedules
```
GET /schedules?shift=morning&date=2024-01-20
```

**Query Parameters:**
- `shift` (optional): morning, afternoon, night
- `date` (optional): YYYY-MM-DD format
- `doctorId` (optional): Filter by doctor

**Response (200):**
```json
[
  {
    "_id": "scheduleid",
    "doctorId": {
      "_id": "doctorid",
      "name": "Dr. John Smith",
      "department": "Cardiology"
    },
    "date": "2024-01-20T00:00:00Z",
    "startTime": "08:00",
    "endTime": "14:00",
    "shift": "morning",
    "status": "scheduled",
    "patientsAssigned": [
      {
        "_id": "patientid",
        "name": "Raj Kumar"
      }
    ]
  },
  ...
]
```

---

### 2. Add Schedule
```
POST /schedules
```

**Required Role:** admin

**Request Body:**
```json
{
  "doctorId": "doctorid",
  "date": "2024-01-20",
  "startTime": "08:00",
  "endTime": "14:00",
  "shift": "morning"
}
```

**Response (201):**
```json
{
  "message": "Schedule added successfully",
  "schedule": { ... }
}
```

---

### 3. Get Doctor's Schedule
```
GET /schedules/doctor/:doctorId?date=2024-01-20
```

**Response (200):**
```json
[
  {
    "_id": "scheduleid",
    "doctorId": { ... },
    "date": "2024-01-20T00:00:00Z",
    ...
  }
]
```

---

### 4. Assign Patient to Schedule
```
POST /schedules/assign
```

**Required Role:** doctor, admin

**Request Body:**
```json
{
  "scheduleId": "scheduleid",
  "patientId": "patientid"
}
```

**Response (200):**
```json
{
  "message": "Patient assigned to schedule successfully",
  "schedule": { ... }
}
```

---

### 5. Update Schedule
```
PUT /schedules/:scheduleId
```

**Required Role:** doctor, admin

**Request Body:**
```json
{
  "startTime": "09:00",
  "endTime": "15:00",
  "status": "completed"
}
```

**Response (200):**
```json
{
  "message": "Schedule updated successfully",
  "schedule": { ... }
}
```

---

## 📦 Resource Endpoints

### 1. Get All Resources
```
GET /resources?ward=ICU
```

**Query Parameters:**
- `ward` (optional): ICU, General, Emergency

**Response (200):**
```json
[
  {
    "_id": "resourceid",
    "resourceName": "Ventilators",
    "totalQuantity": 15,
    "availableQuantity": 12,
    "usedQuantity": 3,
    "ward": "ICU",
    "lowStockAlert": 5,
    "isLowStock": false,
    "lastUpdated": "2024-01-20T10:30:00Z"
  },
  ...
]
```

---

### 2. Add Resource
```
POST /resources
```

**Required Role:** admin

**Request Body:**
```json
{
  "resourceName": "Oxygen_Cylinders",
  "totalQuantity": 100,
  "ward": "ICU",
  "lowStockAlert": 15
}
```

**Response (201):**
```json
{
  "message": "Resource added successfully",
  "resource": { ... }
}
```

---

### 3. Use Resource
```
PUT /resources/:resourceId/use
```

**Required Role:** staff, admin

**Request Body:**
```json
{
  "quantityUsed": 5
}
```

**Response (200):**
```json
{
  "message": "Resource quantity updated successfully",
  "resource": { ... },
  "alert": "⚠️ WARNING: Oxygen_Cylinders in ICU is running low"
}
```

---

### 4. Restock Resource
```
PUT /resources/:resourceId/restock
```

**Required Role:** admin

**Request Body:**
```json
{
  "quantityAdded": 20
}
```

**Response (200):**
```json
{
  "message": "Resource restocked successfully",
  "resource": { ... }
}
```

---

### 5. Get Low Stock Resources
```
GET /resources/alerts/low-stock
```

**Response (200):**
```json
{
  "message": "Low stock resources",
  "resources": [
    {
      "_id": "resourceid",
      "resourceName": "Ventilators",
      "availableQuantity": 4,
      "totalQuantity": 15,
      "isLowStock": true
    }
  ]
}
```

---

### 6. Get Resource Statistics
```
GET /resources/stats/overview
```

**Response (200):**
```json
[
  {
    "resourceName": "Ventilators",
    "ward": "ICU",
    "total": 15,
    "available": 12,
    "used": 3,
    "utilizationPercentage": 20,
    "isLowStock": false
  },
  ...
]
```

---

## ❌ Error Responses

### 400 Bad Request
```json
{
  "message": "Required fields missing"
}
```

### 401 Unauthorized
```json
{
  "message": "No token, authorization denied"
}
```

### 403 Forbidden
```json
{
  "message": "User role 'staff' is not authorized to access this resource"
}
```

### 404 Not Found
```json
{
  "message": "Patient not found"
}
```

### 409 Conflict
```json
{
  "message": "Doctor already has a schedule for this date and shift"
}
```

### 500 Server Error
```json
{
  "message": "Internal Server Error"
}
```

---

## 🔑 Status Codes Reference

| Code | Meaning |
|------|---------|
| 200 | OK - Request successful |
| 201 | Created - Resource created |
| 400 | Bad Request - Invalid input |
| 401 | Unauthorized - No/invalid token |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource not found |
| 409 | Conflict - Duplicate entry |
| 500 | Server Error |

---

## 💡 Usage Tips

1. Always include the JWT token in Authorization header
2. Use correct HTTP methods (GET, POST, PUT, DELETE)
3. Send data as JSON with proper Content-Type header
4. Date format should be YYYY-MM-DD or ISO 8601
5. Phone numbers must be 10 digits
6. Passwords must be at least 6 characters

---

**Last Updated:** January 2024
**API Version:** v1.0
