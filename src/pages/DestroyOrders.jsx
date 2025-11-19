import { useState, useEffect } from 'react'
import { Search, Eye, Plus, Trash2, Filter, X } from 'lucide-react'

const DestroyOrders = () => {
  const [destroyOrders, setDestroyOrders] = useState([
    {
      id: 1,
      maPhieuXuatHuy: 'PXH001',
      ngayXuat: '2024-01-18',
      thoiGianTao: '2024-01-18 14:00:00',
      nguoiTao: 'Admin',
      lyDo: 'Hàng hết hạn sử dụng',
      trangThai: 'Đã hủy',
      tongGiaTri: 2500000,
      ghiChu: 'Hủy do hết hạn',
      sanPham: [
        {
          maHang: 'SP001',
          tenHang: 'Áo thun nam',
          soLuong: 10,
          donGia: 150000,
          thanhTien: 1500000
        },
        {
          maHang: 'SP002',
          tenHang: 'Quần jean',
          soLuong: 5,
          donGia: 200000,
          thanhTien: 1000000
        }
      ]
    },
    {
      id: 2,
      maPhieuXuatHuy: 'PXH002',
      ngayXuat: '2024-01-19',
      thoiGianTao: '2024-01-19 10:00:00',
      nguoiTao: 'Staff01',
      lyDo: 'Hàng bị hỏng',
      trangThai: 'Đang xử lý',
      tongGiaTri: 1500000,
      ghiChu: '',
      sanPham: [
        {
          maHang: 'SP003',
          tenHang: 'Giày thể thao',
          soLuong: 10,
          donGia: 150000,
          thanhTien: 1500000
        }
      ]
    },
  ])

  useEffect(() => {
    if (localStorage.getItem('disableFallbackData') === 'true') {
      setDestroyOrders([])
    }
  }, [])

  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [showDetail, setShowDetail] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState(null)

  const filteredOrders = destroyOrders.filter(order => {
    const matchesSearch = order.maPhieuXuatHuy.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.lyDo.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || order.trangThai === statusFilter
    return matchesSearch && matchesStatus
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Quản lý Xuất Hủy</h1>
          <p className="text-gray-600">Theo dõi và quản lý các phiếu xuất hủy hàng hóa</p>
        </div>
        <button className="btn-primary flex items-center gap-2">
          <Plus size={20} />
          Tạo phiếu xuất hủy
        </button>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Tìm kiếm phiếu xuất hủy..."
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
                <th>Mã phiếu xuất hủy</th>
                <th>Ngày xuất</th>
                <th>Người tạo</th>
                <th>Lý do</th>
                <th>Tổng giá trị</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => (
                <tr key={order.id}>
                  <td className="font-mono font-medium">{order.maPhieuXuatHuy}</td>
                  <td>{order.ngayXuat}</td>
                  <td>{order.nguoiTao}</td>
                  <td>
                    <div className="max-w-xs truncate" title={order.lyDo}>
                      {order.lyDo}
                    </div>
                  </td>
                  <td className="font-semibold text-red-600">
                    {order.tongGiaTri.toLocaleString('vi-VN')} đ
                  </td>
                  <td>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      order.trangThai === 'Đã hủy' 
                        ? 'bg-red-100 text-red-800' 
                        : 'bg-yellow-100 text-yellow-800'
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
          <p className="text-sm text-gray-600">Tổng phiếu xuất hủy</p>
          <p className="text-2xl font-bold mt-1">{destroyOrders.length}</p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-600">Đã hủy</p>
          <p className="text-2xl font-bold mt-1 text-red-600">
            {destroyOrders.filter(o => o.trangThai === 'Đã hủy').length}
          </p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-600">Đang xử lý</p>
          <p className="text-2xl font-bold mt-1 text-yellow-600">
            {destroyOrders.filter(o => o.trangThai === 'Đang xử lý').length}
          </p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-600">Tổng giá trị hủy</p>
          <p className="text-2xl font-bold mt-1 text-red-600">
            {destroyOrders.reduce((sum, o) => sum + o.tongGiaTri, 0).toLocaleString('vi-VN')} đ
          </p>
        </div>
      </div>

      {/* Detail Modal */}
      {showDetail && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Trash2 size={24} />
                Chi tiết phiếu xuất hủy: {selectedOrder.maPhieuXuatHuy}
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
                <span className="text-gray-600">Ngày xuất:</span>
                <div className="font-medium">{selectedOrder.ngayXuat}</div>
              </div>
              <div>
                <span className="text-gray-600">Người tạo:</span>
                <div className="font-medium">{selectedOrder.nguoiTao}</div>
              </div>
              <div>
                <span className="text-gray-600">Lý do:</span>
                <div className="font-medium">{selectedOrder.lyDo}</div>
              </div>
              <div>
                <span className="text-gray-600">Tổng giá trị:</span>
                <div className="font-semibold text-red-600">
                  {selectedOrder.tongGiaTri.toLocaleString('vi-VN')} đ
                </div>
              </div>
              <div className="col-span-2">
                <span className="text-gray-600">Ghi chú:</span>
                <div className="font-medium">{selectedOrder.ghiChu || '-'}</div>
              </div>
            </div>

            {selectedOrder.sanPham && selectedOrder.sanPham.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-4">Danh sách sản phẩm hủy</h3>
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

export default DestroyOrders

