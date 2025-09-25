# Admin User Creation Guide

## Method 1: Using Backend Script
```bash
cd backend
node create-admin.js
```

## Method 2: Using API Endpoint
POST request to `/api/auth/create-admin` with:
```json
{
  "email": "admin@mediconnect.lk",
  "password": "Admin@123456",
  "firstName": "System",
  "lastName": "Administrator",
  "adminSecret": "MediConnect@Admin2024"
}
```

## Method 3: Direct Database (MongoDB)
```javascript
// Connect to MongoDB and run this:
db.users.insertOne({
  firstName: "System",
  lastName: "Administrator",
  email: "admin@mediconnect.lk",
  password: "$2a$12$hashedPasswordHere", // Hash Admin@123456
  role: "admin",
  isVerified: true,
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date()
});
```

## Login Credentials
- **Email**: admin@mediconnect.lk
- **Password**: Admin@123456
- **Role**: admin

## After Login
The system will automatically redirect to `/admin` dashboard.

## Default Admin Features
- Patient Management
- Provider Management  
- System Analytics
- User Verification
- Reports & Analytics