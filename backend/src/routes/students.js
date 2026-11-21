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

// Update a student
router.put('/:id', async (req, res) => {
    try {
        const studentId = Number(req.params.id)

        if (!Number.isSafeInteger(studentId) || studentId < 1) {
            return res.status(400).json({
                message: 'Invalid student ID'
            })
        }

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

        const departmentResult = await pool.query(
            'SELECT id FROM departments WHERE code = $1',
            [departmentCode]
        )

        if (departmentResult.rowCount === 0) {
            return res.status(400).json({
                message: 'Invalid department'
            })
        }

        const result = await pool.query(
            `UPDATE students
             SET name = $2,
                 email = $3,
                 roll_no = $4,
                 department_id = $5,
                 year = $6,
                 phone = $7
             WHERE id = $1
             RETURNING id, name, email, roll_no, year, phone`,
            [
                studentId,
                studentName,
                studentEmail,
                rollNumber,
                departmentResult.rows[0].id,
                academicYear,
                studentPhone || null
            ]
        )

        if (result.rowCount === 0) {
            return res.status(404).json({
                message: 'Student not found'
            })
        }

        res.json({
            ...result.rows[0],
            department: departmentCode
        })
    } catch (error) {
        if (error.code === '23505') {
            return res.status(409).json({
                message: 'A student with this email or roll number already exists'
            })
        }

        console.error('Error updating student:', error.message)

        res.status(500).json({
            message: 'Could not update student'
        })
    }
})

// Delete a student and their related records
router.delete('/:id', async (req, res) => {
    const studentId = Number(req.params.id)

    if (!Number.isSafeInteger(studentId) || studentId < 1) {
        return res.status(400).json({
            message: 'Invalid student ID'
        })
    }

    let client

    try {
        client = await pool.connect()

        await client.query('BEGIN')

        const studentResult = await client.query(
            'SELECT id FROM students WHERE id = $1 FOR UPDATE',
            [studentId]
        )

        if (studentResult.rowCount === 0) {
            await client.query('ROLLBACK')

            return res.status(404).json({
                message: 'Student not found'
            })
        }

        await client.query(
            `DELETE FROM attendance a
             USING registrations r
             WHERE a.registration_id = r.id
             AND r.student_id = $1`,
            [studentId]
        )

        await client.query(
            'DELETE FROM registrations WHERE student_id = $1',
            [studentId]
        )

        await client.query(
            'DELETE FROM students WHERE id = $1',
            [studentId]
        )

        await client.query('COMMIT')

        res.json({
            success: true
        })
    } catch (error) {
        if (client) {
            await client.query('ROLLBACK').catch(() => {})
        }

        console.error('Error deleting student:', error.message)

        res.status(500).json({
            message: 'Could not delete student'
        })
    } finally {
        if (client) {
            client.release()
        }
    }
})

module.exports = router