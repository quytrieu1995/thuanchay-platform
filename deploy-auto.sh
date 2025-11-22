#!/bin/bash

# Script tự động deploy sau khi clone
# Sử dụng: sudo ./deploy-auto.sh [domain]
# Ví dụ: sudo ./deploy-auto.sh sale.thuanchay.vn

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  Auto Deploy - Thuần Chay Platform${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    echo -e "${RED}⚠️  Vui lòng chạy với sudo: sudo ./deploy-auto.sh${NC}"
    exit 1
fi

# Get script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_DIR="$SCRIPT_DIR"
SERVICE_NAME="thuanchay-api"
DOMAIN="${1:-sale.thuanchay.vn}"

echo -e "${GREEN}📦 Project directory: $PROJECT_DIR${NC}"
echo -e "${GREEN}🌐 Domain: $DOMAIN${NC}"
echo -e "${GREEN}🔧 Service name: $SERVICE_NAME${NC}"
echo ""

# Check if package.json exists
if [ ! -f "$PROJECT_DIR/package.json" ]; then
    echo -e "${RED}❌ Không tìm thấy package.json trong $PROJECT_DIR${NC}"
    echo -e "${YELLOW}   Vui lòng đảm bảo đã clone repository vào đúng thư mục${NC}"
    exit 1
fi

# Load NVM
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# Ensure Node.js v24.11.1
echo -e "${YELLOW}[1/7] Kiểm tra Node.js v24.11.1...${NC}"
if ! command -v node &> /dev/null || [ "$(node --version 2>/dev/null)" != "v24.11.1" ]; then
    echo -e "${YELLOW}   Đang cài đặt Node.js v24.11.1...${NC}"
    if [ ! -d "$HOME/.nvm" ]; then
        curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash > /dev/null 2>&1
    fi
    export NVM_DIR="$HOME/.nvm"
    [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
    nvm install 24.11.1 > /dev/null 2>&1
    nvm use 24.11.1 > /dev/null 2>&1
    nvm alias default 24.11.1 > /dev/null 2>&1
    cp $(nvm which node) /usr/local/bin/node 2>/dev/null || true
    cp $(nvm which npm) /usr/local/bin/npm 2>/dev/null || true
fi
echo -e "${GREEN}✅ Node.js $(node --version)${NC}"
echo ""

# Install dependencies
echo -e "${YELLOW}[2/7] Cài đặt dependencies...${NC}"
cd $PROJECT_DIR
npm ci --production > /dev/null 2>&1
echo -e "${GREEN}✅ Dependencies đã được cài đặt${NC}"
echo ""

# Build frontend
echo -e "${YELLOW}[3/7] Build frontend...${NC}"
NODE_ENV=production npm run build > /dev/null 2>&1
echo -e "${GREEN}✅ Frontend đã được build${NC}"
echo ""

# Create logs directory
echo -e "${YELLOW}[4/7] Tạo thư mục logs...${NC}"
mkdir -p $PROJECT_DIR/logs
echo -e "${GREEN}✅ Thư mục logs đã được tạo${NC}"
echo ""

# Configure and start PM2
echo -e "${YELLOW}[5/7] Cấu hình và khởi động PM2...${NC}"
if pm2 list | grep -q "$SERVICE_NAME"; then
    echo -e "${YELLOW}   Đang reload service hiện có...${NC}"
    pm2 reload $SERVICE_NAME > /dev/null 2>&1
else
    echo -e "${YELLOW}   Đang khởi động service mới...${NC}"
    pm2 start ecosystem.config.cjs --env production > /dev/null 2>&1
    pm2 save > /dev/null 2>&1
    pm2 startup systemd -u root --hp /root > /dev/null 2>&1 || true
fi
echo -e "${GREEN}✅ PM2 service đã được khởi động${NC}"
echo ""

# Configure Nginx
echo -e "${YELLOW}[6/7] Cấu hình Nginx...${NC}"

NGINX_CONFIG_FILE="/etc/nginx/sites-available/${DOMAIN}"

# Check if config file exists in project
if [ -f "$PROJECT_DIR/nginx-sale.thuanchay.vn.conf" ] && [ "$DOMAIN" = "sale.thuanchay.vn" ]; then
    cp $PROJECT_DIR/nginx-sale.thuanchay.vn.conf $NGINX_CONFIG_FILE
else
    # Create basic config
    cat > $NGINX_CONFIG_FILE <<EOF
server {
    listen 80;
    listen [::]:80;
    server_name $DOMAIN;
    
    access_log /var/log/nginx/${DOMAIN//./-}-access.log;
    error_log /var/log/nginx/${DOMAIN//./-}-error.log;
    
    client_max_body_size 50M;
    
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
    }
    
    location /health {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
    }
    
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

# Test and reload Nginx
if nginx -t > /dev/null 2>&1; then
    systemctl reload nginx > /dev/null 2>&1
    echo -e "${GREEN}✅ Nginx đã được cấu hình${NC}"
else
    echo -e "${RED}❌ Lỗi cấu hình Nginx. Kiểm tra: sudo nginx -t${NC}"
    exit 1
fi
echo ""

# SSL Setup prompt
echo -e "${YELLOW}[7/7] Cài đặt SSL (tùy chọn)...${NC}"
echo -e "${BLUE}Bạn có muốn cài đặt SSL certificate cho $DOMAIN? (y/n)${NC}"
read -t 10 -r response || response="n"
if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
    echo -e "${YELLOW}   Đang cài đặt SSL...${NC}"
    certbot --nginx -d $DOMAIN --non-interactive --agree-tos --redirect || echo -e "${YELLOW}⚠️  Không thể cài đặt SSL tự động. Chạy thủ công: sudo certbot --nginx -d $DOMAIN${NC}"
    echo -e "${GREEN}✅ SSL đã được cấu hình${NC}"
else
    echo -e "${YELLOW}⚠️  Bỏ qua SSL. Chạy sau: sudo certbot --nginx -d $DOMAIN${NC}"
fi
echo ""

# Final summary
echo ""
echo -e "${BLUE}========================================${NC}"
echo -e "${GREEN}✅ Deploy hoàn tất!${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""
echo -e "${GREEN}🌐 Website: http://$DOMAIN${NC}"
echo -e "${GREEN}📡 API: http://$DOMAIN/api${NC}"
echo -e "${GREEN}💚 Health: http://$DOMAIN/health${NC}"
echo ""
echo -e "${YELLOW}📋 Các lệnh hữu ích:${NC}"
echo -e "${BLUE}  pm2 status                    # Xem trạng thái${NC}"
echo -e "${BLUE}  pm2 logs $SERVICE_NAME        # Xem logs${NC}"
echo -e "${BLUE}  pm2 restart $SERVICE_NAME     # Restart${NC}"
echo -e "${BLUE}  sudo nginx -t                # Kiểm tra Nginx${NC}"
echo ""

