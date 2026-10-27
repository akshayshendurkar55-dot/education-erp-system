-- ========================================================
-- Education ERP / College Management Information System
-- Complete Database Schema (Safe & Non-Destructive)
-- ========================================================

-- 1. Users Table (System Authentication & RBAC)
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'ADMIN',
    password_changed BOOLEAN DEFAULT FALSE,
    en_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    en_by VARCHAR(100),
    ip VARCHAR(50)
);

-- 2. Students Table
CREATE TABLE IF NOT EXISTS students (
    id SERIAL PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    mobile VARCHAR(50) NOT NULL,
    course VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Teachers Table
CREATE TABLE IF NOT EXISTS teachers (
    id SERIAL PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    mobile VARCHAR(50),
    subject VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Courses Table
CREATE TABLE IF NOT EXISTS courses (
    id SERIAL PRIMARY KEY,
    course_name VARCHAR(255) NOT NULL,
    course_code VARCHAR(100) NOT NULL,
    duration VARCHAR(100),
    fees NUMERIC(12, 2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Exams Table
CREATE TABLE IF NOT EXISTS exams (
    id SERIAL PRIMARY KEY,
    exam_name VARCHAR(255) NOT NULL,
    course_name VARCHAR(255) NOT NULL,
    exam_date DATE NOT NULL,
    total_marks INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. Fees Management Table
CREATE TABLE IF NOT EXISTS fees (
    id SERIAL PRIMARY KEY,
    student_name VARCHAR(255) NOT NULL,
    roll_no VARCHAR(100) NOT NULL,
    course_name VARCHAR(255) NOT NULL,
    total_fees NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    paid_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    remaining_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    payment_date DATE NOT NULL,
    payment_mode VARCHAR(100) NOT NULL DEFAULT 'Cash',
    status VARCHAR(50) NOT NULL DEFAULT 'Pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Performance Indexes (Safe IF NOT EXISTS)
CREATE INDEX IF NOT EXISTS idx_users_username ON users (username);
CREATE INDEX IF NOT EXISTS idx_students_course ON students (course);
CREATE INDEX IF NOT EXISTS idx_fees_roll_no ON fees (roll_no);
CREATE INDEX IF NOT EXISTS idx_exams_course ON exams (course_name);
