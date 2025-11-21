# Quick Start - GitHub Auto Deploy

## 🚀 Setup nhanh cho Auto Deploy từ GitHub

### Bước 1: Setup VPS (Chạy trên VPS)

```bash
# Upload file setup-vps-github.sh lên VPS
scp setup-vps-github.sh root@your-vps-ip:/tmp/

# SSH vào VPS
ssh root@your-vps-ip

# Chạy script setup
cd /tmp
chmod +x setup-vps-github.sh
sudo ./setup-vps-github.sh deploy
```

**Lưu lại SSH Private Key** được hiển thị trong output.

### Bước 2: Cấu hình GitHub Secrets

Vào **GitHub Repository** → **Settings** → **Secrets and variables** → **Actions**

Thêm các secrets:

- `VPS_HOST`: IP VPS của bạn
- `VPS_USER`: `deploy`
- `VPS_PORT`: `22` (hoặc port SSH của bạn)
- `VPS_SSH_KEY`: SSH Private Key từ bước 1

### Bước 3: Push code lên GitHub

```bash
git add .
git commit -m "Setup auto deploy"
git push origin main
```

### Bước 4: Kiểm tra

1. Vào tab **Actions** trên GitHub để xem workflow chạy
2. Sau khi thành công, website sẽ tự động cập nhật

## 📖 Xem hướng dẫn chi tiết

Xem file `HUONG_DAN_GITHUB_DEPLOY.md` để có hướng dẫn đầy đủ.

## ✅ Sau khi setup

Mỗi lần bạn push code lên GitHub:
- ✅ Tự động build với Node.js v24.11.1
- ✅ Tự động deploy lên VPS
- ✅ Tự động reload PM2 (zero downtime)

