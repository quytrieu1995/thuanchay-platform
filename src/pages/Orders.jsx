import { useState, useEffect, useMemo, useCallback } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Search, Eye, CheckCircle, XCircle, Clock, Plus, Store, Filter, X, Truck, Download, Loader2, AlertCircle, Printer, Copy, Edit, Trash2, RotateCcw } from 'lucide-react'
import * as XLSX from 'xlsx'
import { useDebounce } from '../hooks/useDebounce'
import { usePagination } from '../hooks/usePagination'
import { multiFilter, fastSearch } from '../utils/filterUtils'
import Pagination from '../components/Pagination'
import { useCrud } from '../hooks/useApi'
import { ordersApi } from '../services/ordersApi'
import PrintDialog from '../components/PrintDialog'
import { getStoredShipments, persistShipments } from '../services/shippingIntegrationService'
import { addInAppNotification } from '../services/notificationService'

const MANUAL_ORDERS_KEY = 'kv_manual_orders_v1'

const loadManualOrders = () => {
  try {
    const raw = localStorage.getItem(MANUAL_ORDERS_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

const Orders = () => {
  const location = useLocation()
  const navigate = useNavigate()
  
  // Danh sách kênh bán hàng mặc định
  const defaultChannels = ['TikTok', 'Shopee', 'Lazada', 'Facebook']
  
  // Lấy danh sách kênh từ localStorage hoặc dùng mặc định
  const [channels, setChannels] = useState(() => {
    const saved = localStorage.getItem('salesChannels')
    return saved ? JSON.parse(saved) : defaultChannels
  })

  // Lưu channels vào localStorage khi thay đổi
  useEffect(() => {
    localStorage.setItem('salesChannels', JSON.stringify(channels))
  }, [channels])

  // Fallback data khi API chưa sẵn sàng
  const FALLBACK_ORDERS = [
    { 
      // Thông tin cơ bản
      chiNhanh: 'CN01 - Hà Nội',
      maHoaDon: 'HD001',
      maVanDon: 'VD001',
      diaChiLayHang: '123 Đường ABC, Quận 1, TP.HCM',
      maDoiSoat: 'DS001',
      phiTraDTGH: 30000,
      thoiGian: '2024-01-15 10:30:00',
      thoiGianTao: '2024-01-15 09:00:00',
      ngayCapNhat: '2024-01-15 14:00:00',
      maDatHang: 'MDH001',
      maTraHang: '',
      
      // Thông tin khách hàng
      maKhachHang: 'KH001',
      tenKhachHang: 'Nguyễn Văn A',
      email: 'nguyenvana@email.com',
      dienThoai: '0901234567',
      diaChiKhachHang: '456 Đường XYZ, Quận 2, TP.HCM',
      khuVucKhachHang: 'Quận 2',
      phuongXaKhachHang: 'Phường 1',
      ngaySinh: '1990-05-15',
      
      // Thông tin đơn hàng
      bangGia: 'Bảng giá chuẩn',
      nguoiBan: 'Nguyễn Thị B',
      kenhBan: 'Shopee',
      nguoiTao: 'Admin',
      doiTacGiaoHang: 'GHN',
      
      // Thông tin người nhận
      nguoiNhan: 'Nguyễn Văn A',
      dienThoaiNguoiNhan: '0901234567',
      diaChiNguoiNhan: '456 Đường XYZ, Quận 2, TP.HCM',
      khuVucNguoiNhan: 'Quận 2',
      phuongXaNguoiNhan: 'Phường 1',
      
      // Thông tin vận chuyển
      dichVu: 'Giao hàng tiêu chuẩn',
      trongLuong: 1500,
      dai: 30,
      rong: 20,
      cao: 15,
      ghiChuTrangThaiGiaoHang: 'Đã giao thành công',
      ghiChuGiaoHang: 'Giao trong giờ hành chính',
      ghiChu: 'Khách hàng yêu cầu giao hàng nhanh',
      
      // Thông tin thanh toán
      tongTienHang: 1200000,
      giamGiaHoaDon: 50000,
      vat: 0,
      thuKhac: 0,
      khachCanTra: 1250000,
      khachDaTra: 1250000,
      tienMat: 1250000,
      the: 0,
      vi: 0,
      chuyenKhoan: 0,
      diem: 0,
      voucher: 0,
      maVoucher: '',
      conCanThuCOD: 0,
      thoiGianGiaoHang: '2024-01-16 14:00:00',
      trangThai: 'Đã giao',
      trangThaiGiaoHang: 'Đã giao',
      
      // Thông tin sản phẩm (mảng)
      sanPham: [
        {
          maHang: 'SP001',
          maVach: '1234567890123',
          tenHang: 'Áo thun nam',
          thuongHieu: 'Brand A',
          dvt: 'Cái',
          ghiChuHangHoa: 'Màu xanh, size L',
          soLuong: 2,
          donGia: 500000,
          giamGiaPhanTram: 10,
          giamGia: 50000,
          giaBan: 450000,
          thanhTien: 900000
        },
        {
          maHang: 'SP002',
          maVach: '1234567890124',
          tenHang: 'Quần jean',
          thuongHieu: 'Brand B',
          dvt: 'Cái',
          ghiChuHangHoa: 'Màu xanh đậm, size 32',
          soLuong: 1,
          donGia: 300000,
          giamGiaPhanTram: 0,
          giamGia: 0,
          giaBan: 300000,
          thanhTien: 300000
        }
      ],
      
      // Trường để tương thích với code cũ
      id: 'HD001',
      customer: 'Nguyễn Văn A',
      date: '2024-01-15',
      total: 1250000,
      status: 'Đã giao',
      items: 3,
      channel: 'Shopee'
    },
    { 
      chiNhanh: 'CN02 - TP.HCM',
      maHoaDon: 'HD002',
      maVanDon: 'VD002',
      diaChiLayHang: '789 Đường DEF, Quận 3, TP.HCM',
      maDoiSoat: 'DS002',
      phiTraDTGH: 25000,
      thoiGian: '2024-01-16 11:00:00',
      thoiGianTao: '2024-01-16 10:00:00',
      ngayCapNhat: '2024-01-16 15:00:00',
      maDatHang: 'MDH002',
      maTraHang: '',
      maKhachHang: 'KH002',
      tenKhachHang: 'Trần Thị B',
      email: 'tranthib@email.com',
      dienThoai: '0912345678',
      diaChiKhachHang: '789 Đường GHI, Quận 4, TP.HCM',
      khuVucKhachHang: 'Quận 4',
      phuongXaKhachHang: 'Phường 2',
      ngaySinh: '1992-08-20',
      bangGia: 'Bảng giá VIP',
      nguoiBan: 'Lê Văn C',
      kenhBan: 'TikTok',
      nguoiTao: 'Staff01',
      doiTacGiaoHang: 'Viettel Post',
      nguoiNhan: 'Trần Thị B',
      dienThoaiNguoiNhan: '0912345678',
      diaChiNguoiNhan: '789 Đường GHI, Quận 4, TP.HCM',
      khuVucNguoiNhan: 'Quận 4',
      phuongXaNguoiNhan: 'Phường 2',
      dichVu: 'Giao hàng nhanh',
      trongLuong: 800,
      dai: 25,
      rong: 15,
      cao: 10,
      ghiChuTrangThaiGiaoHang: 'Đang xử lý',
      ghiChuGiaoHang: '',
      ghiChu: '',
      tongTienHang: 850000,
      giamGiaHoaDon: 40000,
      vat: 0,
      thuKhac: 0,
      khachCanTra: 890000,
      khachDaTra: 0,
      tienMat: 0,
      the: 0,
      vi: 0,
      chuyenKhoan: 0,
      diem: 0,
      voucher: 40000,
      maVoucher: 'VOUCHER001',
      conCanThuCOD: 890000,
      thoiGianGiaoHang: '',
      trangThai: 'Đang xử lý',
      trangThaiGiaoHang: 'Chưa giao',
      sanPham: [
        {
          maHang: 'SP003',
          maVach: '1234567890125',
          tenHang: 'Giày thể thao',
          thuongHieu: 'Brand C',
          dvt: 'Đôi',
          ghiChuHangHoa: 'Size 42, màu đen',
          soLuong: 1,
          donGia: 850000,
          giamGiaPhanTram: 0,
          giamGia: 0,
          giaBan: 850000,
          thanhTien: 850000
        }
      ],
      id: 'HD002',
      customer: 'Trần Thị B',
      date: '2024-01-16',
      total: 890000,
      status: 'Đang xử lý',
      items: 2,
      channel: 'TikTok'
    },
  ]

  // Sử dụng API với fallback
  const {
    items: orders,
    loading,
    error,
    fetchAll,
    setItems: setOrders,
  } = useCrud(ordersApi)

  const [apiError, setApiError] = useState(null)
  const [usingFallback, setUsingFallback] = useState(false)

  // Load data khi component mount
  useEffect(() => {
    const loadOrders = async () => {
      try {
        await fetchAll()
        const manualOrders = loadManualOrders()
        if (manualOrders.length) {
          setOrders((prev) => [...manualOrders, ...prev])
        }
        setApiError(null) // Clear error nếu thành công
        setUsingFallback(false)
      } catch (err) {
        // Nếu API fail (API_UNAVAILABLE hoặc API_DISABLED), sử dụng fallback data
        const errorMessage = err.message || ''
        if (errorMessage === 'API_UNAVAILABLE' || errorMessage === 'API_DISABLED') {
          const disableFallback = localStorage.getItem('disableFallbackData') === 'true'
          if (disableFallback) {
            console.info('API không khả dụng và fallback đã bị vô hiệu hóa. Danh sách đơn hàng được đặt rỗng.')
            setOrders([])
            setApiError('Không thể tải dữ liệu đơn hàng. Vui lòng kiểm tra cấu hình đồng bộ Thuần Chay VN.')
            setUsingFallback(false)
          } else {
            console.info('API không khả dụng, sử dụng dữ liệu mẫu')
            const manualOrders = loadManualOrders()
            setOrders([...manualOrders, ...FALLBACK_ORDERS])
            setApiError(null) // Không hiển thị error khi đã fallback
            setUsingFallback(true)
          }
        } else {
          // Các lỗi khác vẫn hiển thị
          setApiError(err.message)
          setUsingFallback(false)
        }
      }
    }
    loadOrders()
  }, [fetchAll, setOrders])

  // Kiểm tra state từ navigation (từ Customers page)
  useEffect(() => {
    if (location.state) {
      if (location.state.customerFilter) {
        // Filter theo khách hàng
        setCustomerFilter(location.state.customerFilter)
        setShowAdvancedFilters(true)
      }
      if (location.state.orderId) {
        // Tìm và mở modal chi tiết đơn hàng
        const order = orders.find(o => o.maHoaDon === location.state.orderId || o.id === location.state.orderId)
        if (order) {
          setSelectedOrder(order)
          setShowOrderDetail(true)
        } else {
          // Nếu chưa load xong, tìm trong filtered orders
          setTimeout(() => {
            const foundOrder = orders.find(o => o.maHoaDon === location.state.orderId || o.id === location.state.orderId)
            if (foundOrder) {
              setSelectedOrder(foundOrder)
              setShowOrderDetail(true)
            }
          }, 500)
        }
      }
      // Clear state sau khi sử dụng
      navigate(location.pathname, { replace: true, state: {} })
    }
  }, [location.state, navigate, location.pathname, orders])

  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [channelFilter, setChannelFilter] = useState('all')
  const [showAddChannelModal, setShowAddChannelModal] = useState(false)
  const [newChannelName, setNewChannelName] = useState('')
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)
  const [showOrderDetail, setShowOrderDetail] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [printDialog, setPrintDialog] = useState({ open: false, type: 'invoice' })
  const [printPayload, setPrintPayload] = useState(null)
  
  // Advanced filters
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [priceMin, setPriceMin] = useState('')
  const [priceMax, setPriceMax] = useState('')
  const [customerFilter, setCustomerFilter] = useState('')
  const [itemsMin, setItemsMin] = useState('')
  const [itemsMax, setItemsMax] = useState('')

  const buildShipmentFromOrder = (order) => ({
    maVanDon: order?.maVanDon,
    doiTacGiaoHang: order?.doiTacGiaoHang,
    dichVu: order?.dichVu,
    nguoiNhan: order?.nguoiNhan || order?.tenKhachHang,
    dienThoaiNguoiNhan: order?.dienThoaiNguoiNhan || order?.dienThoai,
    diaChiNguoiNhan: order?.diaChiNguoiNhan || order?.diaChiKhachHang,
    phiTraDTGH: order?.phiTraDTGH,
    trongLuong: order?.trongLuong,
    dai: order?.dai,
    rong: order?.rong,
    cao: order?.cao,
  })

  const handlePrintOrder = (order, variant) => {
    if (!order) return
    setPrintPayload({
      order,
      shipment: buildShipmentFromOrder(order),
    })
    setPrintDialog({ open: true, type: variant })
  }

  // Hủy vận đơn
  const handleCancelShipment = (order) => {
    if (!order || !order.maVanDon) {
      addInAppNotification('Đơn hàng này chưa có vận đơn', 'error')
      return
    }

    if (!window.confirm(`Bạn có chắc muốn hủy vận đơn ${order.maVanDon}?`)) {
      return
    }

    try {
      // Xóa vận đơn khỏi danh sách shipments
      const shipments = getStoredShipments() || []
      const updatedShipments = shipments.filter(
        s => s.maVanDon !== order.maVanDon
      )
      persistShipments(updatedShipments)

      // Cập nhật đơn hàng: xóa mã vận đơn và đặt lại trạng thái
      const updatedOrders = orders.map(o => {
        if (o.id === order.id || o.maHoaDon === order.maHoaDon) {
          return {
            ...o,
            maVanDon: null,
            trangThai: 'Chờ xử lý',
            ngayCapNhat: new Date().toLocaleString('vi-VN')
          }
        }
        return o
      })

      // Lưu lại đơn hàng
      localStorage.setItem(MANUAL_ORDERS_KEY, JSON.stringify(updatedOrders))
      setOrders(updatedOrders)

      // Cập nhật selectedOrder nếu đang xem chi tiết
      if (selectedOrder && (selectedOrder.id === order.id || selectedOrder.maHoaDon === order.maHoaDon)) {
        setSelectedOrder({
          ...selectedOrder,
          maVanDon: null,
          trangThai: 'Chờ xử lý',
          ngayCapNhat: new Date().toLocaleString('vi-VN')
        })
      }

      addInAppNotification('Đã hủy vận đơn thành công', 'success')
    } catch (error) {
      console.error('Error canceling shipment:', error)
      addInAppNotification('Không thể hủy vận đơn', 'error')
    }
  }

  // Sao chép đơn hàng
  const handleCopyOrder = (order) => {
    if (!order) return

    try {
      // Chuyển dữ liệu đơn hàng sang CreateOrder với query params
      const orderData = {
        // Thông tin đơn hàng
        maDatHang: order.maDatHang,
        kenhBan: order.kenhBan || order.channel,
        chiNhanh: order.chiNhanh,
        
        // Thông tin khách hàng
        maKhachHang: order.maKhachHang,
        tenKhachHang: order.tenKhachHang || order.customer,
        email: order.email,
        dienThoai: order.dienThoai,
        diaChiKhachHang: order.diaChiKhachHang || order.diaChi,
        customerGroup: order.customerGroup || order.nhomKhachHang,
        
        // Sản phẩm
        items: order.sanPham || order.items || [],
        
        // Thông tin thanh toán
        tongTien: order.tongTien,
        giamGia: order.giamGia,
        phiVanChuyen: order.phiVanChuyen,
        thueVAT: order.thueVAT,
        khachCanTra: order.khachCanTra,
        
        // Thông tin vận chuyển
        donViVanChuyen: order.donViVanChuyen,
        dichVu: order.dichVu,
        nguoiNhan: order.nguoiNhan || order.tenKhachHang,
        dienThoaiNguoiNhan: order.dienThoaiNguoiNhan || order.dienThoai,
        diaChiNguoiNhan: order.diaChiNguoiNhan || order.diaChiKhachHang,
        phiTraDTGH: order.phiTraDTGH,
        trongLuong: order.trongLuong,
        dai: order.dai,
        rong: order.rong,
        cao: order.cao,
      }

      // Lưu vào sessionStorage để CreateOrder có thể đọc
      sessionStorage.setItem('copiedOrderData', JSON.stringify(orderData))
      
      // Chuyển đến trang CreateOrder
      navigate('/orders/create?copy=true')
      
      addInAppNotification('Đã sao chép đơn hàng, bạn có thể chỉnh sửa và tạo đơn mới', 'success')
    } catch (error) {
      console.error('Error copying order:', error)
      addInAppNotification('Không thể sao chép đơn hàng', 'error')
    }
  }

  // Chỉnh sửa đơn hàng
  const handleEditOrder = (order) => {
    if (!order) return

    try {
      // Tương tự như copy nhưng đánh dấu là edit
      const orderData = {
        // Thông tin đơn hàng
        id: order.id,
        maHoaDon: order.maHoaDon,
        maDatHang: order.maDatHang,
        kenhBan: order.kenhBan || order.channel,
        chiNhanh: order.chiNhanh,
        
        // Thông tin khách hàng
        maKhachHang: order.maKhachHang,
        tenKhachHang: order.tenKhachHang || order.customer,
        email: order.email,
        dienThoai: order.dienThoai,
        diaChiKhachHang: order.diaChiKhachHang || order.diaChi,
        customerGroup: order.customerGroup || order.nhomKhachHang,
        
        // Sản phẩm
        items: order.sanPham || order.items || [],
        
        // Thông tin thanh toán
        tongTien: order.tongTien,
        giamGia: order.giamGia,
        phiVanChuyen: order.phiVanChuyen,
        thueVAT: order.thueVAT,
        khachCanTra: order.khachCanTra,
        
        // Thông tin vận chuyển
        donViVanChuyen: order.donViVanChuyen,
        dichVu: order.dichVu,
        nguoiNhan: order.nguoiNhan || order.tenKhachHang,
        dienThoaiNguoiNhan: order.dienThoaiNguoiNhan || order.dienThoai,
        diaChiNguoiNhan: order.diaChiNguoiNhan || order.diaChiKhachHang,
        phiTraDTGH: order.phiTraDTGH,
        trongLuong: order.trongLuong,
        dai: order.dai,
        rong: order.rong,
        cao: order.cao,
      }

      // Lưu vào sessionStorage
      sessionStorage.setItem('editOrderData', JSON.stringify(orderData))
      
      // Chuyển đến trang CreateOrder với mode edit
      navigate('/orders/create?edit=true')
      
      addInAppNotification('Đã mở đơn hàng để chỉnh sửa', 'success')
    } catch (error) {
      console.error('Error editing order:', error)
      addInAppNotification('Không thể mở đơn hàng để chỉnh sửa', 'error')
    }
  }

  // Debounce search và customer filter
  const debouncedSearchTerm = useDebounce(searchTerm, 300)
  const debouncedCustomerFilter = useDebounce(customerFilter, 300)

  // Memoize tính toán totalItems cho mỗi order để tránh tính lại nhiều lần
  const ordersWithTotalItems = useMemo(() => {
    return orders.map(order => ({
      ...order,
      _totalItems: order.sanPham?.reduce((sum, sp) => sum + (sp.soLuong || 0), 0) || order.items || 0
    }))
  }, [orders])

  // Memoize filtered orders với các tối ưu
  const filteredOrders = useMemo(() => {
    let result = ordersWithTotalItems

    // Search filter với fast search
    if (debouncedSearchTerm) {
      result = fastSearch(result, debouncedSearchTerm, [
        'maHoaDon', 'maVanDon', 'tenKhachHang', 'dienThoai', 'maKhachHang', 'maDatHang'
      ])
    }

    // Apply other filters với multiFilter
    const filters = {
      status: statusFilter !== 'all' ? statusFilter : null,
      channel: channelFilter !== 'all' ? channelFilter : null,
      dateFrom: dateFrom || null,
      dateTo: dateTo || null,
      priceMin: priceMin || null,
      priceMax: priceMax || null,
      customer: debouncedCustomerFilter || null,
    }

    result = multiFilter(result, filters)

    // Filter by items count
    if (itemsMin || itemsMax) {
      result = result.filter(order => {
        const totalItems = order._totalItems
        const matchesMin = !itemsMin || totalItems >= Number(itemsMin)
        const matchesMax = !itemsMax || totalItems <= Number(itemsMax)
        return matchesMin && matchesMax
      })
    }

    return result
  }, [
    ordersWithTotalItems,
    debouncedSearchTerm,
    statusFilter,
    channelFilter,
    dateFrom,
    dateTo,
    priceMin,
    priceMax,
    debouncedCustomerFilter,
    itemsMin,
    itemsMax
  ])

  // Pagination
  const {
    currentPage,
    totalPages,
    paginatedData,
    totalItems,
    startIndex,
    endIndex,
    goToPage,
    nextPage,
    prevPage,
    resetPagination,
  } = usePagination(filteredOrders, 50)

  // Reset pagination khi filters thay đổi
  useEffect(() => {
    resetPagination()
  }, [debouncedSearchTerm, statusFilter, channelFilter, dateFrom, dateTo, priceMin, priceMax, debouncedCustomerFilter, itemsMin, itemsMax, resetPagination])

  const handleResetFilters = () => {
    setDateFrom('')
    setDateTo('')
    setPriceMin('')
    setPriceMax('')
    setCustomerFilter('')
    setItemsMin('')
    setItemsMax('')
    setSearchTerm('')
    setStatusFilter('all')
    setChannelFilter('all')
  }

  const hasActiveFilters = dateFrom || dateTo || priceMin || priceMax || 
                          customerFilter || itemsMin || itemsMax || 
                          statusFilter !== 'all' || channelFilter !== 'all'

  const handleAddChannel = () => {
    if (newChannelName.trim() && !channels.includes(newChannelName.trim())) {
      setChannels([...channels, newChannelName.trim()])
      setNewChannelName('')
      setShowAddChannelModal(false)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'Đã giao':
        return 'bg-green-100 text-green-800'
      case 'Đang xử lý':
        return 'bg-yellow-100 text-yellow-800'
      case 'Đang giao':
        return 'bg-blue-100 text-blue-800'
      case 'Chờ xác nhận':
        return 'bg-purple-100 text-purple-800'
      case 'Đã hủy':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Đã giao':
        return <CheckCircle size={16} />
      case 'Đang xử lý':
        return <Clock size={16} />
      case 'Đang giao':
        return <Clock size={16} />
      case 'Chờ xác nhận':
        return <Clock size={16} />
      case 'Đã hủy':
        return <XCircle size={16} />
      default:
        return null
    }
  }

  const handleExportToExcel = () => {
    // Chuẩn bị dữ liệu để xuất
    const exportData = filteredOrders.map((order, index) => {
      const totalItems = order.sanPham?.reduce((sum, sp) => sum + (sp.soLuong || 0), 0) || 0
      return {
        'STT': index + 1,
        'Mã hóa đơn': order.maHoaDon || '',
        'Mã vận đơn': order.maVanDon || '',
        'Chi nhánh': order.chiNhanh || '',
        'Kênh bán': order.kenhBan || '',
        'Ngày tạo': order.thoiGianTao || '',
        'Tên khách hàng': order.tenKhachHang || '',
        'Điện thoại': order.dienThoai || '',
        'Email': order.email || '',
        'Địa chỉ': order.diaChiKhachHang || '',
        'Số lượng SP': totalItems,
        'Tổng tiền hàng': order.tongTienHang || 0,
        'Giảm giá': order.giamGiaHoaDon || 0,
        'VAT': order.vat || 0,
        'Thu khác': order.thuKhac || 0,
        'Khách cần trả': order.khachCanTra || 0,
        'Khách đã trả': order.khachDaTra || 0,
        'Tiền mặt': order.tienMat || 0,
        'Thẻ': order.the || 0,
        'Chuyển khoản': order.chuyenKhoan || 0,
        'Ví': order.vi || 0,
        'Điểm': order.diem || 0,
        'Voucher': order.voucher || 0,
        'Mã voucher': order.maVoucher || '',
        'Còn cần thu COD': order.conCanThuCOD || 0,
        'Đối tác giao hàng': order.doiTacGiaoHang || '',
        'Trạng thái': order.trangThai || '',
        'Trạng thái giao hàng': order.trangThaiGiaoHang || '',
        'Thời gian giao hàng': order.thoiGianGiaoHang || '',
        'Ghi chú': order.ghiChu || ''
      }
    })

    // Tạo workbook và worksheet
    const ws = XLSX.utils.json_to_sheet(exportData)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Đơn hàng')

    // Điều chỉnh độ rộng cột
    const colWidths = [
      { wch: 5 },   // STT
      { wch: 12 },  // Mã hóa đơn
      { wch: 12 },  // Mã vận đơn
      { wch: 20 },  // Chi nhánh
      { wch: 12 },  // Kênh bán
      { wch: 18 },  // Ngày tạo
      { wch: 20 },  // Tên khách hàng
      { wch: 12 },  // Điện thoại
      { wch: 25 },  // Email
      { wch: 30 },  // Địa chỉ
      { wch: 12 },  // Số lượng SP
      { wch: 15 },  // Tổng tiền hàng
      { wch: 12 },  // Giảm giá
      { wch: 10 },  // VAT
      { wch: 12 },  // Thu khác
      { wch: 15 },  // Khách cần trả
      { wch: 15 },  // Khách đã trả
      { wch: 12 },  // Tiền mặt
      { wch: 10 },  // Thẻ
      { wch: 15 },  // Chuyển khoản
      { wch: 10 },  // Ví
      { wch: 10 },  // Điểm
      { wch: 12 },  // Voucher
      { wch: 15 },  // Mã voucher
      { wch: 15 },  // Còn cần thu COD
      { wch: 18 },  // Đối tác giao hàng
      { wch: 15 },  // Trạng thái
      { wch: 20 },  // Trạng thái giao hàng
      { wch: 20 },  // Thời gian giao hàng
      { wch: 30 }   // Ghi chú
    ]
    ws['!cols'] = colWidths

    // Tạo tên file với thời gian
    const now = new Date()
    const dateStr = now.toISOString().split('T')[0]
    const timeStr = now.toTimeString().split(' ')[0].replace(/:/g, '-')
    const fileName = `Don_hang_${dateStr}_${timeStr}.xlsx`

    // Xuất file
    XLSX.writeFile(wb, fileName)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Quản lý Đơn hàng</h1>
          <p className="text-gray-600">Theo dõi và quản lý tất cả đơn hàng</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={() => navigate('/orders/create')}
            className="btn-primary flex items-center gap-2"
          >
            <Plus size={20} />
            Tạo đơn & vận đơn
          </button>
          <button
            onClick={handleExportToExcel}
            disabled={filteredOrders.length === 0}
            className="btn-secondary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download size={20} />
            Xuất Excel
          </button>
        </div>
      </div>

      {/* Error Message - chỉ hiển thị nếu không có fallback data */}
      {(error || apiError) && orders.length === 0 && (
        <div className="card bg-red-50 border border-red-200">
          <div className="flex items-center gap-2 text-red-800">
            <AlertCircle size={20} />
            <span>{error || apiError}</span>
          </div>
        </div>
      )}

      {/* Info Message khi dùng fallback data - chỉ hiển thị trong development */}
      {usingFallback && orders.length > 0 && !loading && import.meta.env.DEV && (
        <div className="card bg-blue-50 border border-blue-200">
          <div className="flex items-center gap-2 text-blue-800 text-sm">
            <AlertCircle size={18} />
            <span>Đang sử dụng dữ liệu mẫu. API server chưa được cấu hình hoặc không khả dụng.</span>
          </div>
        </div>
      )}

      {/* Basic Filters */}
      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Tìm kiếm đơn hàng..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-10"
              disabled={loading}
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input-field"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="Đã giao">Đã giao</option>
            <option value="Đang xử lý">Đang xử lý</option>
            <option value="Đang giao">Đang giao</option>
            <option value="Đã hủy">Đã hủy</option>
          </select>
          <div className="flex gap-2">
            <select
              value={channelFilter}
              onChange={(e) => setChannelFilter(e.target.value)}
              className="input-field flex-1"
            >
              <option value="all">Tất cả kênh</option>
              {channels.map(channel => (
                <option key={channel} value={channel}>{channel}</option>
              ))}
            </select>
            <button
              onClick={() => setShowAddChannelModal(true)}
              className="btn-primary flex items-center gap-2 whitespace-nowrap"
              title="Thêm kênh mới"
            >
              <Plus size={18} />
            </button>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                showAdvancedFilters || hasActiveFilters
                  ? 'bg-primary-600 text-white hover:bg-primary-700'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              <Filter size={18} />
              Bộ lọc nâng cao
              {hasActiveFilters && (
                <span className="ml-1 px-2 py-0.5 bg-white text-primary-600 rounded-full text-xs">
                  {[dateFrom, dateTo, priceMin, priceMax, customerFilter, itemsMin, itemsMax].filter(Boolean).length}
                </span>
              )}
            </button>
            {hasActiveFilters && (
              <button
                onClick={handleResetFilters}
                className="btn-secondary flex items-center gap-2"
                title="Xóa tất cả bộ lọc"
              >
                <X size={18} />
              </button>
            )}
          </div>
        </div>

        {/* Advanced Filters */}
        {showAdvancedFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Từ ngày
                </label>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Đến ngày
                </label>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Giá từ (đ)
                </label>
                <input
                  type="number"
                  value={priceMin}
                  onChange={(e) => setPriceMin(e.target.value)}
                  placeholder="0"
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Giá đến (đ)
                </label>
                <input
                  type="number"
                  value={priceMax}
                  onChange={(e) => setPriceMax(e.target.value)}
                  placeholder="Không giới hạn"
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Khách hàng
                </label>
                <input
                  type="text"
                  value={customerFilter}
                  onChange={(e) => setCustomerFilter(e.target.value)}
                  placeholder="Tên khách hàng"
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Số lượng từ
                </label>
                <input
                  type="number"
                  value={itemsMin}
                  onChange={(e) => setItemsMin(e.target.value)}
                  placeholder="0"
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Số lượng đến
                </label>
                <input
                  type="number"
                  value={itemsMax}
                  onChange={(e) => setItemsMax(e.target.value)}
                  placeholder="Không giới hạn"
                  className="input-field"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Orders Table */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-gray-600">
            Hiển thị <span className="font-semibold text-gray-900">{startIndex}-{endIndex}</span> trong tổng số <span className="font-semibold text-gray-900">{totalItems.toLocaleString('vi-VN')}</span> đơn hàng
            {hasActiveFilters && (
              <span className="ml-2 text-primary-600">(đã lọc từ {orders.length.toLocaleString('vi-VN')} đơn)</span>
            )}
          </p>
        </div>
        <div className="overflow-x-auto">
          {loading && orders.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="animate-spin text-primary-600" size={32} />
              <span className="ml-3 text-gray-600">Đang tải dữ liệu...</span>
            </div>
          ) : paginatedData.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">Không tìm thấy đơn hàng nào</p>
              <p className="text-gray-400 text-sm mt-2">Thử điều chỉnh bộ lọc để tìm kiếm</p>
              {hasActiveFilters && (
                <button
                  onClick={handleResetFilters}
                  className="mt-4 btn-secondary"
                >
                  Xóa tất cả bộ lọc
                </button>
              )}
            </div>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Mã hóa đơn</th>
                  <th>Mã vận đơn</th>
                  <th>Khách hàng</th>
                  <th>Điện thoại</th>
                  <th>Chi nhánh</th>
                  <th>Kênh bán</th>
                  <th>Đối tác GH</th>
                  <th>Ngày tạo</th>
                  <th>Số lượng SP</th>
                  <th>Tổng tiền</th>
                  <th>Trạng thái</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {paginatedData.map((order) => {
                  const totalItems = order._totalItems || 0
                  const orderDate = order.thoiGianTao?.split(' ')[0] || order.date
                  
                  return (
                    <tr key={order.maHoaDon || order.id}>
                      <td className="font-mono font-medium">{order.maHoaDon || order.id}</td>
                      <td className="font-mono text-sm">{order.maVanDon || '-'}</td>
                      <td>
                        <div>
                          <div className="font-medium">{order.tenKhachHang || order.customer}</div>
                          <div className="text-xs text-gray-500">{order.maKhachHang || ''}</div>
                        </div>
                      </td>
                      <td>{order.dienThoai || '-'}</td>
                      <td className="text-sm">{order.chiNhanh || '-'}</td>
                      <td>
                        <span className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium">
                          <Store size={14} />
                          {order.kenhBan || order.channel || 'Chưa xác định'}
                        </span>
                      </td>
                      <td>
                        <span className="inline-flex items-center gap-2 px-3 py-1 bg-purple-50 text-purple-700 rounded-lg text-sm font-medium">
                          <Truck size={14} />
                          {order.doiTacGiaoHang || '-'}
                        </span>
                      </td>
                      <td className="text-sm">{orderDate}</td>
                      <td>{totalItems} SP</td>
                      <td className="font-semibold text-primary-600">
                        {(order.khachCanTra || order.total || 0).toLocaleString('vi-VN')} đ
                      </td>
                      <td>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 w-fit ${getStatusColor(order.trangThai || order.status)}`}>
                          {getStatusIcon(order.trangThai || order.status)}
                          {order.trangThai || order.status}
                        </span>
                      </td>
                      <td>
                        <button 
                          className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors" 
                          title="Xem chi tiết"
                          onClick={() => {
                            // Sẽ mở modal chi tiết
                            setSelectedOrder(order)
                            setShowOrderDetail(true)
                          }}
                        >
                          <Eye size={16} />
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
        
        {/* Pagination */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          startIndex={startIndex}
          endIndex={endIndex}
          onPageChange={goToPage}
          onNext={nextPage}
          onPrev={prevPage}
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card">
          <p className="text-sm text-gray-600">Tổng đơn hàng</p>
          <p className="text-2xl font-bold mt-1">{orders.length}</p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-600">Đã giao</p>
          <p className="text-2xl font-bold mt-1 text-green-600">
            {orders.filter(o => o.status === 'Đã giao').length}
          </p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-600">Đang xử lý</p>
          <p className="text-2xl font-bold mt-1 text-yellow-600">
            {orders.filter(o => o.status === 'Đang xử lý').length}
          </p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-600">Tổng doanh thu</p>
          <p className="text-2xl font-bold mt-1 text-primary-600">
            {orders.reduce((sum, o) => sum + o.total, 0).toLocaleString('vi-VN')} đ
          </p>
        </div>
      </div>

      {/* Channel Statistics */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Store size={20} />
          Thống kê theo kênh bán hàng
        </h3>
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>Kênh bán hàng</th>
                <th>Số đơn hàng</th>
                <th>Tổng doanh thu</th>
                <th>Tỷ lệ</th>
              </tr>
            </thead>
            <tbody>
              {channels.map(channel => {
                const channelOrders = orders.filter(o => o.channel === channel)
                const channelRevenue = channelOrders.reduce((sum, o) => sum + o.total, 0)
                const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0)
                const percentage = totalRevenue > 0 ? (channelRevenue / totalRevenue * 100).toFixed(1) : 0
                
                return (
                  <tr key={channel}>
                    <td className="font-medium">
                      <span className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-700 rounded-lg text-sm">
                        <Store size={14} />
                        {channel}
                      </span>
                    </td>
                    <td>{channelOrders.length} đơn</td>
                    <td className="font-semibold text-primary-600">
                      {channelRevenue.toLocaleString('vi-VN')} đ
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-primary-600 h-2 rounded-full"
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-600 w-12">{percentage}%</span>
                      </div>
                    </td>
                  </tr>
                )
              })}
              {orders.filter(o => !o.channel || !channels.includes(o.channel)).length > 0 && (
                <tr>
                  <td className="font-medium text-gray-500">Chưa xác định</td>
                  <td>{orders.filter(o => !o.channel || !channels.includes(o.channel)).length} đơn</td>
                  <td className="font-semibold text-gray-600">
                    {orders
                      .filter(o => !o.channel || !channels.includes(o.channel))
                      .reduce((sum, o) => sum + o.total, 0)
                      .toLocaleString('vi-VN')} đ
                  </td>
                  <td>-</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Detail Modal */}
      {showOrderDetail && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-lg p-6 w-full max-w-6xl max-h-[90vh] overflow-y-auto">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between mb-6">
              <h2 className="text-2xl font-bold">
                Chi tiết đơn hàng: {selectedOrder.maHoaDon || selectedOrder.id}
              </h2>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => handleCopyOrder(selectedOrder)}
                  className="btn-secondary inline-flex items-center gap-2"
                  title="Sao chép đơn hàng"
                >
                  <Copy size={16} />
                  Sao chép
                </button>
                {selectedOrder.trangThai === 'Chờ lấy hàng' && selectedOrder.maVanDon && (
                  <>
                    <button
                      onClick={() => handleCancelShipment(selectedOrder)}
                      className="btn-secondary inline-flex items-center gap-2 text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                      title="Hủy vận đơn"
                    >
                      <Trash2 size={16} />
                      Hủy vận đơn
                    </button>
                    <button
                      onClick={() => handleEditOrder(selectedOrder)}
                      className="btn-secondary inline-flex items-center gap-2"
                      title="Chỉnh sửa đơn hàng"
                    >
                      <Edit size={16} />
                      Chỉnh sửa
                    </button>
                  </>
                )}
                {(!selectedOrder.maVanDon || selectedOrder.trangThai !== 'Chờ lấy hàng') && (
                  <button
                    onClick={() => handleEditOrder(selectedOrder)}
                    className="btn-secondary inline-flex items-center gap-2"
                    title="Chỉnh sửa đơn hàng"
                  >
                    <Edit size={16} />
                    Chỉnh sửa
                  </button>
                )}
                <button
                  onClick={() => handlePrintOrder(selectedOrder, 'invoice')}
                  className="btn-secondary inline-flex items-center gap-2"
                >
                  <Printer size={16} />
                  In hóa đơn
                </button>
                <button
                  onClick={() => handlePrintOrder(selectedOrder, 'shipping')}
                  className="btn-secondary inline-flex items-center gap-2"
                >
                  <Printer size={16} />
                  In vận đơn
                </button>
                <button
                  onClick={() => {
                    setShowOrderDetail(false)
                    setSelectedOrder(null)
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Thông tin cơ bản */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2">Thông tin cơ bản</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Chi nhánh:</span>
                    <div className="font-medium">{selectedOrder.chiNhanh || '-'}</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Mã vận đơn:</span>
                    <div className="font-mono font-medium">{selectedOrder.maVanDon || '-'}</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Mã đối soát:</span>
                    <div className="font-medium">{selectedOrder.maDoiSoat || '-'}</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Mã đặt hàng:</span>
                    <div className="font-medium">{selectedOrder.maDatHang || '-'}</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Thời gian tạo:</span>
                    <div className="font-medium">{selectedOrder.thoiGianTao || '-'}</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Ngày cập nhật:</span>
                    <div className="font-medium">{selectedOrder.ngayCapNhat || '-'}</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Kênh bán:</span>
                    <div className="font-medium">{selectedOrder.kenhBan || selectedOrder.channel || '-'}</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Người tạo:</span>
                    <div className="font-medium">{selectedOrder.nguoiTao || '-'}</div>
                  </div>
                </div>
              </div>

              {/* Thông tin khách hàng */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2">Thông tin khách hàng</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Mã khách hàng:</span>
                    <div className="font-mono font-medium">{selectedOrder.maKhachHang || '-'}</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Tên khách hàng:</span>
                    <div className="font-medium">{selectedOrder.tenKhachHang || selectedOrder.customer || '-'}</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Email:</span>
                    <div className="font-medium">{selectedOrder.email || '-'}</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Điện thoại:</span>
                    <div className="font-medium">{selectedOrder.dienThoai || '-'}</div>
                  </div>
                  <div className="col-span-2">
                    <span className="text-gray-600">Địa chỉ:</span>
                    <div className="font-medium">{selectedOrder.diaChiKhachHang || '-'}</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Khu vực:</span>
                    <div className="font-medium">{selectedOrder.khuVucKhachHang || '-'}</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Phường/Xã:</span>
                    <div className="font-medium">{selectedOrder.phuongXaKhachHang || '-'}</div>
                  </div>
                </div>
              </div>

              {/* Thông tin thanh toán */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2">Thông tin thanh toán</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Tổng tiền hàng:</span>
                    <div className="font-semibold text-primary-600">
                      {(selectedOrder.tongTienHang || 0).toLocaleString('vi-VN')} đ
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-600">Giảm giá hóa đơn:</span>
                    <div className="font-medium">{(selectedOrder.giamGiaHoaDon || 0).toLocaleString('vi-VN')} đ</div>
                  </div>
                  <div>
                    <span className="text-gray-600">VAT:</span>
                    <div className="font-medium">{(selectedOrder.vat || 0).toLocaleString('vi-VN')} đ</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Khách cần trả:</span>
                    <div className="font-semibold text-primary-600">
                      {(selectedOrder.khachCanTra || selectedOrder.total || 0).toLocaleString('vi-VN')} đ
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-600">Khách đã trả:</span>
                    <div className="font-medium text-green-600">
                      {(selectedOrder.khachDaTra || 0).toLocaleString('vi-VN')} đ
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-600">Còn cần thu (COD):</span>
                    <div className="font-medium text-red-600">
                      {(selectedOrder.conCanThuCOD || 0).toLocaleString('vi-VN')} đ
                    </div>
                  </div>
                  <div className="col-span-2">
                    <span className="text-gray-600">Phương thức thanh toán:</span>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      <div>Tiền mặt: {(selectedOrder.tienMat || 0).toLocaleString('vi-VN')} đ</div>
                      <div>Thẻ: {(selectedOrder.the || 0).toLocaleString('vi-VN')} đ</div>
                      <div>Ví: {(selectedOrder.vi || 0).toLocaleString('vi-VN')} đ</div>
                      <div>Chuyển khoản: {(selectedOrder.chuyenKhoan || 0).toLocaleString('vi-VN')} đ</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Thông tin vận chuyển */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2">Thông tin vận chuyển</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Mã vận đơn:</span>
                    <div className="font-mono font-medium">{selectedOrder.maVanDon || '-'}</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Đối tác giao hàng:</span>
                    <div className="font-medium flex items-center gap-2">
                      <Truck size={16} />
                      {selectedOrder.doiTacGiaoHang || '-'}
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-600">Dịch vụ:</span>
                    <div className="font-medium">{selectedOrder.dichVu || '-'}</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Địa chỉ lấy hàng:</span>
                    <div className="font-medium">{selectedOrder.diaChiLayHang || '-'}</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Trọng lượng:</span>
                    <div className="font-medium">{selectedOrder.trongLuong || 0} gram</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Kích thước:</span>
                    <div className="font-medium">{selectedOrder.dai || 0} x {selectedOrder.rong || 0} x {selectedOrder.cao || 0} cm</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Phí trả ĐTGH:</span>
                    <div className="font-medium">{(selectedOrder.phiTraDTGH || 0).toLocaleString('vi-VN')} đ</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Trạng thái giao hàng:</span>
                    <div className="font-medium">{selectedOrder.trangThaiGiaoHang || '-'}</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Thời gian giao hàng:</span>
                    <div className="font-medium">{selectedOrder.thoiGianGiaoHang || '-'}</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Ghi chú trạng thái giao hàng:</span>
                    <div className="font-medium">{selectedOrder.ghiChuTrangThaiGiaoHang || '-'}</div>
                  </div>
                  <div className="col-span-2">
                    <span className="text-gray-600">Ghi chú giao hàng:</span>
                    <div className="font-medium">{selectedOrder.ghiChuGiaoHang || '-'}</div>
                  </div>
                  <div className="col-span-2">
                    <span className="text-gray-600">Ghi chú:</span>
                    <div className="font-medium">{selectedOrder.ghiChu || '-'}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Danh sách sản phẩm */}
            {selectedOrder.sanPham && selectedOrder.sanPham.length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-4 border-b pb-2">Danh sách sản phẩm</h3>
                <div className="overflow-x-auto">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Mã hàng</th>
                        <th>Mã vạch</th>
                        <th>Tên hàng</th>
                        <th>Thương hiệu</th>
                        <th>ĐVT</th>
                        <th>Số lượng</th>
                        <th>Đơn giá</th>
                        <th>Giảm giá</th>
                        <th>Thành tiền</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedOrder.sanPham.map((sp, index) => (
                        <tr key={index}>
                          <td className="font-mono text-sm">{sp.maHang}</td>
                          <td className="font-mono text-xs">{sp.maVach}</td>
                          <td>{sp.tenHang}</td>
                          <td>{sp.thuongHieu}</td>
                          <td>{sp.dvt}</td>
                          <td>{sp.soLuong}</td>
                          <td>{sp.donGia?.toLocaleString('vi-VN')} đ</td>
                          <td>
                            {sp.giamGiaPhanTram > 0 && `${sp.giamGiaPhanTram}%`}
                            {sp.giamGia > 0 && ` (${sp.giamGia.toLocaleString('vi-VN')} đ)`}
                          </td>
                          <td className="font-semibold text-primary-600">
                            {sp.thanhTien?.toLocaleString('vi-VN')} đ
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add Channel Modal */}
      {showAddChannelModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Thêm kênh bán hàng mới</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tên kênh bán hàng
                </label>
                <input
                  type="text"
                  value={newChannelName}
                  onChange={(e) => setNewChannelName(e.target.value)}
                  placeholder="VD: Instagram, Zalo, Website..."
                  className="input-field"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleAddChannel()
                    }
                  }}
                />
                {channels.includes(newChannelName.trim()) && (
                  <p className="text-sm text-red-600 mt-1">Kênh này đã tồn tại!</p>
                )}
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleAddChannel}
                  disabled={!newChannelName.trim() || channels.includes(newChannelName.trim())}
                  className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Thêm kênh
                </button>
                <button
                  onClick={() => {
                    setShowAddChannelModal(false)
                    setNewChannelName('')
                  }}
                  className="btn-secondary flex-1"
                >
                  Hủy
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {printDialog.open && printPayload && (
        <PrintDialog
          open={printDialog.open}
          type={printDialog.type}
          orderData={printPayload.order}
          shipmentData={printPayload.shipment}
          onClose={() => setPrintDialog({ open: false, type: 'invoice' })}
        />
      )}
    </div>
  )
}

export default Orders


