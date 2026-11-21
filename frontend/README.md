# CampusPulse - Frontend

React 18 + Vite + Tailwind CSS + Recharts. Part of the AP + DE capstone (frontend lead: Aryan Goyal).

## Run it
```bash
npm install
cp .env.example .env     # already provided as .env
npm run dev              # http://localhost:5173
```

## Backend integration and authentication

The checked-in environment defaults to the real Express + PostgreSQL API. Copy the example file before running the app:

```bash
cp .env.example .env
```

Controlled by `.env`:

| Variable | Value | Meaning |
|---|---|---|
| `VITE_USE_MOCK` | `false` | Calls the Express API (`/api`, proxied to `localhost:3000` by `vite.config.js`) |
| `VITE_USE_MOCK` | `true` | Explicitly enable in-memory dummy data for isolated UI work |

Pages never call `fetch` directly. They use `src/services/api.js`, including `credentials: 'include'` for the HttpOnly authentication cookie. On startup the app restores the session through `GET /api/auth/me`; unauthenticated users are sent to `/login`.

Admins have the complete student-management and staff-provisioning UI. Organizers can view students but cannot create, edit, or delete them; both roles can manage events, registrations, and attendance. Backend authorization remains the source of truth.

The API contract is in `docs/API.md`. Start the backend on port 3000 before starting Vite:

```bash
cd ../backend
npm install
npm start
```

## Structure
```
frontend/
├── index.html
├── package.json
├── vite.config.js          dev server + /api proxy
├── tailwind.config.js
├── postcss.config.js
├── .env / .env.example
├── docs/API.md             endpoints the frontend expects
├── public/favicon.svg
└── src/
    ├── main.jsx            entry (Router + AuthProvider + ToastProvider)
    ├── App.jsx             route table
    ├── index.css           Tailwind + shared classes (.card .input .th .td)
    ├── services/
    │   ├── api.js          one `api` object; picks mock or real
    │   ├── mockApi.js      in-memory implementation (joins, duplicate/capacity checks)
    │   └── mockData.js     seeded students, events, registrations, attendance
    ├── hooks/
    │   ├── useFetch.js     loading / error / reload handling
    │   └── useDebounce.js  search-as-you-type
    ├── utils/              constants.js, format.js
    ├── context/            AuthContext (session initialization, login, logout)
    ├── components/
    │   ├── auth/           ProtectedRoute
    │   ├── layout/         Layout, Sidebar (responsive drawer), Topbar
    │   ├── ui/             Button, Modal, ConfirmDialog, Pagination, SearchInput,
    │   │                   Field/Select, StatCard, Badge, States, Toast, PageHeader
    │   ├── students/       StudentForm
    │   └── events/         EventCard, EventForm
    ├── charts/             TopEventsChart, DepartmentChart, MonthlyTrendChart, AttendanceChart
    └── pages/              Login, Dashboard, Students, Events, EventDetail,
                            Registrations, Attendance, Analytics, StaffManagement,
                            AccessDenied, NotFound
```

## Request flow (for the viva)

Page -> `api.students.list()` -> `fetch('/api/students?...', { credentials: 'include' })` -> Express route -> PostgreSQL -> JSON -> state -> table.

No JWT is stored in browser storage: the Express backend owns the HttpOnly cookie. The current backend only exposes staff-account creation, so the Staff Accounts page intentionally does not claim to list, edit, or deactivate staff.
