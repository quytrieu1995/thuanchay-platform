/**
 * Forecast Service
 * Dự đoán số lượng sản phẩm sẽ bán được dựa trên dữ liệu lịch sử
 */

/**
 * Tính toán moving average
 * @param {Array} values - Mảng các giá trị
 * @param {number} period - Số kỳ
 * @returns {number}
 */
const calculateMovingAverage = (values, period) => {
  if (values.length < period) return null
  const recentValues = values.slice(-period)
  return recentValues.reduce((sum, val) => sum + val, 0) / period
}

/**
 * Tính toán growth rate (tỷ lệ tăng trưởng)
 * @param {Array} values - Mảng các giá trị theo thời gian
 * @returns {number} Growth rate (0-1)
 */
const calculateGrowthRate = (values) => {
  if (values.length < 2) return 0
  
  const recent = values.slice(-7) // 7 giá trị gần nhất
  if (recent.length < 2) return 0
  
  const first = recent[0]
  const last = recent[recent.length - 1]
  
  if (first === 0) return 0
  return (last - first) / first / recent.length
}

/**
 * Dự đoán bằng linear regression đơn giản
 * @param {Array} values - Mảng các giá trị
 * @param {number} periods - Số kỳ cần dự đoán
 * @returns {Array} Mảng các giá trị dự đoán
 */
const linearRegressionForecast = (values, periods = 1) => {
  if (values.length < 2) {
    // Nếu không đủ dữ liệu, dùng giá trị trung bình
    const avg = values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0
    return Array(periods).fill(avg)
  }

  const n = values.length
  let sumX = 0
  let sumY = 0
  let sumXY = 0
  let sumX2 = 0

  values.forEach((y, index) => {
    const x = index + 1
    sumX += x
    sumY += y
    sumXY += x * y
    sumX2 += x * x
  })

  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX)
  const intercept = (sumY - slope * sumX) / n

  const forecasts = []
  for (let i = 1; i <= periods; i++) {
    const x = n + i
    forecasts.push(Math.max(0, Math.round(slope * x + intercept)))
  }

  return forecasts
}

/**
 * Phân tích dữ liệu đơn hàng theo sản phẩm
 * @param {Array} orders - Danh sách đơn hàng
 * @returns {Object} Dữ liệu đã được nhóm theo sản phẩm và ngày
 */
export const analyzeOrderData = (orders) => {
  const productData = {}
  const dailyData = {}
  
  // Xử lý từng đơn hàng
  orders.forEach(order => {
    const orderDate = order.thoiGianTao || order.date || order.thoiGian
    if (!orderDate) return
    
    // Lấy ngày (bỏ giờ)
    const date = orderDate.split(' ')[0] || orderDate.split('T')[0]
    
    if (!dailyData[date]) {
      dailyData[date] = {}
    }
    
    // Xử lý sản phẩm trong đơn hàng
    const products = order.sanPham || order.products || []
    products.forEach(product => {
      const productName = product.tenHang || product.name
      const quantity = product.soLuong || product.quantity || 0
      
      if (!productName || quantity === 0) return
      
      // Nhóm theo sản phẩm
      if (!productData[productName]) {
        productData[productName] = {
          name: productName,
          dailySales: {},
          totalSold: 0,
          orders: 0
        }
      }
      
      productData[productName].dailySales[date] = 
        (productData[productName].dailySales[date] || 0) + quantity
      productData[productName].totalSold += quantity
      productData[productName].orders += 1
      
      // Nhóm theo ngày
      if (!dailyData[date][productName]) {
        dailyData[date][productName] = 0
      }
      dailyData[date][productName] += quantity
    })
  })
  
  return { productData, dailyData }
}

/**
 * Dự đoán số lượng sản phẩm sẽ bán trong ngày tiếp theo
 * @param {Object} productData - Dữ liệu sản phẩm
 * @param {string} productName - Tên sản phẩm
 * @returns {Object} Dự đoán
 */
export const forecastNextDay = (productData, productName) => {
  const product = productData[productName]
  if (!product || !product.dailySales) {
    return { forecast: 0, confidence: 0, method: 'no_data' }
  }
  
  const sales = Object.values(product.dailySales)
  if (sales.length === 0) {
    return { forecast: 0, confidence: 0, method: 'no_data' }
  }
  
  // Sắp xếp theo ngày
  const sortedDates = Object.keys(product.dailySales).sort()
  const sortedSales = sortedDates.map(date => product.dailySales[date])
  
  // Phương pháp 1: Moving Average (7 ngày gần nhất)
  const ma7 = calculateMovingAverage(sortedSales, Math.min(7, sortedSales.length))
  
  // Phương pháp 2: Linear Regression
  const lrForecast = linearRegressionForecast(sortedSales, 1)[0]
  
  // Phương pháp 3: Trung bình có trọng số (ngày gần nhất quan trọng hơn)
  let weightedAvg = 0
  let totalWeight = 0
  const recentDays = Math.min(7, sortedSales.length)
  for (let i = 0; i < recentDays; i++) {
    const weight = recentDays - i
    weightedAvg += sortedSales[sortedSales.length - 1 - i] * weight
    totalWeight += weight
  }
  weightedAvg = totalWeight > 0 ? weightedAvg / totalWeight : 0
  
  // Kết hợp các phương pháp
  const forecast = Math.round((ma7 * 0.4 + lrForecast * 0.3 + weightedAvg * 0.3) || ma7 || lrForecast || weightedAvg || 0)
  
  // Tính confidence dựa trên độ ổn định của dữ liệu
  const variance = sales.length > 1 
    ? sales.reduce((sum, val) => sum + Math.pow(val - (sales.reduce((a, b) => a + b, 0) / sales.length), 2), 0) / sales.length
    : 0
  const avg = sales.reduce((a, b) => a + b, 0) / sales.length
  const coefficientOfVariation = avg > 0 ? Math.sqrt(variance) / avg : 1
  const confidence = Math.max(0, Math.min(100, Math.round((1 - Math.min(coefficientOfVariation, 1)) * 100)))
  
  return {
    forecast: Math.max(0, forecast),
    confidence,
    method: 'combined',
    breakdown: {
      movingAverage: Math.round(ma7 || 0),
      linearRegression: lrForecast,
      weightedAverage: Math.round(weightedAvg || 0)
    }
  }
}

/**
 * Dự đoán số lượng sản phẩm sẽ bán trong tuần tiếp theo
 * @param {Object} productData - Dữ liệu sản phẩm
 * @param {string} productName - Tên sản phẩm
 * @returns {Object} Dự đoán
 */
export const forecastNextWeek = (productData, productName) => {
  const product = productData[productName]
  if (!product || !product.dailySales) {
    return { forecast: 0, confidence: 0, method: 'no_data' }
  }
  
  const sales = Object.values(product.dailySales)
  if (sales.length === 0) {
    return { forecast: 0, confidence: 0, method: 'no_data' }
  }
  
  // Sắp xếp theo ngày
  const sortedDates = Object.keys(product.dailySales).sort()
  const sortedSales = sortedDates.map(date => product.dailySales[date])
  
  // Tính trung bình tuần (7 ngày)
  const weeklyAverages = []
  for (let i = 0; i < sortedSales.length; i += 7) {
    const weekSales = sortedSales.slice(i, i + 7)
    if (weekSales.length > 0) {
      weeklyAverages.push(weekSales.reduce((a, b) => a + b, 0))
    }
  }
  
  if (weeklyAverages.length === 0) {
    // Nếu không đủ dữ liệu tuần, dùng dự đoán ngày * 7
    const dailyForecast = forecastNextDay(productData, productName)
    return {
      forecast: dailyForecast.forecast * 7,
      confidence: dailyForecast.confidence,
      method: 'daily_extrapolation'
    }
  }
  
  // Dự đoán tuần tiếp theo
  const lrForecast = linearRegressionForecast(weeklyAverages, 1)[0]
  const maForecast = calculateMovingAverage(weeklyAverages, Math.min(4, weeklyAverages.length))
  
  // Tính growth rate
  const growthRate = calculateGrowthRate(weeklyAverages)
  const lastWeek = weeklyAverages[weeklyAverages.length - 1]
  const growthForecast = lastWeek * (1 + growthRate)
  
  const forecast = Math.round((lrForecast * 0.4 + maForecast * 0.3 + growthForecast * 0.3) || lrForecast || maForecast || growthForecast || 0)
  
  // Confidence
  const variance = weeklyAverages.length > 1
    ? weeklyAverages.reduce((sum, val) => sum + Math.pow(val - (weeklyAverages.reduce((a, b) => a + b, 0) / weeklyAverages.length), 2), 0) / weeklyAverages.length
    : 0
  const avg = weeklyAverages.reduce((a, b) => a + b, 0) / weeklyAverages.length
  const coefficientOfVariation = avg > 0 ? Math.sqrt(variance) / avg : 1
  const confidence = Math.max(0, Math.min(100, Math.round((1 - Math.min(coefficientOfVariation, 1)) * 100)))
  
  return {
    forecast: Math.max(0, forecast),
    confidence,
    method: 'combined',
    growthRate: Math.round(growthRate * 100 * 100) / 100, // Phần trăm
    breakdown: {
      linearRegression: lrForecast,
      movingAverage: Math.round(maForecast || 0),
      growthBased: Math.round(growthForecast || 0)
    }
  }
}

/**
 * Dự đoán số lượng sản phẩm sẽ bán trong tháng tiếp theo
 * @param {Object} productData - Dữ liệu sản phẩm
 * @param {string} productName - Tên sản phẩm
 * @returns {Object} Dự đoán
 */
export const forecastNextMonth = (productData, productName) => {
  const product = productData[productName]
  if (!product || !product.dailySales) {
    return { forecast: 0, confidence: 0, method: 'no_data' }
  }
  
  const sales = Object.values(product.dailySales)
  if (sales.length === 0) {
    return { forecast: 0, confidence: 0, method: 'no_data' }
  }
  
  // Sắp xếp theo ngày
  const sortedDates = Object.keys(product.dailySales).sort()
  const sortedSales = sortedDates.map(date => product.dailySales[date])
  
  // Tính trung bình tháng (30 ngày)
  const monthlyTotals = []
  for (let i = 0; i < sortedSales.length; i += 30) {
    const monthSales = sortedSales.slice(i, i + 30)
    if (monthSales.length > 0) {
      monthlyTotals.push(monthSales.reduce((a, b) => a + b, 0))
    }
  }
  
  if (monthlyTotals.length === 0) {
    // Nếu không đủ dữ liệu tháng, dùng dự đoán tuần * 4
    const weeklyForecast = forecastNextWeek(productData, productName)
    return {
      forecast: Math.round(weeklyForecast.forecast * 4.33), // 30/7 ≈ 4.33
      confidence: Math.max(0, weeklyForecast.confidence - 10), // Giảm confidence
      method: 'weekly_extrapolation'
    }
  }
  
  // Dự đoán tháng tiếp theo
  const lrForecast = linearRegressionForecast(monthlyTotals, 1)[0]
  const maForecast = calculateMovingAverage(monthlyTotals, Math.min(3, monthlyTotals.length))
  
  // Tính growth rate
  const growthRate = calculateGrowthRate(monthlyTotals)
  const lastMonth = monthlyTotals[monthlyTotals.length - 1]
  const growthForecast = lastMonth * (1 + growthRate)
  
  const forecast = Math.round((lrForecast * 0.4 + maForecast * 0.3 + growthForecast * 0.3) || lrForecast || maForecast || growthForecast || 0)
  
  // Confidence
  const variance = monthlyTotals.length > 1
    ? monthlyTotals.reduce((sum, val) => sum + Math.pow(val - (monthlyTotals.reduce((a, b) => a + b, 0) / monthlyTotals.length), 2), 0) / monthlyTotals.length
    : 0
  const avg = monthlyTotals.reduce((a, b) => a + b, 0) / monthlyTotals.length
  const coefficientOfVariation = avg > 0 ? Math.sqrt(variance) / avg : 1
  const confidence = Math.max(0, Math.min(100, Math.round((1 - Math.min(coefficientOfVariation, 1)) * 100)))
  
  return {
    forecast: Math.max(0, forecast),
    confidence,
    method: 'combined',
    growthRate: Math.round(growthRate * 100 * 100) / 100, // Phần trăm
    breakdown: {
      linearRegression: lrForecast,
      movingAverage: Math.round(maForecast || 0),
      growthBased: Math.round(growthForecast || 0)
    }
  }
}

/**
 * Tạo báo cáo dự đoán cho tất cả sản phẩm
 * @param {Array} orders - Danh sách đơn hàng
 * @returns {Object} Báo cáo dự đoán
 */
export const generateForecastReport = (orders) => {
  const { productData } = analyzeOrderData(orders)
  
  const forecasts = {}
  
  Object.keys(productData).forEach(productName => {
    const nextDay = forecastNextDay(productData, productName)
    const nextWeek = forecastNextWeek(productData, productName)
    const nextMonth = forecastNextMonth(productData, productName)
    
    forecasts[productName] = {
      productName,
      currentData: {
        totalSold: productData[productName].totalSold,
        orders: productData[productName].orders,
        avgPerOrder: productData[productName].orders > 0 
          ? Math.round(productData[productName].totalSold / productData[productName].orders)
          : 0
      },
      nextDay,
      nextWeek,
      nextMonth
    }
  })
  
  return {
    forecasts,
    totalProducts: Object.keys(forecasts).length,
    generatedAt: new Date().toISOString()
  }
}




