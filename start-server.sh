#!/bin/bash

# Script để chạy server trên VPS
# Tự động cài đặt dependencies và khởi động server

echo "🚀 Starting Thuần Chay Platform Server..."

# Fix Qt XCB display error (for headless servers)
export QT_QPA_PLATFORM=offscreen
export DISPLAY=:0

# Kiểm tra Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

echo "✅ Node.js version: $(node --version)"
echo "✅ npm version: $(npm --version)"

# Cài đặt dependencies nếu chưa có
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Đảm bảo concurrently được cài đặt (cho start:dev)
if [ ! -f "node_modules/.bin/concurrently" ]; then
    echo "📦 Installing concurrently..."
    npm install concurrently --save-dev
fi

# Tạo thư mục database nếu chưa có
mkdir -p server/database

# Tạo thư mục logs nếu chưa có
mkdir -p logs

# Chạy server
echo "🌟 Starting server..."
if [ "$NODE_ENV" = "production" ]; then
    echo "🏗️  Building frontend..."
    npm run build
    echo "🚀 Starting production server..."
    NODE_ENV=production npm run server
else
    echo "🚀 Starting development server..."
    npm run server
fi

