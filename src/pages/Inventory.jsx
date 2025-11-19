import { useState, useEffect } from 'react'
import { Search, AlertTriangle, CheckCircle, Package } from 'lucide-react'

const Inventory = () => {
  const [inventory, setInventory] = useState([
    { id: 1, name: 'Áo thun nam', sku: 'AT001', stock: 150, minStock: 50, maxStock: 500, status: 'Đủ hàng' },
    { id: 2, name: 'Quần jean nữ', sku: 'QJ002', stock: 80, minStock: 100, maxStock: 300, status: 'Thiếu hàng' },
    { id: 3, name: 'Giày thể thao', sku: 'GT003', stock: 45, minStock: 30, maxStock: 200, status: 'Đủ hàng' },
    { id: 4, name: 'Túi xách', sku: 'TX004', stock: 0, minStock: 20, maxStock: 150, status: 'Hết hàng' },
    { id: 5, name: 'Ví da', sku: 'VD005', stock: 120, minStock: 50, maxStock: 200, status: 'Đủ hàng' },
    { id: 6, name: 'Áo sơ mi nam', sku: 'AS006', stock: 25, minStock: 40, maxStock: 250, status: 'Thiếu hàng' },
    { id: 7, name: 'Váy nữ', sku: 'VN007', stock: 60, minStock: 30, maxStock: 180, status: 'Đủ hàng' },
    { id: 8, name: 'Quần short', sku: 'QS008', stock: 5, minStock: 25, maxStock: 100, status: 'Hết hàng' },
  ])

  useEffect(() => {
    if (localStorage.getItem('disableFallbackData') === 'true') {
      setInventory([])
    }
  }, [])

  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const filteredInventory = inventory.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.sku.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const getStatusColor = (status) => {
    switch (status) {
      case 'Đủ hàng':
        return 'bg-green-100 text-green-800'
      case 'Thiếu hàng':
        return 'bg-yellow-100 text-yellow-800'
      case 'Hết hàng':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStockPercentage = (stock, maxStock) => {
    return Math.min((stock / maxStock) * 100, 100)
  }

  const totalValue = inventory.reduce((sum, item) => {
    // Giả sử giá trung bình là 300,000đ
    return sum + (item.stock * 300000)
  }, 0)

  const lowStockItems = inventory.filter(item => item.stock <= item.minStock).length
  const outOfStockItems = inventory.filter(item => item.stock === 0).length

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Quản lý Tồn kho</h1>
        <p className="text-gray-600">Theo dõi và quản lý tồn kho sản phẩm</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Tổng sản phẩm</p>
              <p className="text-2xl font-bold mt-1">{inventory.length}</p>
            </div>
            <Package className="text-primary-600" size={32} />
          </div>
        </div>
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Tổng giá trị</p>
              <p className="text-2xl font-bold mt-1 text-primary-600">
                {(totalValue / 1000000).toFixed(1)}M đ
              </p>
            </div>
            <CheckCircle className="text-green-600" size={32} />
          </div>
        </div>
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Sắp hết hàng</p>
              <p className="text-2xl font-bold mt-1 text-yellow-600">{lowStockItems}</p>
            </div>
            <AlertTriangle className="text-yellow-600" size={32} />
          </div>
        </div>
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Hết hàng</p>
              <p className="text-2xl font-bold mt-1 text-red-600">{outOfStockItems}</p>
            </div>
            <AlertTriangle className="text-red-600" size={32} />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Tìm kiếm sản phẩm..."
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
            <option value="Đủ hàng">Đủ hàng</option>
            <option value="Thiếu hàng">Thiếu hàng</option>
            <option value="Hết hàng">Hết hàng</option>
          </select>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="card">
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>Mã SKU</th>
                <th>Tên sản phẩm</th>
                <th>Tồn kho</th>
                <th>Min/Max</th>
                <th>Tỷ lệ</th>
                <th>Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {filteredInventory.map((item) => (
                <tr key={item.id}>
                  <td className="font-mono text-sm">{item.sku}</td>
                  <td className="font-medium">{item.name}</td>
                  <td>
                    <span className="font-semibold">{item.stock}</span>
                    <span className="text-gray-500 text-sm ml-1">sản phẩm</span>
                  </td>
                  <td className="text-sm text-gray-600">
                    {item.minStock} / {item.maxStock}
                  </td>
                  <td>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          getStockPercentage(item.stock, item.maxStock) < 30
                            ? 'bg-red-500'
                            : getStockPercentage(item.stock, item.maxStock) < 50
                            ? 'bg-yellow-500'
                            : 'bg-green-500'
                        }`}
                        style={{ width: `${getStockPercentage(item.stock, item.maxStock)}%` }}
                      ></div>
                    </div>
                    <span className="text-xs text-gray-500 mt-1 block">
                      {getStockPercentage(item.stock, item.maxStock).toFixed(0)}%
                    </span>
                  </td>
                  <td>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default Inventory

