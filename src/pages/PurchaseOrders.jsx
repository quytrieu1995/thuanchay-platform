import { useState, useEffect } from 'react'
import { Search, Eye, Plus, Package, Filter, X, Truck } from 'lucide-react'

const PurchaseOrders = () => {
  const [purchaseOrders, setPurchaseOrders] = useState([
    {
      id: 1,
      maPhieuNhap: 'PN001',
      maNhaCungCap: 'NCC001',
      tenNhaCungCap: 'Công ty TNHH ABC',
      ngayNhap: '2024-01-15',
      thoiGianTao: '2024-01-15 09:00:00',
      nguoiTao: 'Admin',
      trangThai: 'Đã nhập',
      tongTien: 15000000,
      ghiChu: 'Nhập hàng tháng 1',
      sanPham: [
        {
          maHang: 'SP001',
          tenHang: 'Áo thun nam',
          soLuong: 100,
          donGia: 150000,
          thanhTien: 15000000
        }
      ]
    },
    {
      id: 2,
      maPhieuNhap: 'PN002',
      maNhaCungCap: 'NCC002',
      tenNhaCungCap: 'Công ty Cổ phần XYZ',
      ngayNhap: '2024-01-16',
      thoiGianTao: '2024-01-16 10:00:00',
      nguoiTao: 'Staff01',
      trangThai: 'Đang xử lý',
      tongTien: 8500000,
      ghiChu: '',
      sanPham: [
        {
          maHang: 'SP003',
          tenHang: 'Giày thể thao',
          soLuong: 50,
          donGia: 170000,
          thanhTien: 8500000
        }
      ]
    },
  ])

  useEffect(() => {
    if (localStorage.getItem('disableFallbackData') === 'true') {
      setPurchaseOrders([])
    }
  }, [])

  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [showDetail, setShowDetail] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState(null)

  const filteredOrders = purchaseOrders.filter(order => {
    const matchesSearch = order.maPhieuNhap.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.tenNhaCungCap.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || order.trangThai === statusFilter
    return matchesSearch && matchesStatus
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Quản lý Nhập hàng</h1>
          <p className="text-gray-600">Theo dõi và quản lý các phiếu nhập hàng từ nhà cung cấp</p>
        </div>
        <button className="btn-primary flex items-center gap-2">
          <Plus size={20} />
          Tạo phiếu nhập
        </button>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Tìm kiếm phiếu nhập..."
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
            <option value="Đã nhập">Đã nhập</option>
            <option value="Đã hủy">Đã hủy</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="card">
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>Mã phiếu nhập</th>
                <th>Nhà cung cấp</th>
                <th>Ngày nhập</th>
                <th>Người tạo</th>
                <th>Tổng tiền</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => (
                <tr key={order.id}>
                  <td className="font-mono font-medium">{order.maPhieuNhap}</td>
                  <td>
                    <div>
                      <div className="font-medium">{order.tenNhaCungCap}</div>
                      <div className="text-xs text-gray-500">{order.maNhaCungCap}</div>
                    </div>
                  </td>
                  <td>{order.ngayNhap}</td>
                  <td>{order.nguoiTao}</td>
                  <td className="font-semibold text-primary-600">
                    {order.tongTien.toLocaleString('vi-VN')} đ
                  </td>
                  <td>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      order.trangThai === 'Đã nhập' 
                        ? 'bg-green-100 text-green-800' 
                        : order.trangThai === 'Đang xử lý'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {order.trangThai}
                    </span>
                  </td>
                  <td>
                    <button
                      onClick={() => {
                        setSelectedOrder(order)
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
          <p className="text-sm text-gray-600">Tổng phiếu nhập</p>
          <p className="text-2xl font-bold mt-1">{purchaseOrders.length}</p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-600">Đã nhập</p>
          <p className="text-2xl font-bold mt-1 text-green-600">
            {purchaseOrders.filter(o => o.trangThai === 'Đã nhập').length}
          </p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-600">Đang xử lý</p>
          <p className="text-2xl font-bold mt-1 text-yellow-600">
            {purchaseOrders.filter(o => o.trangThai === 'Đang xử lý').length}
          </p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-600">Tổng giá trị</p>
          <p className="text-2xl font-bold mt-1 text-primary-600">
            {purchaseOrders.reduce((sum, o) => sum + o.tongTien, 0).toLocaleString('vi-VN')} đ
          </p>
        </div>
      </div>

      {/* Detail Modal */}
      {showDetail && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Package size={24} />
                Chi tiết phiếu nhập: {selectedOrder.maPhieuNhap}
              </h2>
              <button
                onClick={() => {
                  setShowDetail(false)
                  setSelectedOrder(null)
                }}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X size={24} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-6 mb-6">
              <div>
                <span className="text-gray-600">Nhà cung cấp:</span>
                <div className="font-medium">{selectedOrder.tenNhaCungCap}</div>
              </div>
              <div>
                <span className="text-gray-600">Ngày nhập:</span>
                <div className="font-medium">{selectedOrder.ngayNhap}</div>
              </div>
              <div>
                <span className="text-gray-600">Người tạo:</span>
                <div className="font-medium">{selectedOrder.nguoiTao}</div>
              </div>
              <div>
                <span className="text-gray-600">Tổng tiền:</span>
                <div className="font-semibold text-primary-600">
                  {selectedOrder.tongTien.toLocaleString('vi-VN')} đ
                </div>
              </div>
            </div>

            {selectedOrder.sanPham && selectedOrder.sanPham.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-4">Danh sách sản phẩm</h3>
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
                    {selectedOrder.sanPham.map((sp, index) => (
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

export default PurchaseOrders

