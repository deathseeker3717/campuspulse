const express = require('express')
const pool = require('../config/db')

const router = express.Router()

// Get students with search, filters and pagination
router.get('/', async (req, res) => {
    try {
        const search = req.query.search || ''
        const department = req.query.department || null
        const year = req.query.year ? Number(req.query.year) : null
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

        if (year !== null && (!Number.isInteger(year) || year < 1 || year > 4)) {
            return res.status(400).json({
                message: 'Invalid academic year'
            })
        }

        const searchValue = search ? `%${search}%` : null

        const filters = [searchValue, department, year]

        const countResult = await pool.query(
            `SELECT COUNT(*) AS total
             FROM students s
             JOIN departments d ON d.id = s.department_id
             WHERE ($1::text IS NULL OR
                    s.name ILIKE $1 OR
                    s.email ILIKE $1 OR
                    s.roll_no ILIKE $1)
             AND ($2::text IS NULL OR d.code = $2)
             AND ($3::smallint IS NULL OR s.year = $3)`,
            filters
        )

        const result = await pool.query(
            `SELECT
                s.id,
                s.name,
                s.email,
                s.roll_no,
                d.code AS department,
                s.year,
                s.phone
             FROM students s
             JOIN departments d ON d.id = s.department_id
             WHERE ($1::text IS NULL OR
                    s.name ILIKE $1 OR
                    s.email ILIKE $1 OR
                    s.roll_no ILIKE $1)
             AND ($2::text IS NULL OR d.code = $2)
             AND ($3::smallint IS NULL OR s.year = $3)
             ORDER BY s.id
             LIMIT $4 OFFSET $5`,
            [...filters, limit, (page - 1) * limit]
        )

        res.json({
            data: result.rows,
            total: Number(countResult.rows[0].total),
            page,
            limit
        })
    } catch (error) {
        console.error('Error fetching students:', error.message)

        res.status(500).json({
            message: 'Could not fetch students'
        })
    }
})

module.exports = router