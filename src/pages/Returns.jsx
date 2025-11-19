import { useState, useEffect } from 'react'
import { Search, Eye, CheckCircle, XCircle, Clock, RotateCcw, Filter, X, Truck } from 'lucide-react'

const Returns = () => {
  const [returns, setReturns] = useState([
    {
      // Thông tin cơ bản
      maTraHang: 'TH001',
      maHoaDonGoc: 'HD001',
      maVanDon: 'VD001',
      chiNhanh: 'CN01 - Hà Nội',
      thoiGianTao: '2024-01-18 10:00:00',
      ngayCapNhat: '2024-01-18 14:00:00',
      
      // Thông tin khách hàng
      maKhachHang: 'KH001',
      tenKhachHang: 'Nguyễn Văn A',
      email: 'nguyenvana@email.com',
      dienThoai: '0901234567',
      diaChiKhachHang: '456 Đường XYZ, Quận 2, TP.HCM',
      
      // Thông tin đơn hàng trả
      lyDoTra: 'Sản phẩm không đúng mô tả',
      ghiChu: 'Khách hàng yêu cầu đổi màu sắc',
      trangThai: 'Đã xử lý',
      trangThaiGiaoHang: 'Đã nhận hàng trả',
      nguoiXuLy: 'Nguyễn Thị B',
      
      // Thông tin thanh toán
      tongTienTra: 1250000,
      phiTraHang: 0,
      phuongThucHoanTien: 'Chuyển khoản',
      soTienDaHoan: 1250000,
      soTienConHoan: 0,
      
      // Thông tin sản phẩm trả
      sanPhamTra: [
        {
          maHang: 'SP001',
          maVach: '1234567890123',
          tenHang: 'Áo thun nam',
          soLuongTra: 2,
          soLuongHuHong: 0,
          lyDoTraChiTiet: 'Không đúng size',
          donGia: 500000,
          thanhTien: 1000000
        }
      ],
      
      // Thông tin vận chuyển
      doiTacGiaoHang: 'GHN',
      dichVu: 'Giao hàng trả hàng',
      trongLuong: 500,
      thoiGianNhanHang: '2024-01-18 15:00:00'
    },
    {
      maTraHang: 'TH002',
      maHoaDonGoc: 'HD002',
      maVanDon: 'VD002',
      chiNhanh: 'CN02 - TP.HCM',
      thoiGianTao: '2024-01-19 09:00:00',
      ngayCapNhat: '2024-01-19 11:00:00',
      maKhachHang: 'KH002',
      tenKhachHang: 'Trần Thị B',
      email: 'tranthib@email.com',
      dienThoai: '0912345678',
      diaChiKhachHang: '789 Đường GHI, Quận 4, TP.HCM',
      lyDoTra: 'Sản phẩm bị lỗi',
      ghiChu: 'Sản phẩm bị hỏng khi nhận',
      trangThai: 'Đang xử lý',
      trangThaiGiaoHang: 'Đang vận chuyển',
      nguoiXuLy: 'Lê Văn C',
      tongTienTra: 890000,
      phiTraHang: 30000,
      phuongThucHoanTien: 'Tiền mặt',
      soTienDaHoan: 0,
      soTienConHoan: 890000,
      sanPhamTra: [
        {
          maHang: 'SP003',
          maVach: '1234567890125',
          tenHang: 'Giày thể thao',
          soLuongTra: 1,
          soLuongHuHong: 1,
          lyDoTraChiTiet: 'Bị lỗi sản xuất',
          donGia: 850000,
          thanhTien: 850000
        }
      ],
      doiTacGiaoHang: 'Viettel Post',
      dichVu: 'Giao hàng trả hàng',
      trongLuong: 800,
      thoiGianNhanHang: ''
    },
  ])

  useEffect(() => {
    if (localStorage.getItem('disableFallbackData') === 'true') {
      setReturns([])
    }
  }, [])

  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)
  const [showReturnDetail, setShowReturnDetail] = useState(false)
  const [selectedReturn, setSelectedReturn] = useState(null)
  
  // Advanced filters
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [amountMin, setAmountMin] = useState('')
  const [amountMax, setAmountMax] = useState('')
  const [customerFilter, setCustomerFilter] = useState('')

  const filteredReturns = returns.filter(returnOrder => {
    const searchLower = searchTerm.toLowerCase()
    const matchesSearch = !searchTerm || 
      returnOrder.maTraHang?.toLowerCase().includes(searchLower) ||
      returnOrder.maHoaDonGoc?.toLowerCase().includes(searchLower) ||
      returnOrder.tenKhachHang?.toLowerCase().includes(searchLower) ||
      returnOrder.dienThoai?.includes(searchTerm) ||
      returnOrder.maKhachHang?.toLowerCase().includes(searchLower)
    
    const matchesStatus = statusFilter === 'all' || returnOrder.trangThai === statusFilter
    
    const returnDate = returnOrder.thoiGianTao?.split(' ')[0] || ''
    const matchesDateFrom = !dateFrom || returnDate >= dateFrom
    const matchesDateTo = !dateTo || returnDate <= dateTo
    const matchesAmountMin = !amountMin || returnOrder.tongTienTra >= Number(amountMin)
    const matchesAmountMax = !amountMax || returnOrder.tongTienTra <= Number(amountMax)
    const matchesCustomer = !customerFilter || returnOrder.tenKhachHang?.toLowerCase().includes(customerFilter.toLowerCase())
    
    return matchesSearch && matchesStatus &&
           matchesDateFrom && matchesDateTo &&
           matchesAmountMin && matchesAmountMax &&
           matchesCustomer
  })

  const handleResetFilters = () => {
    setDateFrom('')
    setDateTo('')
    setAmountMin('')
    setAmountMax('')
    setCustomerFilter('')
    setSearchTerm('')
    setStatusFilter('all')
  }

  const hasActiveFilters = dateFrom || dateTo || amountMin || amountMax || 
                          customerFilter || statusFilter !== 'all'

  const getStatusColor = (status) => {
    switch (status) {
      case 'Đã xử lý':
        return 'bg-green-100 text-green-800'
      case 'Đang xử lý':
        return 'bg-yellow-100 text-yellow-800'
      case 'Đã hủy':
        return 'bg-red-100 text-red-800'
      case 'Chờ xác nhận':
        return 'bg-purple-100 text-purple-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Đã xử lý':
        return <CheckCircle size={16} />
      case 'Đang xử lý':
        return <Clock size={16} />
      case 'Chờ xác nhận':
        return <Clock size={16} />
      case 'Đã hủy':
        return <XCircle size={16} />
      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Quản lý Đơn hàng Trả</h1>
        <p className="text-gray-600">Theo dõi và quản lý các đơn hàng trả lại</p>
      </div>

      {/* Basic Filters */}
      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Tìm kiếm đơn trả..."
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
            <option value="Chờ xác nhận">Chờ xác nhận</option>
            <option value="Đang xử lý">Đang xử lý</option>
            <option value="Đã xử lý">Đã xử lý</option>
            <option value="Đã hủy">Đã hủy</option>
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
              Bộ lọc nâng cao
              {hasActiveFilters && (
                <span className="ml-1 px-2 py-0.5 bg-white text-primary-600 rounded-full text-xs">
                  {[dateFrom, dateTo, amountMin, amountMax, customerFilter].filter(Boolean).length}
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
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
                  Số tiền từ (đ)
                </label>
                <input
                  type="number"
                  value={amountMin}
                  onChange={(e) => setAmountMin(e.target.value)}
                  placeholder="0"
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Số tiền đến (đ)
                </label>
                <input
                  type="number"
                  value={amountMax}
                  onChange={(e) => setAmountMax(e.target.value)}
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
            </div>
          </div>
        )}
      </div>

      {/* Returns Table */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-gray-600">
            Hiển thị <span className="font-semibold text-gray-900">{filteredReturns.length}</span> trong tổng số <span className="font-semibold text-gray-900">{returns.length}</span> đơn trả
            {hasActiveFilters && (
              <span className="ml-2 text-primary-600">(đã lọc)</span>
            )}
          </p>
        </div>
        <div className="overflow-x-auto">
          {filteredReturns.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">Không tìm thấy đơn trả nào</p>
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
                  <th>Mã trả hàng</th>
                  <th>Mã hóa đơn gốc</th>
                  <th>Mã vận đơn</th>
                  <th>Khách hàng</th>
                  <th>Điện thoại</th>
                  <th>Đối tác GH</th>
                  <th>Ngày tạo</th>
                  <th>Lý do trả</th>
                  <th>Tổng tiền trả</th>
                  <th>Trạng thái</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredReturns.map((returnOrder) => {
                  const returnDate = returnOrder.thoiGianTao?.split(' ')[0] || ''
                  
                  return (
                    <tr key={returnOrder.maTraHang}>
                      <td className="font-mono font-medium">{returnOrder.maTraHang}</td>
                      <td className="font-mono text-sm">{returnOrder.maHoaDonGoc}</td>
                      <td className="font-mono text-sm">{returnOrder.maVanDon || '-'}</td>
                      <td>
                        <div>
                          <div className="font-medium">{returnOrder.tenKhachHang}</div>
                          <div className="text-xs text-gray-500">{returnOrder.maKhachHang}</div>
                        </div>
                      </td>
                      <td>{returnOrder.dienThoai || '-'}</td>
                      <td>
                        <span className="inline-flex items-center gap-2 px-3 py-1 bg-purple-50 text-purple-700 rounded-lg text-sm font-medium">
                          <Truck size={14} />
                          {returnOrder.doiTacGiaoHang || '-'}
                        </span>
                      </td>
                      <td className="text-sm">{returnDate}</td>
                      <td>
                        <div className="max-w-xs truncate" title={returnOrder.lyDoTra}>
                          {returnOrder.lyDoTra || '-'}
                        </div>
                      </td>
                      <td className="font-semibold text-red-600">
                        {(returnOrder.tongTienTra || 0).toLocaleString('vi-VN')} đ
                      </td>
                      <td>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 w-fit ${getStatusColor(returnOrder.trangThai)}`}>
                          {getStatusIcon(returnOrder.trangThai)}
                          {returnOrder.trangThai}
                        </span>
                      </td>
                      <td>
                        <button 
                          className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors" 
                          title="Xem chi tiết"
                          onClick={() => {
                            setSelectedReturn(returnOrder)
                            setShowReturnDetail(true)
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
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card">
          <p className="text-sm text-gray-600">Tổng đơn trả</p>
          <p className="text-2xl font-bold mt-1">{returns.length}</p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-600">Đã xử lý</p>
          <p className="text-2xl font-bold mt-1 text-green-600">
            {returns.filter(r => r.trangThai === 'Đã xử lý').length}
          </p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-600">Đang xử lý</p>
          <p className="text-2xl font-bold mt-1 text-yellow-600">
            {returns.filter(r => r.trangThai === 'Đang xử lý').length}
          </p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-600">Tổng tiền trả</p>
          <p className="text-2xl font-bold mt-1 text-red-600">
            {returns.reduce((sum, r) => sum + (r.tongTienTra || 0), 0).toLocaleString('vi-VN')} đ
          </p>
        </div>
      </div>

      {/* Return Detail Modal */}
      {showReturnDetail && selectedReturn && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-lg p-6 w-full max-w-6xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <RotateCcw size={24} />
                Chi tiết đơn trả hàng: {selectedReturn.maTraHang}
              </h2>
              <button
                onClick={() => {
                  setShowReturnDetail(false)
                  setSelectedReturn(null)
                }}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X size={24} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Thông tin cơ bản */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2">Thông tin cơ bản</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Chi nhánh:</span>
                    <div className="font-medium">{selectedReturn.chiNhanh || '-'}</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Mã hóa đơn gốc:</span>
                    <div className="font-mono font-medium">{selectedReturn.maHoaDonGoc || '-'}</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Mã vận đơn:</span>
                    <div className="font-mono font-medium">{selectedReturn.maVanDon || '-'}</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Thời gian tạo:</span>
                    <div className="font-medium">{selectedReturn.thoiGianTao || '-'}</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Ngày cập nhật:</span>
                    <div className="font-medium">{selectedReturn.ngayCapNhat || '-'}</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Người xử lý:</span>
                    <div className="font-medium">{selectedReturn.nguoiXuLy || '-'}</div>
                  </div>
                </div>
              </div>

              {/* Thông tin khách hàng */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2">Thông tin khách hàng</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Mã khách hàng:</span>
                    <div className="font-mono font-medium">{selectedReturn.maKhachHang || '-'}</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Tên khách hàng:</span>
                    <div className="font-medium">{selectedReturn.tenKhachHang || '-'}</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Email:</span>
                    <div className="font-medium">{selectedReturn.email || '-'}</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Điện thoại:</span>
                    <div className="font-medium">{selectedReturn.dienThoai || '-'}</div>
                  </div>
                  <div className="col-span-2">
                    <span className="text-gray-600">Địa chỉ:</span>
                    <div className="font-medium">{selectedReturn.diaChiKhachHang || '-'}</div>
                  </div>
                </div>
              </div>

              {/* Thông tin trả hàng */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2">Thông tin trả hàng</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="col-span-2">
                    <span className="text-gray-600">Lý do trả:</span>
                    <div className="font-medium">{selectedReturn.lyDoTra || '-'}</div>
                  </div>
                  <div className="col-span-2">
                    <span className="text-gray-600">Ghi chú:</span>
                    <div className="font-medium">{selectedReturn.ghiChu || '-'}</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Trạng thái:</span>
                    <div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedReturn.trangThai)}`}>
                        {selectedReturn.trangThai}
                      </span>
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-600">Trạng thái giao hàng:</span>
                    <div className="font-medium">{selectedReturn.trangThaiGiaoHang || '-'}</div>
                  </div>
                </div>
              </div>

              {/* Thông tin hoàn tiền */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2">Thông tin hoàn tiền</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Tổng tiền trả:</span>
                    <div className="font-semibold text-red-600">
                      {(selectedReturn.tongTienTra || 0).toLocaleString('vi-VN')} đ
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-600">Phí trả hàng:</span>
                    <div className="font-medium">{(selectedReturn.phiTraHang || 0).toLocaleString('vi-VN')} đ</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Phương thức hoàn tiền:</span>
                    <div className="font-medium">{selectedReturn.phuongThucHoanTien || '-'}</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Số tiền đã hoàn:</span>
                    <div className="font-medium text-green-600">
                      {(selectedReturn.soTienDaHoan || 0).toLocaleString('vi-VN')} đ
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-600">Số tiền còn hoàn:</span>
                    <div className="font-medium text-red-600">
                      {(selectedReturn.soTienConHoan || 0).toLocaleString('vi-VN')} đ
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Danh sách sản phẩm trả */}
            {selectedReturn.sanPhamTra && selectedReturn.sanPhamTra.length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-4 border-b pb-2">Danh sách sản phẩm trả</h3>
                <div className="overflow-x-auto">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Mã hàng</th>
                        <th>Mã vạch</th>
                        <th>Tên hàng</th>
                        <th>Số lượng trả</th>
                        <th>Số lượng hỏng</th>
                        <th>Lý do trả</th>
                        <th>Đơn giá</th>
                        <th>Thành tiền</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedReturn.sanPhamTra.map((sp, index) => (
                        <tr key={index}>
                          <td className="font-mono text-sm">{sp.maHang}</td>
                          <td className="font-mono text-xs">{sp.maVach}</td>
                          <td>{sp.tenHang}</td>
                          <td>{sp.soLuongTra}</td>
                          <td>{sp.soLuongHuHong}</td>
                          <td>{sp.lyDoTraChiTiet}</td>
                          <td>{sp.donGia?.toLocaleString('vi-VN')} đ</td>
                          <td className="font-semibold text-red-600">
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
    </div>
  )
}

export default Returns

