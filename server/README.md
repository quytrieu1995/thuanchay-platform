# Backend Server

Backend API server cho hệ thống Thuần Chay Platform.

## Cấu trúc

```
server/
├── index.js              # Entry point của server
├── database/
│   ├── init.js          # Khởi tạo database và tạo bảng
│   └── thuanchay.db     # SQLite database (tự động tạo)
└── routes/
    ├── products.js       # API routes cho sản phẩm
    ├── orders.js        # API routes cho đơn hàng
    ├── customers.js     # API routes cho khách hàng
    ├── returns.js       # API routes cho đơn trả hàng
    └── auth.js          # API routes cho authentication
```

## Database Schema

### Products
- id (INTEGER PRIMARY KEY)
- sku (TEXT UNIQUE)
- name (TEXT)
- category (TEXT)
- price (REAL)
- cost (REAL)
- stock (INTEGER)
- status (TEXT)
- description (TEXT)
- image (TEXT)
- created_at (DATETIME)
- updated_at (DATETIME)

### Customers
- id (INTEGER PRIMARY KEY)
- name (TEXT)
- email (TEXT UNIQUE)
- phone (TEXT)
- address (TEXT)
- status (TEXT)
- total_orders (INTEGER)
- total_spent (REAL)
- created_at (DATETIME)
- updated_at (DATETIME)

### Orders
- id (INTEGER PRIMARY KEY)
- order_number (TEXT UNIQUE)
- customer_id (INTEGER FOREIGN KEY)
- status (TEXT)
- channel (TEXT)
- total_amount (REAL)
- payment_method (TEXT)
- shipping_address (TEXT)
- notes (TEXT)
- created_at (DATETIME)
- updated_at (DATETIME)

### Order Items
- id (INTEGER PRIMARY KEY)
- order_id (INTEGER FOREIGN KEY)
- product_id (INTEGER FOREIGN KEY)
- quantity (INTEGER)
- price (REAL)
- subtotal (REAL)
- created_at (DATETIME)

### Returns
- id (INTEGER PRIMARY KEY)
- return_number (TEXT UNIQUE)
- order_id (INTEGER FOREIGN KEY)
- customer_id (INTEGER FOREIGN KEY)
- status (TEXT)
- reason (TEXT)
- total_amount (REAL)
- created_at (DATETIME)
- updated_at (DATETIME)

### Return Items
- id (INTEGER PRIMARY KEY)
- return_id (INTEGER FOREIGN KEY)
- product_id (INTEGER FOREIGN KEY)
- quantity (INTEGER)
- price (REAL)
- subtotal (REAL)
- created_at (DATETIME)

### Users
- id (INTEGER PRIMARY KEY)
- username (TEXT UNIQUE)
- email (TEXT UNIQUE)
- password_hash (TEXT)
- role (TEXT)
- status (TEXT)
- created_at (DATETIME)
- updated_at (DATETIME)

## API Endpoints

Xem chi tiết tại [../docs/API_DOCUMENTATION.md](../docs/API_DOCUMENTATION.md)

## Khởi tạo Database

Database sẽ tự động được tạo khi chạy server lần đầu:

1. Tạo file database `server/database/thuanchay.db`
2. Tạo tất cả các bảng cần thiết
3. Tạo indexes để tối ưu performance
4. Insert dữ liệu mẫu (nếu database mới)

## Chạy Server

```bash
# Development
npm run server

# Production
NODE_ENV=production npm run start:prod
```

## Environment Variables

- `PORT`: Port để chạy server (mặc định: 3000)
- `NODE_ENV`: Môi trường (development/production)

## Backup Database

```bash
# Backup
cp server/database/thuanchay.db server/database/thuanchay.db.backup

# Restore
cp server/database/thuanchay.db.backup server/database/thuanchay.db
```

