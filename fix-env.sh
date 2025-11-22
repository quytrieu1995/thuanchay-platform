#!/bin/bash

# Script tự động fix environment variables cho Ubuntu server
# Chạy: source fix-env.sh hoặc . ./fix-env.sh

echo "🔧 Fixing environment variables for headless server..."

# Fix Qt XCB display error
export QT_QPA_PLATFORM=offscreen
export DISPLAY=:0

# Thêm vào ~/.bashrc nếu chưa có
if ! grep -q "QT_QPA_PLATFORM=offscreen" ~/.bashrc 2>/dev/null; then
    echo 'export QT_QPA_PLATFORM=offscreen' >> ~/.bashrc
    echo 'export DISPLAY=:0' >> ~/.bashrc
    echo "✅ Added environment variables to ~/.bashrc"
fi

echo "✅ Environment variables set:"
echo "   QT_QPA_PLATFORM=$QT_QPA_PLATFORM"
echo "   DISPLAY=$DISPLAY"
echo ""
echo "💡 To apply permanently, restart terminal or run: source ~/.bashrc"

