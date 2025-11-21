#!/bin/bash

# Script tự động deploy project lên VPS Ubuntu
# Sử dụng: ./deploy-ubuntu.sh [domain]
# Ví dụ: ./deploy-ubuntu.sh sale.thuanchay.vn

set -e  # Exit on error

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  Deploy Thuần Chay Platform - Ubuntu${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Check if running as root or with sudo
if [ "$EUID" -ne 0 ]; then 
    echo -e "${RED}⚠️  Vui lòng chạy với sudo: sudo ./deploy-ubuntu.sh${NC}"
    exit 1
fi

# Variables
PROJECT_DIR="/var/www/thuanchay-platform"
SERVICE_NAME="thuanchay-api"
DOMAIN="${1:-sale.thuanchay.vn}"
NGINX_CONFIG_FILE="/etc/nginx/sites-available/${DOMAIN}"

echo -e "${GREEN}📦 Project directory: $PROJECT_DIR${NC}"
echo -e "${GREEN}🌐 Domain: $DOMAIN${NC}"
echo -e "${GREEN}🔧 Service name: $SERVICE_NAME${NC}"
echo ""

# Step 1: Update system
echo -e "${YELLOW}[1/12] Cập nhật hệ thống...${NC}"
apt update -qq
apt upgrade -y -qq
echo -e "${GREEN}✅ Hệ thống đã được cập nhật${NC}"
echo ""

# Step 2: Install Node.js v24.11.1
echo -e "${YELLOW}[2/12] Kiểm tra và cài đặt Node.js v24.11.1...${NC}"
if ! command -v node &> /dev/null || [ "$(node --version)" != "v24.11.1" ]; then
    echo -e "${YELLOW}   Đang cài đặt NVM và Node.js v24.11.1...${NC}"
    # Install NVM
    if [ ! -d "$HOME/.nvm" ]; then
        curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
    fi
    export NVM_DIR="$HOME/.nvm"
    [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
    nvm install 24.11.1
    nvm use 24.11.1
    nvm alias default 24.11.1
    # Install globally
    cp $(nvm which node) /usr/local/bin/node 2>/dev/null || true
    cp $(nvm which npm) /usr/local/bin/npm 2>/dev/null || true
fi
NODE_VERSION=$(node --version)
echo -e "${GREEN}✅ Node.js: $NODE_VERSION${NC}"
echo ""

# Step 3: Install PM2
echo -e "${YELLOW}[3/12] Kiểm tra và cài đặt PM2...${NC}"
if ! command -v pm2 &> /dev/null; then
    echo -e "${YELLOW}   Đang cài đặt PM2...${NC}"
    npm install -g pm2 > /dev/null 2>&1
fi
echo -e "${GREEN}✅ PM2 đã được cài đặt${NC}"
echo ""

# Step 4: Install Nginx
echo -e "${YELLOW}[4/12] Kiểm tra và cài đặt Nginx...${NC}"
if ! command -v nginx &> /dev/null; then
    echo -e "${YELLOW}   Đang cài đặt Nginx...${NC}"
    apt install -y nginx > /dev/null 2>&1
    systemctl enable nginx > /dev/null 2>&1
    systemctl start nginx > /dev/null 2>&1
fi
echo -e "${GREEN}✅ Nginx đã được cài đặt${NC}"
echo ""

# Step 5: Create project directory
echo -e "${YELLOW}[5/12] Tạo thư mục project...${NC}"
if [ ! -d "$PROJECT_DIR" ]; then
    mkdir -p $PROJECT_DIR
    echo -e "${GREEN}✅ Đã tạo thư mục: $PROJECT_DIR${NC}"
else
    echo -e "${GREEN}✅ Thư mục đã tồn tại: $PROJECT_DIR${NC}"
fi
echo ""

# Step 6: Check if code exists
echo -e "${YELLOW}[6/12] Kiểm tra code...${NC}"
if [ ! -f "$PROJECT_DIR/package.json" ]; then
    echo -e "${RED}❌ Không tìm thấy package.json trong $PROJECT_DIR${NC}"
    echo -e "${YELLOW}   Vui lòng clone/upload code vào thư mục này trước:${NC}"
    echo -e "${BLUE}   git clone <repo-url> $PROJECT_DIR${NC}"
    echo -e "${BLUE}   hoặc upload code vào $PROJECT_DIR${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Code đã có sẵn${NC}"
echo ""

# Step 7: Install dependencies
echo -e "${YELLOW}[7/12] Cài đặt dependencies...${NC}"
cd $PROJECT_DIR
npm install --production > /dev/null 2>&1
echo -e "${GREEN}✅ Dependencies đã được cài đặt${NC}"
echo ""

# Step 8: Build frontend
echo -e "${YELLOW}[8/12] Build frontend...${NC}"
npm run build > /dev/null 2>&1
echo -e "${GREEN}✅ Frontend đã được build${NC}"
echo ""

# Step 9: Create logs directory
echo -e "${YELLOW}[9/12] Tạo thư mục logs...${NC}"
mkdir -p $PROJECT_DIR/logs
echo -e "${GREEN}✅ Thư mục logs đã được tạo${NC}"
echo ""

# Step 10: Configure and start PM2
echo -e "${YELLOW}[10/12] Cấu hình và khởi động PM2...${NC}"
if pm2 list | grep -q "$SERVICE_NAME"; then
    echo -e "${YELLOW}   Đang restart service hiện có...${NC}"
    pm2 restart $SERVICE_NAME > /dev/null 2>&1
else
    echo -e "${YELLOW}   Đang khởi động service mới...${NC}"
    pm2 start ecosystem.config.cjs --env production > /dev/null 2>&1
    pm2 save > /dev/null 2>&1
    pm2 startup systemd -u root --hp /root > /dev/null 2>&1 || true
fi
echo -e "${GREEN}✅ PM2 service đã được khởi động${NC}"
echo ""

# Step 11: Configure Nginx
echo -e "${YELLOW}[11/12] Cấu hình Nginx...${NC}"

# Check if config file exists in project
if [ -f "$PROJECT_DIR/nginx-sale.thuanchay.vn.conf" ] && [ "$DOMAIN" = "sale.thuanchay.vn" ]; then
    echo -e "${YELLOW}   Sử dụng file config có sẵn...${NC}"
    cp $PROJECT_DIR/nginx-sale.thuanchay.vn.conf $NGINX_CONFIG_FILE
else
    echo -e "${YELLOW}   Tạo file config mới...${NC}"
    cat > $NGINX_CONFIG_FILE <<EOF
# HTTP Server - Redirect to HTTPS
server {
    listen 80;
    listen [::]:80;
    server_name $DOMAIN;
    
    # Redirect to HTTPS
    return 301 https://\$server_name\$request_uri;
}

# HTTPS Server (sẽ được cấu hình bởi Certbot)
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name $DOMAIN;
    
    # SSL Configuration (sẽ được cập nhật bởi Certbot)
    # ssl_certificate /etc/letsencrypt/live/$DOMAIN/fullchain.pem;
    # ssl_certificate_key /etc/letsencrypt/live/$DOMAIN/privkey.pem;
    
    # Logs
    access_log /var/log/nginx/${DOMAIN//./-}-access.log;
    error_log /var/log/nginx/${DOMAIN//./-}-error.log;
    
    # Tăng kích thước upload
    client_max_body_size 50M;
    
    # API endpoints - proxy đến backend
    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
    
    # Health check endpoint
    location /health {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
    }
    
    # Serve static files từ React build
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF
fi

# Enable site
ln -sf $NGINX_CONFIG_FILE /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Test Nginx config
if nginx -t > /dev/null 2>&1; then
    systemctl reload nginx > /dev/null 2>&1
    echo -e "${GREEN}✅ Nginx đã được cấu hình và reload${NC}"
else
    echo -e "${RED}❌ Lỗi cấu hình Nginx. Kiểm tra: sudo nginx -t${NC}"
    exit 1
fi
echo ""

# Step 12: Configure Firewall
echo -e "${YELLOW}[12/12] Cấu hình Firewall...${NC}"
if command -v ufw &> /dev/null; then
    ufw allow 22/tcp > /dev/null 2>&1
    ufw allow 80/tcp > /dev/null 2>&1
    ufw allow 443/tcp > /dev/null 2>&1
    echo "y" | ufw enable > /dev/null 2>&1
    echo -e "${GREEN}✅ Firewall đã được cấu hình${NC}"
else
    echo -e "${YELLOW}⚠️  UFW không được cài đặt, bỏ qua${NC}"
fi
echo ""

# SSL Setup prompt
echo -e "${BLUE}========================================${NC}"
echo -e "${YELLOW}🔒 Cài đặt SSL với Let's Encrypt?${NC}"
echo -e "${BLUE}========================================${NC}"
echo -e "${YELLOW}Bạn có muốn cài đặt SSL certificate cho $DOMAIN? (y/n)${NC}"
read -r response
if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
    echo ""
    echo -e "${YELLOW}Đang cài đặt Certbot...${NC}"
    apt install -y certbot python3-certbot-nginx > /dev/null 2>&1
    
    echo -e "${YELLOW}Đang lấy SSL certificate...${NC}"
    certbot --nginx -d $DOMAIN --non-interactive --agree-tos --redirect
    
    echo -e "${GREEN}✅ SSL đã được cài đặt${NC}"
    echo ""
fi

# Final summary
echo ""
echo -e "${BLUE}========================================${NC}"
echo -e "${GREEN}✅ Deploy hoàn tất!${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""
echo -e "${GREEN}🌐 Website: http://$DOMAIN${NC}"
echo -e "${GREEN}📡 API: http://$DOMAIN/api${NC}"
echo -e "${GREEN}💚 Health check: http://$DOMAIN/health${NC}"
echo ""
echo -e "${YELLOW}📋 Các lệnh hữu ích:${NC}"
echo -e "${BLUE}  pm2 status                    # Xem trạng thái${NC}"
echo -e "${BLUE}  pm2 logs $SERVICE_NAME        # Xem logs${NC}"
echo -e "${BLUE}  pm2 restart $SERVICE_NAME     # Restart service${NC}"
echo -e "${BLUE}  sudo nginx -t                # Kiểm tra config Nginx${NC}"
echo -e "${BLUE}  sudo systemctl status nginx   # Trạng thái Nginx${NC}"
echo ""

