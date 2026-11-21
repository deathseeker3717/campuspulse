const path = require('path')

require('dotenv').config({
    path: path.resolve(__dirname, '../.env')
})

const bcrypt = require('bcryptjs')
const pool = require('../src/config/db')

async function createAdmin() {
    const name = process.env.ADMIN_NAME?.trim()
    const email = process.env.ADMIN_EMAIL?.trim().toLowerCase()
    const password = process.env.ADMIN_PASSWORD

    // Validate input
    if (!name || !email || !password) {
        throw new Error('Please provide all Admin details in .env')
    }

    if (!/^\S+@\S+\.\S+$/.test(email)) {
        throw new Error('Please provide a valid email')
    }

    if (password.length < 8) {
        throw new Error('Password must be at least 8 characters')
    }

    // Check whether an Admin already exists
    const adminCheck = await pool.query(
        "SELECT id FROM users WHERE role = 'admin' LIMIT 1"
    )

    if (adminCheck.rowCount > 0) {
        throw new Error('An Admin account already exists')
    }

    // Check duplicate email
    const userCheck = await pool.query(
        'SELECT id FROM users WHERE LOWER(email) = $1',
        [email]
    )

    if (userCheck.rowCount > 0) {
        throw new Error('This email is already registered')
    }

    // Hash the password
    const passwordHash = await bcrypt.hash(password, 12)

    // Create Admin account
    const result = await pool.query(
        `INSERT INTO users (name, email, password_hash, role)
         VALUES ($1, $2, $3, 'admin')
         RETURNING id, name, email, role`,
        [name, email, passwordHash]
    )

    console.log('Admin account created successfully')
    console.log(result.rows[0])
}

async function main() {
    try {
        await createAdmin()
    } catch (error) {
        console.error(error.message)
        process.exitCode = 1
    } finally {
        await pool.end()
    }
}

main()
