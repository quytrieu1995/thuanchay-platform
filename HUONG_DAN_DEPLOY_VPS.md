# Hướng dẫn Deploy lên VPS

Hệ thống sẽ tự động tạo database và kết nối backend khi chạy trên VPS.

## 📌 Quick Links

- **Deploy cơ bản**: Xem hướng dẫn bên dưới
- **Cấu hình Domain và SSL**: Xem [HUONG_DAN_DEPLOY_DOMAIN.md](./HUONG_DAN_DEPLOY_DOMAIN.md)
- **Script tự động deploy**: Sử dụng `deploy.sh` hoặc `setup-domain.sh`

## Yêu cầu hệ thống

- Node.js 18+ (khuyến nghị LTS)
- npm hoặc yarn
- Linux/Windows Server

## Các bước deploy

### 1. Upload code lên VPS

```bash
# Sử dụng git
git clone <repository-url>
cd thuanchay-platform

# Hoặc upload qua FTP/SFTP
```

### 2. Cài đặt dependencies

```bash
npm install
```

### 3. Chạy server

#### Cách 1: Sử dụng script tự động (Khuyến nghị)

**Linux/Mac:**
```bash
chmod +x start-server.sh
./start-server.sh
```

**Windows:**
```cmd
start-server.bat
```

#### Cách 2: Chạy thủ công

**Development mode:**
```bash
npm run server
```

**Production mode:**
```bash
NODE_ENV=production npm run start:prod
```

### 4. Kiểm tra server

- Backend API: http://your-vps-ip:3000/api
- Health check: http://your-vps-ip:3000/health
- Frontend (production): http://your-vps-ip:3000

## Cấu hình môi trường

Tạo file `.env` trong thư mục gốc (tùy chọn):

```env
PORT=3000
NODE_ENV=production
VITE_API_BASE_URL=http://your-vps-ip:3000/api
```

## Database

- Database SQLite sẽ tự động được tạo tại `server/database/thuanchay.db`
- Khi chạy lần đầu, hệ thống sẽ tự động:
  - Tạo các bảng cần thiết
  - Insert dữ liệu mẫu (products, customers, orders)

## Chạy với PM2 (Khuyến nghị cho production)

### Cài đặt PM2:
```bash
npm install -g pm2
```

### Chạy với PM2:
```bash
# Development
pm2 start npm --name "thuanchay-api" -- run server

# Production
pm2 start npm --name "thuanchay-api" -- run start:prod

# Xem logs
pm2 logs thuanchay-api

# Restart
pm2 restart thuanchay-api

# Stop
pm2 stop thuanchay-api
```

### Tự động khởi động lại khi server reboot:
```bash
pm2 startup
pm2 save
```

## Chạy với Nginx (Reverse Proxy)

Cấu hình Nginx để proxy requests:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## Firewall

Mở port 3000 (hoặc port bạn đã cấu hình):

```bash
# Ubuntu/Debian
sudo ufw allow 3000/tcp

# CentOS/RHEL
sudo firewall-cmd --permanent --add-port=3000/tcp
sudo firewall-cmd --reload
```

## Backup Database

Database SQLite nằm tại `server/database/thuanchay.db`. Để backup:

```bash
# Backup database
cp server/database/thuanchay.db server/database/thuanchay.db.backup

# Hoặc tạo script backup tự động
```

## Troubleshooting

### Lỗi port đã được sử dụng:
```bash
# Tìm process đang dùng port 3000
lsof -i :3000  # Linux/Mac
netstat -ano | findstr :3000  # Windows

# Kill process
kill -9 <PID>  # Linux/Mac
taskkill /PID <PID> /F  # Windows
```

### Lỗi quyền truy cập database:
```bash
# Đảm bảo thư mục database có quyền ghi
chmod 755 server/database
```

### Kiểm tra logs:
```bash
# Xem logs của server
pm2 logs thuanchay-api

# Hoặc nếu chạy trực tiếp
npm run server
```

## API Endpoints

Sau khi deploy, các API endpoints sẽ có sẵn:

- `GET /api/products` - Lấy danh sách sản phẩm
- `POST /api/products` - Tạo sản phẩm mới
- `GET /api/orders` - Lấy danh sách đơn hàng
- `POST /api/orders` - Tạo đơn hàng mới
- `GET /api/customers` - Lấy danh sách khách hàng
- `POST /api/customers` - Tạo khách hàng mới
- `GET /api/returns` - Lấy danh sách đơn trả hàng
- `POST /api/auth/login` - Đăng nhập

Xem chi tiết tại `API_DOCUMENTATION.md`

