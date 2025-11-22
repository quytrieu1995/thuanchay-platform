#!/bin/bash

# Script setup VPS ban đầu - Chạy một lần duy nhất
# Sử dụng: sudo ./setup-vps.sh

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  Setup VPS - Thuần Chay Platform${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Check root
if [ "$EUID" -ne 0 ]; then 
    echo -e "${RED}⚠️  Vui lòng chạy với sudo: sudo ./setup-vps.sh${NC}"
    exit 1
fi

PROJECT_DIR="/var/www/thuanchay-platform"
DOMAIN="${1:-sale.thuanchay.vn}"

echo -e "${GREEN}📦 Project directory: $PROJECT_DIR${NC}"
echo -e "${GREEN}🌐 Domain: $DOMAIN${NC}"
echo ""

# Step 1: Update system
echo -e "${YELLOW}[1/8] Cập nhật hệ thống...${NC}"
apt update -qq
apt upgrade -y -qq
echo -e "${GREEN}✅ Hoàn thành${NC}"
echo ""

# Step 2: Install Git
echo -e "${YELLOW}[2/8] Cài đặt Git...${NC}"
if ! command -v git &> /dev/null; then
    apt install -y git > /dev/null 2>&1
fi
echo -e "${GREEN}✅ Git đã được cài đặt${NC}"
echo ""

# Step 3: Install NVM and Node.js v24.11.1
echo -e "${YELLOW}[3/8] Cài đặt NVM và Node.js v24.11.1...${NC}"

# Install NVM for root
if [ ! -d "$HOME/.nvm" ]; then
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash > /dev/null 2>&1
fi

export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# Install Node.js v24.11.1
nvm install 24.11.1 > /dev/null 2>&1
nvm use 24.11.1 > /dev/null 2>&1
nvm alias default 24.11.1 > /dev/null 2>&1

# Install globally
cp $(nvm which node) /usr/local/bin/node 2>/dev/null || true
cp $(nvm which npm) /usr/local/bin/npm 2>/dev/null || true

echo -e "${GREEN}✅ Node.js $(node --version) đã được cài đặt${NC}"
echo ""

# Step 4: Install PM2
echo -e "${YELLOW}[4/8] Cài đặt PM2...${NC}"
npm install -g pm2 > /dev/null 2>&1
echo -e "${GREEN}✅ PM2 đã được cài đặt${NC}"
echo ""

# Step 5: Install Nginx
echo -e "${YELLOW}[5/8] Cài đặt Nginx...${NC}"
if ! command -v nginx &> /dev/null; then
    apt install -y nginx > /dev/null 2>&1
    systemctl enable nginx > /dev/null 2>&1
    systemctl start nginx > /dev/null 2>&1
fi
echo -e "${GREEN}✅ Nginx đã được cài đặt${NC}"
echo ""

# Step 6: Create project directory
echo -e "${YELLOW}[6/8] Tạo thư mục project...${NC}"
mkdir -p $PROJECT_DIR
chmod 755 $PROJECT_DIR
echo -e "${GREEN}✅ Thư mục project đã được tạo${NC}"
echo ""

# Step 7: Install Certbot (for SSL)
echo -e "${YELLOW}[7/8] Cài đặt Certbot...${NC}"
apt install -y certbot python3-certbot-nginx > /dev/null 2>&1
echo -e "${GREEN}✅ Certbot đã được cài đặt${NC}"
echo ""

# Step 8: Configure Firewall
echo -e "${YELLOW}[8/8] Cấu hình Firewall...${NC}"
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

# Summary
echo ""
echo -e "${BLUE}========================================${NC}"
echo -e "${GREEN}✅ Setup hoàn tất!${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""
echo -e "${YELLOW}📋 Bước tiếp theo:${NC}"
echo ""
echo -e "${BLUE}1. Clone repository:${NC}"
echo -e "   cd /var/www"
echo -e "   git clone <your-repo-url> thuanchay-platform"
echo ""
echo -e "${BLUE}2. Chạy script deploy tự động:${NC}"
echo -e "   cd thuanchay-platform"
echo -e "   chmod +x deploy-auto.sh"
echo -e "   sudo ./deploy-auto.sh $DOMAIN"
echo ""
echo -e "${BLUE}Hoặc clone sẽ tự động chạy deploy nếu có git hook${NC}"
echo ""

