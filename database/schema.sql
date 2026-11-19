-- ============================================================
-- CampusPulse
-- PostgreSQL database schema
-- ============================================================

BEGIN;

-- ============================================================
-- 1. DEPARTMENTS
-- ============================================================

CREATE TABLE departments (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    code VARCHAR(10) NOT NULL UNIQUE,
    name VARCHAR(80) NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT departments_code_not_empty
        CHECK (LENGTH(TRIM(code)) > 0),

    CONSTRAINT departments_name_not_empty
        CHECK (LENGTH(TRIM(name)) > 0)
);

-- ============================================================
-- 2. STUDENTS
-- ============================================================

CREATE TABLE students (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    name VARCHAR(100) NOT NULL,
    email VARCHAR(254) NOT NULL UNIQUE,
    roll_no VARCHAR(20) NOT NULL UNIQUE,

    department_id BIGINT NOT NULL
        REFERENCES departments(id) ON DELETE RESTRICT,

    year SMALLINT NOT NULL
        CHECK (year BETWEEN 1 AND 4),

    phone VARCHAR(20),

    status VARCHAR(12) NOT NULL DEFAULT 'active'
        CHECK (status IN ('active', 'inactive')),

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT students_name_not_empty
        CHECK (LENGTH(TRIM(name)) > 0),

    CONSTRAINT students_email_not_empty
        CHECK (LENGTH(TRIM(email)) > 0),

    CONSTRAINT students_roll_no_not_empty
        CHECK (LENGTH(TRIM(roll_no)) > 0)
);

-- ============================================================
-- 3. EVENTS
-- ============================================================

CREATE TABLE events (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    title VARCHAR(150) NOT NULL,
    description TEXT,

    category VARCHAR(30) NOT NULL
        CHECK (
            category IN (
                'Technical',
                'Cultural',
                'Sports',
                'Workshop',
                'Seminar'
            )
        ),

    venue VARCHAR(120),

    event_date DATE NOT NULL,

    registration_deadline TIMESTAMPTZ,

    capacity INTEGER NOT NULL
        CHECK (capacity > 0),

    status VARCHAR(12) NOT NULL DEFAULT 'published'
        CHECK (
            status IN (
                'draft',
                'published',
                'cancelled',
                'completed'
            )
        ),

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT events_title_not_empty
        CHECK (LENGTH(TRIM(title)) > 0),

    CONSTRAINT events_registration_deadline_valid
        CHECK (
            registration_deadline IS NULL
            OR registration_deadline < (event_date + 1)::TIMESTAMP AT TIME ZONE 'UTC'
        )
);

-- ============================================================
-- 4. REGISTRATIONS
-- ============================================================

CREATE TABLE registrations (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    student_id BIGINT NOT NULL
        REFERENCES students(id) ON DELETE RESTRICT,

    event_id BIGINT NOT NULL
        REFERENCES events(id) ON DELETE RESTRICT,

    registered_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    status VARCHAR(12) NOT NULL DEFAULT 'registered'
        CHECK (status IN ('registered', 'cancelled')),

    cancelled_at TIMESTAMPTZ,

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT registrations_unique_student_event
        UNIQUE (student_id, event_id),

    CONSTRAINT registrations_cancellation_consistent
        CHECK (
            (status = 'registered' AND cancelled_at IS NULL)
            OR
            (status = 'cancelled' AND cancelled_at IS NOT NULL)
        )
);

-- ============================================================
-- 5. ATTENDANCE
-- ============================================================

CREATE TABLE attendance (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    registration_id BIGINT NOT NULL UNIQUE
        REFERENCES registrations(id) ON DELETE RESTRICT,

    status VARCHAR(10) NOT NULL
        CHECK (status IN ('present', 'absent')),

    check_in_method VARCHAR(12) NOT NULL DEFAULT 'manual'
        CHECK (
            check_in_method IN ('manual', 'qr', 'bulk')
        ),

    marked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 6. AUTOMATIC updated_at MANAGEMENT
-- ============================================================

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_students_updated_at
BEFORE UPDATE ON students
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_events_updated_at
BEFORE UPDATE ON events
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_registrations_updated_at
BEFORE UPDATE ON registrations
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_attendance_updated_at
BEFORE UPDATE ON attendance
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

-- ============================================================
-- 7. INDEXES
-- ============================================================

-- Student filtering and department analytics
CREATE INDEX idx_students_department_year
    ON students(department_id, year);

CREATE INDEX idx_students_active_department
    ON students(department_id)
    WHERE status = 'active';

-- Case-insensitive email lookup
CREATE UNIQUE INDEX idx_students_email_lower
    ON students(LOWER(email));

-- Event filtering
CREATE INDEX idx_events_category_date
    ON events(category, event_date);

CREATE INDEX idx_events_published_date
    ON events(event_date)
    WHERE status = 'published';

-- Registration lookups and analytics
CREATE INDEX idx_registrations_event_status
    ON registrations(event_id, status);

CREATE INDEX idx_registrations_student_date
    ON registrations(student_id, registered_at DESC);

CREATE INDEX idx_registrations_registered_event
    ON registrations(event_id)
    WHERE status = 'registered';

-- Attendance lookups
CREATE INDEX idx_attendance_status
    ON attendance(status);

-- ============================================================
-- 8. ANALYTICS VIEWS
-- ============================================================

-- Event registration and attendance summary
CREATE VIEW v_event_analytics AS
SELECT
    e.id AS event_id,
    e.title,
    e.category,
    e.event_date,
    e.capacity,
    e.status AS event_status,

    COUNT(r.id) FILTER (
        WHERE r.status = 'registered'
    ) AS total_registrations,

    COUNT(a.id) FILTER (
        WHERE a.status = 'present'
          AND r.status = 'registered'
    ) AS present_count,

    COUNT(a.id) FILTER (
        WHERE a.status = 'absent'
          AND r.status = 'registered'
    ) AS absent_count,

    ROUND(
        100.0 * COUNT(a.id) FILTER (
            WHERE a.status = 'present'
              AND r.status = 'registered'
        ) / NULLIF(
            COUNT(r.id) FILTER (
                WHERE r.status = 'registered'
            ),
            0
        ),
        2
    ) AS attendance_percentage

FROM events e
LEFT JOIN registrations r
    ON r.event_id = e.id
LEFT JOIN attendance a
    ON a.registration_id = r.id
GROUP BY e.id;

-- Department participation summary
CREATE VIEW v_department_analytics AS
SELECT
    d.id AS department_id,
    d.code,
    d.name AS department,

    COUNT(DISTINCT s.id) AS total_students,

    COUNT(DISTINCT r.id) FILTER (
        WHERE r.status = 'registered'
    ) AS total_registrations,

    COUNT(DISTINCT r.student_id) FILTER (
        WHERE r.status = 'registered'
    ) AS participating_students

FROM departments d
LEFT JOIN students s
    ON s.department_id = d.id
LEFT JOIN registrations r
    ON r.student_id = s.id
GROUP BY d.id, d.code, d.name;

-- Monthly registration summary
CREATE VIEW v_monthly_registrations AS
SELECT
    DATE_TRUNC('month', registered_at)::DATE AS month,
    COUNT(*) FILTER (
        WHERE status = 'registered'
    ) AS registrations,
    COUNT(*) FILTER (
        WHERE status = 'cancelled'
    ) AS cancellations
FROM registrations
GROUP BY DATE_TRUNC('month', registered_at)::DATE;

COMMIT;

-- ============================================================
-- END OF SCHEMA
-- ============================================================
