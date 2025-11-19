# Bypass execution policy warning
$ErrorActionPreference = "Continue"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Thuần Chay VN Clone - Start Script" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if Node.js is installed
try {
    $nodeVersion = node --version 2>$null
    $npmVersion = npm --version 2>$null
    if ($nodeVersion -and $npmVersion) {
        Write-Host "[OK] Node.js da duoc cai dat!" -ForegroundColor Green
        Write-Host "Node: $nodeVersion" -ForegroundColor Green
        Write-Host "NPM:  $npmVersion" -ForegroundColor Green
        Write-Host ""
    } else {
        throw "Node.js not found"
    }
} catch {
    Write-Host "[ERROR] Node.js chua duoc cai dat!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Vui long cai dat Node.js:" -ForegroundColor Yellow
    Write-Host "1. Truy cap: https://nodejs.org/" -ForegroundColor Yellow
    Write-Host "2. Tai phien ban LTS (khuyen nghị)" -ForegroundColor Yellow
    Write-Host "3. Cai dat va khoi dong lai PowerShell" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Hoac chay truc tiep cac lenh sau:" -ForegroundColor Cyan
    Write-Host "  npm install" -ForegroundColor White
    Write-Host "  npm run dev" -ForegroundColor White
    Write-Host ""
    Read-Host "Nhan Enter de thoat"
    exit 1
}

# Check if node_modules exists
if (-not (Test-Path "node_modules")) {
    Write-Host "Dang cai dat dependencies..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "[ERROR] Co loi xay ra khi cai dat dependencies!" -ForegroundColor Red
        Read-Host "Nhan Enter de thoat"
        exit 1
    }
    Write-Host ""
}

Write-Host "Dang khoi dong development server..." -ForegroundColor Green
Write-Host ""
Write-Host "Website se chay tai: http://localhost:5173" -ForegroundColor Cyan
Write-Host "Nhan Ctrl+C de dung server" -ForegroundColor Yellow
Write-Host ""
npm run dev


