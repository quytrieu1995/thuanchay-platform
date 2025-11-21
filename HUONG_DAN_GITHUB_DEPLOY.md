# Hướng dẫn Setup GitHub Auto Deploy với Node.js v24.11.1

Hướng dẫn chi tiết để setup tự động deploy từ GitHub lên VPS Ubuntu khi push code.

## 📋 Yêu cầu

- VPS Ubuntu 20.04+ hoặc Debian 11+
- GitHub repository
- Quyền root/sudo trên VPS
- Domain đã cấu hình DNS (tùy chọn)

## 🚀 Bước 1: Setup VPS

### 1.1. Kết nối SSH vào VPS

```bash
ssh root@your-vps-ip
```

### 1.2. Upload và chạy script setup

```bash
# Upload script setup-vps-github.sh lên VPS
# Hoặc clone repository và chạy script

cd /tmp
# Upload file setup-vps-github.sh lên VPS bằng SCP hoặc tạo trực tiếp

# Cấp quyền thực thi
chmod +x setup-vps-github.sh

# Chạy script (tạo user 'deploy')
sudo ./setup-vps-github.sh deploy
```

Script sẽ tự động:
- ✅ Cài đặt NVM và Node.js v24.11.1
- ✅ Cài đặt PM2
- ✅ Cài đặt Nginx
- ✅ Tạo user `deploy` cho GitHub Actions
- ✅ Tạo SSH key cho GitHub Actions
- ✅ Cấu hình sudo permissions

### 1.3. Lưu thông tin SSH Key

Script sẽ hiển thị SSH Private Key. **Lưu lại** để thêm vào GitHub Secrets.

## 🔐 Bước 2: Cấu hình GitHub Secrets

### 2.1. Vào GitHub Repository Settings

1. Mở repository trên GitHub
2. Vào **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**

### 2.2. Thêm các Secrets sau:

**VPS_HOST**
```
Name: VPS_HOST
Value: [IP-VPS-CỦA-BẠN]
Ví dụ: 123.456.789.012
```

**VPS_USER**
```
Name: VPS_USER
Value: deploy
```

**VPS_PORT** (tùy chọn, mặc định 22)
```
Name: VPS_PORT
Value: 22
```

**VPS_SSH_KEY**
```
Name: VPS_SSH_KEY
Value: [SSH Private Key từ script setup]
```

Để lấy SSH Private Key:
```bash
# Trên VPS
sudo cat /home/deploy/.ssh/id_rsa
```

Copy toàn bộ nội dung (bao gồm `-----BEGIN OPENSSH PRIVATE KEY-----` và `-----END OPENSSH PRIVATE KEY-----`)

## 📦 Bước 3: Push code lên GitHub

### 3.1. Khởi tạo Git repository (nếu chưa có)

```bash
# Trên máy local
cd thuanchay-platform

# Khởi tạo git
git init

# Thêm remote
git remote add origin https://github.com/your-username/thuanchay-platform.git

# Thêm tất cả files
git add .

# Commit
git commit -m "Initial commit"

# Push lên GitHub
git push -u origin main
```

### 3.2. Kiểm tra .gitignore

Đảm bảo file `.gitignore` có các mục sau:

```
node_modules/
dist/
.env
.env.local
*.log
logs/
.DS_Store
server/database/*.db
server/database/*.db-journal
```

## 🔄 Bước 4: Kiểm tra Auto Deploy

### 4.1. Push code mới

```bash
git add .
git commit -m "Update code"
git push origin main
```

### 4.2. Kiểm tra GitHub Actions

1. Vào tab **Actions** trên GitHub
2. Xem workflow **Deploy to VPS** đang chạy
3. Click vào workflow để xem chi tiết

### 4.3. Kiểm tra trên VPS

```bash
# SSH vào VPS
ssh deploy@your-vps-ip

# Kiểm tra code đã được deploy
ls -la /var/www/thuanchay-platform

# Kiểm tra PM2
pm2 status
pm2 logs thuanchay-api
```

## ⚙️ Bước 5: Cấu hình Nginx và SSL (Lần đầu)

### 5.1. Cấu hình Nginx

```bash
# SSH vào VPS với quyền root
ssh root@your-vps-ip

# Copy file config
cp /var/www/thuanchay-platform/nginx-sale.thuanchay.vn.conf \
   /etc/nginx/sites-available/sale.thuanchay.vn

# Kích hoạt site
ln -s /etc/nginx/sites-available/sale.thuanchay.vn \
      /etc/nginx/sites-enabled/

# Xóa default site
rm /etc/nginx/sites-enabled/default

# Kiểm tra config
nginx -t

# Reload Nginx
systemctl reload nginx
```

### 5.2. Cài đặt SSL

```bash
# Cài đặt Certbot
apt install -y certbot python3-certbot-nginx

# Lấy SSL certificate
certbot --nginx -d sale.thuanchay.vn

# Test auto-renewal
certbot renew --dry-run
```

### 5.3. Chạy PM2 lần đầu

```bash
# SSH với user deploy
ssh deploy@your-vps-ip

cd /var/www/thuanchay-platform

# Cài đặt dependencies
npm ci --production

# Khởi động PM2
pm2 start ecosystem.config.cjs --env production

# Lưu cấu hình
pm2 save
pm2 startup
```

## 🔄 Quy trình Auto Deploy

Sau khi setup xong, mỗi khi bạn:

1. **Push code lên GitHub:**
   ```bash
   git add .
   git commit -m "Your message"
   git push origin main
   ```

2. **GitHub Actions tự động:**
   - ✅ Checkout code
   - ✅ Setup Node.js v24.11.1
   - ✅ Install dependencies
   - ✅ Build project
   - ✅ Deploy lên VPS
   - ✅ Chạy npm ci trên VPS
   - ✅ Reload PM2

3. **Website tự động cập nhật** ✨

## 🐛 Troubleshooting

### Lỗi: Permission denied khi deploy

```bash
# Kiểm tra quyền thư mục
sudo chown -R deploy:deploy /var/www/thuanchay-platform
sudo chmod -R 755 /var/www/thuanchay-platform
```

### Lỗi: Node.js version không đúng

```bash
# Trên VPS, kiểm tra Node.js
ssh deploy@your-vps-ip
source ~/.nvm/nvm.sh
nvm use 24.11.1
node --version
```

### Lỗi: PM2 không tìm thấy

```bash
# Cài đặt PM2 globally cho user deploy
ssh deploy@your-vps-ip
source ~/.nvm/nvm.sh
npm install -g pm2
```

### Lỗi: GitHub Actions không kết nối được VPS

1. Kiểm tra SSH key trong GitHub Secrets
2. Kiểm tra VPS_HOST và VPS_USER đúng chưa
3. Kiểm tra firewall cho phép port 22

```bash
# Kiểm tra SSH connection
ssh -i /path/to/private/key deploy@your-vps-ip
```

### Lỗi: Build failed trên GitHub Actions

- Kiểm tra Node.js version trong workflow
- Kiểm tra dependencies trong package.json
- Xem logs trong GitHub Actions tab

## 📝 Cấu trúc GitHub Actions Workflow

File `.github/workflows/deploy.yml` sẽ:

1. **Trigger:** Khi push lên `main` branch
2. **Build:** Build project với Node.js v24.11.1
3. **Deploy:** Copy files lên VPS qua SCP
4. **Restart:** Chạy npm ci và reload PM2 trên VPS

## 🔐 Bảo mật

### Best Practices:

1. ✅ **Không commit** `.env` file
2. ✅ **Sử dụng GitHub Secrets** cho sensitive data
3. ✅ **Tạo user riêng** cho deploy (không dùng root)
4. ✅ **Giới hạn sudo permissions** cho deploy user
5. ✅ **Sử dụng SSH keys** thay vì password

### Rotate SSH Keys:

```bash
# Tạo SSH key mới
ssh-keygen -t rsa -b 4096 -f ~/.ssh/id_rsa_new

# Cập nhật authorized_keys
cat ~/.ssh/id_rsa_new.pub >> ~/.ssh/authorized_keys

# Cập nhật GitHub Secret với key mới
```

## ✅ Checklist Setup

- [ ] VPS đã được setup với script `setup-vps-github.sh`
- [ ] GitHub Secrets đã được thêm (VPS_HOST, VPS_USER, VPS_SSH_KEY)
- [ ] Code đã được push lên GitHub
- [ ] GitHub Actions workflow đã chạy thành công
- [ ] Nginx đã được cấu hình
- [ ] SSL đã được cài đặt
- [ ] PM2 đã chạy và website hoạt động

## 🎉 Hoàn thành!

Sau khi setup xong:

- ✅ Mỗi lần push code → Tự động deploy
- ✅ Zero downtime với PM2 reload
- ✅ Node.js v24.11.1 trên cả GitHub Actions và VPS
- ✅ Tự động build và deploy

## 📞 Hỗ trợ

Nếu gặp vấn đề:
1. Kiểm tra logs trong GitHub Actions
2. Kiểm tra logs trên VPS: `pm2 logs thuanchay-api`
3. Kiểm tra Nginx: `sudo tail -f /var/log/nginx/sale-thuanchay-error.log`

