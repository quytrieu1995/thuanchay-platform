# Hướng dẫn Cài đặt và Chạy Dự án

## Bước 1: Cài đặt Node.js

1. Truy cập: https://nodejs.org/
2. Tải phiên bản LTS (khuyến nghị)
3. Cài đặt Node.js (sẽ bao gồm cả npm)
4. Khởi động lại terminal/PowerShell

## Bước 2: Kiểm tra cài đặt

Mở PowerShell/Terminal và chạy:
```bash
node --version
npm --version
```

Nếu hiển thị số phiên bản, bạn đã cài đặt thành công!

## Bước 3: Cài đặt Dependencies

Mở PowerShell trong thư mục dự án và chạy:
```bash
cd Thuần Chay VN-clone
npm install
```

## Bước 4: Chạy Development Server

```bash
npm run dev
```

Sau đó mở trình duyệt tại: **http://localhost:5173**

## Lệnh khác

- **Build cho production**: `npm run build`
- **Preview build**: `npm run preview`

## Lưu ý

- Đảm bảo đã cài đặt Node.js trước khi chạy các lệnh trên
- Nếu gặp lỗi, thử xóa thư mục `node_modules` và chạy lại `npm install`


