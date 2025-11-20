import express from 'express'
import { getDatabase } from '../database/init.js'

const router = express.Router()

// GET /api/customers - Lấy danh sách khách hàng
router.get('/', (req, res) => {
  try {
    const db = getDatabase()
    const { page = 1, limit = 50, search, status } = req.query
    
    let query = 'SELECT * FROM customers WHERE 1=1'
    const params = []
    
    if (search) {
      query += ' AND (name LIKE ? OR email LIKE ? OR phone LIKE ?)'
      const searchTerm = `%${search}%`
      params.push(searchTerm, searchTerm, searchTerm)
    }
    
    if (status) {
      query += ' AND status = ?'
      params.push(status)
    }
    
    query += ' ORDER BY created_at DESC'
    
    // Get total count
    const countQuery = query.replace('SELECT *', 'SELECT COUNT(*) as total')
    const countStmt = db.prepare(countQuery)
    const total = countStmt.get(...params).total
    
    // Add pagination
    const offset = (parseInt(page) - 1) * parseInt(limit)
    query += ' LIMIT ? OFFSET ?'
    params.push(parseInt(limit), offset)
    
    const stmt = db.prepare(query)
    const data = stmt.all(...params)
    
    res.json({
      data,
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / parseInt(limit))
    })
  } catch (error) {
    console.error('Error fetching customers:', error)
    res.status(500).json({ error: error.message })
  }
})

// GET /api/customers/:id - Lấy khách hàng theo ID
router.get('/:id', (req, res) => {
  try {
    const db = getDatabase()
    const stmt = db.prepare('SELECT * FROM customers WHERE id = ?')
    const customer = stmt.get(req.params.id)
    
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' })
    }
    
    res.json(customer)
  } catch (error) {
    console.error('Error fetching customer:', error)
    res.status(500).json({ error: error.message })
  }
})

// GET /api/customers/:id/orders - Lấy đơn hàng của khách hàng
router.get('/:id/orders', (req, res) => {
  try {
    const db = getDatabase()
    const stmt = db.prepare(`
      SELECT o.*, 
        (SELECT COUNT(*) FROM order_items oi WHERE oi.order_id = o.id) as item_count
      FROM orders o
      WHERE o.customer_id = ?
      ORDER BY o.created_at DESC
    `)
    const orders = stmt.all(req.params.id)
    
    res.json(orders)
  } catch (error) {
    console.error('Error fetching customer orders:', error)
    res.status(500).json({ error: error.message })
  }
})

// POST /api/customers - Tạo khách hàng mới
router.post('/', (req, res) => {
  try {
    const db = getDatabase()
    const { name, email, phone, address, status } = req.body
    
    if (!name) {
      return res.status(400).json({ error: 'Name is required' })
    }
    
    const stmt = db.prepare(`
      INSERT INTO customers (name, email, phone, address, status)
      VALUES (?, ?, ?, ?, ?)
    `)
    
    const result = stmt.run(
      name,
      email || null,
      phone || null,
      address || null,
      status || 'active'
    )
    
    const customer = db.prepare('SELECT * FROM customers WHERE id = ?').get(result.lastInsertRowid)
    res.status(201).json(customer)
  } catch (error) {
    if (error.message.includes('UNIQUE constraint')) {
      return res.status(409).json({ error: 'Customer with this email already exists' })
    }
    console.error('Error creating customer:', error)
    res.status(500).json({ error: error.message })
  }
})

// PUT /api/customers/:id - Cập nhật khách hàng
router.put('/:id', (req, res) => {
  try {
    const db = getDatabase()
    const { name, email, phone, address, status } = req.body
    
    const stmt = db.prepare(`
      UPDATE customers 
      SET name = COALESCE(?, name),
          email = COALESCE(?, email),
          phone = COALESCE(?, phone),
          address = COALESCE(?, address),
          status = COALESCE(?, status),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `)
    
    const result = stmt.run(
      name || null,
      email || null,
      phone || null,
      address || null,
      status || null,
      req.params.id
    )
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Customer not found' })
    }
    
    const customer = db.prepare('SELECT * FROM customers WHERE id = ?').get(req.params.id)
    res.json(customer)
  } catch (error) {
    console.error('Error updating customer:', error)
    res.status(500).json({ error: error.message })
  }
})

// PATCH /api/customers/:id/status - Cập nhật trạng thái khách hàng
router.patch('/:id/status', (req, res) => {
  try {
    const db = getDatabase()
    const { status } = req.body
    
    if (!status) {
      return res.status(400).json({ error: 'Status is required' })
    }
    
    const stmt = db.prepare(`
      UPDATE customers 
      SET status = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `)
    
    const result = stmt.run(status, req.params.id)
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Customer not found' })
    }
    
    const customer = db.prepare('SELECT * FROM customers WHERE id = ?').get(req.params.id)
    res.json(customer)
  } catch (error) {
    console.error('Error updating customer status:', error)
    res.status(500).json({ error: error.message })
  }
})

// DELETE /api/customers/:id - Xóa khách hàng
router.delete('/:id', (req, res) => {
  try {
    const db = getDatabase()
    const stmt = db.prepare('DELETE FROM customers WHERE id = ?')
    const result = stmt.run(req.params.id)
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Customer not found' })
    }
    
    res.json({ message: 'Customer deleted successfully' })
  } catch (error) {
    console.error('Error deleting customer:', error)
    res.status(500).json({ error: error.message })
  }
})

export default router

