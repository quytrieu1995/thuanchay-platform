import Database from 'better-sqlite3'
import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Database path - sẽ tạo trong thư mục server/database
const dbDir = path.join(__dirname)
const dbPath = path.join(dbDir, 'thuanchay.db')

// Đảm bảo thư mục database tồn tại
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true })
}

let db = null

/**
 * Khởi tạo database và tạo các bảng nếu chưa tồn tại
 */
export function initDatabase() {
  try {
    // Tạo hoặc mở database
    db = new Database(dbPath)
    
    // Enable foreign keys
    db.pragma('foreign_keys = ON')
    
    // Tạo các bảng
    createTables()
    
    // Insert dữ liệu mẫu nếu database mới
    const isNewDatabase = checkIfNewDatabase()
    if (isNewDatabase) {
      console.log('📦 Inserting sample data...')
      insertSampleData()
    }
    
    console.log(`✅ Database ready at: ${dbPath}`)
    return db
  } catch (error) {
    console.error('❌ Database initialization error:', error)
    throw error
  }
}

/**
 * Lấy instance database (singleton)
 */
export function getDatabase() {
  if (!db) {
    db = new Database(dbPath)
    db.pragma('foreign_keys = ON')
  }
  return db
}

/**
 * Kiểm tra xem database có phải mới không
 */
function checkIfNewDatabase() {
  try {
    const stmt = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='products'")
    const result = stmt.get()
    return !result
  } catch {
    return true
  }
}

/**
 * Tạo các bảng trong database
 */
function createTables() {
  // Bảng Products
  db.exec(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sku TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      category TEXT,
      price REAL NOT NULL DEFAULT 0,
      cost REAL DEFAULT 0,
      stock INTEGER NOT NULL DEFAULT 0,
      status TEXT DEFAULT 'active',
      description TEXT,
      image TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `)

  // Bảng Customers
  db.exec(`
    CREATE TABLE IF NOT EXISTS customers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE,
      phone TEXT,
      address TEXT,
      status TEXT DEFAULT 'active',
      total_orders INTEGER DEFAULT 0,
      total_spent REAL DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `)

  // Bảng Orders
  db.exec(`
    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_number TEXT UNIQUE NOT NULL,
      customer_id INTEGER,
      status TEXT DEFAULT 'pending',
      channel TEXT DEFAULT 'store',
      total_amount REAL NOT NULL DEFAULT 0,
      payment_method TEXT,
      shipping_address TEXT,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL
    )
  `)

  // Bảng Order Items
  db.exec(`
    CREATE TABLE IF NOT EXISTS order_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER NOT NULL,
      product_id INTEGER NOT NULL,
      quantity INTEGER NOT NULL DEFAULT 1,
      price REAL NOT NULL,
      subtotal REAL NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
    )
  `)

  // Bảng Returns
  db.exec(`
    CREATE TABLE IF NOT EXISTS returns (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      return_number TEXT UNIQUE NOT NULL,
      order_id INTEGER NOT NULL,
      customer_id INTEGER,
      status TEXT DEFAULT 'pending',
      reason TEXT,
      total_amount REAL DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
      FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL
    )
  `)

  // Bảng Return Items
  db.exec(`
    CREATE TABLE IF NOT EXISTS return_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      return_id INTEGER NOT NULL,
      product_id INTEGER NOT NULL,
      quantity INTEGER NOT NULL DEFAULT 1,
      price REAL NOT NULL,
      subtotal REAL NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (return_id) REFERENCES returns(id) ON DELETE CASCADE,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
    )
  `)

  // Bảng Users (cho authentication)
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT DEFAULT 'user',
      status TEXT DEFAULT 'active',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `)

  // Tạo indexes để tăng tốc độ query
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);
    CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
    CREATE INDEX IF NOT EXISTS idx_orders_customer ON orders(customer_id);
    CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
    CREATE INDEX IF NOT EXISTS idx_orders_created ON orders(created_at);
    CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
    CREATE INDEX IF NOT EXISTS idx_order_items_product ON order_items(product_id);
    CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);
  `)

  console.log('📊 Database tables created successfully')
}

/**
 * Insert dữ liệu mẫu
 */
function insertSampleData() {
  // Insert sample products
  const insertProduct = db.prepare(`
    INSERT INTO products (sku, name, category, price, cost, stock, status, description)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `)

  const products = [
    ['SKU001', 'Đậu phụ non', 'Thực phẩm', 25000, 15000, 100, 'active', 'Đậu phụ non tươi ngon'],
    ['SKU002', 'Sữa đậu nành', 'Đồ uống', 35000, 20000, 80, 'active', 'Sữa đậu nành nguyên chất'],
    ['SKU003', 'Rau củ quả mix', 'Rau củ', 45000, 25000, 50, 'active', 'Rau củ quả tươi sạch'],
    ['SKU004', 'Gạo lứt hữu cơ', 'Ngũ cốc', 120000, 80000, 30, 'active', 'Gạo lứt hữu cơ chất lượng cao'],
    ['SKU005', 'Tảo spirulina', 'Thực phẩm chức năng', 180000, 120000, 25, 'active', 'Tảo spirulina bột'],
  ]

  const insertProductMany = db.transaction((products) => {
    for (const product of products) {
      insertProduct.run(...product)
    }
  })

  insertProductMany(products)

  // Insert sample customers
  const insertCustomer = db.prepare(`
    INSERT INTO customers (name, email, phone, address, status)
    VALUES (?, ?, ?, ?, ?)
  `)

  const customers = [
    ['Nguyễn Văn A', 'nguyenvana@example.com', '0901234567', '123 Đường ABC, Quận 1, TP.HCM', 'active'],
    ['Trần Thị B', 'tranthib@example.com', '0907654321', '456 Đường XYZ, Quận 2, TP.HCM', 'active'],
    ['Lê Văn C', 'levanc@example.com', '0912345678', '789 Đường DEF, Quận 3, TP.HCM', 'active'],
  ]

  const insertCustomerMany = db.transaction((customers) => {
    for (const customer of customers) {
      insertCustomer.run(...customer)
    }
  })

  insertCustomerMany(customers)

  // Insert sample orders
  const insertOrder = db.prepare(`
    INSERT INTO orders (order_number, customer_id, status, channel, total_amount, payment_method)
    VALUES (?, ?, ?, ?, ?, ?)
  `)

  const insertOrderItem = db.prepare(`
    INSERT INTO order_items (order_id, product_id, quantity, price, subtotal)
    VALUES (?, ?, ?, ?, ?)
  `)

  const orders = [
    ['ORD001', 1, 'completed', 'store', 60000, 'cash'],
    ['ORD002', 2, 'processing', 'online', 80000, 'bank_transfer'],
    ['ORD003', 1, 'pending', 'store', 120000, 'cash'],
  ]

  const insertOrderMany = db.transaction((orders) => {
    for (let i = 0; i < orders.length; i++) {
      const order = orders[i]
      const result = insertOrder.run(...order)
      const orderId = result.lastInsertRowid

      // Insert order items
      if (i === 0) {
        // Order 1: 2 sản phẩm
        insertOrderItem.run(orderId, 1, 2, 25000, 50000)
        insertOrderItem.run(orderId, 2, 1, 35000, 35000)
      } else if (i === 1) {
        // Order 2: 1 sản phẩm
        insertOrderItem.run(orderId, 3, 1, 45000, 45000)
        insertOrderItem.run(orderId, 2, 1, 35000, 35000)
      } else {
        // Order 3: 1 sản phẩm
        insertOrderItem.run(orderId, 4, 1, 120000, 120000)
      }
    }
  })

  insertOrderMany(orders)

  // Update customer stats
  db.exec(`
    UPDATE customers SET 
      total_orders = (
        SELECT COUNT(*) FROM orders WHERE customer_id = customers.id
      ),
      total_spent = (
        SELECT COALESCE(SUM(total_amount), 0) FROM orders WHERE customer_id = customers.id
      )
  `)

  console.log('✅ Sample data inserted successfully')
}

