# Education ERP System

A full-stack Education ERP web application for managing students, teachers, courses, exam schedules, and fee collections.

## Tech Stack
- **Frontend:** Next.js (App Router, React, TypeScript)
- **Backend:** Node.js, Express.js
- **Database:** PostgreSQL

## Modules & Features
- Admin Login & Authentication
- Admin Analytics Dashboard
- Student Records Management (CRUD)
- Teacher Records Management (CRUD)
- Course Batches Management (CRUD)
- Exam Schedule Management (CRUD + Date Formatting)
- Student Fee Collection & Installment Tracking

## Project Setup & Running Locally

### 1. Database Setup
Import `database/schema.sql` into your PostgreSQL database (`erp_system`). (Legacy `database/users.sql` is also preserved).

### 2. Backend Setup
```bash
cd backend
npm install
# Configure your DB credentials in .env
npm start
```
*Backend runs on `http://localhost:5000`*

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
*Frontend runs on `http://localhost:3000`*