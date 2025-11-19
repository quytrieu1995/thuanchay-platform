import { useState, useMemo, useEffect } from 'react'
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { Download, Package, ShoppingCart, DollarSign, FileText, Clock, ArrowDownCircle, ArrowUpCircle, Search, Eye, X } from 'lucide-react'
import { usePagination } from '../hooks/usePagination'
import { fastSearch } from '../utils/filterUtils'
import Pagination from '../components/Pagination'
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
const formatPercent = (value) => `${(value || 0).toFixed(1)}%`

const formatMonthKey = (key) => {
  const [year, month] = key.split('-')
  return `Tháng ${Number(month)} / ${year}`
}

const extractDate = (item) => item?.thoiGian || item?.thoiGianTao || item?.ngayCapNhat || item?.ngay || item?.date

const groupOrdersByMonth = (orders = []) => {
  const grouped = new Map()
  orders.forEach(order => {
    const dateStr = extractDate(order)
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
      key,
      label: formatMonthKey(key),
      revenue: value.revenue,
      orders: value.orders,
    }))
}

const aggregateProductSales = (orders = [], products = [], inventory = []) => {
  const salesMap = new Map()
  const inventoryMap = new Map()
  inventory.forEach(item => {
    const key = item.maHang || item.sku || item.id || item.productId || item.tenHang || item.name
    if (key) inventoryMap.set(key, item)
  })
  const productMap = new Map()
  products.forEach(item => {
    const key = item.maHang || item.sku || item.id || item.productId || item.tenHang || item.name
    if (key) productMap.set(key, item)
  })

  orders.forEach(order => {
    const items = order.sanPham || order.items || order.products || []
    items.forEach(item => {
      const key = item.maHang || item.sku || item.productId || item.id || item.tenHang || item.name
      if (!key) return
      const current = salesMap.get(key) || {
        id: key,
        name: item.tenHang || item.name || key,
        sku: item.maHang || item.sku || '',
        sold: 0,
        revenue: 0,
      }
      const quantity = toNumber(item.soLuong || item.quantity || item.qty || item.soLuongTra)
      const revenue = toNumber(item.thanhTien || item.total || (quantity * toNumber(item.donGia || item.unitPrice || item.price)))
      current.sold += quantity
      current.revenue += revenue
      salesMap.set(key, current)
    })
  })

  return Array.from(salesMap.values()).map(item => {
    const inv = inventoryMap.get(item.id) || {}
    const product = productMap.get(item.id) || {}
    return {
      ...item,
      stock: toNumber(inv.stock ?? product.stock ?? 0),
      category: product.category || product.danhMuc || '',
      price: toNumber(product.price ?? product.gia ?? inv.price ?? 0),
    }
  })
}

const buildReportsData = ({ orders = [], products = [], customers = [], returns = [], inventory = [], purchaseOrders = [], supplierReturns = [], destroyOrders = [] }) => {
  const totalRevenue = orders.reduce((sum, order) => sum + toNumber(order.khachCanTra ?? order.tongTienHang ?? order.tongTien ?? 0), 0)
  const totalOrders = orders.length
  const customerIds = new Set([
    ...orders.map(order => order.maKhachHang || order.customerId || order.tenKhachHang),
    ...customers.map(customer => customer.maKhachHang || customer.id || customer.tenKhachHang)
  ].filter(Boolean))
  const uniqueCustomers = customerIds.size

  const ordersByStatusMap = new Map()
  orders.forEach(order => {
    const status = order.trangThaiGiaoHang || order.trangThai || 'Khác'
    const current = ordersByStatusMap.get(status) || { status, count: 0, revenue: 0 }
    current.count += 1
    current.revenue += toNumber(order.khachCanTra ?? order.tongTienHang ?? order.tongTien ?? 0)
    ordersByStatusMap.set(status, current)
  })
  const ordersByStatus = Array.from(ordersByStatusMap.values())

  const revenueByHourMap = new Map()
  orders.forEach(order => {
    const dateStr = extractDate(order)
    if (!dateStr) return
    const date = new Date(dateStr)
    if (Number.isNaN(date.getTime())) return
    const hourKey = `${date.getHours().toString().padStart(2, '0')}h`
    const current = revenueByHourMap.get(hourKey) || { hour: hourKey, revenue: 0 }
    current.revenue += toNumber(order.khachCanTra ?? order.tongTienHang ?? order.tongTien ?? 0)
    revenueByHourMap.set(hourKey, current)
  })
  const revenueByHour = Array.from(revenueByHourMap.values()).sort((a, b) => a.hour.localeCompare(b.hour))

  const productSales = aggregateProductSales(orders, products, inventory)
  const sortedProductSales = [...productSales].sort((a, b) => b.revenue - a.revenue)

  const totalCost = purchaseOrders.reduce((sum, order) => sum + toNumber(order.tongTien || order.total || 0), 0)
  const totalExpenses = supplierReturns.reduce((sum, item) => sum + toNumber(item.tongTien || item.total || 0), 0) + destroyOrders.reduce((sum, item) => sum + toNumber(item.tongGiaTri || item.total || 0), 0)
  const totalProfit = totalRevenue - totalCost
  const netProfit = totalProfit - totalExpenses

  const revenueByMonth = groupOrdersByMonth(orders)
  const costByMonth = groupOrdersByMonth(purchaseOrders)
  const cashFlow = revenueByMonth.map(entry => {
    const cost = costByMonth.find(item => item.key === entry.key)?.revenue || 0
    return {
      month: entry.label,
      revenue: entry.revenue,
      expenses: cost,
      profit: entry.revenue - cost,
    }
  })

  const paymentTotals = orders.reduce((acc, order) => {
    acc.cash += toNumber(order.tienMat || order.paymentCash)
    acc.bankTransfer += toNumber(order.chuyenKhoan || order.paymentTransfer)
    acc.card += toNumber(order.the || order.paymentCard)
    acc.eWallet += toNumber(order.vi || order.paymentWallet)
    return acc
  }, { cash: 0, bankTransfer: 0, card: 0, eWallet: 0 })
  const paymentTotalSum = Object.values(paymentTotals).reduce((sum, value) => sum + value, 0) || 1

  const salesByChannelMap = new Map()
  orders.forEach(order => {
    const channel = order.kenhBan || order.channel || 'Khác'
    const current = salesByChannelMap.get(channel) || { channel, orders: 0, revenue: 0 }
    current.orders += 1
    current.revenue += toNumber(order.khachCanTra ?? order.tongTienHang ?? order.tongTien ?? 0)
    salesByChannelMap.set(channel, current)
  })
  const salesByChannel = Array.from(salesByChannelMap.values()).map(item => ({
    ...item,
    percentage: totalRevenue ? (item.revenue / totalRevenue) * 100 : 0,
  }))

  const salesByPeriod = revenueByMonth.map(entry => ({
    period: entry.label,
    revenue: entry.revenue,
    orders: entry.orders,
  }))

  const customersBySpendMap = new Map()
  orders.forEach(order => {
    const customerKey = order.maKhachHang || order.tenKhachHang || 'Khác'
    const current = customersBySpendMap.get(customerKey) || { name: customerKey, orders: 0, revenue: 0, lastOrder: '' }
    current.orders += 1
    current.revenue += toNumber(order.khachCanTra ?? order.tongTienHang ?? order.tongTien ?? 0)
    const dateStr = extractDate(order)
    if (dateStr && (!current.lastOrder || new Date(dateStr) > new Date(current.lastOrder))) {
      current.lastOrder = dateStr
    }
    customersBySpendMap.set(customerKey, current)
  })
  const topCustomers = Array.from(customersBySpendMap.values()).sort((a, b) => b.revenue - a.revenue).slice(0, 5)

  const totalStockValue = inventory.reduce((sum, item) => {
    const unitPrice = toNumber(item.price || item.cost || item.unitPrice)
    return sum + toNumber(item.stock || 0) * unitPrice
  }, 0)
  const lowStockItems = inventory.filter(item => toNumber(item.stock || 0) <= toNumber(item.minStock || 0)).length
  const outOfStockItems = inventory.filter(item => toNumber(item.stock || 0) === 0).length

  const categoryDistributionMap = new Map()
  products.forEach(product => {
    const category = product.category || product.danhMuc || 'Khác'
    const value = toNumber(product.stock || 0) * toNumber(product.price || product.gia || 0)
    const current = categoryDistributionMap.get(category) || { name: category, value: 0 }
    current.value += value
    categoryDistributionMap.set(category, current)
  })
  const categoryDistribution = Array.from(categoryDistributionMap.values()).map((entry, index) => ({
    ...entry,
    color: ['#0284c7', '#7c3aed', '#059669', '#ea580c', '#f59e0b', '#dc2626'][index % 6],
  }))

  const importHistory = purchaseOrders.flatMap((order, orderIndex) =>
    (order.sanPham || []).map((item, itemIndex) => ({
      id: `${orderIndex}-${itemIndex}`,
      productId: item.productId || item.maHang || item.sku || item.id || item.tenHang,
      productSku: item.maHang || item.sku || '',
      date: order.ngayNhap || extractDate(order) || '',
      quantity: toNumber(item.soLuong || item.quantity || 0),
      unitPrice: toNumber(item.donGia || item.unitPrice || item.price || 0),
      total: toNumber(item.thanhTien || item.total || 0),
      supplier: order.tenNhaCungCap || order.nhaCungCap || '',
      orderCode: order.maPhieuNhap || order.code || order.id || '',
    }))
  )

  const exportHistory = orders.flatMap((order, orderIndex) =>
    (order.sanPham || []).map((item, itemIndex) => ({
      id: `${orderIndex}-${itemIndex}`,
      productId: item.productId || item.maHang || item.sku || item.id || item.tenHang,
      productSku: item.maHang || item.sku || '',
      date: extractDate(order) || '',
      quantity: toNumber(item.soLuong || item.quantity || 0),
      unitPrice: toNumber(item.donGia || item.unitPrice || item.price || 0),
      total: toNumber(item.thanhTien || item.total || 0),
      orderCode: order.maHoaDon || order.maDon || order.id || '',
      customer: order.tenKhachHang || order.customerName || '',
    }))
  )

  return {
    hasData: Boolean(totalRevenue || totalOrders || products.length || inventory.length || purchaseOrders.length),
    dailyReportData: {
      date: new Date().toLocaleDateString('vi-VN'),
      totalOrders,
      totalRevenue,
      totalCost,
      totalProfit,
      totalCustomers: uniqueCustomers,
      averageOrderValue: totalOrders ? totalRevenue / totalOrders : 0,
      ordersByStatus,
      topProducts: sortedProductSales.slice(0, 3).map(item => ({
        name: item.name,
        sold: item.sold,
        revenue: item.revenue,
      })),
      revenueByHour,
    },
    productReportData: {
      totalProducts: products.length,
      totalStockValue,
      lowStockItems,
      outOfStockItems,
      topSellingProducts: sortedProductSales.slice(0, 5),
      slowMovingProducts: productSales.filter(item => item.sold <= 5).slice(0, 5),
      categoryDistribution,
    },
    salesReportData: {
      totalRevenue,
      totalOrders,
      totalCustomers: uniqueCustomers,
      averageOrderValue: totalOrders ? totalRevenue / totalOrders : 0,
      conversionRate: 0,
      salesByChannel,
      salesByPeriod,
      topCustomers,
    },
    financialReportData: {
      totalRevenue,
      totalCost,
      totalProfit,
      profitMargin: totalRevenue ? (totalProfit / totalRevenue) * 100 : 0,
      totalExpenses,
      netProfit,
      revenueByCategory: [
        { category: 'Doanh thu bán hàng', amount: totalRevenue, percentage: totalRevenue ? (totalRevenue / totalRevenue) * 100 : 0 },
        { category: 'Chi phí nhập hàng', amount: -totalCost, percentage: totalRevenue ? -(totalCost / totalRevenue) * 100 : 0 },
        { category: 'Chi phí khác', amount: -totalExpenses, percentage: totalRevenue ? -(totalExpenses / totalRevenue) * 100 : 0 },
      ],
      cashFlow,
      paymentMethods: [
        { method: 'Tiền mặt', amount: paymentTotals.cash, percentage: (paymentTotals.cash / paymentTotalSum) * 100 },
        { method: 'Chuyển khoản', amount: paymentTotals.bankTransfer, percentage: (paymentTotals.bankTransfer / paymentTotalSum) * 100 },
        { method: 'Thẻ', amount: paymentTotals.card, percentage: (paymentTotals.card / paymentTotalSum) * 100 },
        { method: 'Ví điện tử', amount: paymentTotals.eWallet, percentage: (paymentTotals.eWallet / paymentTotalSum) * 100 },
      ],
    },
    productList: products,
    importHistory,
    exportHistory,
  }
}

const Reports = () => {
  const [activeTab, setActiveTab] = useState('daily') // 'daily', 'product', 'sales', 'financial', 'inventory'
  const [dateRange, setDateRange] = useState('today')
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [searchProductTerm, setSearchProductTerm] = useState('')

  const syncedData = useSyncedData()
  const {
    hasData,
    dailyReportData,
    productReportData,
    salesReportData,
    financialReportData,
    productList,
    importHistory,
    exportHistory,
  } = useMemo(() => buildReportsData(syncedData), [syncedData])

  const COLORS = ['#0284c7', '#7c3aed', '#059669', '#ea580c', '#dc2626', '#f59e0b']

  // Dữ liệu sản phẩm (giả lập - trong thực tế sẽ lấy từ Products, PurchaseOrders, Orders)
  const products = useMemo(() => {
    if (!searchProductTerm) {
      return productList
    }
    return fastSearch(productList, searchProductTerm, ['name', 'sku', 'category'])
  }, [productList, searchProductTerm])

  // Pagination cho danh sách sản phẩm
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
  } = usePagination(products, 50)

  // Reset pagination khi search thay đổi
  useEffect(() => {
    resetPagination()
  }, [searchProductTerm, resetPagination])

  const handleExport = () => {
    alert('Chức năng xuất báo cáo đang được phát triển!')
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Báo cáo & Thống kê</h1>
          <p className="text-gray-600">Phân tích và báo cáo chi tiết về hoạt động kinh doanh</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="input-field"
          >
            <option value="today">Hôm nay</option>
            <option value="week">Tuần này</option>
            <option value="month">Tháng này</option>
            <option value="quarter">Quý này</option>
            <option value="year">Năm này</option>
            <option value="custom">Tùy chọn</option>
          </select>
          <button onClick={handleExport} className="btn-primary flex items-center gap-2">
            <Download size={20} />
            Xuất báo cáo
          </button>
        </div>
      </div>

      {!hasData && (
        <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg">
          Chưa có dữ liệu để báo cáo. Vui lòng đồng bộ dữ liệu hoặc nhập liệu thực tế.
        </div>
      )}

      {/* Tabs */}
      <div className="card p-0">
        <div className="flex border-b border-gray-200 overflow-x-auto">
          <button
            onClick={() => setActiveTab('daily')}
            className={`flex-1 px-6 py-4 font-medium transition-colors whitespace-nowrap ${
              activeTab === 'daily'
                ? 'text-primary-600 border-b-2 border-primary-600 bg-primary-100'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Clock size={20} />
              <span>Báo cáo cuối ngày</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('product')}
            className={`flex-1 px-6 py-4 font-medium transition-colors whitespace-nowrap ${
              activeTab === 'product'
                ? 'text-primary-600 border-b-2 border-primary-600 bg-primary-100'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Package size={20} />
              <span>Báo cáo hàng hóa</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('sales')}
            className={`flex-1 px-6 py-4 font-medium transition-colors whitespace-nowrap ${
              activeTab === 'sales'
                ? 'text-primary-600 border-b-2 border-primary-600 bg-primary-100'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <ShoppingCart size={20} />
              <span>Báo cáo bán hàng</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('financial')}
            className={`flex-1 px-6 py-4 font-medium transition-colors whitespace-nowrap ${
              activeTab === 'financial'
                ? 'text-primary-600 border-b-2 border-primary-600 bg-primary-100'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <DollarSign size={20} />
              <span>Báo cáo tài chính</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('inventory')}
            className={`flex-1 px-6 py-4 font-medium transition-colors whitespace-nowrap ${
              activeTab === 'inventory'
                ? 'text-primary-600 border-b-2 border-primary-600 bg-primary-100'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <FileText size={20} />
              <span>Nhập xuất tồn</span>
            </div>
          </button>
        </div>
      </div>

      {/* Báo cáo cuối ngày */}
      {activeTab === 'daily' && (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="card">
              <p className="text-sm text-gray-600">Tổng đơn hàng</p>
              <p className="text-3xl font-bold text-gray-900">{formatNumber(dailyReportData.totalOrders)}</p>
            </div>
            <div className="card">
              <p className="text-sm text-gray-600">Tổng doanh thu</p>
              <p className="text-3xl font-bold text-gray-900">{formatCurrency(dailyReportData.totalRevenue)} đ</p>
            </div>
            <div className="card">
              <p className="text-sm text-gray-600">Tổng chi phí</p>
              <p className="text-2xl font-bold mt-1 text-orange-600">
                {formatCurrency(dailyReportData.totalCost)} đ
              </p>
            </div>
            <div className="card">
              <p className="text-sm text-gray-600">Tổng lợi nhuận ròng</p>
              <p className="text-2xl font-bold mt-1 text-gray-900">{formatCurrency(dailyReportData.totalProfit)} đ</p>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="card">
              <h3 className="text-lg font-semibold mb-4">Doanh thu theo giờ</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={dailyReportData.revenueByHour}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hour" />
                  <YAxis />
                  <Tooltip formatter={(value) => value.toLocaleString('vi-VN') + ' đ'} />
                  <Line type="monotone" dataKey="revenue" stroke="#0284c7" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="card">
              <h3 className="text-lg font-semibold mb-4">Đơn hàng theo trạng thái</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={dailyReportData.ordersByStatus}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="status" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#7c3aed" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Top Products */}
          <div className="card">
            <h3 className="text-lg font-semibold mb-4">Sản phẩm bán chạy hôm nay</h3>
            <div className="overflow-x-auto">
              <table className="table">
                <thead>
                  <tr>
                    <th>STT</th>
                    <th>Tên sản phẩm</th>
                    <th>Số lượng bán</th>
                    <th>Doanh thu</th>
                  </tr>
                </thead>
                <tbody>
                  {dailyReportData.topProducts.map((product, index) => (
                    <tr key={index}>
                      <td>{index + 1}</td>
                      <td>{product.name}</td>
                      <td>{product.sold}</td>
                      <td className="font-semibold">{formatCurrency(product.revenue)} đ</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Báo cáo hàng hóa */}
      {activeTab === 'product' && (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="card">
              <p className="text-sm text-gray-600">Tổng sản phẩm</p>
              <p className="text-2xl font-bold mt-1">{productReportData.totalProducts}</p>
            </div>
            <div className="card">
              <p className="text-sm text-gray-600">Giá trị tồn kho</p>
              <p className="text-2xl font-bold mt-1 text-primary-600">
                {formatCurrency(productReportData.totalStockValue)} đ
              </p>
            </div>
            <div className="card">
              <p className="text-sm text-gray-600">Sắp hết hàng</p>
              <p className="text-2xl font-bold mt-1 text-yellow-600">{productReportData.lowStockItems}</p>
            </div>
            <div className="card">
              <p className="text-sm text-gray-600">Hết hàng</p>
              <p className="text-2xl font-bold mt-1 text-red-600">{productReportData.outOfStockItems}</p>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="card">
              <h3 className="text-lg font-semibold mb-4">Phân bố theo danh mục</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={productReportData.categoryDistribution.map((item, index) => ({ ...item, color: COLORS[index % COLORS.length] }))} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                    {productReportData.categoryDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => value.toLocaleString('vi-VN') + ' đ'} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="card">
              <h3 className="text-lg font-semibold mb-4">Top 5 sản phẩm bán chạy</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={productReportData.topSellingProducts.slice(0, 5)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="sold" fill="#059669" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Top Selling Products */}
          <div className="card">
            <h3 className="text-lg font-semibold mb-4">Sản phẩm bán chạy</h3>
            <div className="overflow-x-auto">
              <table className="table">
                <thead>
                  <tr>
                    <th>STT</th>
                    <th>Tên sản phẩm</th>
                    <th>Mã SKU</th>
                    <th>Số lượng bán</th>
                    <th>Doanh thu</th>
                    <th>Tồn kho</th>
                  </tr>
                </thead>
                <tbody>
                  {productReportData.topSellingProducts.map((product, index) => (
                    <tr key={index}>
                      <td>{index + 1}</td>
                      <td className="font-medium">{product.name}</td>
                      <td className="font-mono text-sm">{product.sku}</td>
                      <td>{product.sold}</td>
                      <td className="font-semibold">{formatCurrency(product.revenue)} đ</td>
                      <td>
                        <span className={product.stock === 0 ? 'text-red-600 font-semibold' : ''}>
                          {product.stock}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Báo cáo bán hàng */}
      {activeTab === 'sales' && (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="card">
              <p className="text-sm text-gray-600">Tổng doanh thu</p>
              <p className="text-3xl font-bold text-primary-600">
                {formatCurrency(salesReportData.totalRevenue)} đ
              </p>
            </div>
            <div className="card">
              <p className="text-sm text-gray-600">Tổng đơn hàng</p>
              <p className="text-3xl font-bold text-blue-600">
                {formatNumber(salesReportData.totalOrders)}
              </p>
            </div>
            <div className="card">
              <p className="text-sm text-gray-600">Khách hàng</p>
              <p className="text-3xl font-bold text-purple-600">
                {formatNumber(salesReportData.totalCustomers)}
              </p>
            </div>
            <div className="card">
              <p className="text-sm text-gray-600">Tỷ lệ chuyển đổi</p>
              <p className="text-2xl font-bold mt-1 text-green-600">{salesReportData.conversionRate}%</p>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="card">
              <h3 className="text-lg font-semibold mb-4">Doanh thu theo kênh</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={salesReportData.salesByChannel}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="channel" />
                  <YAxis />
                  <Tooltip formatter={(value) => value.toLocaleString('vi-VN') + ' đ'} />
                  <Bar dataKey="revenue" fill="#0284c7" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="card">
              <h3 className="text-lg font-semibold mb-4">Doanh thu theo tuần</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={salesReportData.salesByPeriod}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="period" />
                  <YAxis />
                  <Tooltip formatter={(value) => value.toLocaleString('vi-VN') + ' đ'} />
                  <Line type="monotone" dataKey="revenue" stroke="#7c3aed" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Sales by Channel */}
          <div className="card">
            <h3 className="text-lg font-semibold mb-4">Doanh thu theo kênh bán hàng</h3>
            <div className="overflow-x-auto">
              <table className="table">
                <thead>
                  <tr>
                    <th>Kênh bán hàng</th>
                    <th>Số đơn hàng</th>
                    <th>Doanh thu</th>
                    <th>Tỷ lệ</th>
                  </tr>
                </thead>
                <tbody>
                  {salesReportData.salesByChannel.map((channel, index) => (
                    <tr key={index}>
                      <td className="font-medium">{channel.channel}</td>
                      <td>{channel.orders}</td>
                      <td className="text-right font-semibold text-primary-600">{formatCurrency(channel.revenue)} đ</td>
                      <td>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-primary-600 h-2 rounded-full" 
                              style={{ width: `${channel.percentage}%` }}
                            ></div>
                          </div>
                          <span className="text-sm text-gray-600">{channel.percentage.toFixed(1)}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Báo cáo tài chính */}
      {activeTab === 'financial' && (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="card">
              <p className="text-sm text-gray-600">Tổng doanh thu</p>
              <p className="text-3xl font-bold text-primary-600">
                {formatCurrency(financialReportData.totalRevenue)} đ
              </p>
            </div>
            <div className="card">
              <p className="text-sm text-gray-600">Tổng chi phí</p>
              <p className="text-2xl font-bold mt-1 text-orange-600">
                {formatCurrency(financialReportData.totalCost)} đ
              </p>
            </div>
            <div className="card">
              <p className="text-sm text-gray-600">Lợi nhuận gộp</p>
              <p className="text-2xl font-bold mt-1 text-green-600">
                {formatCurrency(financialReportData.totalProfit)} đ
              </p>
            </div>
            <div className="card">
              <p className="text-sm text-gray-600">Lợi nhuận ròng</p>
              <p className="text-2xl font-bold mt-1 text-blue-600">
                {formatCurrency(financialReportData.netProfit)} đ
              </p>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="card">
              <h3 className="text-lg font-semibold mb-4">Dòng tiền</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={financialReportData.cashFlow}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => value.toLocaleString('vi-VN') + ' đ'} />
                  <Legend />
                  <Line type="monotone" dataKey="revenue" stroke="#0284c7" strokeWidth={2} name="Doanh thu" />
                  <Line type="monotone" dataKey="expenses" stroke="#dc2626" strokeWidth={2} name="Chi phí" />
                  <Line type="monotone" dataKey="profit" stroke="#059669" strokeWidth={2} name="Lợi nhuận" />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="card">
              <h3 className="text-lg font-semibold mb-4">Phương thức thanh toán</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={financialReportData.paymentMethods}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="amount"
                  >
                    {financialReportData.paymentMethods.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => value.toLocaleString('vi-VN') + ' đ'} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Financial Summary */}
          <div className="card">
            <h3 className="text-lg font-semibold mb-4">Tổng hợp tài chính</h3>
            <div className="overflow-x-auto">
              <table className="table">
                <thead>
                  <tr>
                    <th>Danh mục</th>
                    <th>Số tiền</th>
                    <th>Tỷ lệ</th>
                  </tr>
                </thead>
                <tbody>
                  {financialReportData.revenueByCategory.map((item, index) => (
                    <tr key={index}>
                      <td className="font-medium">{item.category}</td>
                      <td className={`font-semibold ${
                        item.amount < 0 ? 'text-red-600' : 'text-green-600'
                      }`}>
                        {item.amount > 0 ? '+' : ''}{formatCurrency(item.amount)} đ
                      </td>
                      <td>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full ${
                                item.amount < 0 ? 'bg-red-500' : 'bg-green-500'
                              }`}
                              style={{ width: `${Math.abs(item.percentage)}%` }}
                            ></div>
                          </div>
                          <span className="text-sm text-gray-600">{Math.abs(item.percentage).toFixed(1)}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Báo cáo nhập xuất tồn chi tiết từng sản phẩm */}
      {activeTab === 'inventory' && (
        <div className="space-y-6">
          {/* Search */}
          <div className="card">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Tìm kiếm sản phẩm theo tên, SKU hoặc danh mục..."
                value={searchProductTerm}
                onChange={(e) => setSearchProductTerm(e.target.value)}
                className="input-field pl-10"
              />
            </div>
          </div>

          {/* Products List */}
          <div className="card">
            <h3 className="text-lg font-semibold mb-4">Danh sách sản phẩm</h3>
            <div className="overflow-x-auto">
              <table className="table">
                <thead>
                  <tr>
                    <th>Mã SKU</th>
                    <th>Tên sản phẩm</th>
                    <th>Danh mục</th>
                    <th>Tồn kho hiện tại</th>
                    <th>Tổng nhập</th>
                    <th>Tổng xuất</th>
                    <th>Giá trị nhập</th>
                    <th>Giá trị xuất</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedData.map((product) => {
                    const inventoryData = getProductInventoryData(product.id)
                    return (
                      <tr key={product.id}>
                        <td className="font-mono text-sm">{product.sku}</td>
                        <td className="font-medium">{product.name}</td>
                        <td>{product.category}</td>
                        <td>
                          <span className={`font-semibold ${
                            inventoryData.currentStock === 0 
                              ? 'text-red-600' 
                              : inventoryData.currentStock < 20 
                              ? 'text-yellow-600' 
                              : 'text-green-600'
                          }`}>
                            {inventoryData.currentStock}
                          </span>
                        </td>
                        <td className="text-primary-600 font-medium">{inventoryData.totalImported}</td>
                        <td className="text-orange-600 font-medium">{inventoryData.totalExported}</td>
                        <td className="font-semibold">{formatCurrency(inventoryData.totalImportValue)} đ</td>
                        <td className="font-semibold">{formatCurrency(inventoryData.totalExportValue)} đ</td>
                        <td>
                          <button
                            onClick={() => setSelectedProduct(product.id)}
                            className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                            title="Xem chi tiết"
                          >
                            <Eye size={16} />
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
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

          {/* Product Detail Modal */}
          {selectedProduct && (() => {
            const inventoryData = getProductInventoryData(selectedProduct)
            if (!inventoryData.product) return null
            
            return (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
                <div className="bg-white rounded-xl p-6 w-full max-w-6xl max-h-[90vh] overflow-y-auto">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-2xl font-bold mb-2">Báo cáo nhập xuất tồn: {inventoryData.product.name}</h2>
                      <p className="text-gray-600">Mã SKU: <span className="font-mono">{inventoryData.product.sku}</span></p>
                    </div>
                    <button
                      onClick={() => setSelectedProduct(null)}
                      className="p-2 hover:bg-gray-100 rounded-lg"
                    >
                      <X size={24} />
                    </button>
                  </div>

                  {/* Summary Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="card">
                      <p className="text-sm text-gray-600">Tồn kho hiện tại</p>
                      <p className={`text-2xl font-bold mt-1 ${
                        inventoryData.currentStock === 0 
                          ? 'text-red-600' 
                          : inventoryData.currentStock < 20 
                          ? 'text-yellow-600' 
                          : 'text-green-600'
                      }`}>
                        {inventoryData.currentStock}
                      </p>
                    </div>
                    <div className="card">
                      <p className="text-sm text-gray-600">Tổng nhập</p>
                      <p className="text-2xl font-bold mt-1 text-primary-600">
                        {inventoryData.totalImported}
                      </p>
                    </div>
                    <div className="card">
                      <p className="text-sm text-gray-600">Tổng xuất</p>
                      <p className="text-2xl font-bold mt-1 text-orange-600">
                        {inventoryData.totalExported}
                      </p>
                    </div>
                    <div className="card">
                      <p className="text-sm text-gray-600">Giá trị tồn kho</p>
                      <p className="text-2xl font-bold mt-1 text-blue-600">
                        {formatCurrency(inventoryData.currentStock * inventoryData.product.price)} đ
                      </p>
                    </div>
                  </div>

                  {/* Stock Movement Chart */}
                  {inventoryData.movements.length > 0 && (
                    <div className="card mb-6">
                      <h3 className="text-lg font-semibold mb-4">Biến động tồn kho theo thời gian</h3>
                      <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={inventoryData.movements}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Line type="monotone" dataKey="stock" stroke="#0284c7" strokeWidth={2} name="Tồn kho" />
                          <Line type="monotone" dataKey="imported" stroke="#059669" strokeWidth={2} name="Nhập" />
                          <Line type="monotone" dataKey="exported" stroke="#dc2626" strokeWidth={2} name="Xuất" />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  )}

                  {/* Import History */}
                  <div className="card mb-6">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <ArrowDownCircle size={20} className="text-green-600" />
                      Lịch sử nhập hàng
                    </h3>
                    {inventoryData.imports.length > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="table">
                          <thead>
                            <tr>
                              <th>Ngày nhập</th>
                              <th>Mã phiếu nhập</th>
                              <th>Nhà cung cấp</th>
                              <th>Số lượng</th>
                              <th>Đơn giá</th>
                              <th>Thành tiền</th>
                            </tr>
                          </thead>
                          <tbody>
                            {inventoryData.imports.map((imp) => (
                              <tr key={imp.id}>
                                <td>{imp.date}</td>
                                <td className="font-mono text-sm">{imp.orderCode}</td>
                                <td>{imp.supplier}</td>
                                <td className="text-green-600 font-medium">{imp.quantity}</td>
                                <td>{formatCurrency(imp.unitPrice)} đ</td>
                                <td className="font-semibold">{formatCurrency(imp.total)} đ</td>
                              </tr>
                            ))}
                          </tbody>
                          <tfoot>
                            <tr className="font-bold">
                              <td colSpan="3">Tổng cộng</td>
                              <td className="text-green-600">{inventoryData.totalImported}</td>
                              <td></td>
                              <td className="text-primary-600">{formatCurrency(inventoryData.totalImportValue)} đ</td>
                            </tr>
                          </tfoot>
                        </table>
                      </div>
                    ) : (
                      <p className="text-gray-500 text-center py-4">Chưa có lịch sử nhập hàng</p>
                    )}
                  </div>

                  {/* Export History */}
                  <div className="card">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <ArrowUpCircle size={20} className="text-orange-600" />
                      Lịch sử xuất hàng
                    </h3>
                    {inventoryData.exports.length > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="table">
                          <thead>
                            <tr>
                              <th>Ngày xuất</th>
                              <th>Mã đơn hàng</th>
                              <th>Khách hàng</th>
                              <th>Số lượng</th>
                              <th>Đơn giá</th>
                              <th>Thành tiền</th>
                            </tr>
                          </thead>
                          <tbody>
                            {inventoryData.exports.map((exp) => (
                              <tr key={exp.id}>
                                <td>{exp.date}</td>
                                <td className="font-mono text-sm">{exp.orderCode}</td>
                                <td>{exp.customer}</td>
                                <td className="text-orange-600 font-medium">{exp.quantity}</td>
                                <td>{formatCurrency(exp.unitPrice)} đ</td>
                                <td className="font-semibold">{formatCurrency(exp.total)} đ</td>
                              </tr>
                            ))}
                          </tbody>
                          <tfoot>
                            <tr className="font-bold">
                              <td colSpan="3">Tổng cộng</td>
                              <td className="text-orange-600">{inventoryData.totalExported}</td>
                              <td></td>
                              <td className="text-primary-600">{formatCurrency(inventoryData.totalExportValue)} đ</td>
                            </tr>
                          </tfoot>
                        </table>
                      </div>
                    ) : (
                      <p className="text-gray-500 text-center py-4">Chưa có lịch sử xuất hàng</p>
                    )}
                  </div>
                </div>
              </div>
            )
          })()}
        </div>
      )}
    </div>
  )
}

export default Reports
