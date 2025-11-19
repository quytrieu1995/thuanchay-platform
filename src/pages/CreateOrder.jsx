import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  ArrowLeft,
  Save,
  Trash2,
  Truck,
  Package,
  MapPin,
  User,
  CreditCard,
  ClipboardList,
  Search,
  MinusCircle,
  PlusCircle,
  Printer,
} from 'lucide-react'
import {
  getCarrierIntegrations,
  getStoredShipments,
  persistShipments,
} from '../services/shippingIntegrationService'
import { addInAppNotification } from '../services/notificationService'
import PrintDialog from '../components/PrintDialog'

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

const saveManualOrders = (orders) => {
  localStorage.setItem(MANUAL_ORDERS_KEY, JSON.stringify(orders))
}

const formatDateTimeString = (date = new Date()) => {
  const pad = (n) => String(n).padStart(2, '0')
  const year = date.getFullYear()
  const month = pad(date.getMonth() + 1)
  const day = pad(date.getDate())
  const hours = pad(date.getHours())
  const minutes = pad(date.getMinutes())
  const seconds = pad(date.getSeconds())
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}

const DEFAULT_PICKUP_ADDRESS = '123 Đường ABC, Quận 1, TP.HCM'
const defaultChannels = ['TikTok', 'Shopee', 'Lazada', 'Facebook']
const customerGroups = ['Khách lẻ', 'Khách sỉ', 'Đại lý', 'VIP']
const mockProducts = [
  { id: 'SP001', name: 'Áo thun basic', sku: 'ATB-01', price: 180000 },
  { id: 'SP002', name: 'Áo sơ mi linen', sku: 'ASM-03', price: 260000 },
  { id: 'SP003', name: 'Quần jeans slim', sku: 'QJ-02', price: 320000 },
  { id: 'SP004', name: 'Váy midi caro', sku: 'VMC-07', price: 410000 },
  { id: 'SP005', name: 'Giày sneaker trắng', sku: 'GST-05', price: 540000 },
]

const CreateOrder = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const isEditMode = searchParams.get('edit') === 'true'
  const isCopyMode = searchParams.get('copy') === 'true'
  const carriers = useMemo(() => getCarrierIntegrations(), [])
  const [editingOrderId, setEditingOrderId] = useState(null)
  const [channels, setChannels] = useState(() => {
    try {
      const saved = localStorage.getItem('salesChannels')
      const parsed = saved ? JSON.parse(saved) : defaultChannels
      return Array.isArray(parsed) && parsed.length ? parsed : defaultChannels
    } catch {
      return defaultChannels
    }
  })

  const [orderInfo, setOrderInfo] = useState({
    branch: 'CN01 - Hà Nội',
    salesChannel: defaultChannels[0],
    orderDate: new Date().toISOString().split('T')[0],
    notes: '',
    discount: 0,
    paymentStatus: 'cod', // cod | prepaid
  })

  const [customerInfo, setCustomerInfo] = useState({
    code: '',
    name: '',
    phone: '',
    email: '',
    address: '',
    district: '',
    ward: '',
    group: customerGroups[0],
  })

  const [shippingInfo, setShippingInfo] = useState({
    carrierId: carriers[0]?.id || '',
    service: 'Giao hàng tiêu chuẩn',
    weight: 1,
    length: 20,
    width: 15,
    height: 10,
    fee: 30000,
    pickupAddress: DEFAULT_PICKUP_ADDRESS,
    note: '',
  })

  const [items, setItems] = useState([])
  const [productSearch, setProductSearch] = useState('')

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [printDialog, setPrintDialog] = useState({ open: false, type: 'invoice' })
  const [printPayload, setPrintPayload] = useState(null)

  const normalizedItems = useMemo(() => {
    return items
      .filter((item) => item.name.trim() && Number(item.quantity) > 0)
      .map((item) => {
        const quantity = Number(item.quantity) || 0
        const price = Number(item.price) || 0
        const discount = Number(item.discount) || 0
        const lineTotal = Math.max(quantity * price - discount, 0)
        return {
          ...item,
          soLuong: quantity,
          donGia: price,
          giamGia: discount,
          giaBan: price,
          thanhTien: lineTotal,
        }
      })
  }, [items])

  const subtotal = normalizedItems.reduce((sum, item) => sum + item.thanhTien, 0)
  const totalItems = normalizedItems.reduce((sum, item) => sum + item.soLuong, 0)
  const orderDiscount = Number(orderInfo.discount) || 0
  const shippingFee = Number(shippingInfo.fee) || 0
  const grandTotal = Math.max(subtotal - orderDiscount + shippingFee, 0)
  const isPrepaid = orderInfo.paymentStatus === 'prepaid'

  useEffect(() => {
    if (!shippingInfo.carrierId && carriers.length) {
      setShippingInfo((prev) => ({ ...prev, carrierId: carriers[0].id }))
    }
  }, [shippingInfo.carrierId, carriers])

  useEffect(() => {
    localStorage.setItem('salesChannels', JSON.stringify(channels))
  }, [channels])

  useEffect(() => {
    if (!channels.includes(orderInfo.salesChannel)) {
      setOrderInfo((prev) => ({ ...prev, salesChannel: channels[0] || '' }))
    }
  }, [channels, orderInfo.salesChannel])

  // Load dữ liệu từ sessionStorage khi copy hoặc edit
  useEffect(() => {
    if (isEditMode) {
      try {
        const editData = sessionStorage.getItem('editOrderData')
        if (editData) {
          const data = JSON.parse(editData)
          setEditingOrderId(data.id || data.maHoaDon)
          
          // Load order info
          if (data.chiNhanh) setOrderInfo(prev => ({ ...prev, branch: data.chiNhanh }))
          if (data.kenhBan) setOrderInfo(prev => ({ ...prev, salesChannel: data.kenhBan }))
          if (data.giamGia !== undefined) setOrderInfo(prev => ({ ...prev, discount: data.giamGia }))
          
          // Load customer info
          if (data.maKhachHang) setCustomerInfo(prev => ({ ...prev, code: data.maKhachHang }))
          if (data.tenKhachHang) setCustomerInfo(prev => ({ ...prev, name: data.tenKhachHang }))
          if (data.dienThoai) setCustomerInfo(prev => ({ ...prev, phone: data.dienThoai }))
          if (data.email) setCustomerInfo(prev => ({ ...prev, email: data.email }))
          if (data.diaChiKhachHang) setCustomerInfo(prev => ({ ...prev, address: data.diaChiKhachHang }))
          if (data.customerGroup) setCustomerInfo(prev => ({ ...prev, group: data.customerGroup }))
          
          // Load shipping info
          if (data.donViVanChuyen) {
            const carrier = carriers.find(c => c.name === data.donViVanChuyen)
            if (carrier) {
              setShippingInfo(prev => ({ ...prev, carrierId: carrier.id }))
            }
          }
          if (data.dichVu) setShippingInfo(prev => ({ ...prev, service: data.dichVu }))
          if (data.phiVanChuyen !== undefined) setShippingInfo(prev => ({ ...prev, fee: data.phiVanChuyen }))
          if (data.trongLuong) setShippingInfo(prev => ({ ...prev, weight: data.trongLuong }))
          if (data.dai) setShippingInfo(prev => ({ ...prev, length: data.dai }))
          if (data.rong) setShippingInfo(prev => ({ ...prev, width: data.rong }))
          if (data.cao) setShippingInfo(prev => ({ ...prev, height: data.cao }))
          if (data.diaChiNguoiNhan) setShippingInfo(prev => ({ ...prev, pickupAddress: data.diaChiNguoiNhan }))
          
          // Load items
          if (data.items && Array.isArray(data.items)) {
            const formattedItems = data.items.map((item, idx) => ({
              id: item.id || Date.now() + idx,
              name: item.tenSanPham || item.name || '',
              sku: item.maSanPham || item.sku || '',
              quantity: item.soLuong || item.quantity || 1,
              price: item.donGia || item.giaBan || item.price || 0,
              discount: item.giamGia || item.discount || 0,
            }))
            setItems(formattedItems)
          }
          
          // Clear sessionStorage sau khi load
          sessionStorage.removeItem('editOrderData')
        }
      } catch (error) {
        console.error('Error loading edit data:', error)
        addInAppNotification('Không thể tải dữ liệu đơn hàng để chỉnh sửa', 'error')
      }
    } else if (isCopyMode) {
      try {
        const copyData = sessionStorage.getItem('copiedOrderData')
        if (copyData) {
          const data = JSON.parse(copyData)
          
          // Load order info
          if (data.chiNhanh) setOrderInfo(prev => ({ ...prev, branch: data.chiNhanh }))
          if (data.kenhBan) setOrderInfo(prev => ({ ...prev, salesChannel: data.kenhBan }))
          if (data.giamGia !== undefined) setOrderInfo(prev => ({ ...prev, discount: data.giamGia }))
          
          // Load customer info
          if (data.maKhachHang) setCustomerInfo(prev => ({ ...prev, code: data.maKhachHang }))
          if (data.tenKhachHang) setCustomerInfo(prev => ({ ...prev, name: data.tenKhachHang }))
          if (data.dienThoai) setCustomerInfo(prev => ({ ...prev, phone: data.dienThoai }))
          if (data.email) setCustomerInfo(prev => ({ ...prev, email: data.email }))
          if (data.diaChiKhachHang) setCustomerInfo(prev => ({ ...prev, address: data.diaChiKhachHang }))
          if (data.customerGroup) setCustomerInfo(prev => ({ ...prev, group: data.customerGroup }))
          
          // Load shipping info
          if (data.donViVanChuyen) {
            const carrier = carriers.find(c => c.name === data.donViVanChuyen)
            if (carrier) {
              setShippingInfo(prev => ({ ...prev, carrierId: carrier.id }))
            }
          }
          if (data.dichVu) setShippingInfo(prev => ({ ...prev, service: data.dichVu }))
          if (data.phiVanChuyen !== undefined) setShippingInfo(prev => ({ ...prev, fee: data.phiVanChuyen }))
          if (data.trongLuong) setShippingInfo(prev => ({ ...prev, weight: data.trongLuong }))
          if (data.dai) setShippingInfo(prev => ({ ...prev, length: data.dai }))
          if (data.rong) setShippingInfo(prev => ({ ...prev, width: data.rong }))
          if (data.cao) setShippingInfo(prev => ({ ...prev, height: data.cao }))
          if (data.diaChiNguoiNhan) setShippingInfo(prev => ({ ...prev, pickupAddress: data.diaChiNguoiNhan }))
          
          // Load items
          if (data.items && Array.isArray(data.items)) {
            const formattedItems = data.items.map((item, idx) => ({
              id: Date.now() + idx, // Tạo ID mới cho copy
              name: item.tenSanPham || item.name || '',
              sku: item.maSanPham || item.sku || '',
              quantity: item.soLuong || item.quantity || 1,
              price: item.donGia || item.giaBan || item.price || 0,
              discount: item.giamGia || item.discount || 0,
            }))
            setItems(formattedItems)
          }
          
          // Clear sessionStorage sau khi load
          sessionStorage.removeItem('copiedOrderData')
        }
      } catch (error) {
        console.error('Error loading copy data:', error)
        addInAppNotification('Không thể tải dữ liệu đơn hàng để sao chép', 'error')
      }
    }
  }, [isEditMode, isCopyMode, carriers])

  const carrierOptions = carriers

  const handleItemChange = (id, field, value) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    )
  }

  const filteredProducts = useMemo(() => {
    if (!productSearch.trim()) return []
    return mockProducts.filter(
      (product) =>
        product.name.toLowerCase().includes(productSearch.toLowerCase()) ||
        product.sku.toLowerCase().includes(productSearch.toLowerCase())
    )
  }, [productSearch])

  const handleSelectProduct = (product) => {
    setItems((prev) => {
      const existing = prev.find((item) => item.sku === product.sku)
      if (existing) {
        return prev.map((item) =>
          item.sku === product.sku ? { ...item, quantity: item.quantity + 1 } : item
        )
      }
      return [
        ...prev,
        {
          id: Date.now(),
          name: product.name,
          sku: product.sku,
          quantity: 1,
          price: product.price,
          discount: 0,
        },
      ]
    })
    setProductSearch('')
  }

  const handleQuantityChange = (id, delta) => {
    setItems((prev) =>
      prev
        .map((item) =>
          item.id === id
            ? { ...item, quantity: Math.max(1, (Number(item.quantity) || 1) + delta) }
            : item
        )
        .filter((item) => item.quantity > 0)
    )
  }

  const handleRemoveItem = (id) => {
    setItems((prev) => prev.filter((item) => item.id !== id))
  }

  const resetForm = () => {
    setCustomerInfo({
      code: '',
      name: '',
      phone: '',
      email: '',
      address: '',
      district: '',
      ward: '',
      group: customerGroups[0],
    })
    setItems([])
    setOrderInfo((prev) => ({
      ...prev,
      notes: '',
      discount: 0,
      salesChannel: channels[0] || '',
    }))
    setShippingInfo((prev) => ({
      ...prev,
      note: '',
    }))
  }

  const handleAddChannel = () => {
    const value = window.prompt('Nhập tên kênh bán hàng mới')
    if (!value) return
    const name = value.trim()
    if (!name) return
    if (channels.includes(name)) {
      setOrderInfo((prev) => ({ ...prev, salesChannel: name }))
      return
    }
    const nextChannels = [name, ...channels]
    setChannels(nextChannels)
    setOrderInfo((prev) => ({ ...prev, salesChannel: name }))
  }

  const ensureOrderReady = () => {
    if (!normalizedItems.length) {
      throw new Error('Vui lòng thêm ít nhất một sản phẩm cho đơn hàng.')
    }
    if (!customerInfo.name.trim() || !customerInfo.phone.trim()) {
      throw new Error('Vui lòng nhập đầy đủ thông tin khách hàng (tên và số điện thoại).')
    }
    if (!shippingInfo.carrierId) {
      throw new Error('Vui lòng chọn đơn vị giao vận.')
    }
  }

  const generateOrderArtifacts = () => {
    const now = new Date()
    const orderId = `HD${now.getTime()}`
    const shipmentId = `VD${now.getTime()}`
    const customerCode =
      customerInfo.code.trim() || `KH${now.getTime().toString().slice(-6)}`
    const carrier = carrierOptions.find((c) => c.id === shippingInfo.carrierId)
    const orderCreatedAt = formatDateTimeString(now)

    const orderPayload = {
      chiNhanh: orderInfo.branch,
      maHoaDon: orderId,
      maVanDon: shipmentId,
      diaChiLayHang: shippingInfo.pickupAddress || DEFAULT_PICKUP_ADDRESS,
      maDoiSoat: '',
      phiTraDTGH: shippingFee,
      thoiGian: orderCreatedAt,
      thoiGianTao: orderCreatedAt,
      ngayCapNhat: orderCreatedAt,
      maDatHang: `MDH${now.getTime()}`,
      maTraHang: '',

      maKhachHang: customerCode,
      tenKhachHang: customerInfo.name.trim(),
      email: customerInfo.email.trim(),
      dienThoai: customerInfo.phone.trim(),
      diaChiKhachHang: customerInfo.address.trim(),
      khuVucKhachHang: customerInfo.district.trim(),
      phuongXaKhachHang: customerInfo.ward.trim(),
      nhomKhachHang: customerInfo.group,

      bangGia: 'Bảng giá chuẩn',
      nguoiBan: 'Nhân viên bán hàng',
      kenhBan: orderInfo.salesChannel,
      nguoiTao: 'Hệ thống',
      doiTacGiaoHang: carrier?.name || '',

      nguoiNhan: customerInfo.name.trim(),
      dienThoaiNguoiNhan: customerInfo.phone.trim(),
      diaChiNguoiNhan: customerInfo.address.trim(),
      khuVucNguoiNhan: customerInfo.district.trim(),
      phuongXaNguoiNhan: customerInfo.ward.trim(),

      dichVu: shippingInfo.service,
      trongLuong: Number(shippingInfo.weight) || 0,
      dai: Number(shippingInfo.length) || 0,
      rong: Number(shippingInfo.width) || 0,
      cao: Number(shippingInfo.height) || 0,
      ghiChuTrangThaiGiaoHang: '',
      ghiChuGiaoHang: shippingInfo.note || '',
      ghiChu: orderInfo.notes || '',

      tongTienHang: subtotal,
      giamGiaHoaDon: orderDiscount,
      vat: 0,
      thuKhac: 0,
      khachCanTra: grandTotal,
      khachDaTra: isPrepaid ? grandTotal : 0,
      tienMat: isPrepaid ? grandTotal : 0,
      the: 0,
      vi: 0,
      chuyenKhoan: 0,
      diem: 0,
      voucher: 0,
      maVoucher: '',
      conCanThuCOD: isPrepaid ? 0 : grandTotal,
      thoiGianGiaoHang: '',
      trangThai: isPrepaid ? 'Đang xử lý' : 'Chờ xác nhận',
      trangThaiGiaoHang: 'Chờ lấy hàng',

      sanPham: normalizedItems.map((item, index) => ({
        maHang: item.sku || `SP${index + 1}`,
        maVach: '',
        tenHang: item.name,
        thuongHieu: '',
        dvt: 'Cái',
        ghiChuHangHoa: '',
        soLuong: item.soLuong,
        donGia: item.donGia,
        giamGiaPhanTram: 0,
        giamGia: item.giamGia,
        giaBan: item.giaBan,
        thanhTien: item.thanhTien,
      })),

      id: orderId,
      customer: customerInfo.name.trim(),
      date: orderCreatedAt.split(' ')[0],
      total: grandTotal,
      status: isPrepaid ? 'Đang xử lý' : 'Chờ xác nhận',
      items: totalItems,
      channel: orderInfo.salesChannel,
    }

    const shipmentPayload = {
      maVanDon: shipmentId,
      maHoaDon: orderId,
      maTraHang: '',
      maKhachHang: customerCode,
      tenKhachHang: customerInfo.name.trim(),
      doiTacGiaoHang: carrier?.shortName || carrier?.name || '',
      dichVu: shippingInfo.service,
      trangThai: 'Chờ lấy hàng',
      trangThaiGiaoHang: 'Chờ lấy hàng',
      nguoiNhan: customerInfo.name.trim(),
      dienThoaiNguoiNhan: customerInfo.phone.trim(),
      diaChiNhan: customerInfo.address.trim(),
      khuVucNhan: customerInfo.district.trim(),
      phuongXaNhan: customerInfo.ward.trim(),
      diaChiLayHang: shippingInfo.pickupAddress || DEFAULT_PICKUP_ADDRESS,
      trongLuong: Number(shippingInfo.weight) || 0,
      dai: Number(shippingInfo.length) || 0,
      rong: Number(shippingInfo.width) || 0,
      cao: Number(shippingInfo.height) || 0,
      phiVanChuyen: shippingFee,
      phiTraDTGH: shippingFee,
      thoiGianTao: orderCreatedAt,
      thoiGianGiaoHang: '',
      ghiChu: shippingInfo.note || '',
      loaiDon: 'Đơn hàng',
    }

    return {
      orderPayload,
      shipmentPayload,
      orderId,
      shipmentId,
    }
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')

    try {
      ensureOrderReady()
    } catch (validationError) {
      setError(validationError.message)
      return
    }

    setIsSubmitting(true)
    try {
      const { orderPayload, shipmentPayload, orderId, shipmentId } = generateOrderArtifacts()

      const manualOrders = loadManualOrders()
      
      if (isEditMode && editingOrderId) {
        // Cập nhật đơn hàng cũ
        const updatedOrders = manualOrders.map(order => {
          if (order.id === editingOrderId || order.maHoaDon === editingOrderId) {
            return {
              ...orderPayload,
              id: order.id, // Giữ nguyên ID cũ
              maHoaDon: order.maHoaDon, // Giữ nguyên mã hóa đơn
              thoiGianTao: order.thoiGianTao, // Giữ nguyên thời gian tạo
              ngayCapNhat: formatDateTimeString(), // Cập nhật thời gian sửa
            }
          }
          return order
        })
        saveManualOrders(updatedOrders)

        // Xóa vận đơn cũ nếu có và tạo vận đơn mới
        const shipments = getStoredShipments() || []
        const oldOrder = manualOrders.find(o => o.id === editingOrderId || o.maHoaDon === editingOrderId)
        if (oldOrder && oldOrder.maVanDon) {
          const filteredShipments = shipments.filter(s => s.maVanDon !== oldOrder.maVanDon)
          persistShipments([shipmentPayload, ...filteredShipments])
        } else {
          persistShipments([shipmentPayload, ...shipments])
        }

        addInAppNotification({
          type: 'order_updated',
          title: 'Đơn hàng đã được cập nhật',
          message: `Đơn hàng ${orderId} cho khách ${customerInfo.name.trim()} đã được cập nhật cùng vận đơn ${shipmentId}.`,
          meta: {
            orderId,
            shipmentId,
            customer: customerInfo.name.trim(),
          },
        })
      } else {
        // Tạo đơn hàng mới
        saveManualOrders([orderPayload, ...manualOrders])

        const shipments = getStoredShipments() || []
        persistShipments([shipmentPayload, ...shipments])

        addInAppNotification({
          type: 'order_created',
          title: 'Đơn hàng mới được tạo',
          message: `Mã đơn ${orderId} cho khách ${customerInfo.name.trim()} đã được tạo cùng vận đơn ${shipmentId}.`,
          meta: {
            orderId,
            shipmentId,
            customer: customerInfo.name.trim(),
          },
        })
      }

      resetForm()
      navigate('/orders', { state: { orderId } })
    } catch (err) {
      setError(err.message || 'Không thể tạo đơn hàng. Vui lòng thử lại.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleOpenPrint = (printType) => {
    try {
      ensureOrderReady()
      const { orderPayload, shipmentPayload } = generateOrderArtifacts()
      setPrintPayload({
        order: orderPayload,
        shipment: shipmentPayload,
      })
      setPrintDialog({ open: true, type: printType })
    } catch (err) {
      setError(err.message || 'Không thể chuẩn bị dữ liệu in.')
    }
  }

  return (
    <>
    <form onSubmit={handleSubmit} className="space-y-6 pb-20">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="btn-secondary inline-flex items-center gap-2"
        >
          <ArrowLeft size={18} />
          Quay lại
        </button>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => handleOpenPrint('invoice')}
            className="btn-secondary inline-flex items-center gap-2"
          >
            <Printer size={18} />
            In hóa đơn
          </button>
          <button
            type="button"
            onClick={() => handleOpenPrint('shipping')}
            className="btn-secondary inline-flex items-center gap-2"
          >
            <Printer size={18} />
            In vận đơn
          </button>
          <button
            type="button"
            onClick={resetForm}
            className="btn-secondary"
          >
            Xóa form
          </button>
          <button
            type="submit"
            className="btn-primary inline-flex items-center gap-2"
            disabled={isSubmitting}
          >
            <Save size={18} />
            {isSubmitting 
              ? (isEditMode ? 'Đang cập nhật...' : 'Đang lưu...') 
              : (isEditMode ? 'Cập nhật đơn hàng & vận đơn' : 'Tạo đơn hàng & vận đơn')
            }
          </button>
        </div>
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-1 xl:grid-cols-[2fr_1fr] gap-6">
          <div className="space-y-6">
            <div className="card space-y-4">
              <h2 className="text-xl font-semibold flex items-center gap-2 text-slate-900">
                <ClipboardList size={20} />
                Thông tin đơn hàng
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Chi nhánh
                  </label>
                  <input
                    type="text"
                    className="input-field"
                    value={orderInfo.branch}
                    onChange={(e) => setOrderInfo((prev) => ({ ...prev, branch: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Kênh bán hàng
                  </label>
                  <div className="flex gap-2">
                    <select
                      className="input-field flex-1"
                      value={orderInfo.salesChannel}
                      onChange={(e) => setOrderInfo((prev) => ({ ...prev, salesChannel: e.target.value }))}
                    >
                      {channels.map((channel) => (
                        <option key={channel} value={channel}>
                          {channel}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={handleAddChannel}
                      className="btn-secondary whitespace-nowrap"
                    >
                      Thêm kênh
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ngày đơn hàng
                  </label>
                  <input
                    type="date"
                    className="input-field"
                    value={orderInfo.orderDate}
                    onChange={(e) => setOrderInfo((prev) => ({ ...prev, orderDate: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Hình thức thanh toán
                  </label>
                  <select
                    className="input-field"
                    value={orderInfo.paymentStatus}
                    onChange={(e) =>
                      setOrderInfo((prev) => ({ ...prev, paymentStatus: e.target.value }))
                    }
                  >
                    <option value="cod">Thu hộ (COD)</option>
                    <option value="prepaid">Khách đã thanh toán</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Giảm giá hóa đơn (đ)
                  </label>
                  <input
                    type="number"
                    min="0"
                    className="input-field"
                    value={orderInfo.discount}
                    onChange={(e) =>
                      setOrderInfo((prev) => ({ ...prev, discount: Number(e.target.value) || 0 }))
                    }
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ghi chú
                  </label>
                  <textarea
                    className="input-field min-h-[80px]"
                    value={orderInfo.notes}
                    onChange={(e) =>
                      setOrderInfo((prev) => ({ ...prev, notes: e.target.value }))
                    }
                    placeholder="Thêm ghi chú cho đơn hàng..."
                  />
                </div>
              </div>
            </div>

            <div className="card space-y-4">
              <h2 className="text-xl font-semibold flex items-center gap-2 text-slate-900">
                <User size={20} />
                Thông tin khách hàng & người nhận
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mã khách hàng (tùy chọn)
                  </label>
                  <input
                    type="text"
                    className="input-field"
                    value={customerInfo.code}
                    onChange={(e) => setCustomerInfo((prev) => ({ ...prev, code: e.target.value }))}
                    placeholder="KH0001"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tên khách hàng *
                  </label>
                  <input
                    type="text"
                    className="input-field"
                    value={customerInfo.name}
                    onChange={(e) => setCustomerInfo((prev) => ({ ...prev, name: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Số điện thoại *
                  </label>
                  <input
                    type="tel"
                    className="input-field"
                    value={customerInfo.phone}
                    onChange={(e) => setCustomerInfo((prev) => ({ ...prev, phone: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    className="input-field"
                    value={customerInfo.email}
                    onChange={(e) => setCustomerInfo((prev) => ({ ...prev, email: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nhóm khách hàng
                  </label>
                  <select
                    className="input-field"
                    value={customerInfo.group}
                    onChange={(e) =>
                      setCustomerInfo((prev) => ({ ...prev, group: e.target.value }))
                    }
                  >
                    {customerGroups.map((group) => (
                      <option key={group} value={group}>
                        {group}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Địa chỉ giao hàng *
                  </label>
                  <input
                    type="text"
                    className="input-field"
                    value={customerInfo.address}
                    onChange={(e) => setCustomerInfo((prev) => ({ ...prev, address: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Quận/Huyện
                  </label>
                  <input
                    type="text"
                    className="input-field"
                    value={customerInfo.district}
                    onChange={(e) =>
                      setCustomerInfo((prev) => ({ ...prev, district: e.target.value }))
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phường/Xã
                  </label>
                  <input
                    type="text"
                    className="input-field"
                    value={customerInfo.ward}
                    onChange={(e) =>
                      setCustomerInfo((prev) => ({ ...prev, ward: e.target.value }))
                    }
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="card space-y-4">
              <h2 className="text-xl font-semibold flex items-center gap-2 text-slate-900">
                <CreditCard size={20} />
                Tóm tắt thanh toán
              </h2>
              <div className="space-y-2 text-sm text-slate-700">
                <div className="flex items-center justify-between">
                  <span>Tổng tiền hàng</span>
                  <span className="font-semibold">
                    {subtotal.toLocaleString('vi-VN')} đ
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Giảm giá hóa đơn</span>
                  <span className="font-semibold text-rose-500">
                    -{orderDiscount.toLocaleString('vi-VN')} đ
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Phí vận chuyển</span>
                  <span className="font-semibold">
                    {shippingFee.toLocaleString('vi-VN')} đ
                  </span>
                </div>
                <div className="border-t border-dashed border-slate-200 pt-2 flex items-center justify-between text-base">
                  <span className="font-semibold text-slate-900">Khách cần thanh toán</span>
                  <span className="font-bold text-primary-600">
                    {grandTotal.toLocaleString('vi-VN')} đ
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>Hình thức thanh toán</span>
                  <span>
                    {isPrepaid ? 'Khách đã trả trước' : 'Thu hộ COD khi giao'}
                  </span>
                </div>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-600 leading-relaxed">
                <p className="font-semibold text-slate-800 mb-1">Lưu ý:</p>
                <ul className="space-y-1">
                  <li>- Đơn hàng sẽ được lưu trong bộ nhớ cục bộ và xuất hiện ở trang Đơn hàng khi API chưa sẵn sàng.</li>
                  <li>- Vận đơn mới tạo sẽ hiển thị ở trang Vận đơn & Đối tác giao hàng với trạng thái “Chờ lấy hàng”.</li>
                  <li>- Có thể cập nhật trạng thái vận đơn thông qua chức năng đồng bộ đối tác giao vận.</li>
                </ul>
              </div>
            </div>

            <div className="card space-y-3">
              <h2 className="text-xl font-semibold flex items-center gap-2 text-slate-900">
                <MapPin size={20} />
                Địa chỉ giao hàng
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                {customerInfo.address
                  ? `${customerInfo.address}${
                      customerInfo.ward ? `, ${customerInfo.ward}` : ''
                    }${customerInfo.district ? `, ${customerInfo.district}` : ''}`
                  : 'Chưa có địa chỉ'}
              </p>
            </div>
          </div>
        </div>

        <div className="card space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2 text-slate-900">
            <Package size={20} />
            Sản phẩm trong đơn
          </h2>
          <div className="space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
              <div className="relative">
                <Search
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  size={18}
                />
                <input
                  type="text"
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  placeholder="Tìm và thêm sản phẩm (F3)"
                  className="input-field h-12 rounded-2xl border border-primary-100 bg-white pl-10 text-sm font-medium focus:border-primary-400 focus:ring-primary-200"
                />
                {filteredProducts.length > 0 && (
                  <div className="absolute z-10 mt-2 w-full rounded-2xl border border-slate-200 bg-white text-sm shadow-xl">
                    {filteredProducts.map((product) => (
                      <button
                        type="button"
                        key={product.id}
                        onClick={() => handleSelectProduct(product)}
                        className="flex w-full items-center justify-between px-4 py-3 text-left hover:bg-primary-50"
                      >
                        <div>
                          <p className="font-semibold text-slate-900">{product.name}</p>
                          <p className="text-xs text-slate-500">{product.sku}</p>
                        </div>
                        <span className="text-sm font-semibold text-primary-600">
                          {product.price.toLocaleString('vi-VN')} đ
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200">
              {items.length === 0 ? (
                <div className="flex h-40 items-center justify-center text-sm text-slate-500">
                  Chưa có sản phẩm nào. Tìm kiếm để thêm vào đơn.
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {items.map((item, index) => {
                    const lineTotal = Math.max(
                      Number(item.quantity) * Number(item.price) - (Number(item.discount) || 0),
                      0
                    )
                    return (
                      <div
                        key={item.id}
                        className="grid grid-cols-1 gap-4 px-4 py-4 lg:grid-cols-[1.4fr_auto_auto_auto]"
                      >
                        <div>
                          <div className="flex items-center justify-between gap-3">
                            <p className="text-sm font-semibold text-slate-600">
                              Sản phẩm #{index + 1}
                            </p>
                            <button
                              type="button"
                              className="text-slate-400 hover:text-rose-500 disabled:opacity-40"
                              onClick={() => handleRemoveItem(item.id)}
                              disabled={items.length === 1}
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                          <div className="mt-2 space-y-2">
                            <input
                              type="text"
                              className="input-field"
                              value={item.name}
                              onChange={(e) => handleItemChange(item.id, 'name', e.target.value)}
                              placeholder="Tên sản phẩm"
                              required
                            />
                            <input
                              type="text"
                              className="input-field"
                              value={item.sku}
                              onChange={(e) => handleItemChange(item.id, 'sku', e.target.value)}
                              placeholder="SKU / Mã hàng"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
                            Số lượng
                          </p>
                          <div className="flex items-center gap-3 rounded-xl border border-slate-200 px-3 py-2">
                            <button
                              type="button"
                              className="text-slate-400 hover:text-primary-600"
                              onClick={() => handleQuantityChange(item.id, -1)}
                            >
                              <MinusCircle size={18} />
                            </button>
                            <input
                              type="number"
                              min="1"
                              className="w-14 border-none bg-transparent text-center text-sm font-semibold focus:outline-none"
                              value={item.quantity}
                              onChange={(e) =>
                                handleItemChange(item.id, 'quantity', Number(e.target.value) || 1)
                              }
                            />
                            <button
                              type="button"
                              className="text-slate-400 hover:text-primary-600"
                              onClick={() => handleQuantityChange(item.id, 1)}
                            >
                              <PlusCircle size={18} />
                            </button>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
                            Giá bán (đ)
                          </label>
                          <input
                            type="number"
                            min="0"
                            className="input-field"
                            value={item.price}
                            onChange={(e) =>
                              handleItemChange(item.id, 'price', Number(e.target.value) || 0)
                            }
                            required
                          />
                          <input
                            type="number"
                            min="0"
                            className="input-field"
                            value={item.discount}
                            onChange={(e) =>
                              handleItemChange(item.id, 'discount', Number(e.target.value) || 0)
                            }
                            placeholder="Giảm giá"
                          />
                        </div>
                        <div className="rounded-2xl bg-slate-50 px-4 py-3 text-right">
                          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
                            Thành tiền
                          </p>
                          <p className="text-lg font-bold text-primary-600">
                            {lineTotal.toLocaleString('vi-VN')} đ
                          </p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="card space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2 text-slate-900">
            <Truck size={20} />
            Thông tin vận chuyển
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Đơn vị giao vận *
              </label>
              <select
                className="input-field"
                value={shippingInfo.carrierId}
                onChange={(e) =>
                  setShippingInfo((prev) => ({ ...prev, carrierId: e.target.value }))
                }
                required
              >
                {carrierOptions.map((carrier) => (
                  <option key={carrier.id} value={carrier.id}>
                    {carrier.name}
                    {carrier.status === 'connected' ? ' (Đã liên kết)' : ''}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Dịch vụ giao hàng
              </label>
              <input
                type="text"
                className="input-field"
                value={shippingInfo.service}
                onChange={(e) =>
                  setShippingInfo((prev) => ({ ...prev, service: e.target.value }))
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cước phí (đ)
              </label>
              <input
                type="number"
                min="0"
                className="input-field"
                value={shippingInfo.fee}
                onChange={(e) =>
                  setShippingInfo((prev) => ({ ...prev, fee: Number(e.target.value) || 0 }))
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Khối lượng (kg)
              </label>
              <input
                type="number"
                min="0"
                step="0.1"
                className="input-field"
                value={shippingInfo.weight}
                onChange={(e) =>
                  setShippingInfo((prev) => ({ ...prev, weight: Number(e.target.value) || 0 }))
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Kích thước (dài x rộng x cao) cm
              </label>
              <div className="grid grid-cols-3 gap-2">
                <input
                  type="number"
                  min="0"
                  className="input-field"
                  value={shippingInfo.length}
                  onChange={(e) =>
                    setShippingInfo((prev) => ({ ...prev, length: Number(e.target.value) || 0 }))
                  }
                  placeholder="Dài"
                />
                <input
                  type="number"
                  min="0"
                  className="input-field"
                  value={shippingInfo.width}
                  onChange={(e) =>
                    setShippingInfo((prev) => ({ ...prev, width: Number(e.target.value) || 0 }))
                  }
                  placeholder="Rộng"
                />
                <input
                  type="number"
                  min="0"
                  className="input-field"
                  value={shippingInfo.height}
                  onChange={(e) =>
                    setShippingInfo((prev) => ({ ...prev, height: Number(e.target.value) || 0 }))
                  }
                  placeholder="Cao"
                />
              </div>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Địa chỉ lấy hàng
              </label>
              <textarea
                className="input-field min-h-[60px]"
                value={shippingInfo.pickupAddress}
                onChange={(e) =>
                  setShippingInfo((prev) => ({ ...prev, pickupAddress: e.target.value }))
                }
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ghi chú vận chuyển
              </label>
              <textarea
                className="input-field min-h-[60px]"
                value={shippingInfo.note}
                onChange={(e) =>
                  setShippingInfo((prev) => ({ ...prev, note: e.target.value }))
                }
                placeholder="Ví dụ: Giao trong giờ hành chính, gọi trước khi đến..."
              />
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="card border border-rose-200 bg-rose-50 text-rose-700">
          <p className="text-sm">{error}</p>
        </div>
      )}
    </form>
      {printDialog.open && printPayload && (
      <PrintDialog
        open={printDialog.open}
        type={printDialog.type}
        orderData={printPayload.order}
        shipmentData={printPayload.shipment}
        onClose={() => setPrintDialog({ open: false, type: 'invoice' })}
      />
    )}
    </>
  )
}

export default CreateOrder

