# Quick Deploy Guide

Hướng dẫn nhanh để deploy sau khi clone trên VPS Ubuntu.

## ⚡ 3 Bước Deploy

### Bước 1: Setup VPS (Chạy một lần)

```bash
cd /var/www
git clone <your-repo-url> thuanchay-platform
cd thuanchay-platform
chmod +x setup-vps.sh deploy-auto.sh
sudo ./setup-vps.sh sale.thuanchay.vn
```

### Bước 2: Deploy

```bash
sudo ./deploy-auto.sh sale.thuanchay.vn
```

### Bước 3: Cài SSL (Tùy chọn)

```bash
sudo certbot --nginx -d sale.thuanchay.vn
```

## ✅ Xong!

Website sẽ chạy tại: `https://sale.thuanchay.vn`

## 🔄 Cập nhật Code Mới

```bash
cd /var/www/thuanchay-platform
git pull origin main
sudo ./deploy-auto.sh sale.thuanchay.vn
```

## 📖 Xem hướng dẫn chi tiết

Xem file `HUONG_DAN_DEPLOY_TU_DONG.md` để có hướng dẫn đầy đủ.

