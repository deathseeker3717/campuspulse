# CampusPulse

**Campus Event Management & Analytics Platform**

CampusPulse is a web-based platform designed to simplify campus event management and provide insights into student participation and event engagement.

The platform brings student management, event creation, registrations, attendance tracking, and analytics together in one dashboard.

Built as an academic capstone project using React, Node.js, Express, and PostgreSQL.

> **Project status:** Under active development. The frontend dashboard and mock API are available on the `dev` branch. Backend API and PostgreSQL integration are under development.

---

## Features

### Dashboard
- Overview of students, events, registrations, and attendance.
- Visual summaries of campus activity.
- Quick access to important platform sections.

### Student Management
- View and manage student records.
- Search students.
- Filter by department and academic year.
- Paginated student listing.

### Event Management
- Browse campus events.
- Create and edit event information.
- View individual event details.
- Organize events by category.

### Registration Management
- View student registrations.
- Filter registrations by event.
- Track student participation.
- Manage registration records.

### Attendance Management
- View registered students for an event.
- Record attendance.
- Support individual and bulk attendance operations.

### Analytics Dashboard
- Top events by registrations.
- Department-wise participation.
- Attendance statistics.
- Monthly registration trends.

---

## Technology Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 |
| Build Tool | Vite |
| Styling | Tailwind CSS |
| Routing | React Router |
| Data Visualization | Recharts |
| Icons | Lucide React |
| Backend | Node.js |
| Backend Framework | Express.js |
| Database | PostgreSQL |
| Database Driver | node-postgres (`pg`) |

---

## Project Architecture

CampusPulse follows a client-server architecture.

```text
                 CampusPulse
                      |
          +-----------+-----------+
          |                       |
       Frontend                 Backend
          |                       |
    React + Vite             Node.js
          |                       |
    React Router               Express
          |                       |
    API Service                 REST API
          |                       |
          +---------- HTTP -------+
                      |
                  PostgreSQL
```

The frontend communicates with the backend through REST API endpoints. The backend handles application logic and database operations.

During frontend development, an in-memory mock API allows the application to run without a database connection.

---

## Repository Structure

```text
campuspulse/
│
├── backend/
│   ├── package.json
│   └── server.js
│
├── database/
│   ├── schema.sql
│   ├── seed.sql
│   └── analytics.sql
│
├── frontend/
│   ├── docs/
│   │   └── API.md
│   │
│   ├── public/
│   │
│   ├── src/
│   │   ├── charts/
│   │   ├── components/
│   │   │   ├── events/
│   │   │   ├── layout/
│   │   │   ├── students/
│   │   │   └── ui/
│   │   │
│   │   ├── hooks/
│   │   ├── pages/
│   │   ├── services/
│   │   └── utils/
│   │
│   ├── .env.example
│   ├── package.json
│   └── vite.config.js
│
└── README.md
```

---

## Getting Started

### Prerequisites

Make sure you have installed:

- Node.js (LTS recommended)
- npm
- Git

PostgreSQL is required when using the database-backed application. It is not required for frontend mock mode.

### 1. Clone the Repository

```bash
git clone https://github.com/deathseeker3717/campuspulse.git

cd campuspulse
```

### 2. Set Up the Frontend

```bash
cd frontend

npm install

cp .env.example .env

npm run dev
```

The frontend will normally be available at:

`http://localhost:5173`

### 3. Set Up the Backend

Open a second terminal from the project root:

```bash
cd backend

npm install
```

Create a `.env` file inside the `backend/` directory:

```env
PORT=5000
```

Start the Express server:

```bash
npm start
```

The current backend health endpoint is available at:

`http://localhost:5000`

The full resource API routes and PostgreSQL integration are still being implemented.

---

## Environment Configuration

The frontend uses environment variables to switch between mock data and the real backend.

File: `frontend/.env`

```env
VITE_USE_MOCK=true
VITE_API_URL=/api
```

| Variable | Value | Purpose |
|---|---|---|
| `VITE_USE_MOCK` | `true` | Uses built-in mock data |
| `VITE_USE_MOCK` | `false` | Sends requests to the backend |
| `VITE_API_URL` | `/api` | API base URL |

### Mock Mode

When:

```env
VITE_USE_MOCK=true
```

The application uses its in-memory mock API. The backend and PostgreSQL database are not required.

### Real API Mode

When:

```env
VITE_USE_MOCK=false
VITE_API_URL=/api
```

The frontend sends requests to the Express API.

The Vite development server proxies `/api` requests to:

`http://localhost:5000`

Real API mode requires the corresponding backend routes and database integration to be implemented.

---

## Database

CampusPulse uses PostgreSQL as its relational database.

The intended core entities are:

- `students`
- `events`
- `registrations`
- `attendance`

The database layer will handle:

- Student and event records.
- Student-event relationships.
- Registration lifecycle.
- Attendance records.
- Referential integrity and data validation.
- Analytics queries.

The `database/` directory currently contains the planned SQL file locations. The schema, seed data, and analytics scripts are still to be implemented.

---

## API Documentation

The frontend API contract is documented in:

[`frontend/docs/API.md`](frontend/docs/API.md)

### Expected API Endpoints

| Module | Method | Endpoint |
|---|---|---|
| Students | GET | `/api/students` |
| Students | POST | `/api/students` |
| Students | PUT | `/api/students/:id` |
| Students | DELETE | `/api/students/:id` |
| Events | GET | `/api/events` |
| Events | GET | `/api/events/:id` |
| Events | POST | `/api/events` |
| Events | PUT | `/api/events/:id` |
| Events | DELETE | `/api/events/:id` |
| Registrations | GET | `/api/registrations` |
| Registrations | POST | `/api/registrations` |
| Registrations | DELETE | `/api/registrations/:id` |
| Attendance | GET | `/api/attendance` |
| Attendance | POST | `/api/attendance` |
| Attendance | POST | `/api/attendance/bulk` |
| Analytics | GET | `/api/analytics/summary` |
| Analytics | GET | `/api/analytics/top-events` |
| Analytics | GET | `/api/analytics/departments` |
| Analytics | GET | `/api/analytics/attendance` |
| Analytics | GET | `/api/analytics/monthly` |

These are the frontend's expected routes, not a claim that they are all implemented.

### Standard Paginated Response

List endpoints are expected to return:

```json
{
  "data": [],
  "total": 0,
  "page": 1,
  "limit": 10
}
```

The API contract specifies HTTP `409 Conflict` for duplicate registrations or events that have reached capacity.

---

## Team

| Member | Responsibility |
|---|---|
| Aditya Kumar | Backend Development & Integration |
| Shaurya Sharma | Database Design & PostgreSQL |
| Aryan Goyal | Frontend Development |
| Harshvardhan Dhankhar | Analytics & Testing |

---

## Development Workflow

The project uses Git and GitHub for collaborative development.

### Branch Strategy

- `main` — stable project branch.
- `dev` — shared integration branch.
- `feature/*` — individual feature branches.

### Contribution Workflow

1. Pull the latest changes from `dev`.
2. Create a feature branch.
3. Implement your changes.
4. Test your work locally.
5. Commit and push your branch.
6. Open a pull request targeting `dev`.

Example:

```bash
git switch dev

git pull origin dev

git switch -c feature/your-feature

# Make your changes

git add .

git commit -m "feat: describe your change"

git push -u origin feature/your-feature
```

Avoid pushing feature work directly to `main` or `dev`.

---

## Development Principles

- Maintain a consistent API contract between frontend and backend.
- Keep database relationships and constraints explicit.
- Validate incoming API data.
- Handle duplicate registrations and event capacity correctly.
- Use transactions for operations that require multiple related database changes.
- Keep secrets and environment files out of version control.
- Test changes before opening pull requests.

---

## Project Status

CampusPulse is actively under development.

Current development priorities include:

- Completing the PostgreSQL schema and seed data.
- Establishing the backend database connection.
- Implementing REST API routes and controllers.
- Integrating the frontend with the real backend.
- Implementing analytics queries.
- Testing database integrity and application workflows.

---

## License

No license has been specified for this repository yet. Contact the project maintainers before reusing or distributing the code.
