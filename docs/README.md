# 📚 Tài liệu Dự án

Thư mục này chứa tất cả các tài liệu hướng dẫn và troubleshooting cho dự án Thuần Chay Platform.

## 📁 Cấu trúc thư mục

```
docs/
├── README.md                          # File này
├── API_DOCUMENTATION.md               # Tài liệu API đầy đủ
├── PERFORMANCE_OPTIMIZATION.md       # Hướng dẫn tối ưu hiệu suất
├── guides/                           # Các hướng dẫn sử dụng
│   ├── HUONG_DAN_CHAY_SAU_KHI_CLONE.md
│   ├── QUICK_START.md
│   ├── CHAY_TRUC_TIEP.md
│   └── LINUX_DISTRIBUTIONS.md        # Khuyến nghị Linux distribution
└── troubleshooting/                  # Hướng dẫn fix lỗi
    ├── QUICK_FIX.md                  # Fix nhanh các lỗi phổ biến
    ├── FIX_UBUNTU_ERRORS.md          # Tất cả lỗi Ubuntu/Linux
    ├── FIX_NPM_GYP_ERROR.md          # Lỗi npm gyp trên Windows
    ├── FIX_QT_XCB_ERROR.md           # Lỗi Qt XCB trên Ubuntu server
    ├── FIX_NGINX_CONFIG_ERROR.md     # Lỗi cấu hình Nginx
    └── FIX_CERTBOT_NGINX_ERROR.md    # Lỗi Certbot Nginx plugin
```

## 📖 Hướng dẫn sử dụng

### 🚀 Bắt đầu nhanh

1. **Lần đầu clone project:**
   - Xem [guides/HUONG_DAN_CHAY_SAU_KHI_CLONE.md](./guides/HUONG_DAN_CHAY_SAU_KHI_CLONE.md)
   - Hoặc [guides/QUICK_START.md](./guides/QUICK_START.md)

2. **Gặp lỗi khi cài đặt/chạy:**
   - Xem [troubleshooting/QUICK_FIX.md](./troubleshooting/QUICK_FIX.md) để fix nhanh
   - Hoặc xem các file chi tiết trong thư mục `troubleshooting/`

3. **Tìm hiểu API:**
   - Xem [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)

4. **Tối ưu hiệu suất:**
   - Xem [PERFORMANCE_OPTIMIZATION.md](./PERFORMANCE_OPTIMIZATION.md)

## 🔍 Tìm kiếm theo lỗi

### Windows
- **npm error gyp** → [troubleshooting/FIX_NPM_GYP_ERROR.md](./troubleshooting/FIX_NPM_GYP_ERROR.md)

### Ubuntu/Linux
- **Qt XCB error** → [troubleshooting/FIX_QT_XCB_ERROR.md](./troubleshooting/FIX_QT_XCB_ERROR.md)
- **Nginx config error** → [troubleshooting/FIX_NGINX_CONFIG_ERROR.md](./troubleshooting/FIX_NGINX_CONFIG_ERROR.md)
- **Certbot Nginx plugin** → [troubleshooting/FIX_CERTBOT_NGINX_ERROR.md](./troubleshooting/FIX_CERTBOT_NGINX_ERROR.md)
- **Các lỗi khác** → [troubleshooting/FIX_UBUNTU_ERRORS.md](./troubleshooting/FIX_UBUNTU_ERRORS.md)

## 📝 Ghi chú

- Tất cả các đường dẫn trong các file markdown đều sử dụng đường dẫn tương đối từ thư mục `docs/`
- Để truy cập từ thư mục gốc project, sử dụng đường dẫn `docs/...`

