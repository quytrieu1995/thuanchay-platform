# Hướng dẫn Deploy Tự Động trên VPS

Hướng dẫn chi tiết để setup và deploy tự động sau khi clone repository trên VPS Ubuntu.

## 📋 Yêu cầu

- VPS Ubuntu 20.04+ hoặc Debian 11+
- Quyền root hoặc sudo
- Domain đã cấu hình DNS (tùy chọn)
- Repository GitHub đã sẵn sàng

## 🚀 Bước 1: Setup VPS (Chạy một lần duy nhất)

### 1.1. Kết nối SSH vào VPS

```bash
ssh root@your-vps-ip
```

### 1.2. Upload và chạy script setup

**Cách A: Clone repository và chạy script**

```bash
# Clone repository
cd /var/www
git clone <your-repo-url> thuanchay-platform
cd thuanchay-platform

# Cấp quyền thực thi
chmod +x setup-vps.sh

# Chạy script setup (thay sale.thuanchay.vn bằng domain của bạn)
sudo ./setup-vps.sh sale.thuanchay.vn
```

**Cách B: Upload script riêng**

```bash
# Upload file setup-vps.sh lên VPS
scp setup-vps.sh root@your-vps-ip:/tmp/

# SSH vào VPS
ssh root@your-vps-ip

# Chạy script
cd /tmp
chmod +x setup-vps.sh
sudo ./setup-vps.sh sale.thuanchay.vn
```

Script sẽ tự động cài đặt:
- ✅ Git
- ✅ NVM và Node.js v24.11.1
- ✅ PM2
- ✅ Nginx
- ✅ Certbot (cho SSL)
- ✅ Firewall (UFW)

## 📦 Bước 2: Clone Repository và Deploy Tự Động

### 2.1. Clone repository (nếu chưa clone ở bước 1)

```bash
cd /var/www
git clone <your-repo-url> thuanchay-platform
cd thuanchay-platform
```

### 2.2. Chạy script deploy tự động

```bash
# Cấp quyền thực thi
chmod +x deploy-auto.sh

# Chạy deploy (thay sale.thuanchay.vn bằng domain của bạn)
sudo ./deploy-auto.sh sale.thuanchay.vn
```

Script sẽ tự động:
- ✅ Kiểm tra và cài đặt Node.js v24.11.1 (nếu chưa có)
- ✅ Cài đặt dependencies (`npm ci --production`)
- ✅ Build frontend (`npm run build`)
- ✅ Tạo thư mục logs
- ✅ Cấu hình và khởi động PM2
- ✅ Cấu hình Nginx
- ✅ Hỏi có muốn cài SSL không

### 2.3. Cài đặt SSL (nếu chưa làm trong script)

```bash
sudo certbot --nginx -d sale.thuanchay.vn
```

## ✅ Kiểm tra

```bash
# Kiểm tra PM2
pm2 status
pm2 logs thuanchay-api

# Kiểm tra Nginx
sudo systemctl status nginx
sudo nginx -t

# Kiểm tra website
curl http://localhost:3000/health
```

Truy cập từ trình duyệt:
- Website: `http://sale.thuanchay.vn` (hoặc `https://` nếu đã cài SSL)
- API: `http://sale.thuanchay.vn/api`
- Health: `http://sale.thuanchay.vn/health`

## 🔄 Cập nhật Code Mới

Khi có code mới trên GitHub:

```bash
cd /var/www/thuanchay-platform

# Pull code mới
git pull origin main

# Chạy lại deploy (sẽ tự động reload PM2)
sudo ./deploy-auto.sh sale.thuanchay.vn
```

Hoặc tạo alias để deploy nhanh hơn:

```bash
# Thêm vào ~/.bashrc hoặc ~/.zshrc
alias deploy='cd /var/www/thuanchay-platform && sudo ./deploy-auto.sh sale.thuanchay.vn'

# Sử dụng
deploy
```

## 🎯 Tạo Script Deploy Nhanh

Tạo file `deploy.sh` trong thư mục project:

```bash
#!/bin/bash
cd /var/www/thuanchay-platform
git pull origin main
sudo ./deploy-auto.sh sale.thuanchay.vn
```

Sử dụng:
```bash
chmod +x deploy.sh
./deploy.sh
```

## 🔧 Cấu hình Domain và DNS

### Cấu hình DNS

Đăng nhập vào quản lý domain và thêm A record:

```
Type: A
Host: sale (hoặc @ nếu là domain chính)
Value: [IP-VPS-CỦA-BẠN]
TTL: 3600
```

### Kiểm tra DNS

```bash
nslookup sale.thuanchay.vn
dig sale.thuanchay.vn
```

## 🐛 Troubleshooting

### Lỗi: Permission denied

```bash
# Đảm bảo quyền đúng
sudo chown -R $USER:$USER /var/www/thuanchay-platform
sudo chmod -R 755 /var/www/thuanchay-platform
```

### Lỗi: Node.js version không đúng

```bash
# Load NVM và sử dụng Node.js v24.11.1
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
nvm use 24.11.1
node --version
```

### Lỗi: PM2 không tìm thấy

```bash
# Cài đặt PM2 globally
npm install -g pm2
```

### Lỗi: Port 3000 đã được sử dụng

```bash
# Kiểm tra process đang dùng port 3000
sudo netstat -tlnp | grep 3000

# Kill process nếu cần
sudo kill -9 <PID>
```

### Lỗi: Nginx không reload được

```bash
# Kiểm tra config
sudo nginx -t

# Xem logs
sudo tail -f /var/log/nginx/error.log
```

## 📝 Các Lệnh Hữu Ích

### PM2 Commands

```bash
pm2 status                    # Xem trạng thái
pm2 logs thuanchay-api       # Xem logs
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
sudo systemctl status nginx    # Trạng thái
sudo tail -f /var/log/nginx/sale-thuanchay-error.log  # Xem logs lỗi
```

### Git Commands

```bash
git pull origin main           # Pull code mới
git status                     # Xem trạng thái
git log --oneline -10          # Xem 10 commit gần nhất
```

## 🔐 Bảo mật

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

Tạo script backup:

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

## ✅ Checklist

- [ ] VPS đã được setup với `setup-vps.sh`
- [ ] Repository đã được clone
- [ ] Deploy đã chạy thành công với `deploy-auto.sh`
- [ ] Nginx đã được cấu hình
- [ ] SSL đã được cài đặt (nếu cần)
- [ ] PM2 đã chạy và website hoạt động
- [ ] DNS đã được cấu hình và domain hoạt động

## 🎉 Hoàn thành!

Sau khi hoàn thành:

- ✅ Website: `https://sale.thuanchay.vn`
- ✅ API: `https://sale.thuanchay.vn/api`
- ✅ SSL/HTTPS đã được cấu hình
- ✅ Server tự động restart khi reboot
- ✅ Dễ dàng cập nhật: `git pull` + `./deploy-auto.sh`

## 📞 Hỗ trợ

Nếu gặp vấn đề:
1. Kiểm tra logs: `pm2 logs thuanchay-api`
2. Kiểm tra Nginx: `sudo tail -f /var/log/nginx/sale-thuanchay-error.log`
3. Kiểm tra system: `sudo journalctl -xe`

