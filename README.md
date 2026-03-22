# TeachGrid - School Staff Management System (Backend) 

Backend service for **TeachGrid**, a full-stack staff management system designed to streamline school operations such as user management, attendance tracking, timetable handling, and administrative workflows.

---

## 🛠 Tech Stack

* **Runtime:** Node.js
* **Framework:** Express.js
* **Database:** MongoDB with Mongoose ODM
* **Authentication:** JWT (JSON Web Tokens) stored in HTTP-only cookies
* **Security:** bcrypt (password hashing), Role-Based Access Control (RBAC)
* **Email Service:** Nodemailer (SMTP integration)
* **Architecture:** Modular MVC pattern

---

## ✨ Core Features

### 🔐 Authentication & Authorization

* Secure user registration and login system
* Password hashing using bcrypt
* JWT-based authentication with cookies
* Middleware-protected routes
* Role-based access (Admin / Teacher)

---

### 📧 Email & OTP System

* Account verification using OTP
* Password reset via email OTP
* Secure OTP expiration handling

---

### 👨‍🏫 User Management

* Create and manage users (Admin / Teacher)
* Store teacher subjects and profile details
* Profile retrieval for authenticated users

---

### 📊 System Modules

* Attendance Management
* Timetable Handling
* Announcements System
* Leave & Absence Management
* Relief Assignment System (conflict-free scheduling logic)
* Dashboard APIs for data insights

---

## 🔗 API Structure

The backend exposes RESTful APIs structured as:

* `/api/auth` → Authentication routes
* `/api/user` → User-related operations
* `/api/attendance` → Attendance management
* `/api/timetable` → Timetable operations
* `/api/announcements` → Announcement system
* `/api/leave` → Leave management
* `/api/admin` → Admin-specific actions

---

## ⚙️ Request Flow (Architecture)

Client → Routes → Middleware → Controllers → Models → MongoDB

* **Routes** handle API endpoints
* **Middleware** handles authentication and validation
* **Controllers** contain business logic
* **Models** define database schemas

---

## ⚡ Key Technical Highlights

* Implemented secure authentication using JWT and cookies
* Designed scalable modular architecture using MVC principles
* Built OTP-based email verification and password reset system
* Integrated real-time email notifications using SMTP
* Ensured secure data handling with hashing and validation

---

## 🛡️ Security Considerations

* Passwords are hashed using bcrypt before storage
* JWT tokens are securely stored in HTTP-only cookies
* Protected routes using authentication middleware
* Environment variables used for sensitive configurations

> ⚠️ Note: Additional production-level protections such as rate limiting and advanced input validation can be implemented for scalability.

---

## ⚙️ Setup Instructions

1. Clone the repository
2. Run `npm install`
3. Configure environment variables (`.env`)
4. Run `npm start`

---

## 🚀 Deployment

* Backend hosted on Render 
* May experience slight delay on first request due to cold starts (free tier)

---

## 🤝 Development Process

* Followed **Agile methodology** with sprint planning
* Version control using structured Git workflow (feature → dev → staging → main)
* Code reviewed through Pull Requests

---


## 📌 Project Overview

TeachGrid is developed as part of a Software Engineering group project at The Open University of Sri Lanka, focusing on building a scalable and secure system for educational institutions.

---

*© 2026 TeachGrid Contributors*
