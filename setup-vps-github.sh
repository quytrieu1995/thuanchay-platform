#!/bin/bash

# Script setup VPS để nhận deploy tự động từ GitHub
# Chạy trên VPS: sudo ./setup-vps-github.sh

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  Setup VPS cho GitHub Auto Deploy${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Check root
if [ "$EUID" -ne 0 ]; then 
    echo -e "${RED}⚠️  Vui lòng chạy với sudo${NC}"
    exit 1
fi

PROJECT_DIR="/var/www/thuanchay-platform"
DEPLOY_USER="${1:-deploy}"

echo -e "${GREEN}📦 Project directory: $PROJECT_DIR${NC}"
echo -e "${GREEN}👤 Deploy user: $DEPLOY_USER${NC}"
echo ""

# Step 1: Update system
echo -e "${YELLOW}[1/8] Cập nhật hệ thống...${NC}"
apt update -qq
apt upgrade -y -qq
echo -e "${GREEN}✅ Hoàn thành${NC}"
echo ""

# Step 2: Install NVM and Node.js v24.11.1
echo -e "${YELLOW}[2/8] Cài đặt NVM và Node.js v24.11.1...${NC}"

# Install NVM for root
if [ ! -d "$HOME/.nvm" ]; then
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
    export NVM_DIR="$HOME/.nvm"
    [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
fi

# Install Node.js v24.11.1
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
nvm install 24.11.1
nvm use 24.11.1
nvm alias default 24.11.1

# Install Node.js globally
cp $(nvm which node) /usr/local/bin/node
cp $(nvm which npm) /usr/local/bin/npm

echo -e "${GREEN}✅ Node.js $(node --version) đã được cài đặt${NC}"
echo ""

# Step 3: Install PM2
echo -e "${YELLOW}[3/8] Cài đặt PM2...${NC}"
npm install -g pm2
echo -e "${GREEN}✅ PM2 đã được cài đặt${NC}"
echo ""

# Step 4: Install Nginx
echo -e "${YELLOW}[4/8] Cài đặt Nginx...${NC}"
if ! command -v nginx &> /dev/null; then
    apt install -y nginx > /dev/null 2>&1
    systemctl enable nginx > /dev/null 2>&1
    systemctl start nginx > /dev/null 2>&1
fi
echo -e "${GREEN}✅ Nginx đã được cài đặt${NC}"
echo ""

# Step 5: Create deploy user
echo -e "${YELLOW}[5/8] Tạo user deploy...${NC}"
if ! id "$DEPLOY_USER" &>/dev/null; then
    useradd -m -s /bin/bash $DEPLOY_USER
    usermod -aG sudo $DEPLOY_USER
    echo -e "${GREEN}✅ User $DEPLOY_USER đã được tạo${NC}"
else
    echo -e "${YELLOW}⚠️  User $DEPLOY_USER đã tồn tại${NC}"
fi

# Setup NVM for deploy user
if [ ! -d "/home/$DEPLOY_USER/.nvm" ]; then
    sudo -u $DEPLOY_USER bash -c 'curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash'
    sudo -u $DEPLOY_USER bash -c 'export NVM_DIR="$HOME/.nvm" && [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh" && nvm install 24.11.1 && nvm use 24.11.1 && nvm alias default 24.11.1'
fi

echo -e "${GREEN}✅ User deploy đã được cấu hình${NC}"
echo ""

# Step 6: Create project directory
echo -e "${YELLOW}[6/8] Tạo thư mục project...${NC}"
mkdir -p $PROJECT_DIR
chown -R $DEPLOY_USER:$DEPLOY_USER $PROJECT_DIR
chmod -R 755 $PROJECT_DIR
echo -e "${GREEN}✅ Thư mục project đã được tạo${NC}"
echo ""

# Step 7: Setup SSH for GitHub Actions
echo -e "${YELLOW}[7/8] Cấu hình SSH cho GitHub Actions...${NC}"

# Create .ssh directory for deploy user
sudo -u $DEPLOY_USER mkdir -p /home/$DEPLOY_USER/.ssh
sudo -u $DEPLOY_USER chmod 700 /home/$DEPLOY_USER/.ssh

# Generate SSH key if not exists
if [ ! -f "/home/$DEPLOY_USER/.ssh/id_rsa" ]; then
    sudo -u $DEPLOY_USER ssh-keygen -t rsa -b 4096 -f /home/$DEPLOY_USER/.ssh/id_rsa -N ""
fi

# Add public key to authorized_keys
PUBLIC_KEY=$(cat /home/$DEPLOY_USER/.ssh/id_rsa.pub)
if ! grep -q "$PUBLIC_KEY" /home/$DEPLOY_USER/.ssh/authorized_keys 2>/dev/null; then
    echo "$PUBLIC_KEY" | sudo -u $DEPLOY_USER tee -a /home/$DEPLOY_USER/.ssh/authorized_keys > /dev/null
fi

sudo -u $DEPLOY_USER chmod 600 /home/$DEPLOY_USER/.ssh/authorized_keys

echo -e "${GREEN}✅ SSH đã được cấu hình${NC}"
echo ""
echo -e "${YELLOW}📋 SSH Private Key (thêm vào GitHub Secrets VPS_SSH_KEY):${NC}"
echo -e "${BLUE}$(cat /home/$DEPLOY_USER/.ssh/id_rsa)${NC}"
echo ""

# Step 8: Configure sudo for deploy user (no password for specific commands)
echo -e "${YELLOW}[8/8] Cấu hình sudo...${NC}"
cat > /etc/sudoers.d/deploy <<EOF
# Allow deploy user to run PM2 and npm without password
$DEPLOY_USER ALL=(ALL) NOPASSWD: /usr/local/bin/pm2 *
$DEPLOY_USER ALL=(ALL) NOPASSWD: /usr/bin/npm *
$DEPLOY_USER ALL=(ALL) NOPASSWD: /usr/bin/systemctl reload nginx
$DEPLOY_USER ALL=(ALL) NOPASSWD: /usr/bin/systemctl restart nginx
EOF

chmod 440 /etc/sudoers.d/deploy
echo -e "${GREEN}✅ Sudo đã được cấu hình${NC}"
echo ""

# Summary
echo ""
echo -e "${BLUE}========================================${NC}"
echo -e "${GREEN}✅ Setup hoàn tất!${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""
echo -e "${YELLOW}📋 Thông tin cần thiết cho GitHub Secrets:${NC}"
echo ""
echo -e "${GREEN}VPS_HOST:${NC} $(hostname -I | awk '{print $1}')"
echo -e "${GREEN}VPS_USER:${NC} $DEPLOY_USER"
echo -e "${GREEN}VPS_PORT:${NC} 22"
echo ""
echo -e "${YELLOW}SSH Private Key (đã hiển thị ở trên)${NC}"
echo ""
echo -e "${BLUE}Bước tiếp theo:${NC}"
echo -e "1. Thêm các secrets vào GitHub repository"
echo -e "2. Push code lên GitHub"
echo -e "3. GitHub Actions sẽ tự động deploy"
echo ""

