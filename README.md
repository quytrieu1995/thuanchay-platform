# Hệ thống Quản lý Bán hàng - Thuần Chay VN Clone

Website quản lý bán hàng với các chức năng tương tự Thuần Chay VN, được xây dựng bằng React và Tailwind CSS.

## Các chức năng chính

### 1. **Dashboard (Tổng quan)**
- Thống kê tổng quan: Doanh thu, Đơn hàng, Sản phẩm, Khách hàng
- Biểu đồ doanh thu và đơn hàng theo tháng
- Top sản phẩm bán chạy

### 2. **Quản lý Sản phẩm**
- CRUD sản phẩm (Thêm, Sửa, Xóa, Tìm kiếm)
- Quản lý thông tin: Tên, Mã SKU, Danh mục, Giá, Tồn kho
- Trạng thái sản phẩm (Còn hàng/Hết hàng)

### 3. **Quản lý Đơn hàng**
- Xem danh sách đơn hàng
- Lọc theo trạng thái (Đã giao, Đang xử lý, Đang giao, Đã hủy)
- Thống kê đơn hàng và doanh thu

### 4. **Quản lý Khách hàng**
- Danh sách khách hàng
- Thông tin chi tiết: Email, Số điện thoại, Địa chỉ
- Số đơn hàng và tổng chi tiêu

### 5. **Quản lý Tồn kho**
- Theo dõi tồn kho sản phẩm
- Cảnh báo sắp hết hàng và hết hàng
- Biểu đồ tỷ lệ tồn kho
- Tổng giá trị tồn kho

### 6. **Báo cáo & Thống kê**
- Báo cáo doanh thu và lợi nhuận
- Phân tích theo danh mục sản phẩm
- Top khách hàng
- Xuất báo cáo

### 7. **Cài đặt**
- Thông tin cửa hàng
- Cài đặt thông báo
- Phương thức thanh toán
- Bảo mật và tài khoản

## Công nghệ sử dụng

### Frontend
- **React 18** - Thư viện UI
- **React Router** - Điều hướng
- **Tailwind CSS** - Styling
- **Recharts** - Biểu đồ
- **Lucide React** - Icons
- **Vite** - Build tool

### Backend
- **Express.js** - Web framework
- **SQLite (better-sqlite3)** - Database
- **CORS** - Cross-origin resource sharing

## ⚠️ Yêu cầu hệ thống

**Cần cài đặt Node.js trước khi chạy dự án!**

1. Tải Node.js từ: https://nodejs.org/ (khuyến nghị phiên bản LTS)
2. Cài đặt Node.js (sẽ bao gồm cả npm)
3. Khởi động lại terminal/PowerShell sau khi cài đặt

## Cài đặt và chạy

### Cách 1: Sử dụng script tự động (Khuyến nghị)

**Windows:**

**Nếu gặp lỗi Execution Policy khi chạy `.\start.ps1`:**
```powershell
powershell -ExecutionPolicy Bypass -File .\start.ps1
```

**Hoặc đơn giản hơn:**
- Double-click vào file `start.bat`

Script sẽ tự động:
- Kiểm tra Node.js đã cài đặt chưa
- Cài đặt dependencies nếu chưa có
- Khởi động development server

### Cách 2: Chạy thủ công

1. Mở terminal/PowerShell trong thư mục dự án

2. Cài đặt dependencies:
```bash
npm install
```

3. Chạy backend server:
```bash
npm run server
```

Backend sẽ tự động:
- ✅ Tạo database SQLite tại `server/database/thuanchay.db`
- ✅ Tạo các bảng cần thiết (products, orders, customers, returns, users)
- ✅ Insert dữ liệu mẫu (nếu database mới)
- ✅ Khởi động API server tại `http://localhost:3000`

4. Chạy frontend (terminal khác):
```bash
npm run dev
```

5. Mở trình duyệt tại: **http://localhost:5173**

### Các lệnh khác

- **Chạy backend server**: `npm run server`
- **Chạy cả frontend và backend**: `npm run start:dev` (cần cài concurrently)
- **Build cho production**: `npm run build`
- **Chạy production**: `npm run start:prod` (build frontend + chạy backend)
- **Preview build**: `npm run preview`

## 🚀 Deploy lên VPS

Hệ thống sẽ **tự động tạo database và kết nối backend** khi chạy trên VPS.

Xem hướng dẫn chi tiết tại: [HUONG_DAN_DEPLOY_VPS.md](./HUONG_DAN_DEPLOY_VPS.md)

**Nhanh chóng:**
```bash
# Linux/Mac
chmod +x start-server.sh
./start-server.sh

# Windows
start-server.bat
```

## Giao diện

- Responsive design, tối ưu cho mọi thiết bị
- Modern UI với Tailwind CSS
- Sidebar navigation có thể thu gọn
- Dark mode ready (có thể mở rộng)

## Tính năng nổi bật

- ✅ Giao diện đẹp, hiện đại
- ✅ Responsive design
- ✅ Thống kê và báo cáo trực quan
- ✅ Quản lý đầy đủ CRUD
- ✅ Tìm kiếm và lọc dữ liệu
- ✅ Biểu đồ và đồ thị

## Database

- **SQLite Database**: Tự động tạo tại `server/database/thuanchay.db` khi chạy lần đầu
- **Tự động migration**: Hệ thống tự động tạo các bảng và dữ liệu mẫu
- **Backup**: Database file có thể backup trực tiếp (copy file `.db`)

## API Endpoints

Backend API có sẵn tại `http://localhost:3000/api`:

- `GET /api/products` - Lấy danh sách sản phẩm
- `POST /api/products` - Tạo sản phẩm mới
- `GET /api/orders` - Lấy danh sách đơn hàng
- `POST /api/orders` - Tạo đơn hàng mới
- `GET /api/customers` - Lấy danh sách khách hàng
- `POST /api/customers` - Tạo khách hàng mới
- `GET /api/returns` - Lấy danh sách đơn trả hàng
- `POST /api/auth/login` - Đăng nhập

Xem chi tiết tại `API_DOCUMENTATION.md`

## Tính năng Backend

- ✅ **Tự động tạo database** khi chạy lần đầu
- ✅ **RESTful API** đầy đủ cho CRUD operations
- ✅ **SQLite database** - Không cần cài đặt database server riêng
- ✅ **Dữ liệu mẫu** tự động insert khi khởi tạo
- ✅ **Transaction support** - Đảm bảo tính nhất quán dữ liệu
- ✅ **Error handling** - Xử lý lỗi đầy đủ
- ✅ **CORS enabled** - Hỗ trợ cross-origin requests


