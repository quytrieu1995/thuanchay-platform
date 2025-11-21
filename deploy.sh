#!/bin/bash

# Script tự động deploy project lên VPS
# Sử dụng: ./deploy.sh

set -e  # Exit on error

echo "🚀 Starting deployment..."

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    echo -e "${RED}Please run as root or with sudo${NC}"
    exit 1
fi

# Variables
PROJECT_DIR="/var/www/thuanchay-platform"
SERVICE_NAME="thuanchay-api"
DOMAIN="${1:-sale.thuanchay.vn}"

echo -e "${GREEN}Deploying to: $PROJECT_DIR${NC}"
echo -e "${GREEN}Domain: $DOMAIN${NC}"

# Step 1: Check Node.js
if ! command -v node &> /dev/null; then
    echo -e "${YELLOW}Node.js not found. Installing...${NC}"
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt install -y nodejs
fi

echo -e "${GREEN}✅ Node.js version: $(node --version)${NC}"

# Step 2: Check PM2
if ! command -v pm2 &> /dev/null; then
    echo -e "${YELLOW}PM2 not found. Installing...${NC}"
    npm install -g pm2
fi

echo -e "${GREEN}✅ PM2 installed${NC}"

# Step 3: Create project directory
if [ ! -d "$PROJECT_DIR" ]; then
    echo -e "${YELLOW}Creating project directory...${NC}"
    mkdir -p $PROJECT_DIR
fi

# Step 4: Install dependencies
echo -e "${YELLOW}Installing dependencies...${NC}"
cd $PROJECT_DIR
npm install --production

# Step 5: Build frontend
echo -e "${YELLOW}Building frontend...${NC}"
npm run build

# Step 6: Create logs directory
mkdir -p logs

# Step 7: Start/Restart PM2
echo -e "${YELLOW}Starting PM2...${NC}"
if pm2 list | grep -q "$SERVICE_NAME"; then
    echo -e "${YELLOW}Restarting existing service...${NC}"
    pm2 restart $SERVICE_NAME
else
    echo -e "${YELLOW}Starting new service...${NC}"
    pm2 start ecosystem.config.cjs --env production
    pm2 save
    pm2 startup
fi

# Step 8: Check Nginx
if ! command -v nginx &> /dev/null; then
    echo -e "${YELLOW}Nginx not found. Installing...${NC}"
    apt update
    apt install -y nginx
    systemctl enable nginx
fi

# Step 9: Configure Nginx
echo -e "${YELLOW}Configuring Nginx...${NC}"
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

# Test and reload Nginx
nginx -t && systemctl reload nginx

# Step 10: Configure Firewall
echo -e "${YELLOW}Configuring firewall...${NC}"
if command -v ufw &> /dev/null; then
    ufw allow 22/tcp
    ufw allow 80/tcp
    ufw allow 443/tcp
    ufw --force enable
fi

# Step 11: SSL Setup (optional)
echo -e "${YELLOW}Do you want to setup SSL with Let's Encrypt? (y/n)${NC}"
read -r response
if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
    if ! command -v certbot &> /dev/null; then
        apt install -y certbot python3-certbot-nginx
    fi
    certbot --nginx -d $DOMAIN -d www.$DOMAIN --non-interactive --agree-tos --email admin@$DOMAIN
fi

echo -e "${GREEN}✅ Deployment completed!${NC}"
echo -e "${GREEN}🌐 Website: http://$DOMAIN${NC}"
echo -e "${GREEN}📡 API: http://$DOMAIN/api${NC}"
echo -e "${GREEN}💡 Check status: pm2 status${NC}"
echo -e "${GREEN}📋 View logs: pm2 logs $SERVICE_NAME${NC}"

