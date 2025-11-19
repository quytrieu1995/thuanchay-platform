import { useState, useMemo } from 'react'
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { TrendingUp, TrendingDown, Users, MapPin, User, Calendar, Package, ShoppingCart } from 'lucide-react'
import { generateForecastReport } from '../services/forecastService'

const COLORS = ['#0284c7', '#7c3aed', '#059669', '#ea580c', '#dc2626', '#f59e0b']

const Analytics = () => {
  const [activeTab, setActiveTab] = useState('customer-analysis') // 'customer-analysis', 'forecast'

  // Dữ liệu khách hàng (giả lập - trong thực tế sẽ lấy từ API)
  const customers = [
    { id: 1, gioiTinh: 'Nam', ngaySinh: '1990-05-15', khuVucGiaoHang: 'Quận 1', tongBan: 12500000, orders: 12 },
    { id: 2, gioiTinh: 'Nữ', ngaySinh: '1992-08-20', khuVucGiaoHang: 'Quận 2', tongBan: 8900000, orders: 8 },
    { id: 3, gioiTinh: 'Nam', ngaySinh: '1985-12-10', khuVucGiaoHang: 'Quận 3', tongBan: 21000000, orders: 15 },
    { id: 4, gioiTinh: 'Nữ', ngaySinh: '1995-03-25', khuVucGiaoHang: 'Quận 4', tongBan: 450000, orders: 3 },
    { id: 5, gioiTinh: 'Nam', ngaySinh: '1988-07-30', khuVucGiaoHang: 'Quận 5', tongBan: 17500000, orders: 20 },
    { id: 6, gioiTinh: 'Nữ', ngaySinh: '1993-11-12', khuVucGiaoHang: 'Quận 1', tongBan: 5600000, orders: 7 },
    { id: 7, gioiTinh: 'Nam', ngaySinh: '1987-04-18', khuVucGiaoHang: 'Quận 2', tongBan: 9800000, orders: 11 },
    { id: 8, gioiTinh: 'Nữ', ngaySinh: '1996-09-05', khuVucGiaoHang: 'Quận 3', tongBan: 3200000, orders: 5 },
    { id: 9, gioiTinh: 'Nam', ngaySinh: '1991-01-22', khuVucGiaoHang: 'Quận 4', tongBan: 7200000, orders: 9 },
    { id: 10, gioiTinh: 'Nữ', ngaySinh: '1989-06-30', khuVucGiaoHang: 'Quận 5', tongBan: 11500000, orders: 14 },
  ]

  // Dữ liệu đơn hàng với sản phẩm và kênh bán hàng (giả lập)
  const ordersWithProducts = [
    { customerId: 1, channel: 'Shopee', products: [{ name: 'Áo thun nam', quantity: 2, revenue: 900000 }, { name: 'Quần jean', quantity: 1, revenue: 450000 }] },
    { customerId: 2, channel: 'TikTok', products: [{ name: 'Giày thể thao', quantity: 1, revenue: 800000 }, { name: 'Túi xách', quantity: 1, revenue: 350000 }] },
    { customerId: 3, channel: 'Shopee', products: [{ name: 'Áo thun nam', quantity: 5, revenue: 2250000 }, { name: 'Quần jean', quantity: 3, revenue: 1350000 }] },
    { customerId: 1, channel: 'Lazada', products: [{ name: 'Ví da', quantity: 2, revenue: 400000 }] },
    { customerId: 4, channel: 'Facebook', products: [{ name: 'Áo thun nam', quantity: 1, revenue: 250000 }] },
    { customerId: 5, channel: 'TikTok', products: [{ name: 'Giày thể thao', quantity: 2, revenue: 1600000 }, { name: 'Túi xách', quantity: 1, revenue: 350000 }] },
    { customerId: 2, channel: 'Shopee', products: [{ name: 'Quần jean', quantity: 2, revenue: 900000 }] },
    { customerId: 6, channel: 'Lazada', products: [{ name: 'Áo thun nam', quantity: 3, revenue: 1350000 }, { name: 'Ví da', quantity: 1, revenue: 200000 }] },
    { customerId: 7, channel: 'TikTok', products: [{ name: 'Giày thể thao', quantity: 1, revenue: 800000 }, { name: 'Quần jean', quantity: 2, revenue: 900000 }] },
    { customerId: 8, channel: 'Facebook', products: [{ name: 'Túi xách', quantity: 1, revenue: 350000 }] },
    { customerId: 9, channel: 'Shopee', products: [{ name: 'Áo thun nam', quantity: 2, revenue: 900000 }, { name: 'Giày thể thao', quantity: 1, revenue: 800000 }] },
    { customerId: 10, channel: 'Lazada', products: [{ name: 'Quần jean', quantity: 4, revenue: 1800000 }, { name: 'Ví da', quantity: 2, revenue: 400000 }] },
    { customerId: 1, channel: 'TikTok', products: [{ name: 'Áo thun nam', quantity: 1, revenue: 450000 }] },
    { customerId: 3, channel: 'Lazada', products: [{ name: 'Giày thể thao', quantity: 1, revenue: 800000 }] },
    { customerId: 5, channel: 'Shopee', products: [{ name: 'Quần jean', quantity: 2, revenue: 900000 }] },
  ]

  // Tính toán dữ liệu phân tích khách hàng
  const customerAnalysisData = useMemo(() => {
    // Phân bố giới tính
    const genderDistribution = customers.reduce((acc, customer) => {
      const gender = customer.gioiTinh || 'Khác'
      acc[gender] = (acc[gender] || 0) + 1
      return acc
    }, {})
    const genderChartData = Object.entries(genderDistribution).map(([name, value]) => ({
      name,
      value,
      percentage: ((value / customers.length) * 100).toFixed(1)
    }))

    // Phân bố độ tuổi
    const calculateAge = (birthDate) => {
      const today = new Date()
      const birth = new Date(birthDate)
      let age = today.getFullYear() - birth.getFullYear()
      const monthDiff = today.getMonth() - birth.getMonth()
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age--
      }
      return age
    }

    const ageGroups = {
      '18-25': 0,
      '26-35': 0,
      '36-45': 0,
      '46-55': 0,
      'Trên 55': 0
    }

    customers.forEach(customer => {
      if (customer.ngaySinh) {
        const age = calculateAge(customer.ngaySinh)
        if (age >= 18 && age <= 25) ageGroups['18-25']++
        else if (age >= 26 && age <= 35) ageGroups['26-35']++
        else if (age >= 36 && age <= 45) ageGroups['36-45']++
        else if (age >= 46 && age <= 55) ageGroups['46-55']++
        else if (age > 55) ageGroups['Trên 55']++
      }
    })

    const ageChartData = Object.entries(ageGroups).map(([name, value]) => ({
      name,
      value,
      percentage: customers.length > 0 ? ((value / customers.length) * 100).toFixed(1) : 0
    }))

    // Phân bố khu vực địa lý
    const regionDistribution = customers.reduce((acc, customer) => {
      const region = customer.khuVucGiaoHang || 'Khác'
      if (!acc[region]) {
        acc[region] = { count: 0, revenue: 0, orders: 0 }
      }
      acc[region].count++
      acc[region].revenue += customer.tongBan || 0
      acc[region].orders += customer.orders || 0
      return acc
    }, {})

    const regionChartData = Object.entries(regionDistribution)
      .map(([name, data]) => ({
        name,
        count: data.count,
        revenue: data.revenue,
        orders: data.orders,
        avgRevenue: data.count > 0 ? Math.round(data.revenue / data.count) : 0
      }))
      .sort((a, b) => b.count - a.count)

    // Top sản phẩm được quan tâm (từ đơn hàng)
    const productInterest = {}
    ordersWithProducts.forEach(order => {
      order.products.forEach(product => {
        if (!productInterest[product.name]) {
          productInterest[product.name] = {
            name: product.name,
            totalQuantity: 0,
            totalRevenue: 0,
            customerCount: new Set()
          }
        }
        productInterest[product.name].totalQuantity += product.quantity
        productInterest[product.name].totalRevenue += product.revenue
        productInterest[product.name].customerCount.add(order.customerId)
      })
    })

    const topProductsData = Object.values(productInterest)
      .map(product => ({
        name: product.name,
        quantity: product.totalQuantity,
        revenue: product.totalRevenue,
        customers: product.customerCount.size,
        avgPerCustomer: product.customerCount.size > 0 ? Math.round(product.totalRevenue / product.customerCount.size) : 0
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10)

    // Phân tích theo giới tính và sản phẩm
    const genderProductAnalysis = {}
    ordersWithProducts.forEach(order => {
      const customer = customers.find(c => c.id === order.customerId)
      if (customer) {
        const gender = customer.gioiTinh || 'Khác'
        order.products.forEach(product => {
          if (!genderProductAnalysis[gender]) {
            genderProductAnalysis[gender] = {}
          }
          if (!genderProductAnalysis[gender][product.name]) {
            genderProductAnalysis[gender][product.name] = {
              quantity: 0,
              revenue: 0
            }
          }
          genderProductAnalysis[gender][product.name].quantity += product.quantity
          genderProductAnalysis[gender][product.name].revenue += product.revenue
        })
      }
    })

    // Phân tích kênh bán hàng
    const channelDistribution = {}
    ordersWithProducts.forEach(order => {
      const channel = order.channel || 'Khác'
      const customer = customers.find(c => c.id === order.customerId)
      const orderRevenue = order.products.reduce((sum, p) => sum + p.revenue, 0)
      
      if (!channelDistribution[channel]) {
        channelDistribution[channel] = {
          orders: 0,
          revenue: 0,
          customers: new Set(),
          genderDistribution: {},
          ageDistribution: {},
          regionDistribution: {}
        }
      }
      
      channelDistribution[channel].orders++
      channelDistribution[channel].revenue += orderRevenue
      channelDistribution[channel].customers.add(order.customerId)
      
      if (customer) {
        // Phân bố theo giới tính
        const gender = customer.gioiTinh || 'Khác'
        if (!channelDistribution[channel].genderDistribution[gender]) {
          channelDistribution[channel].genderDistribution[gender] = { count: 0, revenue: 0 }
        }
        channelDistribution[channel].genderDistribution[gender].count++
        channelDistribution[channel].genderDistribution[gender].revenue += orderRevenue
        
        // Phân bố theo độ tuổi
        if (customer.ngaySinh) {
          const age = calculateAge(customer.ngaySinh)
          let ageGroup = 'Khác'
          if (age >= 18 && age <= 25) ageGroup = '18-25'
          else if (age >= 26 && age <= 35) ageGroup = '26-35'
          else if (age >= 36 && age <= 45) ageGroup = '36-45'
          else if (age >= 46 && age <= 55) ageGroup = '46-55'
          else if (age > 55) ageGroup = 'Trên 55'
          
          if (!channelDistribution[channel].ageDistribution[ageGroup]) {
            channelDistribution[channel].ageDistribution[ageGroup] = { count: 0, revenue: 0 }
          }
          channelDistribution[channel].ageDistribution[ageGroup].count++
          channelDistribution[channel].ageDistribution[ageGroup].revenue += orderRevenue
        }
        
        // Phân bố theo khu vực
        const region = customer.khuVucGiaoHang || 'Khác'
        if (!channelDistribution[channel].regionDistribution[region]) {
          channelDistribution[channel].regionDistribution[region] = { count: 0, revenue: 0 }
        }
        channelDistribution[channel].regionDistribution[region].count++
        channelDistribution[channel].regionDistribution[region].revenue += orderRevenue
      }
    })

    const channelChartData = Object.entries(channelDistribution)
      .map(([name, data]) => ({
        name,
        orders: data.orders,
        revenue: data.revenue,
        customers: data.customers.size,
        avgOrderValue: data.orders > 0 ? Math.round(data.revenue / data.orders) : 0,
        avgRevenuePerCustomer: data.customers.size > 0 ? Math.round(data.revenue / data.customers.size) : 0,
        percentage: ordersWithProducts.length > 0 ? ((data.orders / ordersWithProducts.length) * 100).toFixed(1) : 0
      }))
      .sort((a, b) => b.revenue - a.revenue)

    return {
      genderChartData,
      ageChartData,
      regionChartData,
      topProductsData,
      genderProductAnalysis,
      channelChartData,
      channelDistribution,
      totalCustomers: customers.length,
      totalRevenue: customers.reduce((sum, c) => sum + (c.tongBan || 0), 0),
      totalOrders: customers.reduce((sum, c) => sum + (c.orders || 0), 0)
    }
  }, [])

  // Dữ liệu đơn hàng mẫu để phân tích dự đoán (giả lập - trong thực tế sẽ lấy từ API)
  const sampleOrders = useMemo(() => {
    const orders = []
    const products = ['Áo thun nam', 'Quần jean', 'Giày thể thao', 'Túi xách', 'Ví da']
    const baseDate = new Date()
    baseDate.setDate(baseDate.getDate() - 30) // 30 ngày trước
    
    // Tạo dữ liệu cho 30 ngày gần nhất với xu hướng tăng trưởng
    for (let day = 0; day < 30; day++) {
      const date = new Date(baseDate)
      date.setDate(date.getDate() + day)
      const dateStr = date.toISOString().split('T')[0]
      
      // Tạo xu hướng tăng trưởng theo thời gian
      const growthFactor = 1 + (day / 30) * 0.2 // Tăng 20% sau 30 ngày
      
      products.forEach((productName, productIndex) => {
        // Mỗi sản phẩm có pattern khác nhau
        const baseOrders = [3, 2, 4, 1, 2][productIndex] // Số đơn hàng cơ bản
        const ordersPerDay = Math.max(1, Math.floor(baseOrders * growthFactor * (0.8 + Math.random() * 0.4)))
        
        for (let i = 0; i < ordersPerDay; i++) {
          const baseQuantity = [2, 1, 1, 1, 1][productIndex]
          const quantity = Math.max(1, Math.floor(baseQuantity * (0.8 + Math.random() * 0.4)))
          
          orders.push({
            thoiGianTao: `${dateStr} ${String(9 + Math.floor(Math.random() * 8)).padStart(2, '0')}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}:00`,
            sanPham: [{
              tenHang: productName,
              soLuong: quantity
            }]
          })
        }
      })
    }
    
    return orders
  }, [])

  // Tính toán báo cáo dự đoán
  const forecastReport = useMemo(() => {
    if (sampleOrders.length === 0) {
      return { forecasts: {}, totalProducts: 0, generatedAt: new Date().toISOString() }
    }
    return generateForecastReport(sampleOrders)
  }, [sampleOrders])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Phân tích và dự đoán</h1>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('customer-analysis')}
            className={`flex-1 px-6 py-4 font-medium transition-colors whitespace-nowrap ${
              activeTab === 'customer-analysis'
                ? 'text-primary-600 border-b-2 border-primary-600 bg-primary-100'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Users size={20} />
              <span>Phân tích khách hàng</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('forecast')}
            className={`flex-1 px-6 py-4 font-medium transition-colors whitespace-nowrap ${
              activeTab === 'forecast'
                ? 'text-primary-600 border-b-2 border-primary-600 bg-primary-100'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <TrendingUp size={20} />
              <span>Dự đoán bán hàng</span>
            </div>
          </button>
        </div>
      </div>

      {/* Báo cáo Phân tích khách hàng */}
      {activeTab === 'customer-analysis' && (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="card">
              <p className="text-sm text-gray-600">Tổng khách hàng</p>
              <p className="text-2xl font-bold mt-1">{customerAnalysisData.totalCustomers}</p>
            </div>
            <div className="card">
              <p className="text-sm text-gray-600">Tổng doanh thu</p>
              <p className="text-2xl font-bold mt-1 text-primary-600">
                {customerAnalysisData.totalRevenue.toLocaleString('vi-VN')} đ
              </p>
            </div>
            <div className="card">
              <p className="text-sm text-gray-600">Tổng đơn hàng</p>
              <p className="text-2xl font-bold mt-1">{customerAnalysisData.totalOrders}</p>
            </div>
            <div className="card">
              <p className="text-sm text-gray-600">Đơn hàng trung bình</p>
              <p className="text-2xl font-bold mt-1 text-green-600">
                {customerAnalysisData.totalCustomers > 0 
                  ? Math.round(customerAnalysisData.totalOrders / customerAnalysisData.totalCustomers)
                  : 0}
              </p>
            </div>
          </div>

          {/* Charts Row 1: Giới tính và Độ tuổi */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="card">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <User size={20} />
                Phân bố theo giới tính
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={customerAnalysisData.genderChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percentage }) => `${name}: ${percentage}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {customerAnalysisData.genderChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-4 space-y-2">
                {customerAnalysisData.genderChartData.map((item, index) => (
                  <div key={index} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-4 h-4 rounded" 
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                      <span>{item.name}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="font-medium">{item.value} khách hàng</span>
                      <span className="text-gray-600">{item.percentage}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="card">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Calendar size={20} />
                Phân bố theo độ tuổi
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={customerAnalysisData.ageChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#0284c7" />
                </BarChart>
              </ResponsiveContainer>
              <div className="mt-4 space-y-2">
                {customerAnalysisData.ageChartData.map((item, index) => (
                  <div key={index} className="flex items-center justify-between text-sm">
                    <span>{item.name} tuổi</span>
                    <div className="flex items-center gap-4">
                      <span className="font-medium">{item.value} khách hàng</span>
                      <span className="text-gray-600">{item.percentage}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Charts Row 2: Khu vực địa lý */}
          <div className="card">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <MapPin size={20} />
              Phân bố theo khu vực địa lý
            </h3>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={customerAnalysisData.regionChartData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={100} />
                <Tooltip formatter={(value, name) => {
                  if (name === 'count') return `${value} khách hàng`
                  if (name === 'revenue') return `${value.toLocaleString('vi-VN')} đ`
                  if (name === 'orders') return `${value} đơn hàng`
                  return value
                }} />
                <Legend />
                <Bar dataKey="count" fill="#0284c7" name="Số khách hàng" />
                <Bar dataKey="orders" fill="#059669" name="Số đơn hàng" />
              </BarChart>
            </ResponsiveContainer>
            <div className="mt-4 overflow-x-auto">
              <table className="table">
                <thead>
                  <tr>
                    <th>Khu vực</th>
                    <th>Số khách hàng</th>
                    <th>Số đơn hàng</th>
                    <th>Tổng doanh thu</th>
                    <th>Doanh thu trung bình</th>
                  </tr>
                </thead>
                <tbody>
                  {customerAnalysisData.regionChartData.map((region, index) => (
                    <tr key={index}>
                      <td className="font-medium">{region.name}</td>
                      <td>{region.count}</td>
                      <td>{region.orders}</td>
                      <td className="font-semibold">{region.revenue.toLocaleString('vi-VN')} đ</td>
                      <td className="text-primary-600">{region.avgRevenue.toLocaleString('vi-VN')} đ</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Charts Row 3: Top sản phẩm được quan tâm */}
          <div className="card">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Package size={20} />
              Top sản phẩm được khách hàng quan tâm
            </h3>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={customerAnalysisData.topProductsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip formatter={(value, name) => {
                  if (name === 'revenue') return `${value.toLocaleString('vi-VN')} đ`
                  if (name === 'quantity') return `${value} sản phẩm`
                  if (name === 'customers') return `${value} khách hàng`
                  return value
                }} />
                <Legend />
                <Bar yAxisId="left" dataKey="revenue" fill="#7c3aed" name="Doanh thu" />
                <Bar yAxisId="right" dataKey="quantity" fill="#ea580c" name="Số lượng" />
              </BarChart>
            </ResponsiveContainer>
            <div className="mt-4 overflow-x-auto">
              <table className="table">
                <thead>
                  <tr>
                    <th>STT</th>
                    <th>Tên sản phẩm</th>
                    <th>Số lượng bán</th>
                    <th>Tổng doanh thu</th>
                    <th>Số khách hàng mua</th>
                    <th>Doanh thu trung bình/khách</th>
                  </tr>
                </thead>
                <tbody>
                  {customerAnalysisData.topProductsData.map((product, index) => (
                    <tr key={index}>
                      <td>{index + 1}</td>
                      <td className="font-medium">{product.name}</td>
                      <td>{product.quantity}</td>
                      <td className="font-semibold">{product.revenue.toLocaleString('vi-VN')} đ</td>
                      <td>{product.customers}</td>
                      <td className="text-primary-600">{product.avgPerCustomer.toLocaleString('vi-VN')} đ</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Phân tích sản phẩm theo giới tính */}
          <div className="card">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Users size={20} />
              Phân tích sản phẩm theo giới tính
            </h3>
            <div className="space-y-6">
              {Object.entries(customerAnalysisData.genderProductAnalysis).map(([gender, products]) => {
                const topProducts = Object.entries(products)
                  .map(([name, data]) => ({
                    name,
                    quantity: data.quantity,
                    revenue: data.revenue
                  }))
                  .sort((a, b) => b.revenue - a.revenue)
                  .slice(0, 5)

                return (
                  <div key={gender} className="border-b border-gray-200 pb-4 last:border-b-0">
                    <h4 className="text-md font-semibold mb-3 text-primary-600">{gender}</h4>
                    <div className="overflow-x-auto">
                      <table className="table">
                        <thead>
                          <tr>
                            <th>Tên sản phẩm</th>
                            <th>Số lượng</th>
                            <th>Doanh thu</th>
                          </tr>
                        </thead>
                        <tbody>
                          {topProducts.length > 0 ? (
                            topProducts.map((product, index) => (
                              <tr key={index}>
                                <td className="font-medium">{product.name}</td>
                                <td>{product.quantity}</td>
                                <td className="font-semibold">{product.revenue.toLocaleString('vi-VN')} đ</td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan="3" className="text-center text-gray-500">Chưa có dữ liệu</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Phân tích kênh bán hàng */}
          <div className="card">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <ShoppingCart size={20} />
              Phân tích kênh bán hàng
            </h3>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={customerAnalysisData.channelChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip formatter={(value, name) => {
                  if (name === 'revenue') return `${value.toLocaleString('vi-VN')} đ`
                  if (name === 'orders') return `${value} đơn hàng`
                  if (name === 'customers') return `${value} khách hàng`
                  return value
                }} />
                <Legend />
                <Bar yAxisId="left" dataKey="revenue" fill="#7c3aed" name="Doanh thu" />
                <Bar yAxisId="right" dataKey="orders" fill="#0284c7" name="Số đơn hàng" />
              </BarChart>
            </ResponsiveContainer>
            <div className="mt-4 overflow-x-auto">
              <table className="table">
                <thead>
                  <tr>
                    <th>Kênh bán hàng</th>
                    <th>Số đơn hàng</th>
                    <th>Tổng doanh thu</th>
                    <th>Số khách hàng</th>
                    <th>Giá trị đơn trung bình</th>
                    <th>Doanh thu/khách hàng</th>
                    <th>Tỷ lệ</th>
                  </tr>
                </thead>
                <tbody>
                  {customerAnalysisData.channelChartData.map((channel, index) => (
                    <tr key={index}>
                      <td className="font-medium">{channel.name}</td>
                      <td>{channel.orders}</td>
                      <td className="font-semibold">{channel.revenue.toLocaleString('vi-VN')} đ</td>
                      <td>{channel.customers}</td>
                      <td className="text-primary-600">{channel.avgOrderValue.toLocaleString('vi-VN')} đ</td>
                      <td className="text-green-600">{channel.avgRevenuePerCustomer.toLocaleString('vi-VN')} đ</td>
                      <td>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-primary-600 h-2 rounded-full" 
                              style={{ width: `${channel.percentage}%` }}
                            ></div>
                          </div>
                          <span className="text-sm text-gray-600 w-12">{channel.percentage}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Phân tích kênh theo giới tính */}
          <div className="card">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <User size={20} />
              Phân tích kênh bán hàng theo giới tính
            </h3>
            <div className="space-y-6">
              {Object.entries(customerAnalysisData.channelDistribution).map(([channel, data]) => {
                const genderData = Object.entries(data.genderDistribution)
                  .map(([gender, stats]) => ({
                    gender,
                    orders: stats.count,
                    revenue: stats.revenue,
                    percentage: data.orders > 0 ? ((stats.count / data.orders) * 100).toFixed(1) : 0
                  }))
                  .sort((a, b) => b.revenue - a.revenue)

                return (
                  <div key={channel} className="border-b border-gray-200 pb-4 last:border-b-0">
                    <h4 className="text-md font-semibold mb-3 text-primary-600">{channel}</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <ResponsiveContainer width="100%" height={200}>
                          <PieChart>
                            <Pie
                              data={genderData}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              label={({ gender, percentage }) => `${gender}: ${percentage}%`}
                              outerRadius={60}
                              fill="#8884d8"
                              dataKey="orders"
                            >
                              {genderData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip />
                            <Legend />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="table">
                          <thead>
                            <tr>
                              <th>Giới tính</th>
                              <th>Số đơn</th>
                              <th>Doanh thu</th>
                              <th>Tỷ lệ</th>
                            </tr>
                          </thead>
                          <tbody>
                            {genderData.map((item, index) => (
                              <tr key={index}>
                                <td className="font-medium">{item.gender}</td>
                                <td>{item.orders}</td>
                                <td className="font-semibold">{item.revenue.toLocaleString('vi-VN')} đ</td>
                                <td>{item.percentage}%</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Phân tích kênh theo độ tuổi */}
          <div className="card">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Calendar size={20} />
              Phân tích kênh bán hàng theo độ tuổi
            </h3>
            <div className="space-y-6">
              {Object.entries(customerAnalysisData.channelDistribution).map(([channel, data]) => {
                const ageData = Object.entries(data.ageDistribution)
                  .map(([ageGroup, stats]) => ({
                    ageGroup,
                    orders: stats.count,
                    revenue: stats.revenue
                  }))
                  .sort((a, b) => {
                    const order = ['18-25', '26-35', '36-45', '46-55', 'Trên 55', 'Khác']
                    return order.indexOf(a.ageGroup) - order.indexOf(b.ageGroup)
                  })

                return (
                  <div key={channel} className="border-b border-gray-200 pb-4 last:border-b-0">
                    <h4 className="text-md font-semibold mb-3 text-primary-600">{channel}</h4>
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart data={ageData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="ageGroup" />
                        <YAxis yAxisId="left" />
                        <YAxis yAxisId="right" orientation="right" />
                        <Tooltip formatter={(value, name) => {
                          if (name === 'revenue') return `${value.toLocaleString('vi-VN')} đ`
                          if (name === 'orders') return `${value} đơn hàng`
                          return value
                        }} />
                        <Legend />
                        <Bar yAxisId="left" dataKey="revenue" fill="#7c3aed" name="Doanh thu" />
                        <Bar yAxisId="right" dataKey="orders" fill="#0284c7" name="Số đơn hàng" />
                      </BarChart>
                    </ResponsiveContainer>
                    <div className="mt-4 overflow-x-auto">
                      <table className="table">
                        <thead>
                          <tr>
                            <th>Độ tuổi</th>
                            <th>Số đơn hàng</th>
                            <th>Doanh thu</th>
                          </tr>
                        </thead>
                        <tbody>
                          {ageData.map((item, index) => (
                            <tr key={index}>
                              <td className="font-medium">{item.ageGroup} tuổi</td>
                              <td>{item.orders}</td>
                              <td className="font-semibold">{item.revenue.toLocaleString('vi-VN')} đ</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Phân tích kênh theo khu vực */}
          <div className="card">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <MapPin size={20} />
              Phân tích kênh bán hàng theo khu vực địa lý
            </h3>
            <div className="space-y-6">
              {Object.entries(customerAnalysisData.channelDistribution).map(([channel, data]) => {
                const regionData = Object.entries(data.regionDistribution)
                  .map(([region, stats]) => ({
                    region,
                    orders: stats.count,
                    revenue: stats.revenue
                  }))
                  .sort((a, b) => b.revenue - a.revenue)

                return (
                  <div key={channel} className="border-b border-gray-200 pb-4 last:border-b-0">
                    <h4 className="text-md font-semibold mb-3 text-primary-600">{channel}</h4>
                    <div className="overflow-x-auto">
                      <table className="table">
                        <thead>
                          <tr>
                            <th>Khu vực</th>
                            <th>Số đơn hàng</th>
                            <th>Doanh thu</th>
                            <th>Doanh thu trung bình/đơn</th>
                          </tr>
                        </thead>
                        <tbody>
                          {regionData.length > 0 ? (
                            regionData.map((item, index) => (
                              <tr key={index}>
                                <td className="font-medium">{item.region}</td>
                                <td>{item.orders}</td>
                                <td className="font-semibold">{item.revenue.toLocaleString('vi-VN')} đ</td>
                                <td className="text-primary-600">
                                  {item.orders > 0 ? Math.round(item.revenue / item.orders).toLocaleString('vi-VN') : 0} đ
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan="4" className="text-center text-gray-500">Chưa có dữ liệu</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* Báo cáo Dự đoán bán hàng */}
      {activeTab === 'forecast' && (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="card">
              <p className="text-sm text-gray-600">Tổng sản phẩm được dự đoán</p>
              <p className="text-2xl font-bold mt-1">{forecastReport.totalProducts}</p>
            </div>
            <div className="card">
              <p className="text-sm text-gray-600">Tổng dự đoán ngày mai</p>
              <p className="text-2xl font-bold mt-1 text-primary-600">
                {Object.values(forecastReport.forecasts).reduce((sum, f) => sum + (f.nextDay?.forecast || 0), 0)}
              </p>
            </div>
            <div className="card">
              <p className="text-sm text-gray-600">Tổng dự đoán tuần tới</p>
              <p className="text-2xl font-bold mt-1 text-blue-600">
                {Object.values(forecastReport.forecasts).reduce((sum, f) => sum + (f.nextWeek?.forecast || 0), 0)}
              </p>
            </div>
            <div className="card">
              <p className="text-sm text-gray-600">Tổng dự đoán tháng tới</p>
              <p className="text-2xl font-bold mt-1 text-green-600">
                {Object.values(forecastReport.forecasts).reduce((sum, f) => sum + (f.nextMonth?.forecast || 0), 0)}
              </p>
            </div>
          </div>

          {/* Forecast Table */}
          <div className="card">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <TrendingUp size={20} />
              Dự đoán số lượng sản phẩm sẽ bán
            </h3>
            <div className="overflow-x-auto">
              <table className="table">
                <thead>
                  <tr>
                    <th>Sản phẩm</th>
                    <th>Đã bán (tổng)</th>
                    <th>Số đơn hàng</th>
                    <th>TB/đơn</th>
                    <th>Dự đoán ngày mai</th>
                    <th>Độ tin cậy</th>
                    <th>Dự đoán tuần tới</th>
                    <th>Độ tin cậy</th>
                    <th>Dự đoán tháng tới</th>
                    <th>Độ tin cậy</th>
                    <th>Tăng trưởng</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.values(forecastReport.forecasts)
                    .sort((a, b) => (b.nextDay?.forecast || 0) - (a.nextDay?.forecast || 0))
                    .map((forecast, index) => (
                    <tr key={index}>
                      <td className="font-medium">{forecast.productName}</td>
                      <td>{forecast.currentData.totalSold}</td>
                      <td>{forecast.currentData.orders}</td>
                      <td>{forecast.currentData.avgPerOrder}</td>
                      <td>
                        <span className="font-semibold text-primary-600">
                          {forecast.nextDay?.forecast || 0}
                        </span>
                      </td>
                      <td>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-gray-200 rounded-full h-2 w-16">
                            <div 
                              className={`h-2 rounded-full ${
                                (forecast.nextDay?.confidence || 0) >= 70 ? 'bg-green-500' :
                                (forecast.nextDay?.confidence || 0) >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                              }`}
                              style={{ width: `${forecast.nextDay?.confidence || 0}%` }}
                            ></div>
                          </div>
                          <span className="text-xs text-gray-600 w-10">
                            {forecast.nextDay?.confidence || 0}%
                          </span>
                        </div>
                      </td>
                      <td>
                        <span className="font-semibold text-blue-600">
                          {forecast.nextWeek?.forecast || 0}
                        </span>
                      </td>
                      <td>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-gray-200 rounded-full h-2 w-16">
                            <div 
                              className={`h-2 rounded-full ${
                                (forecast.nextWeek?.confidence || 0) >= 70 ? 'bg-green-500' :
                                (forecast.nextWeek?.confidence || 0) >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                              }`}
                              style={{ width: `${forecast.nextWeek?.confidence || 0}%` }}
                            ></div>
                          </div>
                          <span className="text-xs text-gray-600 w-10">
                            {forecast.nextWeek?.confidence || 0}%
                          </span>
                        </div>
                      </td>
                      <td>
                        <span className="font-semibold text-green-600">
                          {forecast.nextMonth?.forecast || 0}
                        </span>
                      </td>
                      <td>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-gray-200 rounded-full h-2 w-16">
                            <div 
                              className={`h-2 rounded-full ${
                                (forecast.nextMonth?.confidence || 0) >= 70 ? 'bg-green-500' :
                                (forecast.nextMonth?.confidence || 0) >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                              }`}
                              style={{ width: `${forecast.nextMonth?.confidence || 0}%` }}
                            ></div>
                          </div>
                          <span className="text-xs text-gray-600 w-10">
                            {forecast.nextMonth?.confidence || 0}%
                          </span>
                        </div>
                      </td>
                      <td>
                        {forecast.nextWeek?.growthRate !== undefined && (
                          <div className={`flex items-center gap-1 ${
                            forecast.nextWeek.growthRate > 0 ? 'text-green-600' : 
                            forecast.nextWeek.growthRate < 0 ? 'text-red-600' : 'text-gray-600'
                          }`}>
                            {forecast.nextWeek.growthRate > 0 ? (
                              <TrendingUp size={14} />
                            ) : forecast.nextWeek.growthRate < 0 ? (
                              <TrendingDown size={14} />
                            ) : null}
                            <span className="text-sm font-medium">
                              {forecast.nextWeek.growthRate > 0 ? '+' : ''}{forecast.nextWeek.growthRate}%
                            </span>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Forecast Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="card">
              <h3 className="text-lg font-semibold mb-4">So sánh dự đoán theo thời gian</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={Object.values(forecastReport.forecasts)
                  .sort((a, b) => (b.nextDay?.forecast || 0) - (a.nextDay?.forecast || 0))
                  .slice(0, 10)
                  .map(f => ({
                    name: f.productName.length > 15 ? f.productName.substring(0, 15) + '...' : f.productName,
                    'Ngày mai': f.nextDay?.forecast || 0,
                    'Tuần tới': f.nextWeek?.forecast || 0,
                    'Tháng tới': f.nextMonth?.forecast || 0
                  }))}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="Ngày mai" fill="#0284c7" />
                  <Bar dataKey="Tuần tới" fill="#7c3aed" />
                  <Bar dataKey="Tháng tới" fill="#059669" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="card">
              <h3 className="text-lg font-semibold mb-4">Độ tin cậy dự đoán</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={Object.values(forecastReport.forecasts)
                  .sort((a, b) => (b.nextDay?.confidence || 0) - (a.nextDay?.confidence || 0))
                  .slice(0, 10)
                  .map(f => ({
                    name: f.productName.length > 15 ? f.productName.substring(0, 15) + '...' : f.productName,
                    'Ngày mai': f.nextDay?.confidence || 0,
                    'Tuần tới': f.nextWeek?.confidence || 0,
                    'Tháng tới': f.nextMonth?.confidence || 0
                  }))}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                  <YAxis domain={[0, 100]} />
                  <Tooltip formatter={(value) => `${value}%`} />
                  <Legend />
                  <Bar dataKey="Ngày mai" fill="#0284c7" />
                  <Bar dataKey="Tuần tới" fill="#7c3aed" />
                  <Bar dataKey="Tháng tới" fill="#059669" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Top Products Forecast */}
          <div className="card">
            <h3 className="text-lg font-semibold mb-4">Top sản phẩm dự đoán bán chạy</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Ngày mai</span>
                  <Calendar size={16} className="text-primary-600" />
                </div>
                <div className="space-y-2">
                  {Object.values(forecastReport.forecasts)
                    .sort((a, b) => (b.nextDay?.forecast || 0) - (a.nextDay?.forecast || 0))
                    .slice(0, 5)
                    .map((f, idx) => (
                      <div key={idx} className="flex items-center justify-between text-sm">
                        <span className="truncate flex-1">{idx + 1}. {f.productName}</span>
                        <span className="font-semibold text-primary-600 ml-2">{f.nextDay?.forecast || 0}</span>
                      </div>
                    ))}
                </div>
              </div>
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Tuần tới</span>
                  <Calendar size={16} className="text-blue-600" />
                </div>
                <div className="space-y-2">
                  {Object.values(forecastReport.forecasts)
                    .sort((a, b) => (b.nextWeek?.forecast || 0) - (a.nextWeek?.forecast || 0))
                    .slice(0, 5)
                    .map((f, idx) => (
                      <div key={idx} className="flex items-center justify-between text-sm">
                        <span className="truncate flex-1">{idx + 1}. {f.productName}</span>
                        <span className="font-semibold text-blue-600 ml-2">{f.nextWeek?.forecast || 0}</span>
                      </div>
                    ))}
                </div>
              </div>
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Tháng tới</span>
                  <Calendar size={16} className="text-green-600" />
                </div>
                <div className="space-y-2">
                  {Object.values(forecastReport.forecasts)
                    .sort((a, b) => (b.nextMonth?.forecast || 0) - (a.nextMonth?.forecast || 0))
                    .slice(0, 5)
                    .map((f, idx) => (
                      <div key={idx} className="flex items-center justify-between text-sm">
                        <span className="truncate flex-1">{idx + 1}. {f.productName}</span>
                        <span className="font-semibold text-green-600 ml-2">{f.nextMonth?.forecast || 0}</span>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>

          {/* Forecast Info */}
          <div className="card bg-blue-50 border border-blue-200">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <TrendingUp size={20} className="text-blue-600" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-blue-900 mb-2">Về dự đoán bán hàng</h4>
                <p className="text-sm text-blue-800 mb-2">
                  Dự đoán được tính toán dựa trên:
                </p>
                <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                  <li>Moving Average (Trung bình động) - Phân tích xu hướng ngắn hạn</li>
                  <li>Linear Regression (Hồi quy tuyến tính) - Dự đoán xu hướng dài hạn</li>
                  <li>Growth Rate (Tỷ lệ tăng trưởng) - Phân tích tốc độ tăng trưởng</li>
                  <li>Weighted Average (Trung bình có trọng số) - Ưu tiên dữ liệu gần đây</li>
                </ul>
                <p className="text-xs text-blue-700 mt-3">
                  <strong>Lưu ý:</strong> Dự đoán chỉ mang tính chất tham khảo. Độ tin cậy phụ thuộc vào độ ổn định của dữ liệu lịch sử. 
                  Cần kết hợp với phân tích thị trường và các yếu tố bên ngoài để đưa ra quyết định chính xác.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Analytics




