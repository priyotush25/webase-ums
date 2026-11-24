# UMS – University Management System

MERN stack (MongoDB, Express 5, React 19 + Vite + Tailwind 4) with Firebase Authentication and JWT cookie sessions.

## Run

```bash
# Terminal 1 – API (http://localhost:5000)
cd server
npm install
npm run dev

# Terminal 2 – Web app (http://localhost:5173)
cd client
npm install
npm run dev
```

`server/.env`, `server/serviceAccountKey.json` and `client/.env` are already configured.

## First admin

1. Open the site and **sign up** (new accounts are always students).
2. Promote that account:
   ```bash
   cd server
   npm run make-admin -- your@email.com
   ```
3. Log in again – you land on the Admin dashboard. From **Users** you can make others teachers/admins.
4. Optional sample data: `npm run seed` (departments + courses).

## Features

| Area | Admin | Teacher | Student |
|---|---|---|---|
| Dashboard | stats | own stats | own stats |
| Users / roles, Students, Teachers | ✔ | | |
| Departments, Courses (assign teacher) | ✔ | view own | browse |
| Enrollments | approve / reject | | apply / track |
| Attendance | overview | take attendance | view % |
| **Assignments** (new) | overview | create / edit / delete | view due dates |
| **Results & CGPA** (new) | overview + search | enter marks, live grade | grades, CGPA |
| **Notice board** (new) | publish / pin / audience | read | read |
| **My students** (new) | | per course list | |
| **Class routine** (new) | build, clash check | own timetable | own timetable |
| **Academic calendar** (new) | manage | view | view |
| **Fees & payments** (new) | charge, record bKash/Nagad/cash | | statement, print |
| **Profile / Settings** (new) | ✔ | ✔ | ✔ |
| Public site: Home, About, Academics, Contact, Terms, Privacy, Forgot password, 404 | | | |

Grading: Assignment 20 + Midterm 30 + Final 50 = 100 → 4.00 scale (A+ ≥ 80 … D ≥ 40, F < 40). CGPA is credit-weighted.

Home page is fed by live data (`GET /api/public/overview`): notices, upcoming dates, counts and departments.
Dashboards show today's classes, latest notices and upcoming dates. Students can print a transcript from Results.

## API additions

- `/api/routines`, `/api/events`, `/api/fees`, `GET /api/public/overview`

- `GET/POST/PATCH/DELETE /api/notices`
- `GET/POST/PATCH/DELETE /api/assignments` (`/student`, `/my`)
- `GET/POST /api/results/course/:id`, `GET /api/results/my`, `GET /api/results`
- `GET /api/enrollments/teacher/students`

## Security note

Do not publish `.env` or `serviceAccountKey.json` (both are git-ignored). Rotate those keys if the project was ever shared.
