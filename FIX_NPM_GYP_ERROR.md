# Hướng dẫn Fix Lỗi npm gyp trên Windows

Lỗi `npm error gyp` xảy ra khi cài đặt `better-sqlite3` vì module này cần Python và build tools để compile native code.

## 🔧 Giải pháp

### Cách 1: Cài đặt Python và Build Tools (Khuyến nghị)

#### Bước 1: Cài đặt Python

1. Tải Python từ: https://www.python.org/downloads/
2. **QUAN TRỌNG:** Khi cài đặt, chọn **"Add Python to PATH"**
3. Cài đặt Python 3.11 hoặc mới hơn

#### Bước 2: Cài đặt Visual Studio Build Tools

1. Tải Visual Studio Build Tools từ:
   https://visualstudio.microsoft.com/downloads/#build-tools-for-visual-studio-2022

2. Chạy installer và chọn:
   - ✅ **Desktop development with C++** workload
   - ✅ Cài đặt tất cả components mặc định

#### Bước 3: Cấu hình npm

Mở PowerShell hoặc Command Prompt và chạy:

```powershell
# Tìm đường dẫn Python (thường là)
# C:\Users\<username>\AppData\Local\Programs\Python\Python311\python.exe

# Cấu hình npm
npm config set python "C:\Users\13124\AppData\Local\Programs\Python\Python311\python.exe"

# Hoặc nếu Python ở vị trí khác, tìm bằng:
where python
```

#### Bước 4: Cài lại dependencies

```powershell
# Xóa node_modules và package-lock.json
Remove-Item -Recurse -Force node_modules
Remove-Item -Force package-lock.json

# Cài lại
npm install
```

### Cách 2: Sử dụng Chocolatey (Nhanh nhất)

Nếu bạn đã có Chocolatey:

```powershell
# Mở PowerShell as Administrator
choco install python3 visualstudio2022buildtools -y

# Sau đó cấu hình npm
npm config set python "C:\Python311\python.exe"

# Cài lại
npm install
```

### Cách 3: Cài đặt Windows Build Tools tự động

```powershell
# Cài đặt windows-build-tools (tự động cài Python và VS Build Tools)
npm install --global windows-build-tools

# Lưu ý: Quá trình này có thể mất 10-30 phút
```

Sau khi cài xong:

```powershell
npm install
```

## ✅ Kiểm tra cài đặt

```powershell
# Kiểm tra Python
python --version

# Kiểm tra npm config
npm config get python

# Kiểm tra Node.js
node --version
```

## 🐛 Troubleshooting

### Lỗi: Python không được tìm thấy

```powershell
# Kiểm tra Python có trong PATH không
python --version

# Nếu không có, thêm vào PATH:
# 1. Mở System Properties → Environment Variables
# 2. Thêm Python vào PATH:
#    C:\Users\13124\AppData\Local\Programs\Python\Python311
#    C:\Users\13124\AppData\Local\Programs\Python\Python311\Scripts
```

### Lỗi: MSBuild not found

Đảm bảo đã cài Visual Studio Build Tools với "Desktop development with C++" workload.

### Lỗi: Permission denied

Chạy PowerShell hoặc Command Prompt với quyền Administrator.

### Giải pháp tạm thời: Bỏ qua better-sqlite3

Nếu không thể cài đặt build tools, có thể tạm thời comment `better-sqlite3` trong `package.json`:

```json
{
  "dependencies": {
    // "better-sqlite3": "^9.2.2"  // Tạm thời comment
  }
}
```

**Lưu ý:** Điều này sẽ làm backend không hoạt động vì database cần `better-sqlite3`.

## 🎯 Giải pháp tốt nhất cho Windows

**Khuyến nghị:** Sử dụng WSL (Windows Subsystem for Linux) để tránh các vấn đề với native modules:

```bash
# Trong WSL Ubuntu
sudo apt update
sudo apt install -y nodejs npm python3 build-essential
npm install
```

## 📝 Checklist

- [ ] Python 3.11+ đã được cài đặt
- [ ] Python đã được thêm vào PATH
- [ ] Visual Studio Build Tools đã được cài đặt
- [ ] npm đã được cấu hình để sử dụng Python
- [ ] `npm install` chạy thành công

## 🔗 Tài liệu tham khảo

- [node-gyp Installation](https://github.com/nodejs/node-gyp#installation)
- [better-sqlite3 Installation](https://github.com/WiseLibs/better-sqlite3/wiki/Troubleshooting)


