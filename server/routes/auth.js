import express from 'express'
import { getDatabase } from '../database/init.js'
import crypto from 'crypto'

const router = express.Router()

// Simple token generation (in production, use JWT)
function generateToken() {
  return crypto.randomBytes(32).toString('hex')
}

// POST /api/auth/login - Đăng nhập
router.post('/login', (req, res) => {
  try {
    const { username, password } = req.body
    
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' })
    }
    
    // For demo purposes, accept any username/password
    // In production, verify password hash from database
    const db = getDatabase()
    
    // Check if user exists
    const userStmt = db.prepare('SELECT * FROM users WHERE username = ? OR email = ?')
    let user = userStmt.get(username, username)
    
    // If no user exists, create a demo user
    if (!user) {
      const insertUser = db.prepare(`
        INSERT INTO users (username, email, password_hash, role)
        VALUES (?, ?, ?, ?)
      `)
      const hash = crypto.createHash('sha256').update(password).digest('hex')
      const result = insertUser.run(username, `${username}@example.com`, hash, 'admin')
      user = db.prepare('SELECT id, username, email, role, status FROM users WHERE id = ?').get(result.lastInsertRowid)
    }
    
    const token = generateToken()
    
    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    })
  } catch (error) {
    console.error('Error during login:', error)
    res.status(500).json({ error: error.message })
  }
})

// POST /api/auth/register - Đăng ký (optional)
router.post('/register', (req, res) => {
  try {
    const { username, email, password } = req.body
    
    if (!username || !email || !password) {
      return res.status(400).json({ error: 'Username, email, and password are required' })
    }
    
    const db = getDatabase()
    const hash = crypto.createHash('sha256').update(password).digest('hex')
    
    const stmt = db.prepare(`
      INSERT INTO users (username, email, password_hash, role)
      VALUES (?, ?, ?, ?)
    `)
    
    const result = stmt.run(username, email, hash, 'user')
    
    const user = db.prepare('SELECT id, username, email, role, status FROM users WHERE id = ?').get(result.lastInsertRowid)
    
    res.status(201).json({
      message: 'User created successfully',
      user
    })
  } catch (error) {
    if (error.message.includes('UNIQUE constraint')) {
      return res.status(409).json({ error: 'Username or email already exists' })
    }
    console.error('Error during registration:', error)
    res.status(500).json({ error: error.message })
  }
})

export default router

