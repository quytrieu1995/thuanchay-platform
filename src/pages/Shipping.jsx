import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Search,
  Eye,
  Truck,
  Package,
  CheckCircle,
  Clock,
  XCircle,
  Filter,
  X,
  Plus,
  Link2,
  RefreshCcw,
  Unplug,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react'
import {
  getCarrierIntegrations,
  saveCarrierCredentials,
  disconnectCarrier,
  simulateCarrierSync,
  getSyncLogs,
  getStoredShipments,
  persistShipments,
} from '../services/shippingIntegrationService'
import {
  addInAppNotification,
} from '../services/notificationService'

const DEFAULT_SHIPPING_ORDERS = [
  {
    maVanDon: 'VD001',
    maHoaDon: 'HD001',
    maTraHang: '',
    maKhachHang: 'KH001',
    tenKhachHang: 'Nguyễn Văn A',
    doiTacGiaoHang: 'GHN',
    dichVu: 'Giao hàng tiêu chuẩn',
    trangThai: 'Đã giao',
    trangThaiGiaoHang: 'Đã giao',
    nguoiNhan: 'Nguyễn Văn A',
    dienThoaiNguoiNhan: '0901234567',
    diaChiNhan: '456 Đường XYZ, Quận 2, TP.HCM',
    khuVucNhan: 'Quận 2',
    phuongXaNhan: 'Phường 1',
    diaChiLayHang: '123 Đường ABC, Quận 1, TP.HCM',
    trongLuong: 1500,
    dai: 30,
    rong: 20,
    cao: 15,
    phiVanChuyen: 30000,
    phiTraDTGH: 30000,
    thoiGianTao: '2024-01-15 09:00:00',
    thoiGianGiaoHang: '2024-01-16 14:00:00',
    ghiChu: 'Giao trong giờ hành chính',
    loaiDon: 'Đơn hàng',
  },
  {
    maVanDon: 'VD002',
    maHoaDon: 'HD002',
    maTraHang: '',
    maKhachHang: 'KH002',
    tenKhachHang: 'Trần Thị B',
    doiTacGiaoHang: 'Viettel Post',
    dichVu: 'Giao hàng nhanh',
    trangThai: 'Đang giao',
    trangThaiGiaoHang: 'Đang vận chuyển',
    nguoiNhan: 'Trần Thị B',
    dienThoaiNguoiNhan: '0912345678',
    diaChiNhan: '789 Đường GHI, Quận 4, TP.HCM',
    khuVucNhan: 'Quận 4',
    phuongXaNhan: 'Phường 2',
    diaChiLayHang: '789 Đường DEF, Quận 3, TP.HCM',
    trongLuong: 800,
    dai: 25,
    rong: 15,
    cao: 10,
    phiVanChuyen: 25000,
    phiTraDTGH: 25000,
    thoiGianTao: '2024-01-16 10:00:00',
    thoiGianGiaoHang: '',
    ghiChu: '',
    loaiDon: 'Đơn hàng',
  },
  {
    maVanDon: 'VD003',
    maHoaDon: '',
    maTraHang: 'TH001',
    maKhachHang: 'KH001',
    tenKhachHang: 'Nguyễn Văn A',
    doiTacGiaoHang: 'GHN',
    dichVu: 'Giao hàng trả hàng',
    trangThai: 'Đã nhận hàng trả',
    trangThaiGiaoHang: 'Đã nhận hàng trả',
    nguoiNhan: 'Cửa hàng ABC',
    dienThoaiNguoiNhan: '0901234567',
    diaChiNhan: '123 Đường ABC, Quận 1, TP.HCM',
    khuVucNhan: 'Quận 1',
    phuongXaNhan: 'Phường 1',
    diaChiLayHang: '456 Đường XYZ, Quận 2, TP.HCM',
    trongLuong: 500,
    dai: 20,
    rong: 15,
    cao: 10,
    phiVanChuyen: 20000,
    phiTraDTGH: 0,
    thoiGianTao: '2024-01-18 10:00:00',
    thoiGianGiaoHang: '2024-01-18 15:00:00',
    ghiChu: 'Nhận hàng trả từ khách',
    loaiDon: 'Đơn trả',
  },
]

const formatDateTime = (value) => {
  if (!value) return 'Chưa đồng bộ'
  try {
    const date = new Date(value)
    return date.toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return value
  }
}

const getStatusColor = (status) => {
  switch (status) {
    case 'Đã giao':
    case 'Đã nhận hàng trả':
      return 'bg-green-100 text-green-800'
    case 'Đang vận chuyển':
    case 'Đang giao':
      return 'bg-blue-100 text-blue-800'
    case 'Chờ lấy hàng':
      return 'bg-yellow-100 text-yellow-800'
    case 'Hoàn trả':
      return 'bg-orange-100 text-orange-800'
    case 'Đã hủy':
      return 'bg-red-100 text-red-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

const getStatusIcon = (status) => {
  switch (status) {
    case 'Đã giao':
    case 'Đã nhận hàng trả':
      return <CheckCircle size={16} />
    case 'Đang vận chuyển':
    case 'Đang giao':
    case 'Chờ lấy hàng':
      return <Clock size={16} />
    case 'Hoàn trả':
      return <Package size={16} />
    case 'Đã hủy':
      return <XCircle size={16} />
    default:
      return null
  }
}

const getCarrierStatusBadge = (status) => {
  switch (status) {
    case 'connected':
      return {
        label: 'Đã liên kết',
        classes: 'bg-emerald-100 text-emerald-700',
        icon: CheckCircle2,
      }
    case 'error':
      return {
        label: 'Có lỗi đồng bộ',
        classes: 'bg-amber-100 text-amber-700',
        icon: AlertCircle,
      }
    default:
      return {
        label: 'Chưa liên kết',
        classes: 'bg-slate-100 text-slate-600',
        icon: Link2,
      }
  }
}

const Shipping = () => {
  const navigate = useNavigate()
  const [shippingOrders, setShippingOrders] = useState(() => getStoredShipments() || DEFAULT_SHIPPING_ORDERS)
  const [integrations, setIntegrations] = useState(() => getCarrierIntegrations())
  const [syncLogs, setSyncLogs] = useState(() => getSyncLogs())
  const [syncFeedback, setSyncFeedback] = useState(null)
  const [syncingCarrier, setSyncingCarrier] = useState(null)
  const [showConnectModal, setShowConnectModal] = useState(false)
  const [carrierToConnect, setCarrierToConnect] = useState(null)
  const [connectForm, setConnectForm] = useState({ apiKey: '', shopCode: '', webhookUrl: '' })
  const [formError, setFormError] = useState('')

  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [partnerFilter, setPartnerFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [selectedShipping, setSelectedShipping] = useState(null)
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  const partners = ['GHN', 'Viettel Post', 'Giao hàng nhanh', 'J&T Express', 'Ninja Van']
  const statuses = ['Chờ lấy hàng', 'Đang vận chuyển', 'Đã giao', 'Đã nhận hàng trả', 'Hoàn trả', 'Đã hủy']

  useEffect(() => {
    if (localStorage.getItem('disableFallbackData') === 'true') {
      setShippingOrders([])
    }
  }, [])

  useEffect(() => {
    persistShipments(shippingOrders)
  }, [shippingOrders])

  const filteredShipping = shippingOrders.filter(shipping => {
    const searchLower = searchTerm.toLowerCase()
    const matchesSearch = !searchTerm ||
      shipping.maVanDon?.toLowerCase().includes(searchLower) ||
      shipping.maHoaDon?.toLowerCase().includes(searchLower) ||
      shipping.maTraHang?.toLowerCase().includes(searchLower) ||
      shipping.tenKhachHang?.toLowerCase().includes(searchLower) ||
      shipping.dienThoaiNguoiNhan?.includes(searchTerm) ||
      shipping.maKhachHang?.toLowerCase().includes(searchLower)

    const matchesStatus = statusFilter === 'all' || shipping.trangThaiGiaoHang === statusFilter
    const matchesPartner = partnerFilter === 'all' || shipping.doiTacGiaoHang === partnerFilter
    const matchesType = typeFilter === 'all' || shipping.loaiDon === typeFilter

    const shippingDate = shipping.thoiGianTao?.split(' ')[0] || ''
    const matchesDateFrom = !dateFrom || shippingDate >= dateFrom
    const matchesDateTo = !dateTo || shippingDate <= dateTo

    return matchesSearch && matchesStatus && matchesPartner && matchesType &&
      matchesDateFrom && matchesDateTo
  })

  const handleResetFilters = () => {
    setDateFrom('')
    setDateTo('')
    setSearchTerm('')
    setStatusFilter('all')
    setPartnerFilter('all')
    setTypeFilter('all')
  }

  const hasActiveFilters = dateFrom || dateTo || statusFilter !== 'all' ||
    partnerFilter !== 'all' || typeFilter !== 'all'

  const handleOpenConnectModal = (carrier) => {
    setCarrierToConnect(carrier)
    setConnectForm({
      apiKey: carrier.credentials?.apiKey || '',
      shopCode: carrier.credentials?.shopCode || '',
      webhookUrl: carrier.credentials?.webhookUrl || '',
    })
    setFormError('')
    setShowConnectModal(true)
  }

  const handleSubmitConnect = (event) => {
    event.preventDefault()
    if (!carrierToConnect) return
    if (!connectForm.apiKey.trim() || !connectForm.shopCode.trim()) {
      setFormError('Vui lòng nhập đầy đủ API Key và Mã cửa hàng.')
      return
    }
    const updated = saveCarrierCredentials(carrierToConnect.id, {
      apiKey: connectForm.apiKey.trim(),
      shopCode: connectForm.shopCode.trim(),
      webhookUrl: connectForm.webhookUrl.trim(),
    })
    setIntegrations(updated)
    setShowConnectModal(false)
    setCarrierToConnect(null)
    setSyncFeedback({
      type: 'success',
      message: `Đã liên kết thành công với ${connectForm.shopCode} (${carrierToConnect.name}).`,
    })
    addInAppNotification({
      type: 'carrier_connected',
      title: 'Đã liên kết đối tác giao vận',
      message: `${carrierToConnect.name} đã được liên kết cùng mã cửa hàng ${connectForm.shopCode}.`,
      meta: {
        carrierId: carrierToConnect.id,
        shopCode: connectForm.shopCode.trim(),
      },
    })
  }

  const handleDisconnectCarrier = (carrier) => {
    if (!carrier) return
    const confirmed = window.confirm(`Ngắt liên kết với ${carrier.name}?`)
    if (!confirmed) return
    const updated = disconnectCarrier(carrier.id)
    setIntegrations(updated)
    setSyncFeedback({
      type: 'warning',
      message: `Đã ngắt liên kết ${carrier.name}.`,
    })
    addInAppNotification({
      type: 'carrier_disconnected',
      title: 'Ngắt liên kết đối tác',
      message: `${carrier.name} đã được ngắt liên kết khỏi hệ thống.`,
      meta: {
        carrierId: carrier.id,
      },
    })
  }

  const handleSyncCarrier = (carrier) => {
    if (!carrier) return
    setSyncFeedback(null)
    setSyncingCarrier(carrier.id)
    try {
      const result = simulateCarrierSync(carrier.id, shippingOrders)
      setShippingOrders(result.shipments)
      setIntegrations(getCarrierIntegrations())
      setSyncLogs(getSyncLogs())
      setSyncFeedback({
        type: 'success',
        message: `Đồng bộ thành công với ${carrier.name}. Cập nhật ${result.meta.affected} vận đơn.`,
      })
      addInAppNotification({
        type: 'shipping_sync',
        title: `Đồng bộ ${carrier.name}`,
        message: `${result.meta.affected} vận đơn được cập nhật trạng thái.`,
        meta: {
          carrierId: carrier.id,
          affected: result.meta.affected,
        },
      })
    } catch (error) {
      setSyncFeedback({
        type: 'error',
        message: error?.message || 'Không thể đồng bộ. Vui lòng thử lại.',
      })
    } finally {
      setSyncingCarrier(null)
    }
  }

  const connectedCarriers = integrations.filter(item => item.status === 'connected').length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Quản lý Vận đơn & Đối tác Giao hàng</h1>
          <p className="text-gray-600">Theo dõi và quản lý tất cả vận đơn và đối tác giao hàng</p>
        </div>
        <button
          onClick={() => navigate('/orders/create')}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={18} />
          Tạo đơn & vận đơn mới
        </button>
      </div>

      {syncFeedback && (
        <div
          className={`rounded-2xl border px-4 py-3 text-sm flex items-start gap-3 ${
            syncFeedback.type === 'error'
              ? 'border-red-200 bg-red-50 text-red-700'
              : syncFeedback.type === 'warning'
              ? 'border-amber-200 bg-amber-50 text-amber-700'
              : 'border-emerald-200 bg-emerald-50 text-emerald-700'
          }`}
        >
          {syncFeedback.type === 'error' ? (
            <AlertCircle size={18} className="mt-0.5" />
          ) : (
            <CheckCircle2 size={18} className="mt-0.5" />
          )}
          <span>{syncFeedback.message}</span>
          <button
            onClick={() => setSyncFeedback(null)}
            className="ml-auto text-xs uppercase tracking-wide hover:underline"
          >
            Đóng
          </button>
        </div>
      )}

      <div className="card space-y-5">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Liên kết đối tác giao vận</h2>
            <p className="text-sm text-slate-500">
              {connectedCarriers}/{integrations.length} đối tác đã được đồng bộ
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {integrations.map((carrier) => {
            const statusBadge = getCarrierStatusBadge(carrier.status)
            const StatusIcon = statusBadge.icon
            return (
              <div
                key={carrier.id}
                className="rounded-2xl border border-slate-200/70 bg-white/80 p-5 shadow-sm dark:border-slate-800/60 dark:bg-slate-900/50"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100">
                      {carrier.logo ? (
                        <img src={carrier.logo} alt={carrier.name} className="h-10 w-10 object-contain" />
                      ) : (
                        <Truck size={24} className="text-slate-500" />
                      )}
                    </div>
                    <div>
                      <p className="text-base font-semibold text-slate-900">{carrier.name}</p>
                      <p className="text-xs text-slate-500 uppercase tracking-[0.3em]">
                        {carrier.shortName}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${statusBadge.classes}`}
                  >
                    <StatusIcon size={14} />
                    {statusBadge.label}
                  </span>
                </div>
                <p className="mt-4 text-sm text-slate-600 dark:text-slate-300">{carrier.description}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {carrier.features?.map((feature) => (
                    <span
                      key={feature}
                      className="rounded-full border border-slate-200 px-3 py-1 text-xs font-medium text-slate-600 dark:border-slate-700 dark:text-slate-300"
                    >
                      {feature}
                    </span>
                  ))}
                </div>
                <div className="mt-4 space-y-1 text-xs text-slate-500">
                  <p>
                    Lần đồng bộ gần nhất:{' '}
                    <span className="font-medium text-slate-700">
                      {formatDateTime(carrier.lastSyncedAt)}
                    </span>
                  </p>
                  {carrier.credentials?.shopCode && (
                    <p>
                      Cửa hàng tích hợp:{' '}
                      <span className="font-medium text-slate-700">{carrier.credentials.shopCode}</span>
                    </p>
                  )}
                </div>
                <div className="mt-5 flex flex-wrap gap-2">
                  {carrier.status === 'connected' ? (
                    <>
                      <button
                        onClick={() => handleSyncCarrier(carrier)}
                        className="btn-primary text-xs"
                        disabled={syncingCarrier === carrier.id}
                      >
                        {syncingCarrier === carrier.id ? (
                          <span className="flex items-center gap-2">
                            <RefreshCcw className="animate-spin" size={16} />
                            Đang đồng bộ...
                          </span>
                        ) : (
                          <span className="flex items-center gap-2">
                            <RefreshCcw size={16} />
                            Đồng bộ ngay
                          </span>
                        )}
                      </button>
                      <button
                        onClick={() => handleOpenConnectModal(carrier)}
                        className="btn-secondary text-xs"
                      >
                        <Link2 size={14} />
                        Cập nhật thông tin
                      </button>
                      <button
                        onClick={() => handleDisconnectCarrier(carrier)}
                        className="inline-flex items-center gap-2 rounded-xl border border-rose-200 px-4 py-2 text-xs font-semibold text-rose-600 transition hover:-translate-y-0.5 hover:bg-rose-50"
                      >
                        <Unplug size={14} />
                        Ngắt liên kết
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => handleOpenConnectModal(carrier)}
                      className="btn-primary text-xs"
                    >
                      <Link2 size={14} />
                      Liên kết ngay
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Tìm kiếm vận đơn..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-10"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input-field"
          >
            <option value="all">Tất cả trạng thái</option>
            {statuses.map(status => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
          <select
            value={partnerFilter}
            onChange={(e) => setPartnerFilter(e.target.value)}
            className="input-field"
          >
            <option value="all">Tất cả đối tác</option>
            {partners.map(partner => (
              <option key={partner} value={partner}>{partner}</option>
            ))}
          </select>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="input-field"
          >
            <option value="all">Tất cả loại</option>
            <option value="Đơn hàng">Đơn hàng</option>
            <option value="Đơn trả">Đơn trả</option>
          </select>
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
              Bộ lọc
              {hasActiveFilters && (
                <span className="ml-1 px-2 py-0.5 bg-white text-primary-600 rounded-full text-xs">
                  {[dateFrom, dateTo].filter(Boolean).length}
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

        {showAdvancedFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            </div>
          </div>
        )}
      </div>

      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-gray-600">
            Hiển thị <span className="font-semibold text-gray-900">{filteredShipping.length}</span> trong tổng số <span className="font-semibold text-gray-900">{shippingOrders.length}</span> vận đơn
            {hasActiveFilters && (
              <span className="ml-2 text-primary-600">(đã lọc)</span>
            )}
          </p>
        </div>
        <div className="overflow-x-auto">
          {filteredShipping.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">Không tìm thấy vận đơn nào</p>
              <p className="text-gray-400 text-sm mt-2">Thử điều chỉnh bộ lọc để tìm kiếm</p>
            </div>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Mã vận đơn</th>
                  <th>Mã đơn hàng/Trả</th>
                  <th>Loại</th>
                  <th>Đối tác</th>
                  <th>Khách hàng</th>
                  <th>Người nhận</th>
                  <th>Địa chỉ nhận</th>
                  <th>Trạng thái</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredShipping.map((shipping) => (
                  <tr key={shipping.maVanDon}>
                    <td className="font-mono font-medium">{shipping.maVanDon}</td>
                    <td>
                      {shipping.maHoaDon && (
                        <span className="font-mono text-sm text-blue-600">{shipping.maHoaDon}</span>
                      )}
                      {shipping.maTraHang && (
                        <span className="font-mono text-sm text-red-600">{shipping.maTraHang}</span>
                      )}
                    </td>
                    <td>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        shipping.loaiDon === 'Đơn hàng'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {shipping.loaiDon}
                      </span>
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <Truck size={16} className="text-gray-400" />
                        <span className="font-medium">{shipping.doiTacGiaoHang}</span>
                      </div>
                    </td>
                    <td>
                      <div>
                        <div className="font-medium">{shipping.tenKhachHang}</div>
                        <div className="text-xs text-gray-500">{shipping.maKhachHang}</div>
                      </div>
                    </td>
                    <td>
                      <div>
                        <div className="font-medium">{shipping.nguoiNhan}</div>
                        <div className="text-xs text-gray-500">{shipping.dienThoaiNguoiNhan}</div>
                      </div>
                    </td>
                    <td>
                      <div className="max-w-xs truncate" title={shipping.diaChiNhan}>
                        {shipping.diaChiNhan}
                      </div>
                      <div className="text-xs text-gray-500">{shipping.khuVucNhan}, {shipping.phuongXaNhan}</div>
                    </td>
                    <td>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 w-fit ${getStatusColor(shipping.trangThaiGiaoHang)}`}>
                        {getStatusIcon(shipping.trangThaiGiaoHang)}
                        {shipping.trangThaiGiaoHang}
                      </span>
                    </td>
                    <td>
                      <button
                        className="p-2 text-primary-600 hover:bg-primary-100 rounded-lg transition-colors"
                        title="Xem chi tiết"
                        onClick={() => {
                          setSelectedShipping(shipping)
                          setShowDetailModal(true)
                        }}
                      >
                        <Eye size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card">
          <p className="text-sm text-gray-600">Tổng vận đơn</p>
          <p className="text-2xl font-bold mt-1">{shippingOrders.length}</p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-600">Đã giao</p>
          <p className="text-2xl font-bold mt-1 text-green-600">
            {shippingOrders.filter(s => s.trangThaiGiaoHang === 'Đã giao' || s.trangThaiGiaoHang === 'Đã nhận hàng trả').length}
          </p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-600">Đang vận chuyển</p>
          <p className="text-2xl font-bold mt-1 text-blue-600">
            {shippingOrders.filter(s => s.trangThaiGiaoHang === 'Đang vận chuyển').length}
          </p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-600">Tổng phí vận chuyển</p>
          <p className="text-2xl font-bold mt-1 text-primary-600">
            {shippingOrders.reduce((sum, s) => sum + (s.phiVanChuyen || 0), 0).toLocaleString('vi-VN')} đ
          </p>
        </div>
      </div>

      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-900">Lịch sử đồng bộ</h3>
          <span className="text-xs font-medium uppercase tracking-[0.3em] text-slate-500">
            {syncLogs.length} bản ghi gần nhất
          </span>
        </div>
        {syncLogs.length === 0 ? (
          <p className="text-sm text-slate-500">Chưa có lịch sử đồng bộ nào được ghi nhận.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Thời gian</th>
                  <th>Đối tác</th>
                  <th>Số vận đơn cập nhật</th>
                  <th>Tổng vận đơn</th>
                </tr>
              </thead>
              <tbody>
                {syncLogs.map((log) => (
                  <tr key={log.id}>
                    <td className="font-medium text-slate-700">{formatDateTime(log.syncedAt)}</td>
                    <td className="font-medium text-slate-700">{log.carrierName}</td>
                    <td className="text-primary-600 font-semibold">{log.impactedShipments}</td>
                    <td>{log.totalShipments}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showDetailModal && selectedShipping && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-lg p-6 w-full max-w-6xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Truck size={24} />
                Chi tiết vận đơn: {selectedShipping.maVanDon}
              </h2>
              <button
                onClick={() => {
                  setShowDetailModal(false)
                  setSelectedShipping(null)
                }}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X size={24} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2">Thông tin vận đơn</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Mã đơn hàng:</span>
                    <div className="font-medium">{selectedShipping.maHoaDon || '-'}</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Mã đơn trả:</span>
                    <div className="font-medium">{selectedShipping.maTraHang || '-'}</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Loại đơn:</span>
                    <div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        selectedShipping.loaiDon === 'Đơn hàng'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {selectedShipping.loaiDon}
                      </span>
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-600">Đối tác giao hàng:</span>
                    <div className="font-medium">{selectedShipping.doiTacGiaoHang || '-'}</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Dịch vụ:</span>
                    <div className="font-medium">{selectedShipping.dichVu || '-'}</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Thời gian tạo:</span>
                    <div className="font-medium">{selectedShipping.thoiGianTao || '-'}</div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2">Thông tin người nhận</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Tên người nhận:</span>
                    <div className="font-medium">{selectedShipping.nguoiNhan || '-'}</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Điện thoại:</span>
                    <div className="font-medium">{selectedShipping.dienThoaiNguoiNhan || '-'}</div>
                  </div>
                  <div className="col-span-2">
                    <span className="text-gray-600">Địa chỉ nhận:</span>
                    <div className="font-medium">{selectedShipping.diaChiNhan || '-'}</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Khu vực:</span>
                    <div className="font-medium">{selectedShipping.khuVucNhan || '-'}</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Phường/Xã:</span>
                    <div className="font-medium">{selectedShipping.phuongXaNhan || '-'}</div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2">Thông tin địa chỉ lấy hàng</h3>
                <div className="text-sm">
                  <span className="text-gray-600">Địa chỉ:</span>
                  <div className="font-medium mt-1">{selectedShipping.diaChiLayHang || '-'}</div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2">Thông tin vận chuyển</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Trọng lượng:</span>
                    <div className="font-medium">{selectedShipping.trongLuong || 0} gram</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Kích thước:</span>
                    <div className="font-medium">
                      {selectedShipping.dai || 0} x {selectedShipping.rong || 0} x {selectedShipping.cao || 0} cm
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-600">Phí vận chuyển:</span>
                    <div className="font-semibold text-primary-600">
                      {(selectedShipping.phiVanChuyen || 0).toLocaleString('vi-VN')} đ
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-600">Phí trả ĐTGH:</span>
                    <div className="font-medium">
                      {(selectedShipping.phiTraDTGH || 0).toLocaleString('vi-VN')} đ
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-600">Trạng thái:</span>
                    <div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedShipping.trangThaiGiaoHang)}`}>
                        {selectedShipping.trangThaiGiaoHang}
                      </span>
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-600">Thời gian giao hàng:</span>
                    <div className="font-medium">{selectedShipping.thoiGianGiaoHang || 'Chưa giao'}</div>
                  </div>
                  <div className="col-span-2">
                    <span className="text-gray-600">Ghi chú:</span>
                    <div className="font-medium">{selectedShipping.ghiChu || '-'}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showConnectModal && carrierToConnect && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 px-4 py-8 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-700 dark:bg-slate-900">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                  Liên kết {carrierToConnect.name}
                </h2>
                <p className="text-sm text-slate-500">
                  Nhập thông tin do đối tác giao vận cung cấp để kích hoạt đồng bộ.
                </p>
              </div>
              <button
                onClick={() => setShowConnectModal(false)}
                className="rounded-xl p-2 text-slate-500 transition hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmitConnect} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200">
                  API Key
                </label>
                <input
                  type="text"
                  className="input-field mt-1"
                  placeholder="Nhập API Key được cấp"
                  value={connectForm.apiKey}
                  onChange={(e) => setConnectForm(prev => ({ ...prev, apiKey: e.target.value }))}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200">
                  Mã cửa hàng / Shop code
                </label>
                <input
                  type="text"
                  className="input-field mt-1"
                  placeholder="Mã định danh cửa hàng"
                  value={connectForm.shopCode}
                  onChange={(e) => setConnectForm(prev => ({ ...prev, shopCode: e.target.value }))}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200">
                  Webhook URL (tùy chọn)
                </label>
                <input
                  type="url"
                  className="input-field mt-1"
                  placeholder="https://example.com/webhook"
                  value={connectForm.webhookUrl}
                  onChange={(e) => setConnectForm(prev => ({ ...prev, webhookUrl: e.target.value }))}
                />
                <p className="mt-2 text-xs text-slate-400">
                  Sử dụng để nhận thông báo đẩy khi trạng thái vận đơn thay đổi.
                </p>
              </div>
              {formError && (
                <p className="text-sm font-medium text-rose-600">{formError}</p>
              )}
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowConnectModal(false)}
                  className="btn-secondary"
                >
                  Hủy
                </button>
                <button type="submit" className="btn-primary">
                  Lưu liên kết
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Shipping

