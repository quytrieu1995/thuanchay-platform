# Hướng dẫn Deploy nhanh cho sale.thuanchay.vn

Hướng dẫn tóm tắt để deploy project lên VPS với domain **sale.thuanchay.vn**.

## 📋 Yêu cầu

- VPS Ubuntu/Debian với IP công khai
- Domain `thuanchay.vn` đã được quản lý
- Node.js 18+ đã cài đặt
- Quyền root/sudo

## 🚀 Các bước triển khai

### 1. Cấu hình DNS

Đăng nhập vào quản lý domain `thuanchay.vn` và thêm:

```
Type: A
Host: sale
Value: [IP-VPS-CỦA-BẠN]
TTL: 3600
```

Ví dụ: Nếu VPS IP là `123.456.789.012`, thêm record `sale` → `123.456.789.012`

### 2. Upload và cài đặt code

```bash
# Kết nối SSH vào VPS
ssh root@your-vps-ip

# Clone repository
cd /var/www
git clone <your-repo-url> thuanchay-platform
cd thuanchay-platform

# Cài đặt dependencies
npm install

# Build frontend
npm run build

# Tạo thư mục logs
mkdir -p logs
```

### 3. Cấu hình môi trường

```bash
# Tạo file .env
nano .env
```

Thêm nội dung:
```env
PORT=3000
NODE_ENV=production
VITE_API_BASE_URL=https://sale.thuanchay.vn/api
```

### 4. Cài đặt PM2 và Nginx

```bash
# Cài đặt PM2
sudo npm install -g pm2

# Cài đặt Nginx
sudo apt update
sudo apt install -y nginx
```

### 5. Cấu hình Nginx

```bash
# Đảm bảo Nginx đã được cài đặt
sudo apt update
sudo apt install -y nginx

# Kiểm tra Nginx đã được cài đặt
sudo systemctl status nginx

# Kiểm tra file config có tồn tại không
ls -la /var/www/thuanchay-platform/nginx-sale.thuanchay.vn.conf

# Copy file config có sẵn (đảm bảo có sudo)
sudo cp /var/www/thuanchay-platform/nginx-sale.thuanchay.vn.conf /etc/nginx/sites-available/sale.thuanchay.vn

# Hoặc nếu file không tồn tại, tạo file mới
sudo nano /etc/nginx/sites-available/sale.thuanchay.vn
# Copy nội dung từ nginx-sale.thuanchay.vn.conf

# Kích hoạt site
sudo ln -s /etc/nginx/sites-available/sale.thuanchay.vn /etc/nginx/sites-enabled/

# Xóa default site (tùy chọn)
sudo rm -f /etc/nginx/sites-enabled/default

# Kiểm tra cấu hình
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

### 6. Cài đặt SSL với Let's Encrypt

```bash
# Cài đặt Certbot và Nginx plugin
sudo apt update
sudo apt install -y certbot python3-certbot-nginx

# Kiểm tra plugin có sẵn
certbot plugins

# Lấy SSL certificate (tự động cấu hình)
sudo certbot --nginx -d sale.thuanchay.vn

# Hoặc non-interactive mode
sudo certbot --nginx -d sale.thuanchay.vn --non-interactive --agree-tos --email your-email@example.com --redirect

# Test auto-renewal
sudo certbot renew --dry-run
```

**⚠️ Nếu gặp lỗi:** "the requested nginx plugin does not appear to be installed"
- Xem hướng dẫn: [FIX_CERTBOT_NGINX_ERROR.md](./FIX_CERTBOT_NGINX_ERROR.md)

### 7. Chạy ứng dụng với PM2

```bash
cd /var/www/thuanchay-platform

# Chạy với PM2
pm2 start ecosystem.config.cjs --env production

# Lưu cấu hình để tự động khởi động khi reboot
pm2 save
pm2 startup
```

### 8. Kiểm tra

```bash
# Kiểm tra PM2
pm2 status

# Kiểm tra logs
pm2 logs thuanchay-api

# Kiểm tra từ trình duyệt
# Truy cập: https://sale.thuanchay.vn
# API: https://sale.thuanchay.vn/api/health
```

## ✅ Hoàn thành!

Sau khi hoàn thành, bạn có thể:

- ✅ Truy cập website: `https://sale.thuanchay.vn`
- ✅ API hoạt động: `https://sale.thuanchay.vn/api`
- ✅ SSL/HTTPS đã được cấu hình
- ✅ Server tự động restart khi reboot

## 🔄 Cập nhật code mới

```bash
cd /var/www/thuanchay-platform
git pull origin main
npm install
npm run build
pm2 reload thuanchay-api
```

## 🐛 Troubleshooting

### Kiểm tra DNS

```bash
nslookup sale.thuanchay.vn
dig sale.thuanchay.vn
```

### Kiểm tra Nginx

```bash
sudo nginx -t
sudo tail -f /var/log/nginx/sale-thuanchay-error.log
```

### Kiểm tra PM2

```bash
pm2 status
pm2 logs thuanchay-api
```

### Kiểm tra port 3000

```bash
sudo netstat -tlnp | grep 3000
curl http://localhost:3000/health
```

## 📞 Hỗ trợ

Nếu gặp vấn đề, xem file `HUONG_DAN_DEPLOY_DOMAIN.md` để có hướng dẫn chi tiết hơn.

