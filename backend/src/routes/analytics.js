const express = require('express')
const pool = require('../config/db')

const router = express.Router()

// Dashboard KPI cards
router.get('/summary', async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT
                (SELECT COUNT(*) FROM students WHERE status = 'active') AS total_students,
                (SELECT COUNT(*) FROM events) AS total_events,
                (SELECT COUNT(*) FROM registrations WHERE status = 'registered') AS total_registrations,
                (SELECT ROUND(100.0 * COUNT(*) FILTER (WHERE status = 'present') / NULLIF(COUNT(*), 0))
                 FROM attendance) AS avg_attendance`
        )

        const row = result.rows[0]

        res.json({
            total_students: Number(row.total_students),
            total_events: Number(row.total_events),
            total_registrations: Number(row.total_registrations),
            avg_attendance: Number(row.avg_attendance) || 0
        })
    } catch (error) {
        console.error('Error fetching analytics summary:', error.message)

        res.status(500).json({
            message: 'Could not fetch analytics summary'
        })
    }
})

// Five most popular events by registrations
router.get('/top-events', async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT
                event_id,
                title,
                total_registrations AS registrations
             FROM v_event_analytics
             ORDER BY total_registrations DESC, event_date
             LIMIT 5`
        )

        const rows = result.rows.map((row) => ({
            event_id: Number(row.event_id),
            title: row.title,
            registrations: Number(row.registrations)
        }))

        res.json(rows)
    } catch (error) {
        console.error('Error fetching top events:', error.message)

        res.status(500).json({
            message: 'Could not fetch top events'
        })
    }
})

// Registrations per department, used by the pie chart
router.get('/departments', async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT
                code AS department,
                total_registrations AS participation
             FROM v_department_analytics
             WHERE total_registrations > 0
             ORDER BY total_registrations DESC, code`
        )

        const rows = result.rows.map((row) => ({
            department: row.department,
            participation: Number(row.participation)
        }))

        res.json(rows)
    } catch (error) {
        console.error('Error fetching department analytics:', error.message)

        res.status(500).json({
            message: 'Could not fetch department analytics'
        })
    }
})

// Attendance breakdown for events where attendance has been marked
router.get('/attendance', async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT
                event_id,
                title,
                total_registrations AS registered,
                present_count AS present,
                ROUND(attendance_percentage) AS percentage
             FROM v_event_analytics
             WHERE present_count + absent_count > 0
             ORDER BY event_date`
        )

        const rows = result.rows.map((row) => ({
            event_id: Number(row.event_id),
            title: row.title,
            registered: Number(row.registered),
            present: Number(row.present),
            percentage: Number(row.percentage)
        }))

        res.json(rows)
    } catch (error) {
        console.error('Error fetching attendance analytics:', error.message)

        res.status(500).json({
            message: 'Could not fetch attendance analytics'
        })
    }
})

// Registrations grouped by the month the event is held in
router.get('/monthly', async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT
                TO_CHAR(DATE_TRUNC('month', e.event_date), 'YYYY-MM') AS month,
                COUNT(r.id) AS registrations
             FROM events e
             JOIN registrations r ON r.event_id = e.id AND r.status = 'registered'
             GROUP BY DATE_TRUNC('month', e.event_date)
             ORDER BY DATE_TRUNC('month', e.event_date)`
        )

        const rows = result.rows.map((row) => ({
            month: row.month,
            registrations: Number(row.registrations)
        }))

        res.json(rows)
    } catch (error) {
        console.error('Error fetching monthly analytics:', error.message)

        res.status(500).json({
            message: 'Could not fetch monthly analytics'
        })
    }
})

module.exports = router
