import { useState, useEffect } from 'react'
import { Search, Eye, Plus, RotateCcw, Filter, X } from 'lucide-react'

const SupplierReturns = () => {
  const [supplierReturns, setSupplierReturns] = useState([
    {
      id: 1,
      maPhieuTra: 'PT001',
      maNhaCungCap: 'NCC001',
      tenNhaCungCap: 'Công ty TNHH ABC',
      ngayTra: '2024-01-20',
      thoiGianTao: '2024-01-20 10:00:00',
      nguoiTao: 'Admin',
      trangThai: 'Đã trả',
      lyDoTra: 'Sản phẩm lỗi',
      tongTien: 5000000,
      ghiChu: 'Trả hàng do lỗi sản xuất',
      sanPham: [
        {
          maHang: 'SP001',
          tenHang: 'Áo thun nam',
          soLuong: 30,
          donGia: 150000,
          thanhTien: 4500000
        }
      ]
    },
    {
      id: 2,
      maPhieuTra: 'PT002',
      maNhaCungCap: 'NCC002',
      tenNhaCungCap: 'Công ty Cổ phần XYZ',
      ngayTra: '2024-01-21',
      thoiGianTao: '2024-01-21 09:00:00',
      nguoiTao: 'Staff01',
      trangThai: 'Đang xử lý',
      lyDoTra: 'Không đúng chất lượng',
      tongTien: 3000000,
      ghiChu: '',
      sanPham: [
        {
          maHang: 'SP003',
          tenHang: 'Giày thể thao',
          soLuong: 15,
          donGia: 200000,
          thanhTien: 3000000
        }
      ]
    },
  ])

  useEffect(() => {
    if (localStorage.getItem('disableFallbackData') === 'true') {
      setSupplierReturns([])
    }
  }, [])

  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [showDetail, setShowDetail] = useState(false)
  const [selectedReturn, setSelectedReturn] = useState(null)

  const filteredReturns = supplierReturns.filter(returnOrder => {
    const matchesSearch = returnOrder.maPhieuTra.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         returnOrder.tenNhaCungCap.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || returnOrder.trangThai === statusFilter
    return matchesSearch && matchesStatus
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Quản lý Trả hàng (Nhà cung cấp)</h1>
          <p className="text-gray-600">Theo dõi và quản lý các phiếu trả hàng cho nhà cung cấp</p>
        </div>
        <button className="btn-primary flex items-center gap-2">
          <Plus size={20} />
          Tạo phiếu trả
        </button>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Tìm kiếm phiếu trả..."
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
            <option value="Đang xử lý">Đang xử lý</option>
            <option value="Đã trả">Đã trả</option>
            <option value="Đã hủy">Đã hủy</option>
          </select>
        </div>
      </div>

      {/* Returns Table */}
      <div className="card">
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>Mã phiếu trả</th>
                <th>Nhà cung cấp</th>
                <th>Ngày trả</th>
                <th>Người tạo</th>
                <th>Lý do trả</th>
                <th>Tổng tiền</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredReturns.map((returnOrder) => (
                <tr key={returnOrder.id}>
                  <td className="font-mono font-medium">{returnOrder.maPhieuTra}</td>
                  <td>
                    <div>
                      <div className="font-medium">{returnOrder.tenNhaCungCap}</div>
                      <div className="text-xs text-gray-500">{returnOrder.maNhaCungCap}</div>
                    </div>
                  </td>
                  <td>{returnOrder.ngayTra}</td>
                  <td>{returnOrder.nguoiTao}</td>
                  <td>
                    <div className="max-w-xs truncate" title={returnOrder.lyDoTra}>
                      {returnOrder.lyDoTra}
                    </div>
                  </td>
                  <td className="font-semibold text-red-600">
                    {returnOrder.tongTien.toLocaleString('vi-VN')} đ
                  </td>
                  <td>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      returnOrder.trangThai === 'Đã trả' 
                        ? 'bg-green-100 text-green-800' 
                        : returnOrder.trangThai === 'Đang xử lý'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {returnOrder.trangThai}
                    </span>
                  </td>
                  <td>
                    <button
                      onClick={() => {
                        setSelectedReturn(returnOrder)
                        setShowDetail(true)
                      }}
                      className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                      title="Xem chi tiết"
                    >
                      <Eye size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card">
          <p className="text-sm text-gray-600">Tổng phiếu trả</p>
          <p className="text-2xl font-bold mt-1">{supplierReturns.length}</p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-600">Đã trả</p>
          <p className="text-2xl font-bold mt-1 text-green-600">
            {supplierReturns.filter(r => r.trangThai === 'Đã trả').length}
          </p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-600">Đang xử lý</p>
          <p className="text-2xl font-bold mt-1 text-yellow-600">
            {supplierReturns.filter(r => r.trangThai === 'Đang xử lý').length}
          </p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-600">Tổng giá trị</p>
          <p className="text-2xl font-bold mt-1 text-red-600">
            {supplierReturns.reduce((sum, r) => sum + r.tongTien, 0).toLocaleString('vi-VN')} đ
          </p>
        </div>
      </div>

      {/* Detail Modal */}
      {showDetail && selectedReturn && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <RotateCcw size={24} />
                Chi tiết phiếu trả: {selectedReturn.maPhieuTra}
              </h2>
              <button
                onClick={() => {
                  setShowDetail(false)
                  setSelectedReturn(null)
                }}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X size={24} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-6 mb-6">
              <div>
                <span className="text-gray-600">Nhà cung cấp:</span>
                <div className="font-medium">{selectedReturn.tenNhaCungCap}</div>
              </div>
              <div>
                <span className="text-gray-600">Ngày trả:</span>
                <div className="font-medium">{selectedReturn.ngayTra}</div>
              </div>
              <div>
                <span className="text-gray-600">Người tạo:</span>
                <div className="font-medium">{selectedReturn.nguoiTao}</div>
              </div>
              <div>
                <span className="text-gray-600">Lý do trả:</span>
                <div className="font-medium">{selectedReturn.lyDoTra}</div>
              </div>
              <div>
                <span className="text-gray-600">Tổng tiền:</span>
                <div className="font-semibold text-red-600">
                  {selectedReturn.tongTien.toLocaleString('vi-VN')} đ
                </div>
              </div>
              <div className="col-span-2">
                <span className="text-gray-600">Ghi chú:</span>
                <div className="font-medium">{selectedReturn.ghiChu || '-'}</div>
              </div>
            </div>

            {selectedReturn.sanPham && selectedReturn.sanPham.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-4">Danh sách sản phẩm trả</h3>
                <table className="table">
                  <thead>
                    <tr>
                      <th>Mã hàng</th>
                      <th>Tên hàng</th>
                      <th>Số lượng</th>
                      <th>Đơn giá</th>
                      <th>Thành tiền</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedReturn.sanPham.map((sp, index) => (
                      <tr key={index}>
                        <td className="font-mono">{sp.maHang}</td>
                        <td>{sp.tenHang}</td>
                        <td>{sp.soLuong}</td>
                        <td>{sp.donGia.toLocaleString('vi-VN')} đ</td>
                        <td className="font-semibold">{sp.thanhTien.toLocaleString('vi-VN')} đ</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default SupplierReturns

