# Hướng dẫn Fix Lỗi Certbot Nginx Plugin

Lỗi `the requested nginx plugin does not appear to be installed` xảy ra khi Certbot không tìm thấy plugin Nginx.

## 🔍 Nguyên nhân

1. **Plugin chưa được cài đặt** - `python3-certbot-nginx` chưa được cài
2. **Certbot cài từ nguồn khác** - Certbot được cài từ pip hoặc snap nhưng thiếu plugin
3. **Python version không tương thích** - Python version không hỗ trợ plugin
4. **Nginx chưa được cài đặt** - Nginx cần có trước khi cài plugin

## 🔧 Giải pháp

### Giải pháp 1: Cài đặt đầy đủ Certbot và Nginx Plugin (Khuyến nghị)

```bash
# Cài đặt Nginx trước (nếu chưa có)
sudo apt update
sudo apt install -y nginx

# Cài đặt Certbot và Nginx plugin từ Ubuntu repository
sudo apt install -y certbot python3-certbot-nginx

# Kiểm tra Certbot đã được cài đặt
certbot --version

# Kiểm tra plugin có sẵn
certbot plugins
```

Bạn sẽ thấy `nginx` trong danh sách plugins.

### Giải pháp 2: Cài đặt lại Certbot

Nếu Certbot đã được cài nhưng thiếu plugin:

```bash
# Gỡ Certbot cũ (nếu cài từ pip hoặc snap)
sudo pip3 uninstall certbot
sudo snap remove certbot

# Cài đặt lại từ Ubuntu repository
sudo apt update
sudo apt install -y certbot python3-certbot-nginx

# Kiểm tra
certbot --version
certbot plugins
```

### Giải pháp 3: Cài đặt từ Snap (Alternative)

```bash
# Cài đặt Certbot từ snap (bao gồm cả nginx plugin)
sudo snap install --classic certbot

# Tạo symlink
sudo ln -s /snap/bin/certbot /usr/bin/certbot

# Kiểm tra
certbot --version
certbot plugins
```

### Giải pháp 4: Sử dụng Standalone mode (Nếu không cần auto-config)

Nếu không thể cài plugin, sử dụng standalone mode:

```bash
# Dừng Nginx tạm thời
sudo systemctl stop nginx

# Chạy Certbot với standalone mode
sudo certbot certonly --standalone -d sale.thuanchay.vn

# Khởi động lại Nginx
sudo systemctl start nginx

# Cấu hình Nginx thủ công để sử dụng certificate
sudo nano /etc/nginx/sites-available/sale.thuanchay.vn
```

Thêm SSL config vào file Nginx:

```nginx
server {
    listen 443 ssl http2;
    server_name sale.thuanchay.vn;
    
    ssl_certificate /etc/letsencrypt/live/sale.thuanchay.vn/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/sale.thuanchay.vn/privkey.pem;
    
    # ... rest of config
}

server {
    listen 80;
    server_name sale.thuanchay.vn;
    return 301 https://$server_name$request_uri;
}
```

## ✅ Kiểm tra sau khi cài đặt

```bash
# Kiểm tra Certbot version
certbot --version

# Kiểm tra plugins có sẵn
certbot plugins

# Bạn sẽ thấy output như:
# * nginx
#   Description: Nginx Web Server plugin
#   Interfaces: IAuthenticator, IInstaller
#   Entry point: nginx = certbot_nginx._internal.configurator:Configurator
```

## 🚀 Sử dụng Certbot với Nginx Plugin

Sau khi cài đặt thành công:

```bash
# Chạy Certbot với nginx plugin
sudo certbot --nginx -d sale.thuanchay.vn

# Hoặc với nhiều domain
sudo certbot --nginx -d sale.thuanchay.vn -d www.sale.thuanchay.vn

# Non-interactive mode (cho scripts)
sudo certbot --nginx -d sale.thuanchay.vn --non-interactive --agree-tos --email your-email@example.com
```

Certbot sẽ tự động:
- ✅ Lấy SSL certificate
- ✅ Cấu hình Nginx để sử dụng SSL
- ✅ Tự động redirect HTTP → HTTPS
- ✅ Cấu hình auto-renewal

## 🐛 Troubleshooting

### Lỗi: Package not found

```bash
# Cập nhật package list
sudo apt update

# Cài đặt từ universe repository
sudo apt install -y software-properties-common
sudo add-apt-repository universe
sudo apt update
sudo apt install -y certbot python3-certbot-nginx
```

### Lỗi: Python version không tương thích

```bash
# Kiểm tra Python version
python3 --version

# Nên là Python 3.6+ cho Ubuntu 18.04+
# Nếu version cũ, cập nhật:
sudo apt update
sudo apt install -y python3 python3-pip
```

### Lỗi: Nginx không được tìm thấy

```bash
# Đảm bảo Nginx đã được cài đặt
sudo apt install -y nginx

# Kiểm tra Nginx đang chạy
sudo systemctl status nginx

# Kiểm tra cấu hình Nginx
sudo nginx -t
```

### Lỗi: Permission denied

```bash
# Đảm bảo sử dụng sudo
sudo certbot --nginx -d sale.thuanchay.vn

# Kiểm tra quyền thư mục
ls -la /etc/letsencrypt/
```

### Lỗi: Plugin vẫn không hoạt động sau khi cài

```bash
# Xóa cache và cài lại
sudo apt remove --purge certbot python3-certbot-nginx
sudo apt autoremove
sudo apt update
sudo apt install -y certbot python3-certbot-nginx

# Kiểm tra lại
certbot plugins
```

## 📝 Cấu hình Auto-renewal

Sau khi cài SSL thành công, kiểm tra auto-renewal:

```bash
# Test renewal
sudo certbot renew --dry-run

# Kiểm tra timer
sudo systemctl status certbot.timer

# Enable timer (nếu chưa enable)
sudo systemctl enable certbot.timer
sudo systemctl start certbot.timer
```

## 🔄 Renewal Manual (Nếu cần)

Nếu auto-renewal không hoạt động:

```bash
# Renew certificate thủ công
sudo certbot renew

# Hoặc renew cho domain cụ thể
sudo certbot renew --cert-name sale.thuanchay.vn

# Reload Nginx sau khi renew
sudo systemctl reload nginx
```

## ✅ Checklist

Trước khi chạy Certbot:

- [ ] Nginx đã được cài đặt và đang chạy
- [ ] Domain đã trỏ về IP VPS (DNS đã propagate)
- [ ] Port 80 và 443 đã được mở trong firewall
- [ ] Certbot và nginx plugin đã được cài đặt
- [ ] Nginx config đã được tạo cho domain

## 🔗 Tài liệu tham khảo

- [Certbot Nginx Plugin](https://certbot.eff.org/docs/using.html#nginx)
- [Let's Encrypt Documentation](https://letsencrypt.org/docs/)

