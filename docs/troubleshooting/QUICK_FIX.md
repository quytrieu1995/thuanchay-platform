# Quick Fix - Các Lỗi Thường Gặp

Hướng dẫn nhanh để fix các lỗi phổ biến khi chạy project.

## 🔧 Lỗi: concurrently: not found

**Giải pháp:**

```bash
# Cài đặt concurrently
npm install concurrently --save-dev

# Hoặc chạy lại npm install
npm install
```

Package `concurrently` sẽ được tự động cài đặt khi chạy `npm run start:dev`.

## 🔧 Lỗi: qt.qpa.xcb: could not connect to display

**Giải pháp nhanh:**

```bash
# Set environment variables
export QT_QPA_PLATFORM=offscreen
export DISPLAY=:0

# Sau đó chạy lại
npm run server
```

**Áp dụng vĩnh viễn:**

```bash
# Thêm vào ~/.bashrc
echo 'export QT_QPA_PLATFORM=offscreen' >> ~/.bashrc
echo 'export DISPLAY=:0' >> ~/.bashrc
source ~/.bashrc
```

## 🔧 Lỗi: npm error gyp (Windows)

**Giải pháp:**

1. Cài đặt Python 3.11+ từ https://www.python.org/downloads/
   - ✅ Chọn "Add Python to PATH"

2. Cài đặt Visual Studio Build Tools từ:
   https://visualstudio.microsoft.com/downloads/#build-tools-for-visual-studio-2022
   - ✅ Chọn "Desktop development with C++"

3. Cấu hình npm:
   ```powershell
   npm config set python "C:\Users\13124\AppData\Local\Programs\Python\Python311\python.exe"
   ```

4. Cài lại:
   ```powershell
   npm install
   ```

## 🔧 Lỗi: npm error gyp (Ubuntu)

**Giải pháp:**

```bash
sudo apt update
sudo apt install -y build-essential python3
npm install
```

## 🔧 Lỗi: Port 3000 already in use (EADDRINUSE)

**Giải pháp:**

Server sẽ **tự động tìm port khác** nếu port 3000 đã được sử dụng (từ phiên bản mới).

**Nếu muốn fix thủ công:**

```bash
# Cách 1: Tìm và kill process đang dùng port 3000
sudo lsof -ti:3000 | xargs kill -9
# Hoặc
sudo fuser -k 3000/tcp

# Cách 2: Nếu đang chạy với PM2
pm2 list                    # Xem danh sách
pm2 stop thuanchay-api      # Dừng app
pm2 delete thuanchay-api    # Xóa app

# Sau đó chạy lại
npm run server
```

**Hoặc dùng port khác:**

```bash
PORT=3001 npm run server
```

**Lưu ý:** Sau khi pull code mới, server sẽ tự động tìm port khác nếu port 3000 bận.

## ✅ Checklist

Sau khi clone và trước khi chạy:

- [ ] Đã chạy `npm install`
- [ ] Trên Ubuntu server: Đã set `QT_QPA_PLATFORM=offscreen` và `DISPLAY=:0`
- [ ] Kiểm tra `concurrently` đã được cài: `ls node_modules/.bin/concurrently`
- [ ] Kiểm tra environment variables: `echo $QT_QPA_PLATFORM`

## 📖 Xem hướng dẫn chi tiết

- [FIX_UBUNTU_ERRORS.md](./FIX_UBUNTU_ERRORS.md) - Tất cả lỗi Ubuntu
- [FIX_QT_XCB_ERROR.md](./FIX_QT_XCB_ERROR.md) - Lỗi Qt XCB chi tiết
- [FIX_NPM_GYP_ERROR.md](./FIX_NPM_GYP_ERROR.md) - Lỗi npm gyp Windows
- [FIX_NGINX_CONFIG_ERROR.md](./FIX_NGINX_CONFIG_ERROR.md) - Lỗi cấu hình Nginx
- [FIX_CERTBOT_NGINX_ERROR.md](./FIX_CERTBOT_NGINX_ERROR.md) - Lỗi Certbot Nginx plugin

