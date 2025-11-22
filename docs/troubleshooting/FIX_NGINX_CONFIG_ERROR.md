# Hướng dẫn Fix Lỗi Nginx Config trên Ubuntu

Lỗi `cp: cannot create regular file /etc/nginx/sites-available/: no such file or directory` thường xảy ra khi:

## 🔍 Nguyên nhân

1. **Nginx chưa được cài đặt** - Thư mục `/etc/nginx/` không tồn tại
2. **Thiếu quyền sudo** - Không có quyền ghi vào `/etc/nginx/`
3. **File nguồn không tồn tại** - File `nginx-sale.thuanchay.vn.conf` không có trong project
4. **Đường dẫn sai** - Đang ở sai thư mục hoặc đường dẫn không đúng

## 🔧 Giải pháp

### Bước 1: Kiểm tra và cài đặt Nginx

```bash
# Kiểm tra Nginx đã được cài đặt chưa
which nginx
nginx -v

# Nếu chưa có, cài đặt Nginx
sudo apt update
sudo apt install -y nginx

# Kiểm tra Nginx đã được cài đặt
sudo systemctl status nginx
```

### Bước 2: Kiểm tra thư mục tồn tại

```bash
# Kiểm tra thư mục sites-available có tồn tại không
ls -la /etc/nginx/sites-available/

# Nếu không tồn tại, tạo thư mục (thường không cần vì Nginx tự tạo)
sudo mkdir -p /etc/nginx/sites-available
sudo mkdir -p /etc/nginx/sites-enabled
```

### Bước 3: Kiểm tra file nguồn

```bash
# Kiểm tra file config có tồn tại trong project không
ls -la /var/www/thuanchay-platform/nginx-sale.thuanchay.vn.conf

# Hoặc nếu đang ở trong thư mục project
cd /var/www/thuanchay-platform
ls -la nginx-sale.thuanchay.vn.conf

# Nếu file không tồn tại, kiểm tra:
# 1. Đã clone đầy đủ repository chưa
# 2. File có tên khác không: ls -la nginx*.conf
```

### Bước 4: Copy file với đầy đủ đường dẫn

```bash
# Đảm bảo đang ở đúng thư mục
cd /var/www/thuanchay-platform

# Kiểm tra file tồn tại
ls -la nginx-sale.thuanchay.vn.conf

# Copy với đường dẫn đầy đủ và sudo
sudo cp /var/www/thuanchay-platform/nginx-sale.thuanchay.vn.conf /etc/nginx/sites-available/sale.thuanchay.vn

# Hoặc sử dụng đường dẫn tương đối (nếu đang ở trong thư mục project)
sudo cp ./nginx-sale.thuanchay.vn.conf /etc/nginx/sites-available/sale.thuanchay.vn
```

### Bước 5: Tạo file config thủ công (Nếu file không tồn tại)

Nếu file `nginx-sale.thuanchay.vn.conf` không có trong project:

```bash
# Tạo file config mới
sudo nano /etc/nginx/sites-available/sale.thuanchay.vn
```

Copy nội dung sau:

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name sale.thuanchay.vn;
    
    access_log /var/log/nginx/sale-thuanchay-access.log;
    error_log /var/log/nginx/sale-thuanchay-error.log;
    
    client_max_body_size 50M;
    
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
        
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
    
    location /health {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
    }
    
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
    }
}
```

Lưu và thoát (Ctrl+X, Y, Enter).

## ✅ Kiểm tra sau khi copy

```bash
# Kiểm tra file đã được copy
ls -la /etc/nginx/sites-available/sale.thuanchay.vn

# Kiểm tra nội dung file
cat /etc/nginx/sites-available/sale.thuanchay.vn

# Kích hoạt site
sudo ln -s /etc/nginx/sites-available/sale.thuanchay.vn /etc/nginx/sites-enabled/

# Kiểm tra cấu hình
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

## 🐛 Troubleshooting

### Lỗi: Permission denied

```bash
# Đảm bảo sử dụng sudo
sudo cp /var/www/thuanchay-platform/nginx-sale.thuanchay.vn.conf /etc/nginx/sites-available/sale.thuanchay.vn

# Kiểm tra quyền
ls -la /etc/nginx/sites-available/
```

### Lỗi: File không tồn tại

```bash
# Kiểm tra file có trong project không
find /var/www/thuanchay-platform -name "nginx*.conf"

# Hoặc xem tất cả file .conf
ls -la /var/www/thuanchay-platform/*.conf

# Nếu không có, tạo file thủ công (xem Bước 5 ở trên)
```

### Lỗi: Thư mục không tồn tại

```bash
# Kiểm tra Nginx đã được cài đặt
dpkg -l | grep nginx

# Cài đặt Nginx nếu chưa có
sudo apt update
sudo apt install -y nginx

# Kiểm tra lại thư mục
ls -la /etc/nginx/
```

### Lỗi: Symbolic link đã tồn tại

```bash
# Xóa link cũ nếu có
sudo rm -f /etc/nginx/sites-enabled/sale.thuanchay.vn

# Tạo lại link
sudo ln -s /etc/nginx/sites-available/sale.thuanchay.vn /etc/nginx/sites-enabled/
```

## 📝 Checklist

Trước khi copy file config:

- [ ] Nginx đã được cài đặt (`sudo apt install -y nginx`)
- [ ] Thư mục `/etc/nginx/sites-available/` tồn tại
- [ ] File `nginx-sale.thuanchay.vn.conf` có trong project
- [ ] Đang sử dụng `sudo` khi copy
- [ ] Đường dẫn đúng (`/var/www/thuanchay-platform/`)

## 🔗 Tài liệu tham khảo

- [Nginx Configuration](https://nginx.org/en/docs/)
- [Nginx Server Blocks](https://www.nginx.com/resources/wiki/start/topics/examples/server_blocks/)


