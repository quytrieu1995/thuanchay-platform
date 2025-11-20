import express from 'express'
import { getDatabase } from '../database/init.js'

const router = express.Router()

// GET /api/orders - Lấy danh sách đơn hàng
router.get('/', (req, res) => {
  try {
    const db = getDatabase()
    const { page = 1, limit = 50, search, status, channel, customerId, dateFrom, dateTo } = req.query
    
    let query = `
      SELECT o.*, c.name as customer_name, c.email as customer_email, c.phone as customer_phone
      FROM orders o
      LEFT JOIN customers c ON o.customer_id = c.id
      WHERE 1=1
    `
    const params = []
    
    if (search) {
      query += ' AND (o.order_number LIKE ? OR c.name LIKE ? OR c.email LIKE ?)'
      const searchTerm = `%${search}%`
      params.push(searchTerm, searchTerm, searchTerm)
    }
    
    if (status) {
      query += ' AND o.status = ?'
      params.push(status)
    }
    
    if (channel) {
      query += ' AND o.channel = ?'
      params.push(channel)
    }
    
    if (customerId) {
      query += ' AND o.customer_id = ?'
      params.push(customerId)
    }
    
    if (dateFrom) {
      query += ' AND DATE(o.created_at) >= ?'
      params.push(dateFrom)
    }
    
    if (dateTo) {
      query += ' AND DATE(o.created_at) <= ?'
      params.push(dateTo)
    }
    
    query += ' ORDER BY o.created_at DESC'
    
    // Get total count
    const countQuery = query.replace('SELECT o.*, c.name as customer_name, c.email as customer_email, c.phone as customer_phone', 'SELECT COUNT(*) as total')
    const countStmt = db.prepare(countQuery)
    const total = countStmt.get(...params).total
    
    // Add pagination
    const offset = (parseInt(page) - 1) * parseInt(limit)
    query += ' LIMIT ? OFFSET ?'
    params.push(parseInt(limit), offset)
    
    const stmt = db.prepare(query)
    const orders = stmt.all(...params)
    
    // Get order items for each order
    const getItemsStmt = db.prepare(`
      SELECT oi.*, p.name as product_name, p.sku as product_sku
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      WHERE oi.order_id = ?
    `)
    
    const ordersWithItems = orders.map(order => {
      const items = getItemsStmt.all(order.id)
      return { ...order, items }
    })
    
    res.json({
      data: ordersWithItems,
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / parseInt(limit))
    })
  } catch (error) {
    console.error('Error fetching orders:', error)
    res.status(500).json({ error: error.message })
  }
})

// GET /api/orders/:id - Lấy đơn hàng theo ID
router.get('/:id', (req, res) => {
  try {
    const db = getDatabase()
    const orderStmt = db.prepare(`
      SELECT o.*, c.name as customer_name, c.email as customer_email, c.phone as customer_phone, c.address as customer_address
      FROM orders o
      LEFT JOIN customers c ON o.customer_id = c.id
      WHERE o.id = ? OR o.order_number = ?
    `)
    const order = orderStmt.get(req.params.id, req.params.id)
    
    if (!order) {
      return res.status(404).json({ error: 'Order not found' })
    }
    
    const itemsStmt = db.prepare(`
      SELECT oi.*, p.name as product_name, p.sku as product_sku, p.image as product_image
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      WHERE oi.order_id = ?
    `)
    const items = itemsStmt.all(order.id)
    
    res.json({ ...order, items })
  } catch (error) {
    console.error('Error fetching order:', error)
    res.status(500).json({ error: error.message })
  }
})

// POST /api/orders - Tạo đơn hàng mới
router.post('/', (req, res) => {
  try {
    const db = getDatabase()
    const { order_number, customer_id, status, channel, items, payment_method, shipping_address, notes } = req.body
    
    if (!order_number) {
      return res.status(400).json({ error: 'Order number is required' })
    }
    
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Order items are required' })
    }
    
    // Calculate total amount
    let totalAmount = 0
    for (const item of items) {
      if (!item.product_id || !item.quantity || !item.price) {
        return res.status(400).json({ error: 'Each item must have product_id, quantity, and price' })
      }
      totalAmount += item.quantity * item.price
    }
    
    const insertOrder = db.prepare(`
      INSERT INTO orders (order_number, customer_id, status, channel, total_amount, payment_method, shipping_address, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `)
    
    const insertItem = db.prepare(`
      INSERT INTO order_items (order_id, product_id, quantity, price, subtotal)
      VALUES (?, ?, ?, ?, ?)
    `)
    
    const updateStock = db.prepare(`
      UPDATE products SET stock = stock - ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?
    `)
    
    const insertOrderAndItems = db.transaction(() => {
      const orderResult = insertOrder.run(
        order_number,
        customer_id || null,
        status || 'pending',
        channel || 'store',
        totalAmount,
        payment_method || null,
        shipping_address || null,
        notes || null
      )
      
      const orderId = orderResult.lastInsertRowid
      
      for (const item of items) {
        const subtotal = item.quantity * item.price
        insertItem.run(orderId, item.product_id, item.quantity, item.price, subtotal)
        
        // Update product stock
        updateStock.run(item.quantity, item.product_id)
      }
      
      // Update customer stats
      if (customer_id) {
        db.prepare(`
          UPDATE customers SET 
            total_orders = (SELECT COUNT(*) FROM orders WHERE customer_id = ?),
            total_spent = (SELECT COALESCE(SUM(total_amount), 0) FROM orders WHERE customer_id = ?),
            updated_at = CURRENT_TIMESTAMP
          WHERE id = ?
        `).run(customer_id, customer_id, customer_id)
      }
      
      return orderId
    })
    
    const orderId = insertOrderAndItems()
    
    // Get the created order with items
    const orderStmt = db.prepare(`
      SELECT o.*, c.name as customer_name, c.email as customer_email, c.phone as customer_phone
      FROM orders o
      LEFT JOIN customers c ON o.customer_id = c.id
      WHERE o.id = ?
    `)
    const order = orderStmt.get(orderId)
    
    const itemsStmt = db.prepare(`
      SELECT oi.*, p.name as product_name, p.sku as product_sku
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      WHERE oi.order_id = ?
    `)
    const orderItems = itemsStmt.all(orderId)
    
    res.status(201).json({ ...order, items: orderItems })
  } catch (error) {
    if (error.message.includes('UNIQUE constraint')) {
      return res.status(409).json({ error: 'Order with this order number already exists' })
    }
    console.error('Error creating order:', error)
    res.status(500).json({ error: error.message })
  }
})

// PUT /api/orders/:id - Cập nhật đơn hàng
router.put('/:id', (req, res) => {
  try {
    const db = getDatabase()
    const { status, payment_method, shipping_address, notes } = req.body
    
    const stmt = db.prepare(`
      UPDATE orders 
      SET status = COALESCE(?, status),
          payment_method = COALESCE(?, payment_method),
          shipping_address = COALESCE(?, shipping_address),
          notes = COALESCE(?, notes),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `)
    
    const result = stmt.run(
      status || null,
      payment_method || null,
      shipping_address || null,
      notes || null,
      req.params.id
    )
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Order not found' })
    }
    
    const orderStmt = db.prepare(`
      SELECT o.*, c.name as customer_name, c.email as customer_email, c.phone as customer_phone
      FROM orders o
      LEFT JOIN customers c ON o.customer_id = c.id
      WHERE o.id = ?
    `)
    const order = orderStmt.get(req.params.id)
    
    const itemsStmt = db.prepare(`
      SELECT oi.*, p.name as product_name, p.sku as product_sku
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      WHERE oi.order_id = ?
    `)
    const items = itemsStmt.all(req.params.id)
    
    res.json({ ...order, items })
  } catch (error) {
    console.error('Error updating order:', error)
    res.status(500).json({ error: error.message })
  }
})

// PATCH /api/orders/:id/status - Cập nhật trạng thái đơn hàng
router.patch('/:id/status', (req, res) => {
  try {
    const db = getDatabase()
    const { status } = req.body
    
    if (!status) {
      return res.status(400).json({ error: 'Status is required' })
    }
    
    const stmt = db.prepare(`
      UPDATE orders 
      SET status = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `)
    
    const result = stmt.run(status, req.params.id)
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Order not found' })
    }
    
    const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(req.params.id)
    res.json(order)
  } catch (error) {
    console.error('Error updating order status:', error)
    res.status(500).json({ error: error.message })
  }
})

// DELETE /api/orders/:id - Xóa đơn hàng
router.delete('/:id', (req, res) => {
  try {
    const db = getDatabase()
    
    // Get order items to restore stock
    const itemsStmt = db.prepare('SELECT product_id, quantity FROM order_items WHERE order_id = ?')
    const items = itemsStmt.all(req.params.id)
    
    const deleteOrder = db.prepare('DELETE FROM orders WHERE id = ?')
    const restoreStock = db.prepare('UPDATE products SET stock = stock + ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
    
    const deleteOrderAndRestoreStock = db.transaction(() => {
      // Restore stock
      for (const item of items) {
        restoreStock.run(item.quantity, item.product_id)
      }
      
      // Delete order (cascade will delete order_items)
      const result = deleteOrder.run(req.params.id)
      
      if (result.changes === 0) {
        throw new Error('Order not found')
      }
      
      // Update customer stats
      const order = db.prepare('SELECT customer_id FROM orders WHERE id = ?').get(req.params.id)
      if (order && order.customer_id) {
        db.prepare(`
          UPDATE customers SET 
            total_orders = (SELECT COUNT(*) FROM orders WHERE customer_id = ?),
            total_spent = (SELECT COALESCE(SUM(total_amount), 0) FROM orders WHERE customer_id = ?),
            updated_at = CURRENT_TIMESTAMP
          WHERE id = ?
        `).run(order.customer_id, order.customer_id, order.customer_id)
      }
    })
    
    deleteOrderAndRestoreStock()
    
    res.json({ message: 'Order deleted successfully' })
  } catch (error) {
    if (error.message === 'Order not found') {
      return res.status(404).json({ error: error.message })
    }
    console.error('Error deleting order:', error)
    res.status(500).json({ error: error.message })
  }
})

export default router

