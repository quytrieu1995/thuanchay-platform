# Hướng dẫn Fix Lỗi Qt XCB trên Ubuntu Server

Lỗi `qt.qpa.xcb: could not connect to display` thường xảy ra trên Ubuntu server không có GUI (headless server).

## 🔍 Nguyên nhân

Lỗi này xảy ra khi:
- Một ứng dụng Qt/GUI cố gắng kết nối với X11 display
- Server không có display (headless server)
- Một số npm packages hoặc tools cần GUI để chạy

## 🔧 Giải pháp

### Giải pháp 1: Set Environment Variables (Khuyến nghị)

Thiết lập biến môi trường để disable Qt GUI:

```bash
# Set cho session hiện tại
export QT_QPA_PLATFORM=offscreen
export DISPLAY=:0

# Hoặc thêm vào ~/.bashrc để áp dụng vĩnh viễn
echo 'export QT_QPA_PLATFORM=offscreen' >> ~/.bashrc
echo 'export DISPLAY=:0' >> ~/.bashrc
source ~/.bashrc
```

### Giải pháp 2: Cài đặt Xvfb (Virtual Framebuffer)

Nếu cần GUI thực sự:

```bash
# Cài đặt Xvfb
sudo apt update
sudo apt install -y xvfb

# Chạy Xvfb trong background
export DISPLAY=:99
Xvfb :99 -screen 0 1024x768x24 > /dev/null 2>&1 &

# Hoặc tạo service để tự động start
sudo nano /etc/systemd/system/xvfb.service
```

Thêm nội dung:

```ini
[Unit]
Description=Virtual Framebuffer X Server
After=network.target

[Service]
Type=simple
ExecStart=/usr/bin/Xvfb :99 -screen 0 1024x768x24
Restart=always

[Install]
WantedBy=multi-user.target
```

Kích hoạt service:

```bash
sudo systemctl enable xvfb
sudo systemctl start xvfb
export DISPLAY=:99
```

### Giải pháp 3: Cấu hình cho PM2

Nếu đang sử dụng PM2, cập nhật `ecosystem.config.cjs`:

```javascript
module.exports = {
  apps: [
    {
      name: 'thuanchay-api',
      script: 'server/index.js',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
        QT_QPA_PLATFORM: 'offscreen',
        DISPLAY: ':0'
      },
      // ... rest of config
    }
  ]
}
```

Sau đó restart PM2:

```bash
pm2 restart ecosystem.config.cjs --update-env
```

### Giải pháp 4: Cài đặt X11 packages (Nếu cần)

Nếu vẫn cần một số X11 libraries:

```bash
sudo apt update
sudo apt install -y libx11-dev libxext-dev libxrender-dev libxtst6 libxi6
```

## 🎯 Áp dụng cho các trường hợp cụ thể

### Khi chạy npm install

```bash
export QT_QPA_PLATFORM=offscreen
npm install
```

### Khi chạy với PM2

```bash
# Cập nhật ecosystem.config.cjs với env variables
pm2 restart ecosystem.config.cjs --update-env
```

### Khi chạy script deploy

Thêm vào đầu script:

```bash
#!/bin/bash
export QT_QPA_PLATFORM=offscreen
export DISPLAY=:0
# ... rest of script
```

## ✅ Kiểm tra

Sau khi áp dụng, kiểm tra:

```bash
# Kiểm tra environment variables
echo $QT_QPA_PLATFORM
echo $DISPLAY

# Kiểm tra PM2 env
pm2 env 0

# Test chạy lại
npm run server
```

## 🐛 Troubleshooting

### Lỗi vẫn còn sau khi set environment variables

```bash
# Kiểm tra xem có process nào đang dùng display không
ps aux | grep X

# Kill các process cũ
pkill -9 Xvfb

# Set lại và chạy
export QT_QPA_PLATFORM=offscreen
export DISPLAY=:0
```

### Lỗi khi chạy với sudo

Khi chạy với sudo, environment variables có thể không được áp dụng:

```bash
# Sử dụng -E để preserve environment
sudo -E npm install

# Hoặc set trong sudoers
sudo visudo
# Thêm: Defaults env_keep += "QT_QPA_PLATFORM DISPLAY"
```

### Lỗi với systemd service

Nếu chạy như systemd service, thêm vào service file:

```ini
[Service]
Environment="QT_QPA_PLATFORM=offscreen"
Environment="DISPLAY=:0"
```

## 📝 Best Practices

1. **Luôn set environment variables** trước khi chạy npm install hoặc deploy
2. **Sử dụng PM2 ecosystem config** để quản lý environment variables
3. **Tránh cài đặt GUI packages** trên server nếu không cần thiết
4. **Sử dụng Xvfb** chỉ khi thực sự cần GUI

## 🔗 Tài liệu tham khảo

- [Qt Platform Abstraction](https://doc.qt.io/qt-6/qtplatform.html)
- [Xvfb Documentation](https://www.x.org/releases/X11R7.6/doc/man/man1/Xvfb.1.xhtml)


