# Student Placement Management System - Backend API

Production-ready REST API built with **Node.js**, **Express.js**, **MongoDB**, and **Mongoose**.

---

## 1. Technologies & Architecture
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT stored in HttpOnly cookies + Bearer token support
- **Password Security**: bcryptjs (10 salt rounds)
- **Role-Based Access Control**: `admin` (Placement Officer) and `student`
- **Validation**: express-validator schemas on all input mutations
- **Security Middlewares**: Helmet HTTP security headers, CORS origin enforcement, express-rate-limit
- **Testing**: Jest, Supertest, MongoDB-Memory-Server

---

## 2. Directory Structure
```
backend/
|-- src/
|   |-- config/
|   |   |-- db.js               # Mongoose database connection
|   |   |-- jwt.js              # Token signing & verification
|   |-- controllers/            # Request handlers
|   |-- middleware/
|   |   |-- auth.middleware.js  # JWT extraction & validation
|   |   |-- role.middleware.js  # RBAC & student ownership checks
|   |   |-- error.middleware.js # Central error handler & formatters
|   |   |-- rateLimiter.middleware.js
|   |-- models/
|   |   |-- User.js             # User accounts & roles
|   |   |-- Department.js       # Academic departments
|   |   |-- Student.js          # Student academic & placement profiles
|   |   |-- Company.js          # Recruiting partner companies & HR contacts
|   |   |-- JobDrive.js         # Recruitment drives & criteria
|   |   |-- Application.js      # Applications with compound unique index
|   |   |-- Interview.js        # Scheduled interview rounds
|   |   |-- Offer.js            # Placement offers & packages
|   |-- routes/                 # REST API endpoints under /api/v1
|   |-- services/
|   |   |-- eligibility.service.js      # Backend eligibility evaluation
|   |   |-- placement-report.service.js # Aggregations & CSV export
|   |-- validators/             # express-validator schemas
|   |-- scripts/
|   |   |-- seed.js             # Comprehensive database seeder
|   |-- tests/                  # Automated test suites
|   |   |-- setup.js            # In-memory Mongo test database setup
|   |   |-- auth.test.js        # Authentication tests
|   |   |-- eligibility.test.js # Unit tests for eligibility engine
|   |   |-- application.test.js # Application & duplicate prevention tests
|   |   |-- student.test.js     # Student CRUD & RBAC permissions tests
|-- .env.example
|-- package.json
|-- server.js
|-- app.js
```

---

## 3. Environment Variables
Copy `.env.example` to `.env`:
```ini
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/student_placement_db
JWT_SECRET=placement_jwt_super_secret_production_ready_token_key_2025
JWT_EXPIRES_IN=7d
COOKIE_SECRET=placement_cookie_super_secret_signing_key_2025
CLIENT_URL=http://localhost:4200
```

---

## 4. Setup & Running

```bash
# 1. Install dependencies
npm install

# 2. Populate test data (Admin, Students, Drives, Companies)
npm run seed

# 3. Start development server
npm run dev

# 4. Run automated test suite
npm test
```

---

## 5. Seeded Credentials
| Role | Email | Password | Details |
| :--- | :--- | :--- | :--- |
| **Placement Officer (Admin)** | `admin@placement.edu` | `AdminPassword123!` | Full admin access |
| **Eligible Student (CSE)** | `rajesh.cse@student.edu` | `StudentPassword123!` | CGPA 8.85, 0 backlogs |
| **Placed Student (CSE)** | `sneha.cse@student.edu` | `StudentPassword123!` | Placed at Google (22.5 LPA) |
| **Ineligible Student (ECE)**| `priya.ece@student.edu` | `StudentPassword123!` | CGPA 6.45, 2 backlogs |
| **Offered Student (IT)** | `amit.it@student.edu` | `StudentPassword123!` | Offered at Infosys (6.5 LPA) |
