import { useMemo } from 'react'
import { 
  ShoppingCart, 
  Package, 
  Users, 
  DollarSign,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import useSyncedData from '../hooks/useSyncedData'

const toNumber = (value) => {
  if (typeof value === 'number') return Number.isFinite(value) ? value : 0
  if (typeof value === 'string') {
    const normalized = value.replace(/[^0-9.,-]/g, '').replace(/,/g, '')
    const parsed = Number(normalized)
    return Number.isFinite(parsed) ? parsed : 0
  }
  return 0
}

const formatCurrency = (value) => new Intl.NumberFormat('vi-VN').format(Math.round(value || 0))
const formatNumber = (value) => new Intl.NumberFormat('vi-VN').format(Math.round(value || 0))

const formatMonthKey = (key) => {
  const [year, month] = key.split('-')
  return `Tháng ${Number(month)} / ${year}`
}

const aggregateProductSales = (orders = [], inventory = []) => {
  const map = new Map()
  orders.forEach(order => {
    const items = order.sanPham || order.items || order.products || []
    items.forEach(item => {
      const key = item.maHang || item.sku || item.productId || item.id || item.tenHang || item.name
      if (!key) return
      const current = map.get(key) || {
        id: key,
        name: item.tenHang || item.name || key,
        sku: item.maHang || item.sku || '',
        sold: 0,
        revenue: 0,
      }
      const quantity = toNumber(item.soLuong || item.quantity || item.qty || item.soLuongTra)
      const lineRevenue = toNumber(item.thanhTien || item.total || (quantity * toNumber(item.donGia || item.unitPrice || item.price)))
      current.sold += quantity
      current.revenue += lineRevenue
      map.set(key, current)
    })
  })

  if (map.size === 0 && inventory.length) {
    inventory.slice(0, 5).forEach(item => {
      map.set(item.id || item.sku || item.name, {
        id: item.id || item.sku || item.name,
        name: item.name,
        sku: item.sku || '',
        sold: 0,
        revenue: 0,
      })
    })
  }

  return Array.from(map.values()).sort((a, b) => b.revenue - a.revenue).slice(0, 5)
}

const buildRevenueDataset = (orders = []) => {
  const grouped = new Map()
  orders.forEach(order => {
    const dateStr = order.thoiGian || order.thoiGianTao || order.ngayCapNhat || order.ngay || order.date
    if (!dateStr) return
    const date = new Date(dateStr)
    if (Number.isNaN(date.getTime())) return
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    const current = grouped.get(key) || { revenue: 0, orders: 0 }
    current.revenue += toNumber(order.khachCanTra ?? order.tongTienHang ?? order.tongTien ?? 0)
    current.orders += 1
    grouped.set(key, current)
  })

  return Array.from(grouped.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([key, value]) => ({
      month: formatMonthKey(key),
      revenue: value.revenue,
      orders: value.orders,
    }))
}

const Dashboard = () => {
  const { orders, products, customers, returns, inventory } = useSyncedData()

  const totalRevenue = useMemo(() => orders.reduce((sum, order) => sum + toNumber(order.khachCanTra ?? order.tongTienHang ?? order.tongTien ?? 0), 0), [orders])
  const totalOrders = orders.length
  const totalProducts = products.length
  const totalCustomers = customers.length
  const totalReturns = returns.length
  const totalStock = inventory.reduce((sum, item) => sum + toNumber(item.stock || item.quantity || 0), 0)

  const stats = useMemo(() => [
    {
      title: 'Tổng doanh thu',
      value: formatCurrency(totalRevenue),
      unit: 'đ',
      change: '—',
      trend: 'up',
      icon: DollarSign,
      color: 'bg-green-500',
    },
    {
      title: 'Đơn hàng',
      value: formatNumber(totalOrders),
      unit: 'đơn',
      change: '—',
      trend: 'up',
      icon: ShoppingCart,
      color: 'bg-blue-500',
    },
    {
      title: 'Sản phẩm',
      value: formatNumber(totalProducts),
      unit: 'sản phẩm',
      change: '—',
      trend: 'up',
      icon: Package,
      color: 'bg-purple-500',
    },
    {
      title: 'Khách hàng',
      value: formatNumber(totalCustomers),
      unit: 'người',
      change: '—',
      trend: 'up',
      icon: Users,
      color: 'bg-orange-500',
    },
  ], [totalRevenue, totalOrders, totalProducts, totalCustomers])

  const revenueData = useMemo(() => buildRevenueDataset(orders), [orders])
  const revenueChartData = revenueData.length
    ? revenueData
    : [{ month: 'Không có dữ liệu', revenue: 0, orders: 0 }]

  const topProducts = useMemo(() => aggregateProductSales(orders, inventory), [orders, inventory])
  const hasAnyData = totalRevenue || totalOrders || totalProducts || totalCustomers || totalReturns || totalStock
 
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Tổng quan</h1>
          <p className="text-gray-600">Chào mừng trở lại! Đây là tổng quan hoạt động của bạn.</p>
        </div>
      </div>

      {!hasAnyData && (
        <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg">
          Chưa có dữ liệu thực tế. Vui lòng đồng bộ dữ liệu từ Thuần Chay VN hoặc nhập liệu để xem báo cáo.
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <div key={index} className="card group hover:scale-105 transition-transform duration-200">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600 mb-2">{stat.title}</p>
                  <div className="flex items-baseline gap-2 mb-2">
                    <h2 className="text-3xl font-bold text-gray-900">{stat.value}</h2>
                    <span className="text-sm text-gray-500">{stat.unit}</span>
                  </div>
                  <div className={`flex items-center gap-1 text-sm ${
                    stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {stat.trend === 'up' ? (
                      <ArrowUpRight size={16} />
                    ) : (
                      <ArrowDownRight size={16} />
                    )}
                    <span className="font-medium">{stat.change}</span>
                    <span className="text-gray-500 text-xs">so với tháng trước</span>
                  </div>
                </div>
                <div className={`${stat.color} p-4 rounded-xl shadow-lg`} style={{
                  boxShadow: stat.color === 'bg-green-500' ? '0 10px 15px -3px rgba(34, 197, 94, 0.2)' :
                           stat.color === 'bg-blue-500' ? '0 10px 15px -3px rgba(59, 130, 246, 0.2)' :
                           stat.color === 'bg-purple-500' ? '0 10px 15px -3px rgba(168, 85, 247, 0.2)' :
                           '0 10px 15px -3px rgba(249, 115, 22, 0.2)'
                }}>
                  <Icon className="text-white" size={28} />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">Doanh thu theo tháng</h3>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={revenueChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip 
                formatter={(value) => new Intl.NumberFormat('vi-VN').format(value) + ' đ'} 
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="revenue" 
                stroke="#0284c7" 
                strokeWidth={2}
                name="Doanh thu"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Orders Chart */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">Đơn hàng theo tháng</h3>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={revenueChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="orders" fill="#7c3aed" name="Số đơn hàng" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Products */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900">Sản phẩm bán chạy</h3>
        </div>
        <div className="overflow-x-auto">
          {topProducts.length ? (
            <table className="table">
              <thead>
                <tr>
                  <th>STT</th>
                  <th>Tên sản phẩm</th>
                  <th>Số lượng đã bán</th>
                  <th>Doanh thu</th>
                </tr>
              </thead>
              <tbody>
                {topProducts.map((product, index) => (
                  <tr key={product.id || index}>
                    <td>{index + 1}</td>
                    <td className="font-medium">{product.name}</td>
                    <td>{formatNumber(product.sold)}</td>
                    <td className="font-semibold text-primary-600">
                      {formatCurrency(product.revenue)} đ
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-sm text-gray-500">Chưa có dữ liệu sản phẩm bán chạy.</div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Dashboard


