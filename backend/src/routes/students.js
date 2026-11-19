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

// Create a student
router.post('/', async (req, res) => {
    try {
        const { name, email, roll_no, department, year, phone } = req.body || {}

        const studentName = typeof name === 'string' ? name.trim() : ''
        const studentEmail = typeof email === 'string' ? email.trim() : ''
        const rollNumber = typeof roll_no === 'string' ? roll_no.trim() : ''
        const departmentCode = typeof department === 'string' ? department.trim().toUpperCase() : ''
        const academicYear = Number(year)
        const studentPhone = typeof phone === 'string' ? phone.trim() : ''

        if (!studentName || !studentEmail || !rollNumber || !departmentCode || !year) {
            return res.status(400).json({
                message: 'Please provide all required student details'
            })
        }

        if (
            studentName.length > 100 ||
            studentEmail.length > 254 ||
            rollNumber.length > 20
        ) {
            return res.status(400).json({
                message: 'One or more fields exceed the allowed length'
            })
        }

        if (!/^\S+@\S+\.\S+$/.test(studentEmail)) {
            return res.status(400).json({
                message: 'Please provide a valid email'
            })
        }

        if (!Number.isInteger(academicYear) || academicYear < 1 || academicYear > 4) {
            return res.status(400).json({
                message: 'Academic year must be between 1 and 4'
            })
        }

        if (studentPhone && !/^\d{10}$/.test(studentPhone)) {
            return res.status(400).json({
                message: 'Phone must contain 10 digits'
            })
        }

        const result = await pool.query(
            `INSERT INTO students (
                name, email, roll_no, department_id, year, phone
            )
            SELECT $1, $2, $3, d.id, $5, $6
            FROM departments d
            WHERE d.code = $4
            RETURNING id, name, email, roll_no, year, phone`,
            [
                studentName,
                studentEmail,
                rollNumber,
                departmentCode,
                academicYear,
                studentPhone || null
            ]
        )

        if (result.rowCount === 0) {
            return res.status(400).json({
                message: 'Invalid department'
            })
        }

        res.status(201).json({
            ...result.rows[0],
            department: departmentCode
        })
    } catch (error) {
        if (error.code === '23505') {
            return res.status(409).json({
                message: 'A student with this email or roll number already exists'
            })
        }

        console.error('Error creating student:', error.message)

        res.status(500).json({
            message: 'Could not create student'
        })
    }
})

module.exports = router