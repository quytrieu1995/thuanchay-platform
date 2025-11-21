# 🚀 Quick Start Guide

Hướng dẫn nhanh để chạy project và cấu hình domain.

## 📋 Mục lục

1. [Chạy project local](#chạy-project-local)
2. [Deploy lên VPS](#deploy-lên-vps)
3. [Cấu hình Domain](#cấu-hình-domain)

---

## 💻 Chạy project local

### Bước 1: Cài đặt dependencies

```bash
npm install
```

### Bước 2: Chạy backend server

```bash
npm run server
```

Backend sẽ tự động:
- ✅ Tạo database SQLite
- ✅ Tạo các bảng cần thiết
- ✅ Insert dữ liệu mẫu
- ✅ Chạy tại `http://localhost:3000`

### Bước 3: Chạy frontend (terminal khác)

```bash
npm run dev
```

Frontend chạy tại: `http://localhost:5173`

---

## 🖥️ Deploy lên VPS

### Cách 1: Script tự động (Khuyến nghị)

```bash
# Upload code lên VPS
scp -r ./thuanchay-platform root@your-vps-ip:/var/www/

# SSH vào VPS
ssh root@your-vps-ip

# Chạy script deploy
cd /var/www/thuanchay-platform
chmod +x deploy.sh
sudo ./deploy.sh your-domain.com
```

### Cách 2: Thủ công

Xem chi tiết tại: [HUONG_DAN_DEPLOY_VPS.md](./HUONG_DAN_DEPLOY_VPS.md)

---

## 🌐 Cấu hình Domain

### Bước 1: Cấu hình DNS

Đăng nhập vào tài khoản domain và thêm:

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

### Bước 2: Chạy script setup domain

```bash
# Trên VPS
chmod +x setup-domain.sh
sudo ./setup-domain.sh your-domain.com
```

Script sẽ tự động:
- ✅ Cấu hình Nginx
- ✅ Lấy SSL certificate từ Let's Encrypt
- ✅ Cấu hình HTTPS
- ✅ Setup auto-renewal SSL

### Bước 3: Kiểm tra

Mở trình duyệt:
- Website: `https://your-domain.com`
- API: `https://your-domain.com/api/health`

---

## 📝 Checklist Deploy

- [ ] VPS đã cài Node.js 18+
- [ ] Code đã upload lên VPS
- [ ] Dependencies đã cài đặt (`npm install`)
- [ ] Frontend đã build (`npm run build`)
- [ ] PM2 đã cài và server đã chạy
- [ ] Nginx đã cài và cấu hình
- [ ] DNS đã trỏ về VPS IP
- [ ] SSL certificate đã cài đặt
- [ ] Firewall đã mở port 80, 443
- [ ] Website truy cập được từ internet

---

## 🔧 Các lệnh thường dùng

### PM2

```bash
# Xem status
pm2 status

# Xem logs
pm2 logs thuanchay-api

# Restart
pm2 restart thuanchay-api

# Stop
pm2 stop thuanchay-api
```

### Nginx

```bash
# Kiểm tra config
sudo nginx -t

# Reload
sudo systemctl reload nginx

# Xem logs
sudo tail -f /var/log/nginx/thuanchay-error.log
```

### Database

```bash
# Backup
cp server/database/thuanchay.db server/database/thuanchay.db.backup

# Restore
cp server/database/thuanchay.db.backup server/database/thuanchay.db
```

---

## 🐛 Troubleshooting

### Lỗi: Cannot connect

```bash
# Kiểm tra PM2
pm2 status

# Kiểm tra backend
curl http://localhost:3000/health

# Kiểm tra Nginx
sudo nginx -t
```

### Lỗi: 502 Bad Gateway

```bash
# Kiểm tra backend có chạy không
pm2 logs thuanchay-api

# Kiểm tra Nginx logs
sudo tail -f /var/log/nginx/thuanchay-error.log
```

### Lỗi: Domain không resolve

```bash
# Kiểm tra DNS
nslookup your-domain.com
dig your-domain.com
```

---

## 📚 Tài liệu chi tiết

- [HUONG_DAN_DEPLOY_VPS.md](./HUONG_DAN_DEPLOY_VPS.md) - Hướng dẫn deploy cơ bản
- [HUONG_DAN_DEPLOY_DOMAIN.md](./HUONG_DAN_DEPLOY_DOMAIN.md) - Hướng dẫn cấu hình domain và SSL
- [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) - Tài liệu API

---

## 💡 Tips

1. **Luôn backup database** trước khi deploy code mới
2. **Test trên local** trước khi deploy lên production
3. **Monitor logs** thường xuyên để phát hiện lỗi sớm
4. **Setup auto-backup** cho database
5. **Cập nhật hệ thống** định kỳ: `sudo apt update && sudo apt upgrade`

---

## 🎉 Hoàn thành!

Sau khi hoàn thành, bạn có thể:
- ✅ Truy cập website từ bất kỳ đâu: `https://your-domain.com`
- ✅ API hoạt động: `https://your-domain.com/api`
- ✅ SSL/HTTPS đã được cấu hình
- ✅ Server tự động restart khi reboot

