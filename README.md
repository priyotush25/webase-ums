# UMS – University Management System

MERN stack (MongoDB, Express 5, React 19 + Vite + Tailwind 4) with Firebase Authentication and JWT cookie sessions.

## Run

```bash
# Terminal 1 – API (http://localhost:5000)
cd server
npm install
npm run dev

# Terminal 2 – Website + portal (http://localhost:5173)
cd client
npm install
npm run dev
```

Copy `server/.env.example` to `server/.env` and `client/.env.example` to `client/.env`, then fill in your values.
Put your Firebase Admin key (Firebase console, Project settings, Service accounts, Generate new private key) at `server/serviceAccountKey.json`.
These three files are git-ignored and must never be committed.

## First-time setup

1. Open the site and **sign up** (new accounts are students).
2. Make yourself admin: `cd server && npm run make-admin -- your@email.com`, then log in again.
3. `npm run seed` – sample departments, courses and academic calendar.
4. Optional `npm run seed:demo` – demo teachers (no login) and sample notices so the public site looks populated.
5. Existing users automatically get a student ID (S27-0001) or teacher ID (T-0001) when the server starts.

## Rebrand for a client

Edit `client/src/config/site.js`: university name, address, phone, emails, admission session and deadline, eligibility, documents, milestones and values. Colors live in `client/src/index.css` (`@theme`).

## Public website

Home (live notices, calendar, stats, departments, faculty), About, Academics, Departments and department pages (courses by semester + faculty), Faculty directory, Notice board with search, Contact, Terms, Privacy.

**Admissions:** information page, online application form, and application tracking by application number + email. Admin reviews applications (received, under review, approved, waitlisted, not selected) with a note shown to the applicant. When an approved applicant signs up with the same email, their department, program, batch and personal details are filled in automatically.

## Portal

| Area | Admin | Teacher | Student |
|---|---|---|---|
| Dashboard with today's classes, notices, dates | ✔ | ✔ | ✔ |
| Notification bell (new notices) | ✔ | ✔ | ✔ |
| Admissions review | ✔ | | |
| Users, students, teachers + academic record (department, semester, batch, designation) | ✔ | | |
| Departments, courses with seat capacity | ✔ | own | browse, enroll |
| Enrollments (blocked when course is full) | approve / reject | | apply |
| Class routine (room and teacher clash check) | build | own | own |
| Attendance | overview | take | view |
| Assignments | overview | create | view |
| Results: marks, grades | overview | enter | semester-wise SGPA, CGPA, print transcript |
| Fees: charge, record bKash / Nagad / cash / bank | ✔ | | statement, print |
| Notices, academic calendar | manage | view | view |
| Reports (students per department, fees, seats, admissions, grades, attendance) | ✔ | | |
| Profile (personal details, photo) | ✔ | ✔ | ✔ |
| Student ID card (printable) | | | ✔ |

Grading: Assignment 20 + Midterm 30 + Final 50 = 100 → 4.00 scale (A+ ≥ 80 … D ≥ 40, F < 40). GPA is credit-weighted.

## Security notes

- Role checks on every API route; teachers can only touch their own courses.
- Public application form and tracking are rate limited per IP.
- Do not publish `.env` or `serviceAccountKey.json` (git-ignored). Rotate those keys if the project was ever shared.
- Fees record payments manually; there is no online payment gateway.
