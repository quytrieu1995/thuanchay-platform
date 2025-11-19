@echo off
echo ========================================
echo   Thuần Chay VN Clone - Start Script
echo ========================================
echo.

REM Check if Node.js is installed
where node >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js chua duoc cai dat!
    echo.
    echo Vui long cai dat Node.js:
    echo 1. Truy cap: https://nodejs.org/
    echo 2. Tai phien ban LTS (khuyen nghị)
    echo 3. Cai dat va khoi dong lai terminal
    echo.
    pause
    exit /b 1
)

echo [OK] Node.js da duoc cai dat!
node --version
npm --version
echo.

REM Check if node_modules exists
if not exist "node_modules" (
    echo Dang cai dat dependencies...
    call npm install
    if %ERRORLEVEL% NEQ 0 (
        echo [ERROR] Co loi xay ra khi cai dat dependencies!
        pause
        exit /b 1
    )
    echo.
)

echo Dang khoi dong development server...
echo.
echo Website se chay tai: http://localhost:5173
echo Nhan Ctrl+C de dung server
echo.
call npm run dev


