# Hướng dẫn Fix Lỗi trên Ubuntu

Hướng dẫn fix các lỗi thường gặp khi cài đặt và chạy project trên Ubuntu VPS.

## 🔧 Lỗi: qt.qpa.xcb: could not connect to display

### Nguyên nhân
Lỗi này xảy ra khi một ứng dụng Qt/GUI cố gắng kết nối với X11 display nhưng server không có display (headless server).

### Giải pháp

```bash
# Option 1: Disable Qt GUI (Khuyến nghị cho server)
export QT_QPA_PLATFORM=offscreen
export DISPLAY=:0

# Hoặc thêm vào ~/.bashrc để áp dụng vĩnh viễn
echo 'export QT_QPA_PLATFORM=offscreen' >> ~/.bashrc
echo 'export DISPLAY=:0' >> ~/.bashrc
source ~/.bashrc

# Option 2: Cài đặt Xvfb (Virtual framebuffer)
sudo apt update
sudo apt install -y xvfb
export DISPLAY=:99
Xvfb :99 -screen 0 1024x768x24 > /dev/null 2>&1 &

# Option 3: Nếu đang chạy PM2, thêm vào ecosystem.config.cjs
# env: {
#   QT_QPA_PLATFORM: 'offscreen',
#   DISPLAY: ':0'
# }
```

### Áp dụng cho PM2

Nếu lỗi xảy ra khi chạy với PM2, cập nhật `ecosystem.config.cjs`:

```javascript
env: {
  NODE_ENV: 'production',
  PORT: 3000,
  QT_QPA_PLATFORM: 'offscreen',
  DISPLAY: ':0'
}
```

## 🔧 Lỗi: npm error gyp / better-sqlite3 không build được

### Nguyên nhân
`better-sqlite3` cần build tools để compile native code.

### Giải pháp

```bash
# Cài đặt build tools và Python
sudo apt update
sudo apt install -y build-essential python3

# Cài lại dependencies
rm -rf node_modules package-lock.json
npm install
```

## 🔧 Lỗi: EACCES permission denied

### Nguyên nhân
Không có quyền truy cập vào thư mục hoặc npm global packages.

### Giải pháp

```bash
# Option 1: Sử dụng sudo (không khuyến nghị cho npm install)
sudo npm install

# Option 2: Fix npm permissions (Khuyến nghị)
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.bashrc
source ~/.bashrc

# Sau đó cài lại
npm install
```

## 🔧 Lỗi: Cannot find module 'better-sqlite3'

### Nguyên nhân
Module chưa được build hoặc cài đặt không đúng.

### Giải pháp

```bash
# Cài đặt build tools
sudo apt install -y build-essential python3

# Xóa và cài lại
rm -rf node_modules package-lock.json
npm install

# Nếu vẫn lỗi, build lại manually
cd node_modules/better-sqlite3
npm run build-release
cd ../..
```

## 🔧 Lỗi: Port 3000 already in use (EADDRINUSE)

### Nguyên nhân
Port 3000 đã được sử dụng bởi process khác (có thể là PM2 đang chạy hoặc instance khác của server).

### Giải pháp tự động

**Server sẽ tự động tìm port khác nếu port 3000 đã được sử dụng.**

Nếu muốn fix thủ công:

```bash
# Tìm process đang dùng port 3000
sudo lsof -i :3000
# hoặc
sudo netstat -tlnp | grep 3000

# Kill process (thay <PID> bằng Process ID)
sudo kill -9 <PID>

# Hoặc nếu đang chạy với PM2
pm2 list
pm2 stop thuanchay-api
pm2 delete thuanchay-api

# Sau đó chạy lại
npm run server
```

**Hoặc thay đổi port:**

```bash
# Set port khác
PORT=3001 npm run server

# Hoặc trong .env
echo "PORT=3001" > .env
npm run server
```

## 🔧 Lỗi: ENOENT: no such file or directory

### Nguyên nhân
Thiếu thư mục hoặc file cần thiết.

### Giải pháp

```bash
# Tạo thư mục database
mkdir -p server/database

# Tạo thư mục logs
mkdir -p logs

# Đảm bảo quyền đúng
chmod -R 755 server/database
chmod -R 755 logs
```

## 🔧 Lỗi: PM2 command not found

### Nguyên nhân
PM2 chưa được cài đặt hoặc không có trong PATH.

### Giải pháp

```bash
# Cài đặt PM2 globally
sudo npm install -g pm2

# Kiểm tra
pm2 --version

# Nếu vẫn không tìm thấy, thêm vào PATH
export PATH=$PATH:/usr/local/bin
```

## 🔧 Lỗi: Nginx không start được

### Nguyên nhân
Cấu hình Nginx sai hoặc port đã được sử dụng.

### Giải pháp

```bash
# Kiểm tra cấu hình
sudo nginx -t

# Xem logs
sudo tail -f /var/log/nginx/error.log

# Restart Nginx
sudo systemctl restart nginx

# Kiểm tra status
sudo systemctl status nginx
```

## 🔧 Lỗi: Database không tạo được

### Nguyên nhân
Không có quyền ghi vào thư mục database.

### Giải pháp

```bash
# Tạo thư mục database
mkdir -p server/database

# Đảm bảo quyền đúng
sudo chown -R $USER:$USER server/database
chmod -R 755 server/database

# Chạy lại server
npm run server
```

## 🔧 Lỗi: Node.js version không đúng

### Nguyên nhân
Ubuntu repository có thể có Node.js version cũ.

### Giải pháp

```bash
# Option 1: Sử dụng NVM (Khuyến nghị)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc
nvm install 24.11.1
nvm use 24.11.1
nvm alias default 24.11.1

# Option 2: Cài từ NodeSource
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Kiểm tra version
node --version
npm --version
```

## 🔧 Lỗi: npm install bị timeout

### Nguyên nhân
Kết nối mạng chậm hoặc registry bị chặn.

### Giải pháp

```bash
# Tăng timeout
npm config set fetch-timeout 600000
npm config set fetch-retries 5

# Hoặc sử dụng registry khác
npm config set registry https://registry.npmjs.org/

# Cài lại
npm install
```

## 🔧 Lỗi: Out of memory khi build

### Nguyên nhân
RAM không đủ để build project.

### Giải pháp

```bash
# Tăng swap space
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile

# Thêm vào /etc/fstab để tự động mount
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab

# Build lại
npm run build
```

## 🔧 Lỗi: Permission denied khi chạy script

### Nguyên nhân
Script không có quyền thực thi.

### Giải pháp

```bash
# Chạy server trực tiếp
npm run server

# Hoặc chạy cả frontend và backend
npm run start:dev
```

## 🔧 Lỗi: Git clone bị timeout

### Nguyên nhân
Kết nối GitHub bị chặn hoặc chậm.

### Giải pháp

```bash
# Sử dụng SSH thay vì HTTPS
git clone git@github.com:quytrieu1995/thuanchay-platform.git

# Hoặc tăng timeout
git config --global http.postBuffer 524288000
git config --global http.lowSpeedLimit 0
git config --global http.lowSpeedTime 999999
```

## 🔧 Lỗi: qt.qpa.xcb: could not connect to display

### Nguyên nhân
Qt/GUI application cố gắng kết nối với X11 display nhưng server không có display.

### Giải pháp

```bash
# Set environment variables
export QT_QPA_PLATFORM=offscreen
export DISPLAY=:0

# Thêm vào ~/.bashrc để áp dụng vĩnh viễn
echo 'export QT_QPA_PLATFORM=offscreen' >> ~/.bashrc
echo 'export DISPLAY=:0' >> ~/.bashrc
source ~/.bashrc

# Nếu dùng PM2, cập nhật ecosystem.config.cjs với env variables
```

📖 **Xem hướng dẫn chi tiết:** [FIX_QT_XCB_ERROR.md](./FIX_QT_XCB_ERROR.md)

## 🔧 Lỗi: cp: cannot create regular file /etc/nginx/sites-available/: no such file or directory

### Nguyên nhân
Nginx chưa được cài đặt hoặc file nguồn không tồn tại.

### Giải pháp

```bash
# 1. Cài đặt Nginx
sudo apt update
sudo apt install -y nginx

# 2. Kiểm tra file config có tồn tại không
ls -la /var/www/thuanchay-platform/nginx-sale.thuanchay.vn.conf

# 3. Copy file (đảm bảo có sudo)
sudo cp /var/www/thuanchay-platform/nginx-sale.thuanchay.vn.conf /etc/nginx/sites-available/sale.thuanchay.vn

# 4. Nếu file không tồn tại, tạo file thủ công
sudo nano /etc/nginx/sites-available/sale.thuanchay.vn
```

📖 **Xem hướng dẫn chi tiết:** [FIX_NGINX_CONFIG_ERROR.md](./FIX_NGINX_CONFIG_ERROR.md)

## 🔧 Lỗi: the requested nginx plugin does not appear to be installed

### Nguyên nhân
Certbot không tìm thấy Nginx plugin.

### Giải pháp

```bash
# Cài đặt đầy đủ Certbot và Nginx plugin
sudo apt update
sudo apt install -y certbot python3-certbot-nginx

# Kiểm tra plugin có sẵn
certbot plugins

# Sau đó chạy lại
sudo certbot --nginx -d sale.thuanchay.vn
```

📖 **Xem hướng dẫn chi tiết:** [FIX_CERTBOT_NGINX_ERROR.md](./FIX_CERTBOT_NGINX_ERROR.md)

## 🔧 Lỗi: SSL certificate không cài được

### Nguyên nhân
Domain chưa trỏ về VPS hoặc firewall chặn port 80/443.

### Giải pháp

```bash
# Kiểm tra DNS
nslookup sale.thuanchay.vn
dig sale.thuanchay.vn

# Kiểm tra firewall
sudo ufw status
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Cài SSL
sudo certbot --nginx -d sale.thuanchay.vn
```

## ✅ Checklist Fix Lỗi

Khi gặp lỗi, làm theo thứ tự:

1. ✅ **Cài đặt build tools:**
   ```bash
   sudo apt update
   sudo apt install -y build-essential python3
   ```

2. ✅ **Kiểm tra Node.js version:**
   ```bash
   node --version  # Nên >= 18
   ```

3. ✅ **Xóa và cài lại:**
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

4. ✅ **Kiểm tra quyền:**
   ```bash
   ls -la
   chmod -R 755 .
   ```

5. ✅ **Kiểm tra logs:**
   ```bash
   pm2 logs
   sudo tail -f /var/log/nginx/error.log
   ```

## 🐛 Debug Commands

```bash
# Xem thông tin hệ thống
uname -a
node --version
npm --version
python3 --version

# Xem process đang chạy
ps aux | grep node
pm2 list

# Xem port đang được sử dụng
sudo netstat -tlnp | grep -E '3000|5173|80|443'

# Xem disk space
df -h

# Xem memory
free -h

# Xem logs
pm2 logs
sudo journalctl -xe
```

## 📞 Hỗ trợ

Nếu vẫn gặp lỗi:

1. Kiểm tra logs: `pm2 logs` hoặc `sudo journalctl -xe`
2. Xem file hướng dẫn deploy: `HUONG_DAN_DEPLOY_UBUNTU.md`
3. Kiểm tra system requirements

