#!/bin/bash

# Script cấu hình domain và SSL
# Sử dụng: ./setup-domain.sh your-domain.com

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

if [ -z "$1" ]; then
    echo -e "${RED}Usage: ./setup-domain.sh your-domain.com${NC}"
    exit 1
fi

DOMAIN=$1
PROJECT_DIR="/var/www/thuanchay-platform"

echo -e "${GREEN}Setting up domain: $DOMAIN${NC}"

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    echo -e "${RED}Please run as root or with sudo${NC}"
    exit 1
fi

# Step 1: Install Certbot
if ! command -v certbot &> /dev/null; then
    echo -e "${YELLOW}Installing Certbot...${NC}"
    apt update
    apt install -y certbot python3-certbot-nginx
fi

# Step 2: Update Nginx config with domain
echo -e "${YELLOW}Updating Nginx configuration...${NC}"
cat > /etc/nginx/sites-available/thuanchay-platform <<EOF
server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN;

    access_log /var/log/nginx/thuanchay-access.log;
    error_log /var/log/nginx/thuanchay-error.log;

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

# Enable site
ln -sf /etc/nginx/sites-available/thuanchay-platform /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Test Nginx config
nginx -t && systemctl reload nginx

# Step 3: Get SSL Certificate
echo -e "${YELLOW}Getting SSL certificate from Let's Encrypt...${NC}"
echo -e "${YELLOW}Please enter your email for Let's Encrypt:${NC}"
read -r EMAIL

certbot --nginx -d $DOMAIN -d www.$DOMAIN \
    --non-interactive \
    --agree-tos \
    --email "$EMAIL" \
    --redirect

# Step 4: Setup auto-renewal
echo -e "${YELLOW}Setting up SSL auto-renewal...${NC}"
systemctl enable certbot.timer
systemctl start certbot.timer

# Step 5: Test renewal
echo -e "${YELLOW}Testing certificate renewal...${NC}"
certbot renew --dry-run

echo -e "${GREEN}✅ Domain setup completed!${NC}"
echo -e "${GREEN}🌐 Website: https://$DOMAIN${NC}"
echo -e "${GREEN}📡 API: https://$DOMAIN/api${NC}"
echo -e "${GREEN}💡 SSL certificate will auto-renew every 90 days${NC}"

