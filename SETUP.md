# MediConnect AI - Setup Guide

## 🚀 Quick Start

This guide will help you set up and run the MediConnect AI telemedicine platform on your local machine.

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v18 or higher) - [Download here](https://nodejs.org/)
- **PostgreSQL** (v14 or higher) - [Download here](https://www.postgresql.org/download/)
- **Redis** (for caching) - [Download here](https://redis.io/download)
- **Git** - [Download here](https://git-scm.com/)

## 🗄️ Database Setup

### 1. Create PostgreSQL Database
```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE mediconnect_ai;

# Create user (optional)
CREATE USER mediconnect_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE mediconnect_ai TO mediconnect_user;

# Exit psql
\q
```

### 2. Run Database Schema
```bash
# Navigate to database directory
cd database

# Run the schema file
psql -U postgres -d mediconnect_ai -f schema.sql
```

## 🔧 Backend Setup

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Environment Configuration
```bash
# Copy environment template
cp .env.example .env

# Edit .env file with your configuration
# Update database credentials, JWT secrets, etc.
```

### 3. Start the Backend Server
```bash
# Development mode
npm run dev

# Production mode
npm start
```

The backend server will start on `http://localhost:5000`

## 🎨 Frontend Setup

### 1. Install Dependencies
```bash
cd frontend
npm install
```

### 2. Install Tailwind CSS
```bash
# Install Tailwind CSS and dependencies
npm install -D tailwindcss postcss autoprefixer @tailwindcss/forms @tailwindcss/typography @tailwindcss/aspect-ratio

# Create PostCSS config
echo "module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}" > postcss.config.js
```

### 3. Start the Frontend Development Server
```bash
npm start
```

The frontend will start on `http://localhost:3000`

## 🔴 Redis Setup (Optional for Development)

**Note**: Redis is optional for development. The application will work without it, but some caching features will be disabled.

### Windows Options

#### Option 1: Using Docker (Recommended)
```bash
# Start Docker Desktop first, then run:
docker run -d -p 6379:6379 --name redis redis:alpine
```

#### Option 2: Using WSL2 (Windows Subsystem for Linux)
```bash
# Install WSL2 and Ubuntu, then:
wsl
sudo apt update
sudo apt install redis-server
sudo service redis-server start
```

#### Option 3: Using Redis for Windows (Unofficial)
1. Download Redis for Windows from: https://github.com/microsoftarchive/redis/releases
2. Extract and run `redis-server.exe`

#### Option 4: Quick Windows Redis Setup
```powershell
# Download and run Redis for Windows in one command
# Create a temporary Redis directory
mkdir C:\temp\redis 2>$null
cd C:\temp\redis

# Download Redis for Windows (if not already downloaded)
if (!(Test-Path "redis-server.exe")) {
    Invoke-WebRequest -Uri "https://github.com/tporadowski/redis/releases/download/v5.0.14.1/Redis-x64-5.0.14.1.zip" -OutFile "redis.zip"
    Expand-Archive -Path "redis.zip" -DestinationPath "." -Force
    Move-Item "Redis-x64-5.0.14.1\*" "." -Force
    Remove-Item "Redis-x64-5.0.14.1" -Recurse -Force
    Remove-Item "redis.zip" -Force
}

# Start Redis server
.\redis-server.exe
```

#### Option 5: Skip Redis (Simplest)
Just ignore the Redis errors - the app works fine without it during development.

### macOS (using Homebrew)
```bash
brew install redis
brew services start redis
```

### Linux (Ubuntu/Debian)
```bash
sudo apt update
sudo apt install redis-server
sudo systemctl start redis-server
```

## 🌐 Environment Variables

### Backend (.env)
```env
# Server
NODE_ENV=development
PORT=5000

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=mediconnect_ai
DB_USER=postgres
DB_PASSWORD=your_password

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRES_IN=24h
JWT_REFRESH_SECRET=your_refresh_secret_here
JWT_REFRESH_EXPIRES_IN=7d

# Email (Optional - for production)
EMAIL_SERVICE=gmail
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password

# CORS
CLIENT_URL=http://localhost:3000
```

### Frontend (.env)
```env
REACT_APP_API_URL=http://localhost:5000/api
```

## 🧪 Testing the Setup

### 1. Test Backend Health
```bash
curl http://localhost:5000/health
```
You should receive a JSON response with status "OK".

### 2. Test Database Connection
Check the backend console logs for "Database connected successfully" message.

### 3. Test Frontend
Navigate to `http://localhost:3000` in your browser. You should see the MediConnect AI homepage.

### 4. Redis (Optional for Development)
Redis errors in the backend logs are normal during development. The application will work without Redis, but some features like session caching will be disabled.

## 📱 Core Features Available

### ✅ Currently Implemented
- **Project Structure**: Full-stack architecture with React frontend and Node.js backend
- **Authentication System**: User registration, login, logout with JWT tokens
- **Database Schema**: Complete PostgreSQL schema for healthcare data
- **Security**: Input validation, rate limiting, CORS, helmet security headers
- **Multi-role Support**: Patient, Provider, and Admin roles
- **Responsive Design**: Tailwind CSS with healthcare-appropriate styling
- **Error Handling**: Comprehensive error handling and logging
- **API Documentation**: RESTful API with proper endpoints

### 🚧 Coming Next (Phase 2)
- **Patient Portal**: Complete dashboard with health summary
- **Appointment Booking**: Full scheduling system
- **Symptom Checker**: AI-powered health assessment
- **Health Records**: Medical history management
- **Video Consultations**: WebRTC integration
- **Notifications**: Real-time alerts and reminders

### 🔮 Future Features (Phase 3)
- **Multi-language Support**: Sinhala and Tamil translations
- **Mobile App**: React Native mobile application
- **Advanced Analytics**: Healthcare insights and reporting
- **AI Integration**: Enhanced symptom analysis and diagnosis assistance

## 🐛 Troubleshooting

### Common Issues

#### Database Connection Error
```bash
# Check if PostgreSQL is running
sudo systemctl status postgresql

# Check database exists
psql -U postgres -l | grep mediconnect_ai
```

#### Redis Connection Error
```bash
# Check if Redis is running
redis-cli ping
# Should return "PONG"
```

#### Port Already in Use
```bash
# Kill process on port 5000
lsof -ti:5000 | xargs kill -9

# Kill process on port 3000
lsof -ti:3000 | xargs kill -9
```

#### Module Not Found Errors
```bash
# Clear npm cache and reinstall
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

## 📞 Support

If you encounter any issues:

1. **Check the logs**: Both backend and frontend console logs provide helpful information
2. **Verify environment variables**: Ensure all required variables are set correctly
3. **Database connectivity**: Confirm PostgreSQL and Redis are running
4. **Port conflicts**: Make sure ports 3000, 5000, 5432, and 6379 are available

## 🔄 Development Workflow

### Starting Development
```bash
# Terminal 1: Start PostgreSQL and Redis
# Terminal 2: Start Backend
cd backend && npm run dev

# Terminal 3: Start Frontend
cd frontend && npm start
```

### Making Changes
1. **Backend changes**: Server will auto-restart with nodemon
2. **Frontend changes**: Browser will auto-reload with React dev server
3. **Database changes**: Apply migrations manually

## 📊 Project Status

**Current Phase**: Foundation Complete ✅
**Next Phase**: Core Features Implementation 🚧
**Target**: Production-ready healthcare platform 🎯

---

**MediConnect AI** - Bridging Healthcare Gaps Through Technology 🏥✨
