import express from 'express'
import { getDatabase } from '../database/init.js'

const router = express.Router()

// GET /api/products - Lấy danh sách sản phẩm
router.get('/', (req, res) => {
  try {
    const db = getDatabase()
    const { page = 1, limit = 50, search, category, status } = req.query
    
    let query = 'SELECT * FROM products WHERE 1=1'
    const params = []
    
    if (search) {
      query += ' AND (name LIKE ? OR sku LIKE ? OR description LIKE ?)'
      const searchTerm = `%${search}%`
      params.push(searchTerm, searchTerm, searchTerm)
    }
    
    if (category) {
      query += ' AND category = ?'
      params.push(category)
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
    console.error('Error fetching products:', error)
    res.status(500).json({ error: error.message })
  }
})

// GET /api/products/:id - Lấy sản phẩm theo ID
router.get('/:id', (req, res) => {
  try {
    const db = getDatabase()
    const stmt = db.prepare('SELECT * FROM products WHERE id = ?')
    const product = stmt.get(req.params.id)
    
    if (!product) {
      return res.status(404).json({ error: 'Product not found' })
    }
    
    res.json(product)
  } catch (error) {
    console.error('Error fetching product:', error)
    res.status(500).json({ error: error.message })
  }
})

// POST /api/products - Tạo sản phẩm mới
router.post('/', (req, res) => {
  try {
    const db = getDatabase()
    const { sku, name, category, price, cost, stock, status, description, image } = req.body
    
    if (!sku || !name || price === undefined) {
      return res.status(400).json({ error: 'SKU, name, and price are required' })
    }
    
    const stmt = db.prepare(`
      INSERT INTO products (sku, name, category, price, cost, stock, status, description, image)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)
    
    const result = stmt.run(
      sku,
      name,
      category || null,
      price || 0,
      cost || 0,
      stock || 0,
      status || 'active',
      description || null,
      image || null
    )
    
    const product = db.prepare('SELECT * FROM products WHERE id = ?').get(result.lastInsertRowid)
    res.status(201).json(product)
  } catch (error) {
    if (error.message.includes('UNIQUE constraint')) {
      return res.status(409).json({ error: 'Product with this SKU already exists' })
    }
    console.error('Error creating product:', error)
    res.status(500).json({ error: error.message })
  }
})

// PUT /api/products/:id - Cập nhật sản phẩm
router.put('/:id', (req, res) => {
  try {
    const db = getDatabase()
    const { name, category, price, cost, stock, status, description, image } = req.body
    
    const stmt = db.prepare(`
      UPDATE products 
      SET name = COALESCE(?, name),
          category = COALESCE(?, category),
          price = COALESCE(?, price),
          cost = COALESCE(?, cost),
          stock = COALESCE(?, stock),
          status = COALESCE(?, status),
          description = COALESCE(?, description),
          image = COALESCE(?, image),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `)
    
    const result = stmt.run(
      name || null,
      category || null,
      price || null,
      cost || null,
      stock || null,
      status || null,
      description || null,
      image || null,
      req.params.id
    )
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Product not found' })
    }
    
    const product = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id)
    res.json(product)
  } catch (error) {
    console.error('Error updating product:', error)
    res.status(500).json({ error: error.message })
  }
})

// PATCH /api/products/:id/stock - Cập nhật số lượng tồn kho
router.patch('/:id/stock', (req, res) => {
  try {
    const db = getDatabase()
    const { stock } = req.body
    
    if (stock === undefined) {
      return res.status(400).json({ error: 'Stock quantity is required' })
    }
    
    const stmt = db.prepare(`
      UPDATE products 
      SET stock = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `)
    
    const result = stmt.run(stock, req.params.id)
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Product not found' })
    }
    
    const product = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id)
    res.json(product)
  } catch (error) {
    console.error('Error updating stock:', error)
    res.status(500).json({ error: error.message })
  }
})

// DELETE /api/products/:id - Xóa sản phẩm
router.delete('/:id', (req, res) => {
  try {
    const db = getDatabase()
    const stmt = db.prepare('DELETE FROM products WHERE id = ?')
    const result = stmt.run(req.params.id)
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Product not found' })
    }
    
    res.json({ message: 'Product deleted successfully' })
  } catch (error) {
    console.error('Error deleting product:', error)
    res.status(500).json({ error: error.message })
  }
})

export default router

