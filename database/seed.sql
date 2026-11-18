-- Run after schema.sql: psql campuspulse -f database/seed.sql
-- 14 students, 7 events, 23 registrations, 19 attendance rows.
-- Events straddle 16 Nov 2026: past events have attendance, future ones do not.

-- ------------------------------------------------------------
-- students
-- ------------------------------------------------------------
insert into students (name, email, roll_no, department, year, phone) values
('Aditya Kumar','aditya.kumar@campus.edu','CP26001','CSE',2,'9810012345'),
('Shaurya Sharma','shaurya.sharma@campus.edu','CP26002','CSE',2,'9810012346'),
('Aryan Goyal','aryan.goyal@campus.edu','CP26003','CSE',2,'9810012347'),
('Harshvardhan Dhankhar','harshvardhan.dhankhar@campus.edu','CP26004','CSE',2,'9810012348'),
('Neha Verma','neha.verma@campus.edu','CP26005','ECE',3,'9810012349'),
('Ishan Rao','ishan.rao@campus.edu','CP26006','ECE',1,'9810012350'),
('Priya Nair','priya.nair@campus.edu','CP26007','ECE',3,'9810012351'),
('Kabir Singh','kabir.singh@campus.edu','CP26008','ME',2,'9810012352'),
('Sanya Mehra','sanya.mehra@campus.edu','CP26009','ME',4,'9810012353'),
('Rohan Das','rohan.das@campus.edu','CP26010','CE',1,'9810012354'),
('Myra Kapoor','myra.kapoor@campus.edu','CP26011','IT',3,'9810012355'),
('Devansh Jain','devansh.jain@campus.edu','CP26012','IT',2,'9810012356'),
('Tanya Reddy','tanya.reddy@campus.edu','CP26013','EE',4,'9810012357'),
('Manav Gupta','manav.gupta@campus.edu','CP26014','MBA',1,'9810012358');

-- ------------------------------------------------------------
-- events
-- ------------------------------------------------------------
insert into events (title, description, category, venue, event_date, capacity) values
('HackSprint 2026','24-hour coding sprint open to all departments.','Technical','Main Auditorium','2026-08-22',120),
('Freshers Fiesta','Welcome evening for the incoming batch.','Cultural','Open Air Theatre','2026-09-05',200),
('Inter-Dept Cricket','Knockout cricket tournament between departments.','Sports','Central Ground','2026-09-19',60),
('Data Engineering Workshop','Hands-on session on pipelines and PostgreSQL.','Workshop','Lab 3','2026-10-03',40),
('AI and Ethics Seminar','Panel discussion on responsible AI.','Seminar','Seminar Hall A','2026-11-07',80),
('Diwali Cultural Night','Music, dance and food stalls.','Cultural','Open Air Theatre','2026-12-05',180),
('Cloud Computing Bootcamp','Two-day bootcamp on cloud deployment.','Workshop','Lab 1','2026-12-18',45);

-- ------------------------------------------------------------
-- registrations
-- ------------------------------------------------------------
insert into registrations (student_id, event_id, registered_at, status) values
(1,1,'2026-08-10 10:00','registered'),
(2,1,'2026-08-10 11:30','registered'),
(3,1,'2026-08-11 09:15','registered'),
(4,1,'2026-08-12 14:40','registered'),
(5,1,'2026-08-13 16:20','registered'),
(1,2,'2026-08-28 10:05','registered'),
(2,2,'2026-08-28 12:10','registered'),
(6,2,'2026-08-29 09:00','registered'),
(8,2,'2026-08-30 15:45','registered'),
(11,2,'2026-08-31 11:20','registered'),
(13,2,'2026-09-01 10:30','registered'),
(3,3,'2026-09-10 09:40','registered'),
(8,3,'2026-09-11 13:15','registered'),
(9,3,'2026-09-12 17:05','registered'),
(1,4,'2026-09-25 10:00','registered'),
(5,4,'2026-09-26 11:10','registered'),
(11,4,'2026-09-27 14:25','registered'),
(13,4,'2026-09-28 09:50','registered'),
(2,5,'2026-10-30 10:15','registered'),
(4,5,'2026-10-31 16:00','cancelled'),
(4,6,'2026-11-10 09:30','registered'),
(9,6,'2026-11-11 12:45','registered'),
(13,6,'2026-11-12 18:10','registered');

-- ------------------------------------------------------------
-- attendance
-- ------------------------------------------------------------
insert into attendance (registration_id, status, marked_at) values
(1,'present','2026-08-22 09:05'),
(2,'present','2026-08-22 09:08'),
(3,'absent','2026-08-22 09:30'),
(4,'present','2026-08-22 09:12'),
(5,'present','2026-08-22 09:20'),
(6,'present','2026-09-05 18:05'),
(7,'absent','2026-09-05 18:30'),
(8,'present','2026-09-05 18:10'),
(9,'present','2026-09-05 18:15'),
(10,'present','2026-09-05 18:20'),
(11,'absent','2026-09-05 18:35'),
(12,'present','2026-09-19 08:00'),
(13,'present','2026-09-19 08:05'),
(14,'absent','2026-09-19 08:30'),
(15,'present','2026-10-03 10:00'),
(16,'present','2026-10-03 10:04'),
(17,'present','2026-10-03 10:09'),
(18,'absent','2026-10-03 10:30'),
(19,'present','2026-11-07 11:00');
