-- Drop Block 
drop table if exists attendance, registrations, events, students cascade;
--

-- SQL
create table students (
  student_id serial primary key,
  full_name varchar(100) not null,
  email varchar(100) not null unique,
  department varchar(100) not null,
  enrollment_year int not null 
);

create table events (
  event_id serial primary key,
  title varchar(100) not null,
  category varchar(60) not null,
  event_date date not null,
  venue varchar(100),
  capacity int check(capacity>0)
);

create table registrations (
  registration_id serial primary key,
  student_id int not null,
  event_id int not null,
  registered_at timestamp not null default now(),
  unique (student_id,event_id)
);

create table attendance (
  attendance_id serial primary key,
  registration_id int not null unique,
  status varchar(10) not null default 'absent' check (status in ('present','absent')),
  checked_in_at timestamp
);

insert into students (full_name, email, department, enrollment_year) values
('Aditya Kumar','aditya@univ.edu','B.Tech CSAI',2025),
('Shaurya Sharma','shaurya@univ.edu','B.Tech CSAI',2025),
('Aryan Goyal','aryan@univ.edu','B.Tech CSAI',2025),
('Harshvardhan Dhankhar','harsh@univ.edu','B.Tech CSAI',2025),
('Neha Verma','neha@univ.edu','B.Tech DS',2025),
('Ishan Rao','ishan@univ.edu','B.Tech DS',2024),
('Priya Nair','priya@univ.edu','B.Tech DS',2024),
('Kabir Singh','kabir@univ.edu','Psychology',2025),
('Sanya Mehra','sanya@univ.edu','Psychology',2024),
('Rohan Das','rohan@univ.edu','Psychology',2024),
('Myra Kapoor','myra@univ.edu','B.Design',2025),
('Devansh Jain','devansh@univ.edu','B.Design',2023);

insert into events (title, category, event_date, venue, capacity) values
('AI Hackathon 24h','Technical','2026-09-12','A Block',120),
('Cultural Night','Cultural','2026-09-27','Main Ground',500),
('Data Science Workshop','Workshop','2026-10-05','C Block',80),
('Design Thinking Bootcamp','Workshop','2026-10-18','Design Studio',60),
('Mental Health Awareness Seminar','Seminar','2026-11-02','Auditorium',200),
('Robotics Expo','Technical','2026-11-20','B Block',150);

insert into registrations (student_id, event_id, registered_at) values
(1,1,'2026-09-01'),(2,1,'2026-09-02'),(3,1,'2026-09-03'),(4,1,'2026-09-04'),(5,1,'2026-09-05'),
(1,2,'2026-09-15'),(2,2,'2026-09-16'),(6,2,'2026-09-17'),(8,2,'2026-09-18'),(9,2,'2026-09-19'),(11,2,'2026-09-20'),
(1,3,'2026-10-01'),(5,3,'2026-10-01'),(6,3,'2026-10-02'),(7,3,'2026-10-03'),
(3,4,'2026-10-12'),(11,4,'2026-10-13'),
(8,5,'2026-10-28');

insert into attendance (registration_id, status, checked_in_at) values
(1,'present','2026-09-12 09:05'),(2,'present','2026-09-12 09:10'),(3,'absent',null),
(4,'present','2026-09-12 09:20'),(5,'present','2026-09-12 09:40'),
(6,'present','2026-09-27 18:05'),(7,'absent',null),(8,'present','2026-09-27 18:20'),
(9,'present','2026-09-27 18:30'),(10,'absent',null),(11,'present','2026-09-27 18:45'),
(12,'present','2026-10-05 10:00'),(13,'present','2026-10-05 10:05'),(14,'absent',null),
(15,'present','2026-10-05 10:15'),
(16,'present','2026-10-18 09:00'),(17,'present','2026-10-18 09:05');

-- Validation 

select
  s.student_id, s.full_name, s.department,
  e.title, e.event_date,
  a.status
from students s
left join registrations r on r.student_id      = s.student_id
left join events        e on e.event_id        = r.event_id
left join attendance    a on a.registration_id = r.registration_id
order by s.student_id, e.event_date;
