-- CampusPulse sample data
-- Run once after schema.sql on a fresh, empty database.
-- Sample data: 7 departments, 14 students, 7 events,
-- 23 registrations and 19 attendance records.

BEGIN;

-- ============================================================
-- 1. DEPARTMENTS
-- ============================================================

INSERT INTO departments (id, code, name) OVERRIDING SYSTEM VALUE VALUES
(1, 'CSE', 'Computer Science and Engineering'),
(2, 'ECE', 'Electronics and Communication Engineering'),
(3, 'ME', 'Mechanical Engineering'),
(4, 'CE', 'Civil Engineering'),
(5, 'IT', 'Information Technology'),
(6, 'EE', 'Electrical Engineering'),
(7, 'MBA', 'Master of Business Administration');

-- ============================================================
-- 2. STUDENTS
-- ============================================================

INSERT INTO students (id, name, email, roll_no, department_id, year, phone, status)
OVERRIDING SYSTEM VALUE VALUES
(1, 'Aditya Kumar', 'aditya.kumar@campus.edu', 'CP26001', 1, 2, '9810012345', 'active'),
(2, 'Shaurya Sharma', 'shaurya.sharma@campus.edu', 'CP26002', 1, 2, '9810012346', 'active'),
(3, 'Aryan Goyal', 'aryan.goyal@campus.edu', 'CP26003', 1, 2, '9810012347', 'active'),
(4, 'Harshvardhan Dhankhar', 'harshvardhan.dhankhar@campus.edu', 'CP26004', 1, 2, '9810012348', 'active'),
(5, 'Neha Verma', 'neha.verma@campus.edu', 'CP26005', 2, 3, '9810012349', 'active'),
(6, 'Ishan Rao', 'ishan.rao@campus.edu', 'CP26006', 2, 1, '9810012350', 'active'),
(7, 'Priya Nair', 'priya.nair@campus.edu', 'CP26007', 2, 3, '9810012351', 'active'),
(8, 'Kabir Singh', 'kabir.singh@campus.edu', 'CP26008', 3, 2, '9810012352', 'active'),
(9, 'Sanya Mehra', 'sanya.mehra@campus.edu', 'CP26009', 3, 4, '9810012353', 'active'),
(10, 'Rohan Das', 'rohan.das@campus.edu', 'CP26010', 4, 1, '9810012354', 'active'),
(11, 'Myra Kapoor', 'myra.kapoor@campus.edu', 'CP26011', 5, 3, '9810012355', 'active'),
(12, 'Devansh Jain', 'devansh.jain@campus.edu', 'CP26012', 5, 2, '9810012356', 'active'),
(13, 'Tanya Reddy', 'tanya.reddy@campus.edu', 'CP26013', 6, 4, '9810012357', 'active'),
(14, 'Manav Gupta', 'manav.gupta@campus.edu', 'CP26014', 7, 1, '9810012358', 'active');

-- ============================================================
-- 3. EVENTS
-- ============================================================

INSERT INTO events (
    id, title, description, category, venue, event_date,
    registration_deadline, capacity, status
) OVERRIDING SYSTEM VALUE VALUES
(1, 'HackSprint 2026', '24-hour coding sprint open to all departments.', 'Technical', 'Main Auditorium', '2026-08-22', '2026-08-21 23:59:00+00', 120, 'completed'),
(2, 'Freshers Fiesta', 'Welcome evening for the incoming batch.', 'Cultural', 'Open Air Theatre', '2026-09-05', '2026-09-04 23:59:00+00', 200, 'completed'),
(3, 'Inter-Dept Cricket', 'Knockout cricket tournament between departments.', 'Sports', 'Central Ground', '2026-09-19', '2026-09-18 23:59:00+00', 60, 'completed'),
(4, 'Data Engineering Workshop', 'Hands-on session on pipelines and PostgreSQL.', 'Workshop', 'Lab 3', '2026-10-03', '2026-10-02 23:59:00+00', 40, 'completed'),
(5, 'AI and Ethics Seminar', 'Panel discussion on responsible AI.', 'Seminar', 'Seminar Hall A', '2026-11-07', '2026-11-06 23:59:00+00', 80, 'completed'),
(6, 'Diwali Cultural Night', 'Music, dance and food stalls.', 'Cultural', 'Open Air Theatre', '2026-12-05', '2026-12-04 23:59:00+00', 180, 'published'),
(7, 'Cloud Computing Bootcamp', 'Two-day bootcamp on cloud deployment.', 'Workshop', 'Lab 1', '2026-12-18', '2026-12-17 23:59:00+00', 45, 'published');

-- ============================================================
-- 4. REGISTRATIONS
-- ============================================================

INSERT INTO registrations (
    id, student_id, event_id, registered_at, status, cancelled_at
) OVERRIDING SYSTEM VALUE VALUES
(1, 1, 1, '2026-08-10 10:00:00+00', 'registered', NULL),
(2, 2, 1, '2026-08-10 11:30:00+00', 'registered', NULL),
(3, 3, 1, '2026-08-11 09:15:00+00', 'registered', NULL),
(4, 4, 1, '2026-08-12 14:40:00+00', 'registered', NULL),
(5, 5, 1, '2026-08-13 16:20:00+00', 'registered', NULL),
(6, 1, 2, '2026-08-28 10:05:00+00', 'registered', NULL),
(7, 2, 2, '2026-08-28 12:10:00+00', 'registered', NULL),
(8, 6, 2, '2026-08-29 09:00:00+00', 'registered', NULL),
(9, 8, 2, '2026-08-30 15:45:00+00', 'registered', NULL),
(10, 11, 2, '2026-08-31 11:20:00+00', 'registered', NULL),
(11, 13, 2, '2026-09-01 10:30:00+00', 'registered', NULL),
(12, 3, 3, '2026-09-10 09:40:00+00', 'registered', NULL),
(13, 8, 3, '2026-09-11 13:15:00+00', 'registered', NULL),
(14, 9, 3, '2026-09-12 17:05:00+00', 'registered', NULL),
(15, 1, 4, '2026-09-25 10:00:00+00', 'registered', NULL),
(16, 5, 4, '2026-09-26 11:10:00+00', 'registered', NULL),
(17, 11, 4, '2026-09-27 14:25:00+00', 'registered', NULL),
(18, 13, 4, '2026-09-28 09:50:00+00', 'registered', NULL),
(19, 2, 5, '2026-10-30 10:15:00+00', 'registered', NULL),
(20, 4, 5, '2026-10-31 16:00:00+00', 'cancelled', '2026-11-01 09:00:00+00'),
(21, 4, 6, '2026-11-10 09:30:00+00', 'registered', NULL),
(22, 9, 6, '2026-11-11 12:45:00+00', 'registered', NULL),
(23, 13, 6, '2026-11-12 18:10:00+00', 'registered', NULL);

-- ============================================================
-- 5. ATTENDANCE
-- ============================================================

INSERT INTO attendance (id, registration_id, status, check_in_method, marked_at)
OVERRIDING SYSTEM VALUE VALUES
(1, 1, 'present', 'manual', '2026-08-22 09:05:00+00'),
(2, 2, 'present', 'manual', '2026-08-22 09:08:00+00'),
(3, 3, 'absent', 'manual', '2026-08-22 09:30:00+00'),
(4, 4, 'present', 'manual', '2026-08-22 09:12:00+00'),
(5, 5, 'present', 'manual', '2026-08-22 09:20:00+00'),
(6, 6, 'present', 'manual', '2026-09-05 18:05:00+00'),
(7, 7, 'absent', 'manual', '2026-09-05 18:30:00+00'),
(8, 8, 'present', 'manual', '2026-09-05 18:10:00+00'),
(9, 9, 'present', 'manual', '2026-09-05 18:15:00+00'),
(10, 10, 'present', 'manual', '2026-09-05 18:20:00+00'),
(11, 11, 'absent', 'manual', '2026-09-05 18:35:00+00'),
(12, 12, 'present', 'manual', '2026-09-19 08:00:00+00'),
(13, 13, 'present', 'manual', '2026-09-19 08:05:00+00'),
(14, 14, 'absent', 'manual', '2026-09-19 08:30:00+00'),
(15, 15, 'present', 'manual', '2026-10-03 10:00:00+00'),
(16, 16, 'present', 'manual', '2026-10-03 10:04:00+00'),
(17, 17, 'present', 'manual', '2026-10-03 10:09:00+00'),
(18, 18, 'absent', 'manual', '2026-10-03 10:30:00+00'),
(19, 19, 'present', 'manual', '2026-11-07 11:00:00+00');

-- Keep identity sequences ahead of the explicit sample IDs.
SELECT setval(pg_get_serial_sequence('departments', 'id'), (SELECT MAX(id) FROM departments));
SELECT setval(pg_get_serial_sequence('students', 'id'), (SELECT MAX(id) FROM students));
SELECT setval(pg_get_serial_sequence('events', 'id'), (SELECT MAX(id) FROM events));
SELECT setval(pg_get_serial_sequence('registrations', 'id'), (SELECT MAX(id) FROM registrations));
SELECT setval(pg_get_serial_sequence('attendance', 'id'), (SELECT MAX(id) FROM attendance));

COMMIT;
