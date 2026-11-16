# CampusPulse - Frontend

React 18 + Vite + Tailwind CSS + Recharts. Part of the AP + DE capstone (frontend lead: Aryan Goyal).

## Run it
```bash
npm install
cp .env.example .env     # already provided as .env
npm run dev              # http://localhost:5173
```

## Demo data vs real backend
Controlled by `.env`:

| Variable | Value | Meaning |
|---|---|---|
| `VITE_USE_MOCK` | `true` | In-memory dummy data, no backend needed |
| `VITE_USE_MOCK` | `false` | Calls the Express API (`/api`, proxied to `localhost:5000` by `vite.config.js`) |

Pages never call `fetch` directly. They use `src/services/api.js`, so switching from dummy data to the real backend needs no page changes.
The agreed API contract is in `docs/API.md`.

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
    ├── main.jsx            entry (Router + ToastProvider)
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
    ├── components/
    │   ├── layout/         Layout, Sidebar (responsive drawer), Topbar
    │   ├── ui/             Button, Modal, ConfirmDialog, Pagination, SearchInput,
    │   │                   Field/Select, StatCard, Badge, States, Toast, PageHeader
    │   ├── students/       StudentForm
    │   └── events/         EventCard, EventForm
    ├── charts/             TopEventsChart, DepartmentChart, MonthlyTrendChart, AttendanceChart
    └── pages/              Dashboard, Students, Events, EventDetail,
                            Registrations, Attendance, Analytics, NotFound
```

## Request flow (for the viva)
Page -> `api.students.list()` -> `fetch('/api/students?...')` -> Express route -> controller -> PostgreSQL -> JSON -> state -> table.
