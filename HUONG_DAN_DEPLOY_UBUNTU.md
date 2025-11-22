# Hướng dẫn Deploy trên Ubuntu VPS

Hướng dẫn chi tiết để deploy project Thuần Chay Platform lên VPS Ubuntu.

## 📋 Yêu cầu

- VPS Ubuntu 20.04+ hoặc Debian 11+
- Domain đã được cấu hình DNS (ví dụ: sale.thuanchay.vn)
- Quyền root hoặc sudo
- Kết nối SSH vào VPS

## 🚀 Cách 1: Deploy tự động (Khuyến nghị)

### Bước 1: Upload code lên VPS

**Cách A: Sử dụng Git (Khuyến nghị)**

```bash
# Kết nối SSH vào VPS
ssh root@your-vps-ip

# Clone repository
cd /var/www
git clone <your-repository-url> thuanchay-platform
cd thuanchay-platform
```

**Cách B: Upload qua SCP**

```bash
# Từ máy local (Windows PowerShell hoặc Linux)
scp -r ./thuanchay-platform root@your-vps-ip:/var/www/
```

**Cách C: Upload qua FTP/SFTP**

Sử dụng FileZilla, WinSCP hoặc VS Code Remote SSH để upload code.

### Bước 2: Chạy script deploy tự động

```bash
# Vào thư mục project
cd /var/www/thuanchay-platform

# Cấp quyền thực thi cho script
chmod +x deploy-ubuntu.sh

# Chạy script (thay sale.thuanchay.vn bằng domain của bạn)
sudo ./deploy-ubuntu.sh sale.thuanchay.vn
```

Script sẽ tự động:
- ✅ Cập nhật hệ thống
- ✅ Cài đặt Node.js 20.x
- ✅ Cài đặt PM2
- ✅ Cài đặt Nginx
- ✅ Cài đặt dependencies
- ✅ Build frontend
- ✅ Cấu hình PM2
- ✅ Cấu hình Nginx
- ✅ Cấu hình Firewall
- ✅ Hỏi có muốn cài SSL không

### Bước 3: Cấu hình DNS (nếu chưa làm)

Đăng nhập vào quản lý domain và thêm A record:

```
Type: A
Host: sale (hoặc @ nếu là domain chính)
Value: [IP-VPS-CỦA-BẠN]
TTL: 3600
```

### Bước 4: Cài đặt SSL (nếu chưa làm trong script)

```bash
# Cài đặt Certbot
sudo apt install -y certbot python3-certbot-nginx

# Lấy SSL certificate
sudo certbot --nginx -d sale.thuanchay.vn

# Test auto-renewal
sudo certbot renew --dry-run
```

## 🔧 Cách 2: Deploy thủ công

Nếu không muốn dùng script tự động, làm theo các bước sau:

### 1. Cập nhật hệ thống

```bash
sudo apt update
sudo apt upgrade -y
```

### 2. Cài đặt Node.js

```bash
# Cài đặt Node.js 20.x LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Kiểm tra version
node --version
npm --version
```

### 3. Cài đặt PM2

```bash
sudo npm install -g pm2
```

### 4. Upload và cài đặt code

```bash
# Vào thư mục project
cd /var/www/thuanchay-platform

# Cài đặt dependencies
npm install --production

# Build frontend
npm run build

# Tạo thư mục logs
mkdir -p logs
```

### 5. Tạo file .env

```bash
nano .env
```

Thêm nội dung:
```env
PORT=3000
NODE_ENV=production
VITE_API_BASE_URL=https://sale.thuanchay.vn/api
```

### 6. Chạy với PM2

```bash
cd /var/www/thuanchay-platform

# Khởi động service
pm2 start ecosystem.config.cjs --env production

# Lưu cấu hình để tự động khởi động khi reboot
pm2 save
pm2 startup
```

### 7. Cài đặt và cấu hình Nginx

```bash
# Cài đặt Nginx
sudo apt install -y nginx

# Copy file config
sudo cp /var/www/thuanchay-platform/nginx-sale.thuanchay.vn.conf \
        /etc/nginx/sites-available/sale.thuanchay.vn

# Kích hoạt site
sudo ln -s /etc/nginx/sites-available/sale.thuanchay.vn \
           /etc/nginx/sites-enabled/

# Xóa default site
sudo rm /etc/nginx/sites-enabled/default

# Kiểm tra config
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

### 8. Cài đặt SSL

```bash
# Cài đặt Certbot
sudo apt install -y certbot python3-certbot-nginx

# Lấy SSL certificate
sudo certbot --nginx -d sale.thuanchay.vn

# Test auto-renewal
sudo certbot renew --dry-run
```

### 9. Cấu hình Firewall

```bash
# Cho phép SSH, HTTP, HTTPS
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Kích hoạt firewall
sudo ufw enable

# Kiểm tra status
sudo ufw status
```

## ✅ Kiểm tra sau khi deploy

```bash
# Kiểm tra PM2
pm2 status
pm2 logs thuanchay-api

# Kiểm tra Nginx
sudo systemctl status nginx
sudo nginx -t

# Kiểm tra port 3000
sudo netstat -tlnp | grep 3000
curl http://localhost:3000/health

# Kiểm tra từ trình duyệt
# Truy cập: https://sale.thuanchay.vn
# API: https://sale.thuanchay.vn/api/health
```

## 🔄 Cập nhật code mới

Khi có code mới, deploy lại:

```bash
cd /var/www/thuanchay-platform

# Pull code mới
git pull origin main

# Cài đặt dependencies mới (nếu có)
npm install --production

# Build lại frontend
npm run build

# Reload PM2 (zero downtime)
pm2 reload thuanchay-api

# Hoặc restart
pm2 restart thuanchay-api
```

## 🐛 Troubleshooting

📖 **Xem hướng dẫn fix lỗi chi tiết:** [FIX_UBUNTU_ERRORS.md](./FIX_UBUNTU_ERRORS.md)

### Lỗi: Cannot connect to server

```bash
# Kiểm tra PM2
pm2 status
pm2 logs thuanchay-api

# Kiểm tra port 3000
sudo netstat -tlnp | grep 3000
curl http://localhost:3000/health
```

### Lỗi: 502 Bad Gateway

```bash
# Kiểm tra backend có chạy không
curl http://localhost:3000/health

# Kiểm tra Nginx config
sudo nginx -t

# Kiểm tra logs Nginx
sudo tail -f /var/log/nginx/sale-thuanchay-error.log
```

### Lỗi: Permission denied

```bash
# Đảm bảo quyền đúng cho thư mục
sudo chown -R $USER:$USER /var/www/thuanchay-platform
sudo chmod -R 755 /var/www/thuanchay-platform
```

### Lỗi: better-sqlite3 không build được

Trên Ubuntu, `better-sqlite3` cần build tools:

```bash
# Cài đặt build tools
sudo apt install -y build-essential python3

# Xóa và cài lại
rm -rf node_modules
npm install
```

### Lỗi: Domain không resolve

```bash
# Kiểm tra DNS
nslookup sale.thuanchay.vn
dig sale.thuanchay.vn

# Kiểm tra DNS propagation
# https://www.whatsmydns.net/#A/sale.thuanchay.vn
```

## 📝 Các lệnh hữu ích

### PM2 Commands

```bash
pm2 status                    # Xem trạng thái
pm2 logs thuanchay-api        # Xem logs
pm2 restart thuanchay-api     # Restart
pm2 reload thuanchay-api      # Reload (zero downtime)
pm2 stop thuanchay-api        # Stop
pm2 delete thuanchay-api      # Xóa
pm2 monit                     # Monitor
pm2 show thuanchay-api        # Thông tin chi tiết
```

### Nginx Commands

```bash
sudo nginx -t                  # Kiểm tra config
sudo systemctl reload nginx   # Reload (không downtime)
sudo systemctl restart nginx  # Restart
sudo systemctl status nginx   # Trạng thái
sudo tail -f /var/log/nginx/sale-thuanchay-error.log  # Xem logs lỗi
```

### System Commands

```bash
sudo systemctl status pm2-root    # Trạng thái PM2 service
sudo journalctl -xe               # System logs
df -h                             # Kiểm tra dung lượng disk
free -h                           # Kiểm tra RAM
```

## 🔐 Bảo mật bổ sung

### 1. Tắt root login SSH (tùy chọn)

```bash
sudo nano /etc/ssh/sshd_config
# Đặt: PermitRootLogin no
sudo systemctl restart sshd
```

### 2. Cài đặt fail2ban

```bash
sudo apt install -y fail2ban
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

### 3. Backup định kỳ

Tạo script backup tự động:

```bash
nano /var/www/thuanchay-platform/backup.sh
```

```bash
#!/bin/bash
BACKUP_DIR="/var/backups/thuanchay"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

# Backup database
cp /var/www/thuanchay-platform/server/database/thuanchay.db \
   $BACKUP_DIR/thuanchay_$DATE.db

# Xóa backup cũ hơn 7 ngày
find $BACKUP_DIR -name "thuanchay_*.db" -mtime +7 -delete

echo "Backup completed: $BACKUP_DIR/thuanchay_$DATE.db"
```

Thêm vào crontab:

```bash
crontab -e
# Thêm dòng: 0 2 * * * /var/www/thuanchay-platform/backup.sh
```

## 🎉 Hoàn thành!

Sau khi deploy thành công:

- ✅ Website: `https://sale.thuanchay.vn`
- ✅ API: `https://sale.thuanchay.vn/api`
- ✅ SSL/HTTPS đã được cấu hình
- ✅ Server tự động restart khi reboot
- ✅ PM2 quản lý process tự động

## 📞 Hỗ trợ

Nếu gặp vấn đề:
1. Kiểm tra logs: `pm2 logs thuanchay-api`
2. Kiểm tra Nginx: `sudo tail -f /var/log/nginx/sale-thuanchay-error.log`
3. Xem file `DEPLOY_SALE_THUANCHAY.md` để có hướng dẫn nhanh hơn

