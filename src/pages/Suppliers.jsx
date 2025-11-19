import { useState, useEffect } from 'react'
import { Search, Eye, Plus, Edit, Trash2, Phone, Mail, MapPin, Building2 } from 'lucide-react'

const Suppliers = () => {
  const [suppliers, setSuppliers] = useState([
    {
      id: 1,
      maNhaCungCap: 'NCC001',
      tenNhaCungCap: 'Công ty TNHH ABC',
      nguoiLienHe: 'Nguyễn Văn A',
      dienThoai: '0901234567',
      email: 'contact@abc.com',
      diaChi: '123 Đường ABC, Quận 1, TP.HCM',
      maSoThue: '1234567890',
      website: 'www.abc.com',
      ghiChu: 'Nhà cung cấp chính cho sản phẩm thời trang',
      trangThai: 'Hoạt động',
      soDonHang: 25,
      tongGiaTri: 50000000
    },
    {
      id: 2,
      maNhaCungCap: 'NCC002',
      tenNhaCungCap: 'Công ty Cổ phần XYZ',
      nguoiLienHe: 'Trần Thị B',
      dienThoai: '0912345678',
      email: 'info@xyz.com',
      diaChi: '456 Đường XYZ, Quận 2, TP.HCM',
      maSoThue: '0987654321',
      website: 'www.xyz.com',
      ghiChu: '',
      trangThai: 'Hoạt động',
      soDonHang: 15,
      tongGiaTri: 30000000
    },
    {
      id: 3,
      maNhaCungCap: 'NCC003',
      tenNhaCungCap: 'Công ty TNHH DEF',
      nguoiLienHe: 'Lê Văn C',
      dienThoai: '0923456789',
      email: 'sales@def.com',
      diaChi: '789 Đường DEF, Quận 3, TP.HCM',
      maSoThue: '1122334455',
      website: '',
      ghiChu: 'Nhà cung cấp phụ',
      trangThai: 'Tạm dừng',
      soDonHang: 5,
      tongGiaTri: 10000000
    },
  ])

  useEffect(() => {
    if (localStorage.getItem('disableFallbackData') === 'true') {
      setSuppliers([])
    }
  }, [])

  const [searchTerm, setSearchTerm] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingSupplier, setEditingSupplier] = useState(null)
  const [formData, setFormData] = useState({
    maNhaCungCap: '',
    tenNhaCungCap: '',
    nguoiLienHe: '',
    dienThoai: '',
    email: '',
    diaChi: '',
    maSoThue: '',
    website: '',
    ghiChu: '',
    trangThai: 'Hoạt động'
  })

  const filteredSuppliers = suppliers.filter(supplier =>
    supplier.tenNhaCungCap.toLowerCase().includes(searchTerm.toLowerCase()) ||
    supplier.maNhaCungCap.toLowerCase().includes(searchTerm.toLowerCase()) ||
    supplier.dienThoai.includes(searchTerm)
  )

  const handleAdd = () => {
    setEditingSupplier(null)
    setFormData({
      maNhaCungCap: '',
      tenNhaCungCap: '',
      nguoiLienHe: '',
      dienThoai: '',
      email: '',
      diaChi: '',
      maSoThue: '',
      website: '',
      ghiChu: '',
      trangThai: 'Hoạt động'
    })
    setShowModal(true)
  }

  const handleEdit = (supplier) => {
    setEditingSupplier(supplier)
    setFormData(supplier)
    setShowModal(true)
  }

  const handleDelete = (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa nhà cung cấp này?')) {
      setSuppliers(suppliers.filter(s => s.id !== id))
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (editingSupplier) {
      setSuppliers(suppliers.map(s => 
        s.id === editingSupplier.id ? { ...s, ...formData } : s
      ))
    } else {
      const newSupplier = {
        id: suppliers.length + 1,
        ...formData,
        soDonHang: 0,
        tongGiaTri: 0
      }
      setSuppliers([...suppliers, newSupplier])
    }
    setShowModal(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Quản lý Nhà cung cấp</h1>
          <p className="text-gray-600">Quản lý danh sách nhà cung cấp và thông tin liên hệ</p>
        </div>
        <button onClick={handleAdd} className="btn-primary flex items-center gap-2">
          <Plus size={20} />
          Thêm nhà cung cấp
        </button>
      </div>

      {/* Search */}
      <div className="card">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Tìm kiếm nhà cung cấp..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field pl-10"
          />
        </div>
      </div>

      {/* Suppliers Table */}
      <div className="card">
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>Mã NCC</th>
                <th>Tên nhà cung cấp</th>
                <th>Người liên hệ</th>
                <th>Điện thoại</th>
                <th>Email</th>
                <th>Địa chỉ</th>
                <th>Số đơn hàng</th>
                <th>Tổng giá trị</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredSuppliers.map((supplier) => (
                <tr key={supplier.id}>
                  <td className="font-mono font-medium">{supplier.maNhaCungCap}</td>
                  <td className="font-medium">{supplier.tenNhaCungCap}</td>
                  <td>{supplier.nguoiLienHe}</td>
                  <td>
                    <div className="flex items-center gap-2">
                      <Phone size={14} className="text-gray-400" />
                      {supplier.dienThoai}
                    </div>
                  </td>
                  <td>
                    <div className="flex items-center gap-2">
                      <Mail size={14} className="text-gray-400" />
                      {supplier.email}
                    </div>
                  </td>
                  <td>
                    <div className="flex items-center gap-2 max-w-xs truncate" title={supplier.diaChi}>
                      <MapPin size={14} className="text-gray-400" />
                      <span className="truncate">{supplier.diaChi}</span>
                    </div>
                  </td>
                  <td>{supplier.soDonHang}</td>
                  <td className="font-semibold text-primary-600">
                    {supplier.tongGiaTri.toLocaleString('vi-VN')} đ
                  </td>
                  <td>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      supplier.trangThai === 'Hoạt động' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {supplier.trangThai}
                    </span>
                  </td>
                  <td>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEdit(supplier)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Sửa"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(supplier.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Xóa"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
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
          <p className="text-sm text-gray-600">Tổng nhà cung cấp</p>
          <p className="text-2xl font-bold mt-1">{suppliers.length}</p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-600">Đang hoạt động</p>
          <p className="text-2xl font-bold mt-1 text-green-600">
            {suppliers.filter(s => s.trangThai === 'Hoạt động').length}
          </p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-600">Tổng đơn hàng</p>
          <p className="text-2xl font-bold mt-1">
            {suppliers.reduce((sum, s) => sum + s.soDonHang, 0)}
          </p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-600">Tổng giá trị</p>
          <p className="text-2xl font-bold mt-1 text-primary-600">
            {suppliers.reduce((sum, s) => sum + s.tongGiaTri, 0).toLocaleString('vi-VN')} đ
          </p>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">
              {editingSupplier ? 'Sửa nhà cung cấp' : 'Thêm nhà cung cấp mới'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mã nhà cung cấp</label>
                  <input
                    type="text"
                    required
                    value={formData.maNhaCungCap}
                    onChange={(e) => setFormData({ ...formData, maNhaCungCap: e.target.value })}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tên nhà cung cấp</label>
                  <input
                    type="text"
                    required
                    value={formData.tenNhaCungCap}
                    onChange={(e) => setFormData({ ...formData, tenNhaCungCap: e.target.value })}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Người liên hệ</label>
                  <input
                    type="text"
                    required
                    value={formData.nguoiLienHe}
                    onChange={(e) => setFormData({ ...formData, nguoiLienHe: e.target.value })}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Điện thoại</label>
                  <input
                    type="text"
                    required
                    value={formData.dienThoai}
                    onChange={(e) => setFormData({ ...formData, dienThoai: e.target.value })}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mã số thuế</label>
                  <input
                    type="text"
                    value={formData.maSoThue}
                    onChange={(e) => setFormData({ ...formData, maSoThue: e.target.value })}
                    className="input-field"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Địa chỉ</label>
                  <input
                    type="text"
                    value={formData.diaChi}
                    onChange={(e) => setFormData({ ...formData, diaChi: e.target.value })}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
                  <input
                    type="text"
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
                  <select
                    value={formData.trangThai}
                    onChange={(e) => setFormData({ ...formData, trangThai: e.target.value })}
                    className="input-field"
                  >
                    <option value="Hoạt động">Hoạt động</option>
                    <option value="Tạm dừng">Tạm dừng</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ghi chú</label>
                  <textarea
                    value={formData.ghiChu}
                    onChange={(e) => setFormData({ ...formData, ghiChu: e.target.value })}
                    className="input-field"
                    rows="3"
                  />
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button type="submit" className="btn-primary flex-1">
                  {editingSupplier ? 'Cập nhật' : 'Thêm mới'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn-secondary flex-1"
                >
                  Hủy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Suppliers

