@echo off
REM Script để chạy server trên Windows/VPS Windows

echo 🚀 Starting Thuần Chay Platform Server...

REM Kiểm tra Node.js
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Node.js is not installed. Please install Node.js first.
    pause
    exit /b 1
)

echo ✅ Node.js version:
node --version
echo ✅ npm version:
npm --version

REM Cài đặt dependencies nếu chưa có
if not exist "node_modules" (
    echo 📦 Installing dependencies...
    call npm install
)

REM Tạo thư mục database nếu chưa có
if not exist "server\database" mkdir server\database

REM Chạy server
echo 🌟 Starting server...
if "%NODE_ENV%"=="production" (
    echo 🏗️  Building frontend...
    call npm run build
    echo 🚀 Starting production server...
    set NODE_ENV=production
    call npm run server
) else (
    echo 🚀 Starting development server...
    call npm run server
)

pause

