-- Run order: schema.sql → seed.sql
--   psql campuspulse -f database/schema.sql
--   psql campuspulse -f database/seed.sql


-- ------------------------------------------------------------
-- students
-- ------------------------------------------------------------
create table students (
  id serial primary key,
  name varchar(100) not null,
  email varchar(120) not null unique,
  roll_no varchar(20) not null unique,
  department varchar(60) not null,
  year int not null check (year between 1 and 4),
  phone varchar(15)
);

-- ------------------------------------------------------------
-- events
-- ------------------------------------------------------------
create table events (
  id serial primary key,
  title varchar(150) not null,
  description text,
  category varchar(30) not null check (category in ('Technical','Cultural','Sports','Workshop','Seminar')),
  venue varchar(100),
  event_date date not null,
  capacity int not null check (capacity > 0)
);

-- ------------------------------------------------------------
-- registrations
-- ------------------------------------------------------------
create table registrations (
  id serial primary key,
  student_id int not null references students(id) on delete cascade,
  event_id int not null references events(id) on delete cascade,
  registered_at timestamp not null default now(),
  status varchar(10) not null default 'registered' check (status in ('registered','cancelled')),
  unique (student_id, event_id)
);

-- ------------------------------------------------------------
-- attendance
-- ------------------------------------------------------------
create table attendance (
  id serial primary key,
  registration_id int not null unique references registrations(id) on delete cascade,
  status varchar(10) not null check (status in ('present','absent')),
  marked_at timestamp not null default now()
);

-- ------------------------------------------------------------
-- indexes
-- ------------------------------------------------------------
create index idx_students_department on students(department); -- GET /students?department=
create index idx_students_year on students(year); -- GET /students?year=
create index idx_events_category on events(category); -- GET /events?category=
create index idx_events_date on events(event_date); -- monthly analytics, upcoming events
create index idx_registrations_event on registrations(event_id); -- GET /registrations?event_id=
create index idx_registrations_student on registrations(student_id); -- per-student history
