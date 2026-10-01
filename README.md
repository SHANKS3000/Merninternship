# Northstar Exam Office

A college examination timetable and digital hall-pass portal built with React, Express, and MongoDB/Mongoose.

## Requirements

- Node.js 20.19+ or 22.12+
- MongoDB running locally or a MongoDB Atlas connection string

## Run locally

1. Install packages: `npm install`
2. Copy `.env.example` to `.env` and set `MONGO_URI`, a long random `JWT_SECRET`, and a private `ADMIN_INVITE_CODE`.
3. Start MongoDB, then run `npm run dev`.
4. Open `http://localhost:5173`.

The Vite client proxies `/api` requests to the Express API on port 5000. `GET /api/health` reports API and database connection status.

## Accounts and roles

- Students register with their name, college email, password, roll number, academic year, and branch. Their timetable and hall pass only show scheduled exams for that year and branch.
- Administrators register using the configured `ADMIN_INVITE_CODE`. Admin accounts can publish, cancel, and delete exams.
- Passwords are bcrypt-hashed. The API issues signed JWT sessions; set a unique, private `JWT_SECRET` before using real accounts.

When MongoDB is unavailable, the API returns a `503` and the browser falls back to demo mode. Demo student registration and exam edits are stored only in that browser's local storage. To try the administrator interface without a database, sign in with an email containing `admin` (for example, `admin@northstar.edu`). This demo shortcut is client-side only and must not be used as an authentication mechanism in a deployed application.

## API

- `POST /api/auth/register` and `POST /api/auth/login`
- `GET /api/exams` (admin gets all records; students get their year/branch schedule)
- `POST /api/exams` (admin)
- `PATCH /api/exams/:id/cancel` (admin)
- `DELETE /api/exams/:id` (admin)

## Scripts

- `npm run dev` starts Vite and Express together.
- `npm run build` creates the production client bundle.
- `npm run lint` runs ESLint.
- `npm start` starts the API server.
