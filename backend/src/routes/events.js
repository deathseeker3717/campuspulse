const express = require('express')
const pool = require('../config/db')

const router = express.Router()

// Valid categories from the database schema
const VALID_CATEGORIES = [
    'Technical',
    'Cultural',
    'Sports',
    'Workshop',
    'Seminar'
]

// Valid statuses from the database schema
const VALID_STATUSES = [
    'draft',
    'published',
    'cancelled',
    'completed'
]

// Get events with search, category filtering and pagination
router.get('/', async (req, res) => {
    try {
        const search = typeof req.query.search === 'string' ? req.query.search.trim() : ''
        const category = typeof req.query.category === 'string' && req.query.category.trim()
            ? req.query.category.trim()
            : null
        const page = Number(req.query.page) || 1
        const limit = Number(req.query.limit) || 8

        if (
            !Number.isInteger(page) || page < 1 ||
            !Number.isInteger(limit) || limit < 1 || limit > 100
        ) {
            return res.status(400).json({
                message: 'Invalid pagination values'
            })
        }

        if (category && !VALID_CATEGORIES.includes(category)) {
            return res.status(400).json({
                message: 'Invalid category'
            })
        }

        const searchValue = search ? `%${search}%` : null

        const filters = [searchValue, category]

        const countResult = await pool.query(
            `SELECT COUNT(*) AS total
             FROM events e
             WHERE ($1::text IS NULL OR
                    e.title ILIKE $1 OR
                    e.description ILIKE $1 OR
                    e.venue ILIKE $1)
             AND ($2::text IS NULL OR e.category = $2)`,
            filters
        )

        const result = await pool.query(
            `SELECT
                e.id,
                e.title,
                e.description,
                e.category,
                e.venue,
                to_char(e.event_date, 'YYYY-MM-DD') AS event_date,
                e.registration_deadline,
                e.capacity,
                e.status,
                e.created_at,
                e.updated_at,
                COUNT(r.id) FILTER (
                    WHERE r.status = 'registered'
                )::int AS registered
             FROM events e
             LEFT JOIN registrations r ON r.event_id = e.id
             WHERE ($1::text IS NULL OR
                    e.title ILIKE $1 OR
                    e.description ILIKE $1 OR
                    e.venue ILIKE $1)
             AND ($2::text IS NULL OR e.category = $2)
             GROUP BY e.id
             ORDER BY e.event_date ASC, e.id ASC
             LIMIT $3 OFFSET $4`,
            [...filters, limit, (page - 1) * limit]
        )

        res.json({
            data: result.rows,
            total: Number(countResult.rows[0].total),
            page,
            limit
        })
    } catch (error) {
        console.error('Error fetching events:', error.message)

        res.status(500).json({
            message: 'Could not fetch events'
        })
    }
})

// Get single event with details and registrations
router.get('/:id', async (req, res) => {
    try {
        const eventId = Number(req.params.id)

        if (!Number.isSafeInteger(eventId) || eventId < 1) {
            return res.status(400).json({
                message: 'Invalid event ID'
            })
        }

        const eventResult = await pool.query(
            `SELECT
                e.id,
                e.title,
                e.description,
                e.category,
                e.venue,
                to_char(e.event_date, 'YYYY-MM-DD') AS event_date,
                e.registration_deadline,
                e.capacity,
                e.status,
                e.created_at,
                e.updated_at,
                COUNT(r.id) FILTER (
                    WHERE r.status = 'registered'
                )::int AS registered
             FROM events e
             LEFT JOIN registrations r ON r.event_id = e.id
             WHERE e.id = $1
             GROUP BY e.id`,
            [eventId]
        )

        if (eventResult.rowCount === 0) {
            return res.status(404).json({
                message: 'Event not found'
            })
        }

        const registrationsResult = await pool.query(
            `SELECT
                r.id,
                r.student_id,
                r.event_id,
                r.registered_at,
                r.status,
                s.name AS student_name,
                s.roll_no,
                d.code AS department,
                e.title AS event_title,
                to_char(e.event_date, 'YYYY-MM-DD') AS event_date,
                a.status AS attendance_status
             FROM registrations r
             JOIN students s ON s.id = r.student_id
             JOIN departments d ON d.id = s.department_id
             JOIN events e ON e.id = r.event_id
             LEFT JOIN attendance a ON a.registration_id = r.id
             WHERE r.event_id = $1
             AND r.status = 'registered'
             ORDER BY r.registered_at DESC`,
            [eventId]
        )

        res.json({
            ...eventResult.rows[0],
            registrations: registrationsResult.rows
        })
    } catch (error) {
        console.error('Error fetching event:', error.message)

        res.status(500).json({
            message: 'Could not fetch event'
        })
    }
})

// Create an event
router.post('/', async (req, res) => {
    try {
        const {
            title,
            description,
            category,
            venue,
            event_date,
            registration_deadline,
            capacity,
            status
        } = req.body || {}

        const eventTitle = typeof title === 'string' ? title.trim() : ''
        const eventDescription = typeof description === 'string' ? description.trim() : ''
        const eventCategory = typeof category === 'string' ? category.trim() : ''
        const eventVenue = typeof venue === 'string' ? venue.trim() : ''
        const eventDate = typeof event_date === 'string' ? event_date.trim() : ''
        const eventDeadline = typeof registration_deadline === 'string' && registration_deadline.trim()
            ? registration_deadline.trim()
            : null
        const eventCapacity = Number(capacity)
        const eventStatus = typeof status === 'string' && status.trim() ? status.trim() : 'published'

        if (!eventTitle || !eventCategory || !eventDate || capacity === undefined || capacity === null || capacity === '') {
            return res.status(400).json({
                message: 'Please provide title, category, event_date and capacity'
            })
        }

        if (eventTitle.length > 150) {
            return res.status(400).json({
                message: 'Title exceeds the allowed length'
            })
        }

        if (eventVenue && eventVenue.length > 120) {
            return res.status(400).json({
                message: 'Venue exceeds the allowed length'
            })
        }

        if (!VALID_CATEGORIES.includes(eventCategory)) {
            return res.status(400).json({
                message: 'Invalid category'
            })
        }

        if (!VALID_STATUSES.includes(eventStatus)) {
            return res.status(400).json({
                message: 'Invalid status'
            })
        }

        if (!Number.isInteger(eventCapacity) || eventCapacity < 1 || eventCapacity > 2147483647) {
            return res.status(400).json({
                message: 'Capacity must be a positive integer within valid range'
            })
        }

        if (isNaN(Date.parse(eventDate))) {
            return res.status(400).json({
                message: 'Invalid event date'
            })
        }

        if (eventDeadline && isNaN(Date.parse(eventDeadline))) {
            return res.status(400).json({
                message: 'Invalid registration deadline'
            })
        }

        const result = await pool.query(
            `INSERT INTO events (
                title, description, category, venue,
                event_date, registration_deadline, capacity, status
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING
                id,
                title,
                description,
                category,
                venue,
                to_char(event_date, 'YYYY-MM-DD') AS event_date,
                registration_deadline,
                capacity,
                status,
                created_at,
                updated_at`,
            [
                eventTitle,
                eventDescription || null,
                eventCategory,
                eventVenue || null,
                eventDate,
                eventDeadline,
                eventCapacity,
                eventStatus
            ]
        )

        res.status(201).json(result.rows[0])
    } catch (error) {
        if (error.code === '23514') {
            return res.status(400).json({
                message: 'Registration deadline must be before the event date'
            })
        }

        if (error.code === '22007' || error.code === '22008') {
            return res.status(400).json({
                message: 'Invalid date or deadline format'
            })
        }

        console.error('Error creating event:', error.message)

        res.status(500).json({
            message: 'Could not create event'
        })
    }
})

// Update an event
router.put('/:id', async (req, res) => {
    try {
        const eventId = Number(req.params.id)

        if (!Number.isSafeInteger(eventId) || eventId < 1) {
            return res.status(400).json({
                message: 'Invalid event ID'
            })
        }

        // Fetch existing event first to support partial updates and verify existence
        const existingResult = await pool.query(
            'SELECT * FROM events WHERE id = $1',
            [eventId]
        )

        if (existingResult.rowCount === 0) {
            return res.status(404).json({
                message: 'Event not found'
            })
        }

        const existing = existingResult.rows[0]

        const {
            title,
            description,
            category,
            venue,
            event_date,
            registration_deadline,
            capacity,
            status
        } = req.body || {}

        const eventTitle = title !== undefined
            ? (typeof title === 'string' ? title.trim() : '')
            : existing.title

        const eventDescription = description !== undefined
            ? (typeof description === 'string' ? description.trim() : '')
            : existing.description

        const eventCategory = category !== undefined
            ? (typeof category === 'string' ? category.trim() : '')
            : existing.category

        const eventVenue = venue !== undefined
            ? (typeof venue === 'string' ? venue.trim() : '')
            : existing.venue

        const eventDate = event_date !== undefined
            ? (typeof event_date === 'string' ? event_date.trim() : '')
            : existing.event_date

        const eventDeadline = registration_deadline !== undefined
            ? (typeof registration_deadline === 'string' && registration_deadline.trim()
                ? registration_deadline.trim()
                : null)
            : existing.registration_deadline

        const eventCapacity = capacity !== undefined
            ? Number(capacity)
            : existing.capacity

        const eventStatus = status !== undefined && typeof status === 'string' && status.trim()
            ? status.trim()
            : existing.status

        if (!eventTitle || !eventCategory || !eventDate || !eventCapacity) {
            return res.status(400).json({
                message: 'Please provide title, category, event_date and capacity'
            })
        }

        if (eventTitle.length > 150) {
            return res.status(400).json({
                message: 'Title exceeds the allowed length'
            })
        }

        if (eventVenue && eventVenue.length > 120) {
            return res.status(400).json({
                message: 'Venue exceeds the allowed length'
            })
        }

        if (!VALID_CATEGORIES.includes(eventCategory)) {
            return res.status(400).json({
                message: 'Invalid category'
            })
        }

        if (!VALID_STATUSES.includes(eventStatus)) {
            return res.status(400).json({
                message: 'Invalid status'
            })
        }

        if (!Number.isInteger(eventCapacity) || eventCapacity < 1 || eventCapacity > 2147483647) {
            return res.status(400).json({
                message: 'Capacity must be a positive integer within valid range'
            })
        }

        if (isNaN(Date.parse(eventDate))) {
            return res.status(400).json({
                message: 'Invalid event date'
            })
        }

        if (eventDeadline && isNaN(Date.parse(eventDeadline))) {
            return res.status(400).json({
                message: 'Invalid registration deadline'
            })
        }

        const result = await pool.query(
            `UPDATE events
             SET title = $2,
                 description = $3,
                 category = $4,
                 venue = $5,
                 event_date = $6,
                 registration_deadline = $7,
                 capacity = $8,
                 status = $9
             WHERE id = $1
             RETURNING
                id,
                title,
                description,
                category,
                venue,
                to_char(event_date, 'YYYY-MM-DD') AS event_date,
                registration_deadline,
                capacity,
                status,
                created_at,
                updated_at`,
            [
                eventId,
                eventTitle,
                eventDescription || null,
                eventCategory,
                eventVenue || null,
                eventDate,
                eventDeadline,
                eventCapacity,
                eventStatus
            ]
        )

        res.json(result.rows[0])
    } catch (error) {
        if (error.code === '23514') {
            return res.status(400).json({
                message: 'Registration deadline must be before the event date'
            })
        }

        if (error.code === '22007' || error.code === '22008') {
            return res.status(400).json({
                message: 'Invalid date or deadline format'
            })
        }

        console.error('Error updating event:', error.message)

        res.status(500).json({
            message: 'Could not update event'
        })
    }
})

// Delete an event and its related records
router.delete('/:id', async (req, res) => {
    const eventId = Number(req.params.id)

    if (!Number.isSafeInteger(eventId) || eventId < 1) {
        return res.status(400).json({
            message: 'Invalid event ID'
        })
    }

    let client

    try {
        client = await pool.connect()

        await client.query('BEGIN')

        const eventResult = await client.query(
            'SELECT id FROM events WHERE id = $1 FOR UPDATE',
            [eventId]
        )

        if (eventResult.rowCount === 0) {
            await client.query('ROLLBACK')

            return res.status(404).json({
                message: 'Event not found'
            })
        }

        await client.query(
            `DELETE FROM attendance a
             USING registrations r
             WHERE a.registration_id = r.id
             AND r.event_id = $1`,
            [eventId]
        )

        await client.query(
            'DELETE FROM registrations WHERE event_id = $1',
            [eventId]
        )

        await client.query(
            'DELETE FROM events WHERE id = $1',
            [eventId]
        )

        await client.query('COMMIT')

        res.json({
            success: true
        })
    } catch (error) {
        if (client) {
            await client.query('ROLLBACK').catch(() => {})
        }

        console.error('Error deleting event:', error.message)

        res.status(500).json({
            message: 'Could not delete event'
        })
    } finally {
        if (client) {
            client.release()
        }
    }
})

module.exports = router
