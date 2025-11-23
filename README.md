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
3. Khởi động lại terminal sau khi cài đặt

**⚠️ Lưu ý:**

- **Windows:** Nếu gặp lỗi `npm error gyp`, cần cài đặt Python và Visual Studio Build Tools
  - 📖 Xem hướng dẫn fix: [docs/troubleshooting/FIX_NPM_GYP_ERROR.md](./docs/troubleshooting/FIX_NPM_GYP_ERROR.md)
  - 💡 **Khuyến nghị:** Sử dụng WSL để tránh các vấn đề với native modules

- **Ubuntu/Linux:** Nếu gặp lỗi khi cài đặt
  - 📖 Xem hướng dẫn fix: [docs/troubleshooting/FIX_UBUNTU_ERRORS.md](./docs/troubleshooting/FIX_UBUNTU_ERRORS.md)
  - 💡 **Giải pháp nhanh:** `sudo apt install -y build-essential python3`
  - 🔧 **Lỗi Qt XCB:** Xem [docs/troubleshooting/FIX_QT_XCB_ERROR.md](./docs/troubleshooting/FIX_QT_XCB_ERROR.md)
  - 🔧 **Lỗi concurrently:** Script sẽ tự động cài đặt, hoặc chạy `npm install concurrently --save-dev`
  - 🐧 **Chọn Linux Distribution:** Xem [docs/guides/LINUX_DISTRIBUTIONS.md](./docs/guides/LINUX_DISTRIBUTIONS.md) - **Khuyến nghị: Ubuntu Server LTS**

## Cài đặt và chạy

### 🚀 Quick Start (Sau khi clone)

```bash
# 1. Clone repository
git clone https://github.com/quytrieu1995/thuanchay-platform.git
cd thuanchay-platform

# 2. Cài đặt dependencies
npm install

# 3. Chạy backend (Terminal 1)
npm run server

# 4. Chạy frontend (Terminal 2 - mở terminal mới)
npm run dev

# 5. Mở trình duyệt: http://localhost:5173
```

**Hoặc chạy cả hai cùng lúc:**
```bash
npm run start:dev
```

📖 **Xem hướng dẫn chi tiết:** [docs/guides/HUONG_DAN_CHAY_SAU_KHI_CLONE.md](./docs/guides/HUONG_DAN_CHAY_SAU_KHI_CLONE.md)  
🔧 **Gặp lỗi?** Xem [docs/troubleshooting/QUICK_FIX.md](./docs/troubleshooting/QUICK_FIX.md)

### Chạy thủ công

1. Mở terminal trong thư mục dự án

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

Xem chi tiết tại [docs/API_DOCUMENTATION.md](./docs/API_DOCUMENTATION.md)

## Tính năng Backend

- ✅ **Tự động tạo database** khi chạy lần đầu
- ✅ **RESTful API** đầy đủ cho CRUD operations
- ✅ **SQLite database** - Không cần cài đặt database server riêng
- ✅ **Dữ liệu mẫu** tự động insert khi khởi tạo
- ✅ **Transaction support** - Đảm bảo tính nhất quán dữ liệu
- ✅ **Error handling** - Xử lý lỗi đầy đủ
- ✅ **CORS enabled** - Hỗ trợ cross-origin requests


