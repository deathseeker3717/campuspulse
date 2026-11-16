# API contract expected by the frontend

Base URL: `/api`. All bodies are JSON. Errors: non-2xx with `{ "message": "..." }`.
List endpoints return `{ "data": [...], "total": 40, "page": 1, "limit": 8 }` (a plain array also works).
Use HTTP 409 for duplicate registration / event full.

## Students  (`id, name, email, roll_no, department, year, phone`)
- `GET /students?search=&department=&year=&page=&limit=`
- `POST /students`, `PUT /students/:id`, `DELETE /students/:id`

## Events  (`id, title, description, category, venue, event_date, capacity`)
- `GET /events?search=&category=&page=&limit=`  - each row should include `registered` (count)
- `GET /events/:id` - event + `registered` + `registrations[]`
- `POST /events`, `PUT /events/:id`, `DELETE /events/:id`

## Registrations
Row: `id, student_id, event_id, registered_at` + joined `student_name, roll_no, department, event_title, event_date, attendance_status`
- `GET /registrations?search=&event_id=&page=&limit=`
- `POST /registrations` `{ student_id, event_id }`  (409 if duplicate or event is full)
- `DELETE /registrations/:id`

## Attendance
- `GET /attendance?event_id=` - array of registration rows (as above) with `attendance_status` = `present | absent | null`
- `POST /attendance` `{ registration_id, status }` - upsert one
- `POST /attendance/bulk` `{ event_id, status }` - mark everyone

## Analytics
- `GET /analytics/summary` -> `{ total_students, total_events, total_registrations, avg_attendance }`
- `GET /analytics/top-events` -> `[{ event_id, title, registrations }]` (top 5)
- `GET /analytics/departments` -> `[{ department, participation }]`
- `GET /analytics/attendance` -> `[{ event_id, title, registered, present, percentage }]`
- `GET /analytics/monthly` -> `[{ month: "2026-10", registrations }]`
