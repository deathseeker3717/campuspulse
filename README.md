# CampusPulse

**Campus Event Management & Analytics Platform**

CampusPulse is a web application for managing campus activities in one place. It brings together student records, event creation, registrations, attendance tracking, and participation analytics.

Built as an academic capstone project with **React, Vite, Node.js, Express, and PostgreSQL**.

## Features

- **Dashboard:** Overview of students, events, registrations, and attendance.
- **Student management:** Search, filter, paginate, create, update, and delete student records.
- **Event management:** Create and manage events, view event details, check registration counts, and enforce event capacity and registration deadlines.
- **Registrations:** Register students for events, view registration details, and cancel registrations.
- **Attendance:** Mark attendance individually or in bulk.
- **Analytics:** Summary statistics, top events, department participation, attendance rates, and monthly registration trends.
- **Authentication:** Login and logout using an HttpOnly authentication cookie.
- **Staff management:** Admin users can create Admin and Organizer accounts.
- **Role-based access:** Permissions are checked by backend middleware as well as the frontend.

## Technology stack

| Layer | Technologies |
|---|---|
| Frontend | React 18, Vite |
| Routing | React Router |
| Styling | Tailwind CSS |
| Charts | Recharts |
| Icons | Lucide React |
| Backend | Node.js, Express 5 |
| Database | PostgreSQL |
| Database driver | node-postgres (`pg`) |
| Authentication | JSON Web Tokens, HttpOnly cookies |
| Password hashing | bcryptjs |
| Development | Git, GitHub, Nodemon |

## Roles and permissions

| Capability | Admin | Organizer |
|---|:---:|:---:|
| View students | Yes | Yes |
| Create, update, and delete students | Yes | No |
| View and manage events | Yes | Yes |
| Manage registrations | Yes | Yes |
| Manage attendance | Yes | Yes |
| View analytics | Yes | Yes |
| Create staff accounts | Yes | No |

## Architecture

CampusPulse uses a client-server architecture:

1. The React frontend renders pages and collects user input.
2. The frontend API service sends HTTP requests to the Express backend.
3. Express routes validate requests, apply authentication and role checks, and query PostgreSQL.
4. PostgreSQL stores users, departments, students, events, registrations, and attendance.
5. Analytics endpoints aggregate database records and return data for dashboard charts.

During local development, Vite proxies requests beginning with `/api` to the backend at `http://localhost:3000`.

## Repository structure

```text
campuspulse/
├── backend/
│   ├── scripts/
│   │   └── createAdmin.js
│   ├── src/
│   │   ├── config/
│   │   ├── middleware/
│   │   ├── routes/
│   │   ├── app.js
│   │   └── server.js
│   └── package.json
├── database/
│   ├── migrations/
│   │   └── 001_create_users.sql
│   ├── schema.sql
│   └── seed.sql
├── frontend/
│   ├── docs/
│   │   └── API.md
│   ├── src/
│   │   ├── charts/
│   │   ├── components/
│   │   ├── context/
│   │   ├── hooks/
│   │   ├── pages/
│   │   └── services/
│   ├── .env.example
│   └── package.json
└── README.md
```

# Setup: run the complete project locally

## Prerequisites

Install the following before starting:

- **Git** — to clone the repository.
- **Node.js (LTS) and npm** — to install and run the frontend and backend.
- **PostgreSQL** — to store application data.

You will also need a local PostgreSQL user and permission to create a database. Make sure PostgreSQL is running before continuing.

## 1. Clone the repository

```bash
git clone https://github.com/deathseeker3717/campuspulse.git
cd campuspulse
```

## 2. Create the PostgreSQL database

Create a new, empty database named `campuspulse_dev`:

```bash
createdb campuspulse_dev
```

If your local PostgreSQL setup requires a username, use:

```bash
createdb -U postgres campuspulse_dev
```

Apply the SQL files in this exact order:

```bash
psql -d campuspulse_dev -f database/schema.sql
psql -d campuspulse_dev -f database/seed.sql
psql -d campuspulse_dev -f database/migrations/001_create_users.sql
```

The order matters: the users migration uses the `set_updated_at()` function created by the main schema.

**Important:** These commands are for a fresh database. The seed script inserts sample departments, students, events, registrations, and attendance. Do not rerun the schema or seed script on an existing populated database.

If you use pgAdmin instead of the terminal, create the `campuspulse_dev` database, open its Query Tool, and execute the same three SQL files in the order shown above.

## 3. Configure the backend

Create a file named `.env` inside the `backend` folder. Do not commit this file.

Example `backend/.env`:

```env
PORT=3000
DATABASE_URL=postgresql://postgres:YOUR_POSTGRES_PASSWORD@localhost:5432/campuspulse_dev
FRONTEND_URL=http://localhost:5173
NODE_ENV=development
JWT_SECRET=replace_with_a_long_random_secret

# Used only for the initial Admin account setup
ADMIN_NAME=CampusPulse Admin
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=replace_with_a_strong_password
```

Replace the PostgreSQL username and password with your own local credentials. Generate a strong, unique `JWT_SECRET`. Use a strong Admin password.

Install backend dependencies:

```bash
cd backend
npm ci
```

Create the initial Admin account once:

```bash
node scripts/createAdmin.js
```

The script reads `ADMIN_NAME`, `ADMIN_EMAIL`, and `ADMIN_PASSWORD` from `backend/.env` and stores a bcrypt hash of the password in PostgreSQL. Run this only after applying the users migration. It will stop if an Admin account already exists.

Start the backend:

```bash
npm run dev
```

The backend should be available at `http://localhost:3000`. Keep this terminal running.

## 4. Configure and run the frontend

Open a second terminal at the repository root:

```bash
cd frontend
npm ci
cp .env.example .env
npm run dev
```

The frontend environment file should contain:

```env
VITE_USE_MOCK=false
VITE_API_URL=/api
```

The supplied `.env.example` already contains these values. Real API mode is the default. Set `VITE_USE_MOCK=true` only when you intentionally want to run the frontend with in-memory mock data.

The frontend should be available at `http://localhost:5173`. Keep this terminal running too.

## 5. Verify the setup

Open these URLs in a browser:

- Frontend: `http://localhost:5173`
- Backend health: `http://localhost:3000/api/health`
- Database health: `http://localhost:3000/api/health/db`

The database health endpoint should report a successful PostgreSQL connection. Then sign in using the Admin email and password configured in `backend/.env`.

## Common setup problems

- **Database connection failed:** Confirm PostgreSQL is running and `DATABASE_URL` contains the correct username, password, port, and database name.
- **Backend cannot start:** Confirm `backend/.env` exists and backend dependencies were installed with `npm ci`.
- **Frontend cannot reach the API:** Start the backend on port `3000` and confirm the frontend is using `VITE_API_URL=/api`.
- **Admin creation fails:** Confirm the users migration has completed and the `ADMIN_*` values are present in `backend/.env`. Do not run the setup script again if an Admin account already exists.
- **Port already in use:** Stop the other process using the port or configure a different backend port and update the Vite proxy target in `frontend/vite.config.js`.

## Environment variables

### Backend: `backend/.env`

| Variable | Purpose |
|---|---|
| `PORT` | Backend port; defaults to `3000` |
| `DATABASE_URL` | PostgreSQL connection string |
| `FRONTEND_URL` | Allowed frontend origin for credentialed CORS |
| `NODE_ENV` | Runtime environment; production enables secure cookies |
| `JWT_SECRET` | Secret used to sign authentication tokens |
| `ADMIN_NAME` | Initial Admin name for the setup script |
| `ADMIN_EMAIL` | Initial Admin email for the setup script |
| `ADMIN_PASSWORD` | Initial Admin password for the setup script |

The `ADMIN_*` values are only required when creating the initial Admin account.

### Frontend: `frontend/.env`

| Variable | Purpose |
|---|---|
| `VITE_USE_MOCK` | Set to `true` to use mock data; otherwise the real API is used |
| `VITE_API_URL` | API base path; normally `/api` |

Never place secrets in frontend environment variables. Vite exposes `VITE_*` values to browser code.

## API overview

All backend routes use the `/api` prefix. Request and response details are documented in [frontend/docs/API.md](frontend/docs/API.md).

| Module | Methods and endpoints |
|---|---|
| Health | `GET /health`, `GET /health/db` |
| Authentication | `POST /auth/login`, `GET /auth/me`, `POST /auth/logout` |
| Staff | `POST /auth/users` (Admin only) |
| Students | `GET /students`, `POST /students`, `PUT /students/:id`, `DELETE /students/:id` |
| Events | `GET /events`, `GET /events/:id`, `POST /events`, `PUT /events/:id`, `DELETE /events/:id` |
| Registrations | `GET /registrations`, `POST /registrations`, `DELETE /registrations/:id` |
| Attendance | `GET /attendance`, `POST /attendance`, `POST /attendance/bulk` |
| Analytics | `GET /analytics/summary`, `GET /analytics/top-events`, `GET /analytics/departments`, `GET /analytics/attendance`, `GET /analytics/monthly` |

Health endpoints are public. Login is required for application resources. Student mutations and staff account creation are restricted to Admin users by the backend.

## Authentication and security notes

- Passwords are stored as bcrypt hashes, not plain text.
- Login issues a signed JWT in an HttpOnly cookie.
- The frontend sends requests with credentials enabled.
- The backend loads the current user from PostgreSQL and checks whether the account is active.
- Role authorization is enforced by backend middleware.
- Local environment files, database passwords, and JWT secrets must never be committed.

For production deployment, configure HTTPS, the correct frontend origin, secure environment variables, and production-appropriate cookie and security settings.

## Development workflow

The project uses this branch strategy:

- `main` — stable versions.
- `dev` — shared integration branch.
- `feature/*` — individual features and fixes.

Recommended workflow:

1. Update the local `dev` branch.
2. Create a feature branch from `dev`.
3. Implement and test the changes.
4. Commit and push the feature branch.
5. Open a Pull Request targeting `dev`.
6. Merge tested changes from `dev` into `main` through a Pull Request.

Example:

```bash
git switch dev
git pull --ff-only origin dev
git switch -c feature/your-feature

# Make and test your changes
git add .
git commit -m "feat: describe your change"
git push -u origin feature/your-feature
```

Avoid pushing feature work directly to `main` or `dev`. Never commit `.env` files, database credentials, JWT secrets, or other private configuration.

## Team

| Member | Responsibility |
|---|---|
| Aditya Kumar | Backend development and integration |
| Shaurya Sharma | Database design and PostgreSQL |
| Aryan Goyal | Frontend development |
| Harshvardhan Dhankhar | Analytics and testing |

## License

No license has been specified for this repository yet. Contact the project maintainers before reusing or distributing the code.
