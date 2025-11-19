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

- **React 18** - Thư viện UI
- **React Router** - Điều hướng
- **Tailwind CSS** - Styling
- **Recharts** - Biểu đồ
- **Lucide React** - Icons
- **Vite** - Build tool

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

3. Chạy development server:
```bash
npm run dev
```

4. Mở trình duyệt tại: **http://localhost:5173**

### Các lệnh khác

- **Build cho production**: `npm run build`
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

## Lưu ý

Hiện tại dữ liệu được lưu trữ trong state (local). Để sử dụng trong production, cần tích hợp với backend API và database.


