# Hướng dẫn Deploy Project và Cấu hình Domain

Hướng dẫn chi tiết để deploy project lên VPS và cấu hình domain để truy cập từ internet.

## 📋 Yêu cầu

- VPS/Server với Linux (Ubuntu/Debian khuyến nghị)
- Domain name đã mua
- Quyền root hoặc sudo trên VPS
- Node.js 18+ đã cài đặt

## 🚀 Bước 1: Chuẩn bị VPS

### 1.1. Kết nối SSH vào VPS

```bash
ssh root@your-vps-ip
# hoặc
ssh username@your-vps-ip
```

### 1.2. Cập nhật hệ thống

```bash
sudo apt update
sudo apt upgrade -y
```

### 1.3. Cài đặt Node.js (nếu chưa có)

```bash
# Cài đặt Node.js 20.x LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Kiểm tra version
node --version
npm --version
```

### 1.4. Cài đặt PM2 (Process Manager)

```bash
sudo npm install -g pm2
```

### 1.5. Cài đặt Nginx

```bash
sudo apt install -y nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

## 📦 Bước 2: Upload và Cài đặt Project

### 2.1. Upload code lên VPS

**Cách 1: Sử dụng Git (Khuyến nghị)**

```bash
# Cài đặt Git
sudo apt install -y git

# Clone repository
cd /var/www
sudo git clone <your-repository-url> thuanchay-platform
cd thuanchay-platform

# Hoặc nếu dùng SSH key
sudo git clone git@github.com:username/repo.git thuanchay-platform
```

**Cách 2: Upload qua SCP**

```bash
# Từ máy local
scp -r ./thuanchay-platform root@your-vps-ip:/var/www/
```

**Cách 3: Upload qua FTP/SFTP**

Sử dụng FileZilla hoặc WinSCP để upload toàn bộ thư mục project lên `/var/www/thuanchay-platform`

**⚠️ Lưu ý quan trọng về thư mục:**

Ubuntu mặc định chỉ cho phép truy cập web browser vào các file trong:
- `/var/www` và các thư mục con
- `/var/www/html` (document root mặc định)
- `/usr/share` (cho các ứng dụng web)

**Khuyến nghị:** Sử dụng `/var/www/thuanchay-platform` như trong hướng dẫn này để tránh các vấn đề về quyền truy cập.

**Nếu bạn muốn sử dụng thư mục khác (ví dụ: `/srv/thuanchay-platform`):**
- Với **Nginx**: Không có vấn đề, chỉ cần cấu hình đúng đường dẫn trong config
- Với **Apache**: Cần whitelist thư mục trong `/etc/apache2/apache2.conf` (xem phần Troubleshooting bên dưới)

### 2.2. Cài đặt dependencies

```bash
cd /var/www/thuanchay-platform
sudo npm install
```

### 2.3. Build frontend cho production

```bash
sudo npm run build
```

### 2.4. Tạo thư mục logs

```bash
mkdir -p logs
```

## ⚙️ Bước 3: Cấu hình và Chạy Server

### 3.1. Tạo file .env (tùy chọn)

```bash
nano .env
```

Thêm nội dung:
```env
PORT=3000
NODE_ENV=production
VITE_API_BASE_URL=https://your-domain.com/api
```

### 3.2. Chạy server với PM2

```bash
# Chạy với PM2
pm2 start ecosystem.config.cjs --env production

# Hoặc chạy trực tiếp
pm2 start npm --name "thuanchay-api" -- run start:prod

# Lưu cấu hình để tự động khởi động khi server reboot
pm2 save
pm2 startup
```

### 3.3. Kiểm tra server đã chạy

```bash
# Xem status
pm2 status

# Xem logs
pm2 logs thuanchay-api

# Kiểm tra API
curl http://localhost:3000/health
```

## 🌐 Bước 4: Cấu hình Domain và DNS

### 4.1. Cấu hình DNS tại nhà cung cấp domain

Đăng nhập vào tài khoản domain của bạn và thêm các DNS records:

**Type A Record:**
```
Host: @
Type: A
Value: your-vps-ip
TTL: 3600
```

**Type A Record cho www:**
```
Host: www
Type: A
Value: your-vps-ip
TTL: 3600
```

**Ví dụ:**
- Domain: `thuanchay.com`
- VPS IP: `123.456.789.012`
- Thêm A record: `@` → `123.456.789.012`
- Thêm A record: `www` → `123.456.789.012`

### 4.2. Kiểm tra DNS đã propagate

```bash
# Kiểm tra từ VPS
nslookup your-domain.com
dig your-domain.com

# Hoặc từ máy local
ping your-domain.com
```

**Lưu ý:** DNS có thể mất 5 phút đến 48 giờ để propagate hoàn toàn.

## 🔧 Bước 5: Cấu hình Nginx Reverse Proxy

### 5.1. Tạo file cấu hình Nginx

```bash
sudo nano /etc/nginx/sites-available/thuanchay-platform
```

Thêm nội dung sau (thay `your-domain.com` bằng domain của bạn):

```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    # Logs
    access_log /var/log/nginx/thuanchay-access.log;
    error_log /var/log/nginx/thuanchay-error.log;

    # Tăng kích thước upload
    client_max_body_size 50M;

    # API endpoints - proxy đến backend
    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Health check endpoint
    location /health {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
    }

    # Serve static files từ React build
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Cache static assets
        location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot)$ {
            proxy_pass http://localhost:3000;
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }
}
```

### 5.2. Kích hoạt site

```bash
# Tạo symbolic link
sudo ln -s /etc/nginx/sites-available/thuanchay-platform /etc/nginx/sites-enabled/

# Xóa default site (tùy chọn)
sudo rm /etc/nginx/sites-enabled/default

# Kiểm tra cấu hình Nginx
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

## 🔒 Bước 6: Cài đặt SSL/HTTPS với Let's Encrypt

### 6.1. Cài đặt Certbot

```bash
sudo apt install -y certbot python3-certbot-nginx
```

### 6.2. Lấy SSL Certificate

```bash
# Tự động cấu hình SSL cho Nginx
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# Hoặc chỉ lấy certificate (cấu hình thủ công)
sudo certbot certonly --nginx -d your-domain.com -d www.your-domain.com
```

Certbot sẽ:
- Tự động cấu hình Nginx để sử dụng HTTPS
- Tự động renew certificate mỗi 90 ngày

### 6.3. Kiểm tra auto-renewal

```bash
# Test renewal
sudo certbot renew --dry-run

# Kiểm tra timer
sudo systemctl status certbot.timer
```

### 6.4. Cập nhật cấu hình Nginx sau khi có SSL

Nginx sẽ tự động được cập nhật, nhưng bạn có thể kiểm tra:

```bash
sudo nano /etc/nginx/sites-available/thuanchay-platform
```

File sẽ có thêm phần SSL:

```nginx
server {
    listen 443 ssl http2;
    server_name your-domain.com www.your-domain.com;

    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;
    
    # SSL configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # ... rest of configuration
}

# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;
    return 301 https://$server_name$request_uri;
}
```

## 🔥 Bước 7: Cấu hình Firewall

### 7.1. Cấu hình UFW (Ubuntu Firewall)

```bash
# Cho phép SSH
sudo ufw allow 22/tcp

# Cho phép HTTP và HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Kích hoạt firewall
sudo ufw enable

# Kiểm tra status
sudo ufw status
```

**Lưu ý:** Không cần mở port 3000 vì chỉ Nginx truy cập localhost.

## ✅ Bước 8: Kiểm tra và Test

### 8.1. Kiểm tra từ trình duyệt

1. Mở trình duyệt và truy cập: `https://your-domain.com`
2. Kiểm tra API: `https://your-domain.com/api/health`
3. Kiểm tra frontend: `https://your-domain.com`

### 8.2. Kiểm tra logs

```bash
# PM2 logs
pm2 logs thuanchay-api

# Nginx logs
sudo tail -f /var/log/nginx/thuanchay-access.log
sudo tail -f /var/log/nginx/thuanchay-error.log

# System logs
sudo journalctl -u nginx -f
```

## 🔄 Bước 9: Cập nhật Code (Deploy mới)

Khi có code mới, deploy lại:

```bash
cd /var/www/thuanchay-platform

# Pull code mới
git pull origin main

# Cài đặt dependencies mới (nếu có)
npm install

# Build lại frontend
npm run build

# Restart PM2
pm2 restart thuanchay-api

# Hoặc reload (zero downtime)
pm2 reload thuanchay-api
```

## 📝 Các lệnh hữu ích

### PM2 Commands

```bash
# Xem status
pm2 status

# Xem logs
pm2 logs thuanchay-api

# Restart
pm2 restart thuanchay-api

# Stop
pm2 stop thuanchay-api

# Delete
pm2 delete thuanchay-api

# Monitor
pm2 monit

# Xem thông tin chi tiết
pm2 show thuanchay-api
```

### Nginx Commands

```bash
# Kiểm tra cấu hình
sudo nginx -t

# Reload (không downtime)
sudo systemctl reload nginx

# Restart
sudo systemctl restart nginx

# Status
sudo systemctl status nginx
```

### Database Backup

```bash
# Backup database
cp /var/www/thuanchay-platform/server/database/thuanchay.db \
   /var/www/thuanchay-platform/server/database/thuanchay.db.backup.$(date +%Y%m%d)

# Restore database
cp /var/www/thuanchay-platform/server/database/thuanchay.db.backup.20240101 \
   /var/www/thuanchay-platform/server/database/thuanchay.db
```

## 🐛 Troubleshooting

### Lỗi: Cannot connect to server

```bash
# Kiểm tra PM2
pm2 status

# Kiểm tra port 3000
sudo netstat -tlnp | grep 3000

# Kiểm tra logs
pm2 logs thuanchay-api
```

### Lỗi: 502 Bad Gateway

```bash
# Kiểm tra backend có chạy không
curl http://localhost:3000/health

# Kiểm tra Nginx config
sudo nginx -t

# Kiểm tra logs Nginx
sudo tail -f /var/log/nginx/thuanchay-error.log
```

### Lỗi: Domain không resolve

```bash
# Kiểm tra DNS
nslookup your-domain.com
dig your-domain.com

# Kiểm tra DNS propagation
# https://www.whatsmydns.net/
```

### Lỗi: SSL Certificate không hoạt động

```bash
# Kiểm tra certificate
sudo certbot certificates

# Renew certificate
sudo certbot renew

# Reload Nginx
sudo systemctl reload nginx
```

### Lỗi: Permission denied hoặc Forbidden (403)

**Nếu sử dụng Apache và deploy ở thư mục ngoài /var/www:**

Ubuntu Apache mặc định chỉ cho phép truy cập vào `/var/www`, `/var/www/html`, và `/usr/share`. Nếu bạn deploy ở thư mục khác (như `/srv`), cần whitelist:

```bash
# Mở file cấu hình Apache
sudo nano /etc/apache2/apache2.conf

# Thêm vào cuối file (thay /srv/thuanchay-platform bằng đường dẫn của bạn):
<Directory /srv/thuanchay-platform>
    Options Indexes FollowSymLinks
    AllowOverride None
    Require all granted
</Directory>

# Restart Apache
sudo systemctl restart apache2
```

**Kiểm tra quyền truy cập thư mục:**

```bash
# Đảm bảo thư mục có quyền đọc
sudo chmod -R 755 /var/www/thuanchay-platform

# Đảm bảo owner đúng (thay www-data bằng user của bạn)
sudo chown -R www-data:www-data /var/www/thuanchay-platform

# Hoặc với Nginx
sudo chown -R www-data:www-data /var/www/thuanchay-platform
```

**Kiểm tra quyền file:**

```bash
# Kiểm tra quyền hiện tại
ls -la /var/www/thuanchay-platform

# Sửa quyền nếu cần
sudo chmod -R 644 /var/www/thuanchay-platform/dist/*
sudo find /var/www/thuanchay-platform/dist -type d -exec chmod 755 {} \;
```

## 🌐 Phụ lục: Sử dụng Apache thay vì Nginx

Nếu bạn muốn sử dụng Apache thay vì Nginx:

### Cài đặt Apache

```bash
sudo apt install -y apache2
sudo systemctl start apache2
sudo systemctl enable apache2
```

### Cấu hình Virtual Host cho Apache

```bash
sudo nano /etc/apache2/sites-available/thuanchay-platform.conf
```

Thêm nội dung:

```apache
<VirtualHost *:80>
    ServerName your-domain.com
    ServerAlias www.your-domain.com
    
    # Document root (nếu serve static files trực tiếp)
    # DocumentRoot /var/www/thuanchay-platform/dist
    
    # Proxy đến Node.js backend
    ProxyPreserveHost On
    ProxyPass /api http://localhost:3000/api
    ProxyPassReverse /api http://localhost:3000/api
    
    ProxyPass / http://localhost:3000/
    ProxyPassReverse / http://localhost:3000/
    
    # Logs
    ErrorLog ${APACHE_LOG_DIR}/thuanchay-error.log
    CustomLog ${APACHE_LOG_DIR}/thuanchay-access.log combined
</VirtualHost>
```

Kích hoạt site và modules:

```bash
# Enable required modules
sudo a2enmod proxy
sudo a2enmod proxy_http
sudo a2enmod rewrite

# Enable site
sudo a2ensite thuanchay-platform.conf

# Disable default site (tùy chọn)
sudo a2dissite 000-default.conf

# Test config
sudo apache2ctl configtest

# Restart Apache
sudo systemctl restart apache2
```

### Cấu hình SSL với Apache

```bash
sudo apt install -y certbot python3-certbot-apache
sudo certbot --apache -d your-domain.com -d www.your-domain.com
```

## 🔐 Bảo mật bổ sung

### 1. Cập nhật hệ thống định kỳ

```bash
sudo apt update && sudo apt upgrade -y
```

### 2. Cấu hình fail2ban (chống brute force)

```bash
sudo apt install -y fail2ban
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

### 3. Tắt root login SSH (tùy chọn)

```bash
sudo nano /etc/ssh/sshd_config
# Đặt: PermitRootLogin no
sudo systemctl restart sshd
```

### 4. Backup định kỳ

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

## 📊 Monitoring

### Cài đặt PM2 Monitoring (tùy chọn)

```bash
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
```

## 🎉 Hoàn thành!

Sau khi hoàn thành các bước trên, bạn có thể:

- ✅ Truy cập website từ internet: `https://your-domain.com`
- ✅ API hoạt động tại: `https://your-domain.com/api`
- ✅ SSL/HTTPS đã được cấu hình
- ✅ Server tự động restart khi reboot
- ✅ Database tự động được tạo và quản lý

## 📞 Hỗ trợ

Nếu gặp vấn đề, kiểm tra:
1. PM2 logs: `pm2 logs thuanchay-api`
2. Nginx logs: `sudo tail -f /var/log/nginx/thuanchay-error.log`
3. System logs: `sudo journalctl -xe`

