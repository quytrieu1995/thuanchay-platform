import express from 'express'
import { getDatabase } from '../database/init.js'

const router = express.Router()

// GET /api/returns - Lấy danh sách đơn trả hàng
router.get('/', (req, res) => {
  try {
    const db = getDatabase()
    const { page = 1, limit = 50, search, status } = req.query
    
    let query = `
      SELECT r.*, o.order_number, c.name as customer_name, c.email as customer_email
      FROM returns r
      LEFT JOIN orders o ON r.order_id = o.id
      LEFT JOIN customers c ON r.customer_id = c.id
      WHERE 1=1
    `
    const params = []
    
    if (search) {
      query += ' AND (r.return_number LIKE ? OR o.order_number LIKE ? OR c.name LIKE ?)'
      const searchTerm = `%${search}%`
      params.push(searchTerm, searchTerm, searchTerm)
    }
    
    if (status) {
      query += ' AND r.status = ?'
      params.push(status)
    }
    
    query += ' ORDER BY r.created_at DESC'
    
    // Get total count
    const countQuery = query.replace('SELECT r.*, o.order_number, c.name as customer_name, c.email as customer_email', 'SELECT COUNT(*) as total')
    const countStmt = db.prepare(countQuery)
    const total = countStmt.get(...params).total
    
    // Add pagination
    const offset = (parseInt(page) - 1) * parseInt(limit)
    query += ' LIMIT ? OFFSET ?'
    params.push(parseInt(limit), offset)
    
    const stmt = db.prepare(query)
    const returns = stmt.all(...params)
    
    // Get return items
    const getItemsStmt = db.prepare(`
      SELECT ri.*, p.name as product_name, p.sku as product_sku
      FROM return_items ri
      JOIN products p ON ri.product_id = p.id
      WHERE ri.return_id = ?
    `)
    
    const returnsWithItems = returns.map(returnItem => {
      const items = getItemsStmt.all(returnItem.id)
      return { ...returnItem, items }
    })
    
    res.json({
      data: returnsWithItems,
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / parseInt(limit))
    })
  } catch (error) {
    console.error('Error fetching returns:', error)
    res.status(500).json({ error: error.message })
  }
})

// GET /api/returns/:id - Lấy đơn trả hàng theo ID
router.get('/:id', (req, res) => {
  try {
    const db = getDatabase()
    const returnStmt = db.prepare(`
      SELECT r.*, o.order_number, c.name as customer_name, c.email as customer_email
      FROM returns r
      LEFT JOIN orders o ON r.order_id = o.id
      LEFT JOIN customers c ON r.customer_id = c.id
      WHERE r.id = ? OR r.return_number = ?
    `)
    const returnItem = returnStmt.get(req.params.id, req.params.id)
    
    if (!returnItem) {
      return res.status(404).json({ error: 'Return not found' })
    }
    
    const itemsStmt = db.prepare(`
      SELECT ri.*, p.name as product_name, p.sku as product_sku
      FROM return_items ri
      JOIN products p ON ri.product_id = p.id
      WHERE ri.return_id = ?
    `)
    const items = itemsStmt.all(returnItem.id)
    
    res.json({ ...returnItem, items })
  } catch (error) {
    console.error('Error fetching return:', error)
    res.status(500).json({ error: error.message })
  }
})

// POST /api/returns - Tạo đơn trả hàng mới
router.post('/', (req, res) => {
  try {
    const db = getDatabase()
    const { return_number, order_id, customer_id, status, reason, items } = req.body
    
    if (!return_number || !order_id) {
      return res.status(400).json({ error: 'Return number and order ID are required' })
    }
    
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Return items are required' })
    }
    
    // Calculate total amount
    let totalAmount = 0
    for (const item of items) {
      if (!item.product_id || !item.quantity || !item.price) {
        return res.status(400).json({ error: 'Each item must have product_id, quantity, and price' })
      }
      totalAmount += item.quantity * item.price
    }
    
    const insertReturn = db.prepare(`
      INSERT INTO returns (return_number, order_id, customer_id, status, reason, total_amount)
      VALUES (?, ?, ?, ?, ?, ?)
    `)
    
    const insertItem = db.prepare(`
      INSERT INTO return_items (return_id, product_id, quantity, price, subtotal)
      VALUES (?, ?, ?, ?, ?)
    `)
    
    const restoreStock = db.prepare(`
      UPDATE products SET stock = stock + ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?
    `)
    
    const insertReturnAndItems = db.transaction(() => {
      const returnResult = insertReturn.run(
        return_number,
        order_id,
        customer_id || null,
        status || 'pending',
        reason || null,
        totalAmount
      )
      
      const returnId = returnResult.lastInsertRowid
      
      for (const item of items) {
        const subtotal = item.quantity * item.price
        insertItem.run(returnId, item.product_id, item.quantity, item.price, subtotal)
        
        // Restore product stock
        restoreStock.run(item.quantity, item.product_id)
      }
      
      return returnId
    })
    
    const returnId = insertReturnAndItems()
    
    // Get the created return with items
    const returnStmt = db.prepare(`
      SELECT r.*, o.order_number, c.name as customer_name, c.email as customer_email
      FROM returns r
      LEFT JOIN orders o ON r.order_id = o.id
      LEFT JOIN customers c ON r.customer_id = c.id
      WHERE r.id = ?
    `)
    const returnItem = returnStmt.get(returnId)
    
    const itemsStmt = db.prepare(`
      SELECT ri.*, p.name as product_name, p.sku as product_sku
      FROM return_items ri
      JOIN products p ON ri.product_id = p.id
      WHERE ri.return_id = ?
    `)
    const returnItems = itemsStmt.all(returnId)
    
    res.status(201).json({ ...returnItem, items: returnItems })
  } catch (error) {
    if (error.message.includes('UNIQUE constraint')) {
      return res.status(409).json({ error: 'Return with this return number already exists' })
    }
    console.error('Error creating return:', error)
    res.status(500).json({ error: error.message })
  }
})

// PUT /api/returns/:id - Cập nhật đơn trả hàng
router.put('/:id', (req, res) => {
  try {
    const db = getDatabase()
    const { status, reason } = req.body
    
    const stmt = db.prepare(`
      UPDATE returns 
      SET status = COALESCE(?, status),
          reason = COALESCE(?, reason),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `)
    
    const result = stmt.run(
      status || null,
      reason || null,
      req.params.id
    )
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Return not found' })
    }
    
    const returnStmt = db.prepare(`
      SELECT r.*, o.order_number, c.name as customer_name, c.email as customer_email
      FROM returns r
      LEFT JOIN orders o ON r.order_id = o.id
      LEFT JOIN customers c ON r.customer_id = c.id
      WHERE r.id = ?
    `)
    const returnItem = returnStmt.get(req.params.id)
    
    const itemsStmt = db.prepare(`
      SELECT ri.*, p.name as product_name, p.sku as product_sku
      FROM return_items ri
      JOIN products p ON ri.product_id = p.id
      WHERE ri.return_id = ?
    `)
    const items = itemsStmt.all(req.params.id)
    
    res.json({ ...returnItem, items })
  } catch (error) {
    console.error('Error updating return:', error)
    res.status(500).json({ error: error.message })
  }
})

// DELETE /api/returns/:id - Xóa đơn trả hàng
router.delete('/:id', (req, res) => {
  try {
    const db = getDatabase()
    
    // Get return items to adjust stock
    const itemsStmt = db.prepare('SELECT product_id, quantity FROM return_items WHERE return_id = ?')
    const items = itemsStmt.all(req.params.id)
    
    const deleteReturn = db.prepare('DELETE FROM returns WHERE id = ?')
    const adjustStock = db.prepare('UPDATE products SET stock = stock - ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
    
    const deleteReturnAndAdjustStock = db.transaction(() => {
      // Adjust stock (remove returned items from stock)
      for (const item of items) {
        adjustStock.run(item.quantity, item.product_id)
      }
      
      // Delete return (cascade will delete return_items)
      const result = deleteReturn.run(req.params.id)
      
      if (result.changes === 0) {
        throw new Error('Return not found')
      }
    })
    
    deleteReturnAndAdjustStock()
    
    res.json({ message: 'Return deleted successfully' })
  } catch (error) {
    if (error.message === 'Return not found') {
      return res.status(404).json({ error: error.message })
    }
    console.error('Error deleting return:', error)
    res.status(500).json({ error: error.message })
  }
})

export default router

