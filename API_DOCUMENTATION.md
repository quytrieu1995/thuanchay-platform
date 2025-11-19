# API Documentation

Tài liệu này mô tả các API services đã được triển khai cho hệ thống.

## Cấu trúc

```
src/services/
├── apiClient.js       # HTTP client với error handling
├── productsApi.js     # Products CRUD API
├── ordersApi.js       # Orders CRUD API
├── customersApi.js    # Customers CRUD API
├── returnsApi.js      # Returns CRUD API
└── index.js           # Export tất cả services
```

## API Client

### Cấu hình

API base URL có thể được cấu hình qua environment variable:
```env
VITE_API_BASE_URL=http://localhost:3000/api
```

Mặc định: `http://localhost:3000/api`

### Authentication

API client tự động thêm Authorization header từ localStorage:
```javascript
localStorage.setItem('authToken', 'your-token-here')
```

## Products API

### `productsApi.getAll(params)`
Lấy danh sách tất cả sản phẩm

**Parameters:**
- `page` (number): Số trang
- `limit` (number): Số items mỗi trang
- `search` (string): Từ khóa tìm kiếm
- `category` (string): Lọc theo danh mục
- `status` (string): Lọc theo trạng thái

**Response:**
```json
{
  "data": [...],
  "total": 100,
  "page": 1,
  "limit": 50
}
```

### `productsApi.getById(id)`
Lấy thông tin một sản phẩm

**Response:**
```json
{
  "id": 1,
  "name": "Áo thun nam",
  "sku": "AT001",
  "category": "Áo",
  "price": 250000,
  "stock": 150,
  "status": "Còn hàng",
  "image": "...",
  "description": "..."
}
```

### `productsApi.create(productData)`
Tạo sản phẩm mới

**Request Body:**
```json
{
  "name": "Áo thun nam",
  "sku": "AT001",
  "category": "Áo",
  "price": 250000,
  "stock": 150,
  "status": "Còn hàng",
  "image": "...",
  "description": "..."
}
```

### `productsApi.update(id, productData)`
Cập nhật sản phẩm

### `productsApi.delete(id)`
Xóa sản phẩm

### `productsApi.search(searchTerm, filters)`
Tìm kiếm sản phẩm

### `productsApi.updateStock(id, quantity)`
Cập nhật số lượng tồn kho

### `productsApi.getByCategory(category)`
Lấy sản phẩm theo danh mục

## Orders API

### `ordersApi.getAll(params)`
Lấy danh sách tất cả đơn hàng

**Parameters:**
- `page`, `limit`, `search`
- `status`: Trạng thái đơn hàng
- `channel`: Kênh bán hàng
- `dateFrom`, `dateTo`: Khoảng thời gian

### `ordersApi.getById(id)`
Lấy thông tin một đơn hàng

### `ordersApi.create(orderData)`
Tạo đơn hàng mới

**Request Body:**
```json
{
  "maHoaDon": "HD001",
  "tenKhachHang": "Nguyễn Văn A",
  "sanPham": [...],
  "tongTienHang": 1200000,
  "khachCanTra": 1250000,
  ...
}
```

### `ordersApi.update(id, orderData)`
Cập nhật đơn hàng

### `ordersApi.delete(id)`
Xóa đơn hàng

### `ordersApi.updateStatus(id, status)`
Cập nhật trạng thái đơn hàng

### `ordersApi.getByCustomer(customerId)`
Lấy đơn hàng theo khách hàng

### `ordersApi.getByChannel(channel)`
Lấy đơn hàng theo kênh bán hàng

### `ordersApi.getByDateRange(dateFrom, dateTo)`
Lấy đơn hàng theo khoảng thời gian

## Customers API

### `customersApi.getAll(params)`
Lấy danh sách tất cả khách hàng

### `customersApi.getById(id)`
Lấy thông tin một khách hàng

### `customersApi.create(customerData)`
Tạo khách hàng mới

**Request Body:**
```json
{
  "name": "Nguyễn Văn A",
  "email": "nguyenvana@email.com",
  "phone": "0901234567",
  "address": "123 Đường ABC",
  ...
}
```

### `customersApi.update(id, customerData)`
Cập nhật khách hàng

### `customersApi.delete(id)`
Xóa khách hàng

### `customersApi.getOrders(customerId)`
Lấy lịch sử đơn hàng của khách hàng

### `customersApi.updateStatus(id, status)`
Cập nhật trạng thái khách hàng

## Returns API

### `returnsApi.getAll(params)`
Lấy danh sách tất cả đơn trả hàng

### `returnsApi.getById(id)`
Lấy thông tin một đơn trả hàng

### `returnsApi.create(returnData)`
Tạo đơn trả hàng mới

**Request Body:**
```json
{
  "maTraHang": "TH001",
  "maHoaDonGoc": "HD001",
  "tenKhachHang": "Nguyễn Văn A",
  "sanPham": [...],
  "tongTienTra": 500000,
  ...
}
```

### `returnsApi.update(id, returnData)`
Cập nhật đơn trả hàng

### `returnsApi.delete(id)`
Xóa đơn trả hàng

### `returnsApi.updateStatus(id, status)`
Cập nhật trạng thái đơn trả hàng

### `returnsApi.getByOrder(orderId)`
Lấy đơn trả hàng theo đơn hàng gốc

### `returnsApi.getByCustomer(customerId)`
Lấy đơn trả hàng theo khách hàng

### `returnsApi.getByDateRange(dateFrom, dateTo)`
Lấy đơn trả hàng theo khoảng thời gian

## Sử dụng trong Components

### Sử dụng useCrud Hook

```javascript
import { useCrud } from '../hooks/useApi'
import { productsApi } from '../services/productsApi'

const MyComponent = () => {
  const {
    items: products,
    loading,
    error,
    fetchAll,
    create,
    update,
    remove,
  } = useCrud(productsApi)

  useEffect(() => {
    fetchAll()
  }, [fetchAll])

  const handleCreate = async () => {
    try {
      await create({ name: 'New Product', ... })
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div>
      {loading && <p>Loading...</p>}
      {error && <p>Error: {error}</p>}
      {products.map(product => ...)}
    </div>
  )
}
```

### Sử dụng trực tiếp API

```javascript
import { productsApi } from '../services/productsApi'

const loadProducts = async () => {
  try {
    const result = await productsApi.getAll({ page: 1, limit: 50 })
    console.log(result.data)
  } catch (error) {
    console.error('Error:', error.message)
  }
}
```

## Error Handling

Tất cả API calls tự động xử lý errors và throw Error với message. Bạn nên wrap trong try-catch:

```javascript
try {
  const product = await productsApi.create(data)
} catch (error) {
  alert('Error: ' + error.message)
}
```

## Backend Requirements

Backend API cần implement các endpoints sau:

### Products
- `GET /api/products` - List products
- `GET /api/products/:id` - Get product
- `POST /api/products` - Create product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product
- `PATCH /api/products/:id/stock` - Update stock

### Orders
- `GET /api/orders` - List orders
- `GET /api/orders/:id` - Get order
- `POST /api/orders` - Create order
- `PUT /api/orders/:id` - Update order
- `DELETE /api/orders/:id` - Delete order
- `PATCH /api/orders/:id/status` - Update status

### Customers
- `GET /api/customers` - List customers
- `GET /api/customers/:id` - Get customer
- `POST /api/customers` - Create customer
- `PUT /api/customers/:id` - Update customer
- `DELETE /api/customers/:id` - Delete customer
- `GET /api/customers/:id/orders` - Get customer orders
- `PATCH /api/customers/:id/status` - Update status

### Returns
- `GET /api/returns` - List returns
- `GET /api/returns/:id` - Get return
- `POST /api/returns` - Create return
- `PUT /api/returns/:id` - Update return
- `DELETE /api/returns/:id` - Delete return
- `PATCH /api/returns/:id/status` - Update status

## Mock Mode

Nếu backend chưa sẵn sàng, các pages sẽ tự động fallback về dữ liệu mẫu khi API calls fail. Điều này cho phép development và testing mà không cần backend.




