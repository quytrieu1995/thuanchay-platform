# Hướng dẫn Chạy Project sau khi Clone

Hướng dẫn chi tiết để chạy project Thuần Chay Platform sau khi clone từ GitHub.

## 📋 Yêu cầu

- Node.js 18+ (khuyến nghị Node.js v24.11.1)
- npm hoặc yarn
- Git

## 🚀 Các bước chạy project

### Bước 1: Clone repository

```bash
git clone https://github.com/quytrieu1995/thuanchay-platform.git
cd thuanchay-platform
```

### Bước 2: Fix Environment (Chỉ cho Ubuntu Server)

**Nếu bạn đang chạy trên Ubuntu server (headless), chạy script này trước:**

```bash
# Fix Qt XCB display error
chmod +x fix-env.sh
source fix-env.sh
# hoặc
. ./fix-env.sh
```

Script sẽ tự động set environment variables để tránh lỗi Qt XCB.

### Bước 3: Cài đặt dependencies

```bash
npm install
```

**Lưu ý:** 
- Trên Windows, nếu gặp lỗi với `better-sqlite3`, cần cài đặt Python và build tools (xem phần Troubleshooting)
- Trên Linux/Mac desktop, thường không có vấn đề
- Trên Ubuntu server (headless), đã fix ở Bước 2

### Bước 4: Chạy Backend Server

Mở terminal thứ nhất:

```bash
npm run server
```

Backend sẽ:
- ✅ Tự động tạo database SQLite tại `server/database/thuanchay.db`
- ✅ Tạo các bảng cần thiết (products, orders, customers, returns, users)
- ✅ Insert dữ liệu mẫu (nếu database mới)
- ✅ Khởi động API server tại `http://localhost:3000`

Bạn sẽ thấy thông báo:
```
✨ Server is running on port 3000
📡 API available at http://localhost:3000/api
🌐 Frontend dev server: http://localhost:5173
💡 Health check: http://localhost:3000/health
```

### Bước 5: Chạy Frontend (Terminal mới)

Mở terminal thứ hai (giữ terminal backend đang chạy):

```bash
npm run dev
```

Frontend sẽ chạy tại: **http://localhost:5173**

### Bước 6: Mở trình duyệt

Truy cập: **http://localhost:5173**

## 🎯 Cách chạy nhanh (Cả Frontend và Backend cùng lúc)

Script sẽ tự động cài đặt `concurrently` nếu chưa có:

```bash
npm run start:dev
```

Lệnh này sẽ tự động:
- ✅ Cài đặt `concurrently` nếu chưa có
- ✅ Set environment variables để fix Qt XCB error
- ✅ Chạy cả frontend và backend cùng lúc

**Lưu ý:** Trên Ubuntu server, script đã tự động set `QT_QPA_PLATFORM=offscreen` để tránh lỗi Qt XCB.

## 📝 Các lệnh khác

### Development

```bash
# Chạy backend
npm run server

# Chạy frontend
npm run dev

# Chạy cả hai
npm run start:dev
```

### Production

```bash
# Build frontend
npm run build

# Chạy production (build + server)
npm run start:prod

# Preview build
npm run preview
```

## 🐛 Troubleshooting

### Lỗi trên Ubuntu/Linux

📖 **Xem hướng dẫn chi tiết:** [FIX_UBUNTU_ERRORS.md](./FIX_UBUNTU_ERRORS.md)

**Giải pháp nhanh cho npm error gyp:**
```bash
sudo apt update
sudo apt install -y build-essential python3
rm -rf node_modules package-lock.json
npm install
```

### Lỗi: better-sqlite3 không cài được trên Windows (npm error gyp)

**Giải pháp nhanh:**

📖 **Xem hướng dẫn chi tiết:** [FIX_NPM_GYP_ERROR.md](./FIX_NPM_GYP_ERROR.md)

**Tóm tắt:**

1. **Cài đặt Python 3.11+** từ https://www.python.org/downloads/
   - ✅ **QUAN TRỌNG:** Chọn "Add Python to PATH"

2. **Cài đặt Visual Studio Build Tools** từ:
   https://visualstudio.microsoft.com/downloads/#build-tools-for-visual-studio-2022
   - ✅ Chọn "Desktop development with C++" workload

3. **Cấu hình npm:**
   ```powershell
   npm config set python "C:\Users\13124\AppData\Local\Programs\Python\Python311\python.exe"
   ```

4. **Cài lại:**
   ```powershell
   Remove-Item -Recurse -Force node_modules
   Remove-Item -Force package-lock.json
   npm install
   ```

**Hoặc sử dụng WSL (Khuyến nghị cho Windows):**
```bash
# Trong WSL Ubuntu
sudo apt update
sudo apt install -y nodejs npm python3 build-essential
npm install
```

### Lỗi: Port 3000 already in use (EADDRINUSE)

**Server sẽ tự động tìm port khác nếu port 3000 đã được sử dụng.**

**Nếu muốn fix thủ công:**

```bash
# Tìm process đang dùng port 3000
# Linux/Mac
sudo lsof -i :3000
# hoặc
sudo netstat -tlnp | grep 3000

# Windows
netstat -ano | findstr :3000

# Kill process (thay <PID> bằng Process ID)
# Linux/Mac
sudo kill -9 <PID>

# Windows
taskkill /PID <PID> /F

# Hoặc nếu đang chạy với PM2
pm2 stop thuanchay-api
pm2 delete thuanchay-api
```

**Hoặc dùng port khác:**

```bash
# Set port khác
PORT=3001 npm run server

# Hoặc trong file .env
echo "PORT=3001" > .env
npm run server
```

### Lỗi: Port 5173 đã được sử dụng

Vite sẽ tự động tìm port khác, hoặc bạn có thể chỉ định port:

```bash
npm run dev -- --port 5174
```

### Lỗi: concurrently: not found

```bash
# Cài đặt concurrently
npm install concurrently --save-dev

# Hoặc chạy lại npm install (sẽ tự động cài)
npm install
```

### Lỗi: qt.qpa.xcb: could not connect to display

**Trên Ubuntu server (headless):**

```bash
# Set environment variables
export QT_QPA_PLATFORM=offscreen
export DISPLAY=:0

# Hoặc thêm vào ~/.bashrc để áp dụng vĩnh viễn
echo 'export QT_QPA_PLATFORM=offscreen' >> ~/.bashrc
echo 'export DISPLAY=:0' >> ~/.bashrc
source ~/.bashrc

# Sau đó chạy lại
npm run server
```

📖 **Xem hướng dẫn chi tiết:** [FIX_QT_XCB_ERROR.md](./FIX_QT_XCB_ERROR.md)

### Lỗi: Module not found

```bash
# Xóa node_modules và cài lại
rm -rf node_modules
npm install

# Hoặc trên Windows
rmdir /s node_modules
npm install
```

### Lỗi: Database không tạo được

Đảm bảo thư mục `server/database` có quyền ghi:

```bash
# Linux/Mac
chmod -R 755 server/database

# Windows: Kiểm tra quyền thư mục trong File Explorer
```

## ✅ Kiểm tra đã chạy thành công

1. **Backend:** Truy cập http://localhost:3000/health
   - Kết quả: `{"status":"ok","timestamp":"..."}`

2. **Frontend:** Truy cập http://localhost:5173
   - Thấy giao diện website

3. **API:** Truy cập http://localhost:3000/api/products
   - Thấy danh sách sản phẩm (JSON)

## 📦 Cấu trúc Project

```
thuanchay-platform/
├── server/              # Backend code
│   ├── index.js        # Server chính
│   ├── database/       # Database files
│   └── routes/         # API routes
├── src/                # Frontend code (React)
├── dist/               # Build output (sau khi build)
├── package.json        # Dependencies
└── vite.config.js      # Vite config
```

## 🔧 Cấu hình môi trường (Tùy chọn)

Tạo file `.env` trong thư mục root:

```env
PORT=3000
NODE_ENV=development
VITE_API_BASE_URL=http://localhost:3000/api
```

## 📚 Tài liệu tham khảo

- [API Documentation](./API_DOCUMENTATION.md)
- [Deploy lên VPS](./HUONG_DAN_DEPLOY_VPS.md)
- [Cấu hình Domain](./HUONG_DAN_DEPLOY_DOMAIN.md)

## 🎉 Hoàn thành!

Sau khi chạy thành công:

- ✅ Backend API: `http://localhost:3000/api`
- ✅ Frontend: `http://localhost:5173`
- ✅ Database tự động được tạo
- ✅ Dữ liệu mẫu đã sẵn sàng

Bắt đầu phát triển! 🚀

