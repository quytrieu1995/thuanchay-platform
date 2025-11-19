const SAMPLE_ITEMS = [
  {
    maHang: 'SP001',
    tenHang: 'Áo thun basic',
    soLuong: 2,
    donGia: 180000,
    giamGia: 0,
    thanhTien: 360000,
  },
  {
    maHang: 'SP002',
    tenHang: 'Quần jean slim',
    soLuong: 1,
    donGia: 320000,
    giamGia: 20000,
    thanhTien: 300000,
  },
]

const SAMPLE_ORDER = {
  maHoaDon: 'HD0001',
  thoiGianTao: '2025-01-12 10:30:00',
  chiNhanh: 'CN01 - Hà Nội',
  kenhBan: 'Online',
  nhomKhachHang: 'Khách lẻ',
  tenKhachHang: 'Nguyễn Văn A',
  maKhachHang: 'KH0001',
  email: 'khachhang@example.com',
  dienThoai: '0901234567',
  diaChiKhachHang: '123 Đường ABC, Quận 1, TP.HCM',
  khuVucKhachHang: 'Quận 1',
  phuongXaKhachHang: 'Phường Bến Nghé',
  tongTienHang: 660000,
  giamGiaHoaDon: 20000,
  khachCanTra: 690000,
  khachDaTra: 200000,
  conCanThuCOD: 490000,
  sanPham: SAMPLE_ITEMS,
}

const SAMPLE_SHIPMENT = {
  maVanDon: 'VD0001',
  doiTacGiaoHang: 'GHN',
  dichVu: 'Giao hàng tiêu chuẩn',
  nguoiNhan: 'Nguyễn Văn A',
  dienThoaiNguoiNhan: '0901234567',
  diaChiNguoiNhan: '123 Đường ABC, Quận 1, TP.HCM',
  phiTraDTGH: 30000,
  trongLuong: 500,
  dai: 10,
  rong: 10,
  cao: 10,
}

const getStoreProfile = () => {
  if (typeof window === 'undefined') {
    return {
      name: 'Thuần Chay VN',
      address: '123 Đường ABC, Quận 1, TP.HCM',
      phone: '0901234567',
      taxCode: '123456789',
    }
  }
  try {
    const raw = localStorage.getItem('appSettings')
    if (!raw) {
      return {
        name: 'Thuần Chay VN',
        address: '123 Đường ABC, Quận 1, TP.HCM',
        phone: '0901234567',
        taxCode: '123456789',
      }
    }
    const settings = JSON.parse(raw)
    return {
      name: settings.storeName || 'Thuần Chay VN',
      address: settings.address || '123 Đường ABC, Quận 1, TP.HCM',
      phone: settings.phone || '0901234567',
      taxCode: settings.taxCode || '123456789',
    }
  } catch {
    return {
      name: 'Thuần Chay VN',
      address: '123 Đường ABC, Quận 1, TP.HCM',
      phone: '0901234567',
      taxCode: '123456789',
    }
  }
}

const safeNumber = (value) => Number(value || 0)

export const composePrintData = ({ order, shipment, storeProfile }) => {
  const store = storeProfile || getStoreProfile()
  const orderData = order || SAMPLE_ORDER
  const shipmentData =
    shipment || {
      ...SAMPLE_SHIPMENT,
      maVanDon: orderData.maVanDon || SAMPLE_SHIPMENT.maVanDon,
      phiTraDTGH: orderData.phiTraDTGH ?? SAMPLE_SHIPMENT.phiTraDTGH,
      nguoiNhan: orderData.nguoiNhan || orderData.tenKhachHang,
      dienThoaiNguoiNhan: orderData.dienThoaiNguoiNhan || orderData.dienThoai,
      diaChiNguoiNhan: orderData.diaChiNguoiNhan || orderData.diaChiKhachHang,
    }

  const items = orderData.sanPham || []

  return {
    store,
    order: orderData,
    customer: {
      maKhachHang: orderData.maKhachHang,
      tenKhachHang: orderData.tenKhachHang,
      email: orderData.email,
      dienThoai: orderData.dienThoai,
      diaChiKhachHang: orderData.diaChiKhachHang,
      group: orderData.nhomKhachHang || 'Khách lẻ',
    },
    shipping: {
      ...shipmentData,
      maVanDon: shipmentData.maVanDon || orderData.maVanDon,
      doiTacGiaoHang: shipmentData.doiTacGiaoHang || orderData.doiTacGiaoHang,
      nguoiNhan: shipmentData.nguoiNhan || orderData.nguoiNhan || orderData.tenKhachHang,
      dienThoaiNguoiNhan: shipmentData.dienThoaiNguoiNhan || orderData.dienThoaiNguoiNhan || orderData.dienThoai,
      diaChiNguoiNhan: shipmentData.diaChiNguoiNhan || orderData.diaChiNguoiNhan || orderData.diaChiKhachHang,
      phiTraDTGH: shipmentData.phiTraDTGH ?? orderData.phiTraDTGH ?? 0,
    },
    items,
    orderSummary: {
      itemCount: items.reduce((sum, item) => sum + safeNumber(item.soLuong), 0),
      channel: orderData.kenhBan || orderData.channel,
      createdAt: orderData.thoiGianTao,
    },
    totals: {
      tongTienHang: orderData.tongTienHang ?? items.reduce((sum, item) => sum + safeNumber(item.thanhTien), 0),
      giamGiaHoaDon: orderData.giamGiaHoaDon ?? 0,
      khachCanTra: orderData.khachCanTra ?? orderData.total ?? 0,
      khachDaTra: orderData.khachDaTra ?? 0,
      conCanThuCOD:
        orderData.conCanThuCOD ?? Math.max((orderData.khachCanTra ?? 0) - (orderData.khachDaTra ?? 0), 0),
    },
  }
}

export const getSamplePrintData = () => composePrintData({ order: SAMPLE_ORDER, shipment: SAMPLE_SHIPMENT })


