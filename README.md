# MediConnect AI - Telemedicine Platform

## Project Overview
MediConnect AI is an AI-powered telemedicine platform designed to bridge the gap between urban and rural healthcare through technology. This comprehensive healthcare solution provides secure, accessible medical consultations and health management tools.

## 🏥 Features
- **Multi-role User Authentication** (Patients, Healthcare Providers, Admins)
- **Patient Portal** with health dashboard and symptom checker
- **Healthcare Provider Dashboard** with patient management
- **Video Consultations** using WebRTC
- **Appointment Scheduling** system
- **Health Records Management**
- **Multi-language Support** (English, Sinhala, Tamil)
- **Mobile-Responsive Design**

## 🛠️ Technology Stack
- **Frontend**: React.js with responsive design
- **Backend**: Node.js with Express.js
- **Database**: PostgreSQL with Redis caching
- **Authentication**: JWT-based secure authentication
- **Real-time**: WebRTC for video consultations
- **Styling**: Modern CSS with healthcare-appropriate design


## 🚀 Quick Start

### Prerequisites
- Node.js (v18 or higher)
- PostgreSQL (v14 or higher)
- Redis (for caching)
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd MediConnect-AI
   ```

2. **Setup Backend**
   ```bash
   cd backend
   npm install
   cp .env.example .env
   # Configure your database and environment variables
   npm run dev
   ```

3. **Setup Frontend**
   ```bash
   cd frontend
   npm install
   npm start
   ```

4. **Setup Database**
   ```bash
   cd database
   # Run migration scripts (instructions in database/README.md)
   ```



---
*MediConnect AI - Bridging Healthcare Gaps Through Technology*