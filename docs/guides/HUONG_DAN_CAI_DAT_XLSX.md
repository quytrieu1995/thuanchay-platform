# Hướng dẫn cài đặt thư viện xlsx

## Vấn đề
Lỗi: `npm is not recognized` - Node.js chưa được cài đặt trên hệ thống.

## Giải pháp

### Bước 1: Cài đặt Node.js

1. **Tải Node.js:**
   - Truy cập: https://nodejs.org/
   - Tải phiên bản LTS (Long Term Support) - khuyến nghị cho Windows
   - File tải về sẽ có dạng: `node-vXX.XX.X-x64.msi`

2. **Cài đặt Node.js:**
   - Chạy file `.msi` vừa tải
   - Làm theo hướng dẫn cài đặt (Next, Next, Install)
   - **Quan trọng:** Đảm bảo chọn tùy chọn "Add to PATH" trong quá trình cài đặt

3. **Khởi động lại PowerShell:**
   - Đóng PowerShell hiện tại
   - Mở PowerShell mới (hoặc CMD mới)
   - Hoặc khởi động lại máy tính

### Bước 2: Kiểm tra cài đặt

Mở PowerShell mới và chạy các lệnh sau:

```powershell
node --version
npm --version
```

Nếu hiển thị số phiên bản (ví dụ: `v18.17.0` và `9.6.7`), nghĩa là đã cài đặt thành công.

### Bước 3: Cài đặt thư viện xlsx

1. **Di chuyển vào thư mục project:**
   ```powershell
   cd C:\Thuần Chay VN-clone
   ```

2. **Cài đặt thư viện xlsx:**
   ```powershell
   npm install
   ```

   Lệnh này sẽ cài đặt tất cả các dependencies trong `package.json`, bao gồm cả `xlsx`.

3. **Hoặc chỉ cài đặt xlsx:**
   ```powershell
   npm install xlsx
   ```

### Bước 4: Chạy lại ứng dụng

Sau khi cài đặt xong, khởi động lại server:

```powershell
npm run dev
```

## Lưu ý

- Nếu vẫn gặp lỗi sau khi cài đặt Node.js, hãy khởi động lại máy tính
- Đảm bảo đang sử dụng PowerShell mới (không phải PowerShell cũ trước khi cài Node.js)
- Có thể cần chạy PowerShell với quyền Administrator

## Kiểm tra nhanh

Sau khi cài đặt, chạy lệnh này để kiểm tra:

```powershell
npm list xlsx
```

Nếu hiển thị thông tin về xlsx, nghĩa là đã cài đặt thành công.



