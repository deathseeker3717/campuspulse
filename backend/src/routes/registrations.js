const express = require('express')
const pool = require('../config/db')

const router = express.Router()

// Helper to format a registration row with consistent string BIGINT identifiers and joined fields
function formatRegistration(row) {
    return {
        id: String(row.id),
        student_id: String(row.student_id),
        event_id: String(row.event_id),
        registered_at: row.registered_at,
        student_name: row.student_name,
        roll_no: row.roll_no,
        department: row.department,
        event_title: row.event_title,
        event_date: row.event_date,
        attendance_status: row.attendance_status ?? null
    }
}

// GET /api/registrations
// Returns list of registrations with search, event filter and pagination
router.get('/', async (req, res) => {
    try {
        const search = typeof req.query.search === 'string' ? req.query.search.trim() : ''
        const eventId = req.query.event_id !== undefined && req.query.event_id !== '' ? Number(req.query.event_id) : null
        const page = req.query.page !== undefined && req.query.page !== '' ? Number(req.query.page) : 1
        const limit = req.query.limit !== undefined && req.query.limit !== '' ? Number(req.query.limit) : 8

        if (
            !Number.isInteger(page) || page < 1 ||
            !Number.isInteger(limit) || limit < 1 || limit > 100
        ) {
            return res.status(400).json({
                message: 'Invalid pagination values'
            })
        }

        if (eventId !== null && (!Number.isInteger(eventId) || eventId < 1)) {
            return res.status(400).json({
                message: 'Invalid event ID'
            })
        }

        const searchValue = search ? `%${search}%` : null
        const filters = [searchValue, eventId]

        const countResult = await pool.query(
            `SELECT COUNT(*) AS total
             FROM registrations r
             JOIN students s ON s.id = r.student_id
             JOIN events e ON e.id = r.event_id
             WHERE r.status = 'registered'
               AND ($1::text IS NULL OR
                    s.name ILIKE $1 OR
                    s.roll_no ILIKE $1 OR
                    e.title ILIKE $1)
               AND ($2::bigint IS NULL OR r.event_id = $2)`,
            filters
        )

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
               AND ($1::text IS NULL OR
                    s.name ILIKE $1 OR
                    s.roll_no ILIKE $1 OR
                    e.title ILIKE $1)
               AND ($2::bigint IS NULL OR r.event_id = $2)
             ORDER BY r.id DESC
             LIMIT $3 OFFSET $4`,
            [...filters, limit, (page - 1) * limit]
        )

        res.json({
            data: result.rows.map(formatRegistration),
            total: Number(countResult.rows[0].total),
            page,
            limit
        })
    } catch (error) {
        console.error('Error fetching registrations:', error.message)

        res.status(500).json({
            message: 'Could not fetch registrations'
        })
    }
})

// POST /api/registrations
// Register a student for an event using { student_id, event_id }
router.post('/', async (req, res) => {
    const { student_id, event_id } = req.body || {}
    const studentId = Number(student_id)
    const eventId = Number(event_id)

    if (!Number.isInteger(studentId) || studentId < 1 ||
        !Number.isInteger(eventId) || eventId < 1) {
        return res.status(400).json({
            message: 'Please provide valid student_id and event_id'
        })
    }

    let client

    try {
        client = await pool.connect()
        await client.query('BEGIN')

        // 1. Verify student exists and is active
        const studentCheck = await client.query(
            'SELECT id, name, status FROM students WHERE id = $1',
            [studentId]
        )

        if (studentCheck.rowCount === 0) {
            await client.query('ROLLBACK')
            return res.status(404).json({
                message: 'Student not found'
            })
        }

        if (studentCheck.rows[0].status !== 'active') {
            await client.query('ROLLBACK')
            return res.status(400).json({
                message: 'Inactive students cannot register for events'
            })
        }

        // 2. Lock event row to check existence, status, registration deadline, and capacity
        const eventCheck = await client.query(
            `SELECT
                id,
                title,
                capacity,
                status,
                registration_deadline,
                (registration_deadline IS NOT NULL AND registration_deadline < NOW()) AS is_deadline_passed
             FROM events
             WHERE id = $1
             FOR UPDATE`,
            [eventId]
        )

        if (eventCheck.rowCount === 0) {
            await client.query('ROLLBACK')
            return res.status(404).json({
                message: 'Event not found'
            })
        }

        const event = eventCheck.rows[0]

        // Only allow registration for published events (reject draft, cancelled, completed)
        if (event.status !== 'published') {
            await client.query('ROLLBACK')
            return res.status(409).json({
                message: `Cannot register for a ${event.status} event`
            })
        }

        // Validate registration deadline against PostgreSQL NOW()
        if (event.is_deadline_passed) {
            await client.query('ROLLBACK')
            return res.status(409).json({
                message: 'Registration deadline has passed'
            })
        }

        // 3. Check for duplicate active registration
        const existingReg = await client.query(
            'SELECT id, status FROM registrations WHERE student_id = $1 AND event_id = $2',
            [studentId, eventId]
        )

        if (existingReg.rowCount > 0 && existingReg.rows[0].status === 'registered') {
            await client.query('ROLLBACK')
            return res.status(409).json({
                message: 'This student is already registered for this event'
            })
        }

        // 4. Check event capacity against active registrations count
        const capacityCheck = await client.query(
            `SELECT COUNT(*) AS total
             FROM registrations
             WHERE event_id = $1 AND status = 'registered'`,
            [eventId]
        )

        const currentRegistered = Number(capacityCheck.rows[0].total)
        const eventCapacity = Number(event.capacity)

        if (currentRegistered >= eventCapacity) {
            await client.query('ROLLBACK')
            return res.status(409).json({
                message: 'Event is full'
            })
        }

        // 5. Insert new registration or reactivate if previously cancelled
        let registrationId

        if (existingReg.rowCount > 0) {
            // Clear any old attendance record from previous registration
            await client.query(
                'DELETE FROM attendance WHERE registration_id = $1',
                [existingReg.rows[0].id]
            )

            const updateResult = await client.query(
                `UPDATE registrations
                 SET status = 'registered',
                     cancelled_at = NULL,
                     registered_at = NOW()
                 WHERE id = $1
                 RETURNING id`,
                [existingReg.rows[0].id]
            )
            registrationId = updateResult.rows[0].id
        } else {
            const insertResult = await client.query(
                `INSERT INTO registrations (student_id, event_id, registered_at, status)
                 VALUES ($1, $2, NOW(), 'registered')
                 RETURNING id`,
                [studentId, eventId]
            )
            registrationId = insertResult.rows[0].id
        }

        // 6. Fetch full joined registration details for frontend response
        const detailsResult = await client.query(
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
             WHERE r.id = $1`,
            [registrationId]
        )

        await client.query('COMMIT')

        res.status(201).json(formatRegistration(detailsResult.rows[0]))
    } catch (error) {
        if (client) {
            await client.query('ROLLBACK').catch(() => {})
        }

        if (error.code === '23505') {
            return res.status(409).json({
                message: 'This student is already registered for this event'
            })
        }

        console.error('Error creating registration:', error.message)

        res.status(500).json({
            message: 'Could not create registration'
        })
    } finally {
        if (client) {
            client.release()
        }
    }
})

// DELETE /api/registrations/:id
// Cancel a registration (soft cancellation preserving history)
router.delete('/:id', async (req, res) => {
    const registrationId = Number(req.params.id)

    if (!Number.isSafeInteger(registrationId) || registrationId < 1) {
        return res.status(400).json({
            message: 'Invalid registration ID'
        })
    }

    let client

    try {
        client = await pool.connect()
        await client.query('BEGIN')

        const registrationResult = await client.query(
            'SELECT id, status FROM registrations WHERE id = $1 FOR UPDATE',
            [registrationId]
        )

        if (registrationResult.rowCount === 0) {
            await client.query('ROLLBACK')
            return res.status(404).json({
                message: 'Registration not found'
            })
        }

        if (registrationResult.rows[0].status === 'cancelled') {
            await client.query('ROLLBACK')
            return res.status(400).json({
                message: 'Registration is already cancelled'
            })
        }

        // Soft-cancel: preserve registration row and set status to cancelled with timestamp
        await client.query(
            `UPDATE registrations
             SET status = 'cancelled',
                 cancelled_at = NOW()
             WHERE id = $1`,
            [registrationId]
        )

        await client.query('COMMIT')

        res.json({
            success: true,
            message: 'Registration cancelled successfully'
        })
    } catch (error) {
        if (client) {
            await client.query('ROLLBACK').catch(() => {})
        }

        console.error('Error cancelling registration:', error.message)

        res.status(500).json({
            message: 'Could not cancel registration'
        })
    } finally {
        if (client) {
            client.release()
        }
    }
})

module.exports = router
