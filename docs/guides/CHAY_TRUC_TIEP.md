# Hướng dẫn Chạy Trực tiếp (Không dùng script)

## Nếu gặp lỗi Execution Policy

Nếu bạn gặp lỗi khi chạy script PowerShell, bạn có thể chạy trực tiếp các lệnh sau:

## Bước 1: Kiểm tra Node.js

```powershell
node --version
npm --version
```

Nếu hiển thị số phiên bản → Node.js đã được cài đặt, tiếp tục Bước 2.

Nếu báo lỗi → Cần cài đặt Node.js từ https://nodejs.org/

## Bước 2: Cài đặt Dependencies

```powershell
cd C:\Thuần Chay VN-clone
npm install
```

## Bước 3: Chạy Development Server

```powershell
npm run dev
```

## Bước 4: Mở trình duyệt

Mở trình duyệt và truy cập: **http://localhost:5173**

---

## Chạy cả Frontend và Backend cùng lúc

```powershell
npm run start:dev
```

Lệnh này sẽ tự động:
- ✅ Cài đặt `concurrently` nếu chưa có
- ✅ Chạy cả frontend và backend cùng lúc
- ✅ Hiển thị logs của cả hai server


