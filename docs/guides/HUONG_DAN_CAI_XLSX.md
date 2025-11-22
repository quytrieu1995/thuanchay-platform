# Hướng dẫn cài đặt thư viện xlsx

## Lỗi: Failed to resolve import "xlsx"

Lỗi này xảy ra vì thư viện `xlsx` chưa được cài đặt. Bạn cần cài đặt dependencies.

## Cách khắc phục

### Bước 1: Đảm bảo Node.js đã được cài đặt

Nếu chưa có Node.js:
1. Tải Node.js từ: https://nodejs.org/
2. Cài đặt phiên bản LTS
3. Khởi động lại terminal/PowerShell

### Bước 2: Cài đặt dependencies

Mở terminal/PowerShell trong thư mục dự án và chạy:

```bash
cd C:\Thuần Chay VN-clone
npm install
```

Lệnh này sẽ cài đặt tất cả dependencies, bao gồm cả `xlsx`.

### Bước 3: Khởi động lại dev server

Sau khi cài đặt xong:

```bash
npm run dev
```

## Kiểm tra cài đặt

Nếu muốn kiểm tra xem `xlsx` đã được cài đặt chưa:

```bash
npm list xlsx
```

Hoặc kiểm tra trong thư mục `node_modules`:

```bash
dir node_modules\xlsx
```

## Lưu ý

- Nếu vẫn gặp lỗi sau khi cài đặt, thử:
  1. Xóa thư mục `node_modules` và file `package-lock.json`
  2. Chạy lại `npm install`
  3. Khởi động lại dev server

- Đảm bảo bạn đang ở đúng thư mục dự án khi chạy lệnh


