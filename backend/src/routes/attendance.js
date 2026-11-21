const express = require('express')
const pool = require('../config/db')

const router = express.Router()

// Get the registration list for an event. attendance_status is null when
// attendance has not been marked yet.
router.get('/', async (req, res) => {
    try {
        const eventId = req.query.event_id ? Number(req.query.event_id) : null

        if (eventId !== null && (!Number.isInteger(eventId) || eventId < 1)) {
            return res.status(400).json({
                message: 'Invalid event ID'
            })
        }

        const result = await pool.query(
            `SELECT
                r.id,
                r.student_id,
                r.event_id,
                r.registered_at,
                s.name AS student_name,
                s.roll_no,
                d.code AS department,
                e.title AS event_title,
                e.event_date,
                a.status AS attendance_status
             FROM registrations r
             JOIN students s ON s.id = r.student_id
             JOIN departments d ON d.id = s.department_id
             JOIN events e ON e.id = r.event_id
             LEFT JOIN attendance a ON a.registration_id = r.id
             WHERE r.status = 'registered'
             AND ($1::bigint IS NULL OR r.event_id = $1)
             ORDER BY e.event_date, s.name`,
            [eventId]
        )

        res.json(result.rows)
    } catch (error) {
        console.error('Error fetching attendance:', error.message)

        res.status(500).json({
            message: 'Could not fetch attendance'
        })
    }
})

// Mark attendance for one student. Marking the same registration again
// updates the existing record.
router.post('/', async (req, res) => {
    try {
        const { registration_id, status } = req.body || {}

        const registrationId = Number(registration_id)
        const attendanceStatus = typeof status === 'string' ? status.trim() : ''

        if (!Number.isInteger(registrationId) || registrationId < 1) {
            return res.status(400).json({
                message: 'Invalid registration ID'
            })
        }

        if (attendanceStatus !== 'present' && attendanceStatus !== 'absent') {
            return res.status(400).json({
                message: "Status must be 'present' or 'absent'"
            })
        }

        const registration = await pool.query(
            "SELECT id FROM registrations WHERE id = $1 AND status = 'registered'",
            [registrationId]
        )

        if (registration.rowCount === 0) {
            return res.status(404).json({
                message: 'No active registration found for this ID'
            })
        }

        const result = await pool.query(
            `INSERT INTO attendance (registration_id, status, check_in_method)
             VALUES ($1, $2, 'manual')
             ON CONFLICT (registration_id) DO UPDATE
             SET status = $2,
                 marked_at = NOW()
             RETURNING id, registration_id, status, marked_at`,
            [registrationId, attendanceStatus]
        )

        res.json(result.rows[0])
    } catch (error) {
        console.error('Error marking attendance:', error.message)

        res.status(500).json({
            message: 'Could not mark attendance'
        })
    }
})

// Mark the same status for everyone registered for an event.
router.post('/bulk', async (req, res) => {
    try {
        const { event_id, status } = req.body || {}

        const eventId = Number(event_id)
        const attendanceStatus = typeof status === 'string' ? status.trim() : ''

        if (!Number.isInteger(eventId) || eventId < 1) {
            return res.status(400).json({
                message: 'Invalid event ID'
            })
        }

        if (attendanceStatus !== 'present' && attendanceStatus !== 'absent') {
            return res.status(400).json({
                message: "Status must be 'present' or 'absent'"
            })
        }

        const event = await pool.query(
            'SELECT id FROM events WHERE id = $1',
            [eventId]
        )

        if (event.rowCount === 0) {
            return res.status(404).json({
                message: 'Event not found'
            })
        }

        const result = await pool.query(
            `INSERT INTO attendance (registration_id, status, check_in_method)
             SELECT r.id, $2, 'bulk'
             FROM registrations r
             WHERE r.event_id = $1
             AND r.status = 'registered'
             ON CONFLICT (registration_id) DO UPDATE
             SET status = $2,
                 marked_at = NOW()
             RETURNING id`,
            [eventId, attendanceStatus]
        )

        res.json({
            event_id: eventId,
            status: attendanceStatus,
            marked: result.rowCount
        })
    } catch (error) {
        console.error('Error marking bulk attendance:', error.message)

        res.status(500).json({
            message: 'Could not mark bulk attendance'
        })
    }
})

module.exports = router
