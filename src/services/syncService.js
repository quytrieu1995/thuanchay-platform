/**
 * Sync Service - Đồng bộ tất cả dữ liệu Thuần Chay VN
 * Hỗ trợ đồng bộ đến backend API, localStorage, hoặc export file
 */

import { productsApi } from './productsApi'
import { ordersApi } from './ordersApi'
import { customersApi } from './customersApi'
import { returnsApi } from './returnsApi'
import { apiClient } from './apiClient'
import { webhookService } from './webhookService'
import * as XLSX from 'xlsx'

// Các loại dữ liệu cần đồng bộ
export const SYNC_DATA_TYPES = {
  PRODUCTS: 'products',
  ORDERS: 'orders',
  CUSTOMERS: 'customers',
  RETURNS: 'returns',
  SUPPLIERS: 'suppliers',
  PURCHASE_ORDERS: 'purchaseOrders',
  SUPPLIER_RETURNS: 'supplierReturns',
  DESTROY_ORDERS: 'destroyOrders',
  RECONCILIATION: 'reconciliation',
  USERS: 'users',
  INVENTORY: 'inventory',
}

// Các phương thức đồng bộ
export const SYNC_METHODS = {
  API: 'api',           // Đồng bộ đến backend API
  LOCAL_STORAGE: 'localStorage', // Lưu vào localStorage
  EXPORT_FILE: 'exportFile',     // Xuất ra file
  WEBHOOK: 'webhook',   // Đăng ký webhook realtime
}

const ADDITIONAL_RESET_KEYS = [
  'apiConfig',
  'Thuần Chay VNCredentials',
  'appSettings',
  'theme',
  'salesChannels',
  'users',
  'currentUser',
  'emailLogs',
  'chatLogs',
  'version_update_dismissed',
  'app_build_hash',
  'app_build_time',
  'app_version',
  'authToken',
]

/**
 * Lấy tất cả dữ liệu từ localStorage (fallback data)
 */
const getLocalStorageData = () => {
  const data = {
    products: [],
    orders: [],
    customers: [],
    returns: [],
    suppliers: [],
    purchaseOrders: [],
    supplierReturns: [],
    destroyOrders: [],
    reconciliation: [],
    users: [],
    inventory: [],
  }

  // Lấy dữ liệu từ localStorage nếu có
  try {
    const savedProducts = localStorage.getItem('products')
    if (savedProducts) data.products = JSON.parse(savedProducts)

    const savedOrders = localStorage.getItem('orders')
    if (savedOrders) data.orders = JSON.parse(savedOrders)

    const savedCustomers = localStorage.getItem('customers')
    if (savedCustomers) data.customers = JSON.parse(savedCustomers)

    const savedReturns = localStorage.getItem('returns')
    if (savedReturns) data.returns = JSON.parse(savedReturns)

    const savedSuppliers = localStorage.getItem('suppliers')
    if (savedSuppliers) data.suppliers = JSON.parse(savedSuppliers)

    const savedUsers = localStorage.getItem('users')
    if (savedUsers) data.users = JSON.parse(savedUsers)
  } catch (error) {
    console.error('Error reading localStorage data:', error)
  }

  return data
}

/**
 * Lấy tất cả dữ liệu từ API
 */
const fetchAllDataFromAPI = async (onProgress) => {
  const data = {
    products: [],
    orders: [],
    customers: [],
    returns: [],
    suppliers: [],
    purchaseOrders: [],
    supplierReturns: [],
    destroyOrders: [],
    reconciliation: [],
    users: [],
    inventory: [],
  }

  const totalSteps = 10
  let currentStep = 0

  const updateProgress = (step, type, count) => {
    currentStep = step
    if (onProgress) {
      onProgress({
        step: currentStep,
        total: totalSteps,
        type,
        count,
        percentage: Math.round((currentStep / totalSteps) * 100),
      })
    }
  }

  try {
    // 1. Lấy sản phẩm
    try {
      const productsResult = await productsApi.getAll({ limit: 10000 })
      data.products = productsResult?.data || productsResult || []
      updateProgress(1, SYNC_DATA_TYPES.PRODUCTS, data.products.length)
    } catch (error) {
      console.warn('Error fetching products:', error)
      updateProgress(1, SYNC_DATA_TYPES.PRODUCTS, 0)
    }

    // 2. Lấy đơn hàng
    try {
      const ordersResult = await ordersApi.getAll({ limit: 10000 })
      data.orders = ordersResult?.data || ordersResult || []
      updateProgress(2, SYNC_DATA_TYPES.ORDERS, data.orders.length)
    } catch (error) {
      console.warn('Error fetching orders:', error)
      updateProgress(2, SYNC_DATA_TYPES.ORDERS, 0)
    }

    // 3. Lấy khách hàng
    try {
      const customersResult = await customersApi.getAll({ limit: 10000 })
      data.customers = customersResult?.data || customersResult || []
      updateProgress(3, SYNC_DATA_TYPES.CUSTOMERS, data.customers.length)
    } catch (error) {
      console.warn('Error fetching customers:', error)
      updateProgress(3, SYNC_DATA_TYPES.CUSTOMERS, 0)
    }

    // 4. Lấy đơn trả hàng
    try {
      const returnsResult = await returnsApi.getAll({ limit: 10000 })
      data.returns = returnsResult?.data || returnsResult || []
      updateProgress(4, SYNC_DATA_TYPES.RETURNS, data.returns.length)
    } catch (error) {
      console.warn('Error fetching returns:', error)
      updateProgress(4, SYNC_DATA_TYPES.RETURNS, 0)
    }

    // 5. Lấy nhà cung cấp (nếu có API)
    try {
      const suppliersResult = await apiClient.get('/suppliers', { limit: 10000 })
      data.suppliers = suppliersResult?.data || suppliersResult || []
      updateProgress(5, SYNC_DATA_TYPES.SUPPLIERS, data.suppliers.length)
    } catch (error) {
      console.warn('Error fetching suppliers:', error)
      updateProgress(5, SYNC_DATA_TYPES.SUPPLIERS, 0)
    }

    // 6. Lấy đơn mua hàng (nếu có API)
    try {
      const purchaseOrdersResult = await apiClient.get('/purchase-orders', { limit: 10000 })
      data.purchaseOrders = purchaseOrdersResult?.data || purchaseOrdersResult || []
      updateProgress(6, SYNC_DATA_TYPES.PURCHASE_ORDERS, data.purchaseOrders.length)
    } catch (error) {
      console.warn('Error fetching purchase orders:', error)
      updateProgress(6, SYNC_DATA_TYPES.PURCHASE_ORDERS, 0)
    }

    // 7. Lấy đơn trả nhà cung cấp (nếu có API)
    try {
      const supplierReturnsResult = await apiClient.get('/supplier-returns', { limit: 10000 })
      data.supplierReturns = supplierReturnsResult?.data || supplierReturnsResult || []
      updateProgress(7, SYNC_DATA_TYPES.SUPPLIER_RETURNS, data.supplierReturns.length)
    } catch (error) {
      console.warn('Error fetching supplier returns:', error)
      updateProgress(7, SYNC_DATA_TYPES.SUPPLIER_RETURNS, 0)
    }

    // 8. Lấy đơn hủy (nếu có API)
    try {
      const destroyOrdersResult = await apiClient.get('/destroy-orders', { limit: 10000 })
      data.destroyOrders = destroyOrdersResult?.data || destroyOrdersResult || []
      updateProgress(8, SYNC_DATA_TYPES.DESTROY_ORDERS, data.destroyOrders.length)
    } catch (error) {
      console.warn('Error fetching destroy orders:', error)
      updateProgress(8, SYNC_DATA_TYPES.DESTROY_ORDERS, 0)
    }

    // 9. Lấy đối soát (nếu có API)
    try {
      const reconciliationResult = await apiClient.get('/reconciliation', { limit: 10000 })
      data.reconciliation = reconciliationResult?.data || reconciliationResult || []
      updateProgress(9, SYNC_DATA_TYPES.RECONCILIATION, data.reconciliation.length)
    } catch (error) {
      console.warn('Error fetching reconciliation:', error)
      updateProgress(9, SYNC_DATA_TYPES.RECONCILIATION, 0)
    }

    // 10. Lấy người dùng (từ localStorage)
    try {
      const savedUsers = localStorage.getItem('users')
      if (savedUsers) {
        data.users = JSON.parse(savedUsers)
      }
      updateProgress(10, SYNC_DATA_TYPES.USERS, data.users.length)
    } catch (error) {
      console.warn('Error fetching users:', error)
      updateProgress(10, SYNC_DATA_TYPES.USERS, 0)
    }

    // Tính toán tồn kho từ sản phẩm
    data.inventory = data.products.map(product => ({
      productId: product.id,
      productName: product.name,
      sku: product.sku,
      stock: product.stock || 0,
      minStock: product.minStock || 0,
      price: product.price || 0,
      totalValue: (product.stock || 0) * (product.price || 0),
      status: (product.stock || 0) <= (product.minStock || 0) ? 'Hết hàng' : 'Còn hàng',
    }))

  } catch (error) {
    console.error('Error fetching all data:', error)
    throw error
  }

  return data
}

/**
 * Đồng bộ dữ liệu đến backend API
 */
const syncToAPI = async (data, targetEndpoint, onProgress, useApiCredentials = false) => {
  const results = {
    success: [],
    failed: [],
    total: 0,
  }

  try {
    // Kiểm tra cấu hình API nếu sử dụng credentials
    if (useApiCredentials) {
      const apiConfig = apiClient.getApiConfig()
      if (!apiConfig.clientId || !apiConfig.secretKey) {
        throw new Error('Vui lòng cấu hình Client ID và Secret Key trong phần Cấu hình API')
      }
      if (!apiConfig.apiUrl) {
        throw new Error('Vui lòng cấu hình API URL trong phần Cấu hình API')
      }
    }

    if (onProgress) {
      onProgress({
        step: 50,
        total: 100,
        type: 'syncing',
        message: 'Đang gửi dữ liệu đến server...',
        percentage: 50,
      })
    }

    // Gửi tất cả dữ liệu đến endpoint đồng bộ
    const response = await apiClient.post(
      targetEndpoint || '/sync',
      {
        data,
        timestamp: new Date().toISOString(),
        version: '1.0.0',
      },
      useApiCredentials
    )

    results.success = response?.success || []
    results.failed = response?.failed || []
    results.total = Object.values(data).reduce((sum, arr) => sum + (Array.isArray(arr) ? arr.length : 0), 0)

    if (onProgress) {
      onProgress({
        step: 100,
        total: 100,
        type: 'complete',
        count: results.total,
        percentage: 100,
      })
    }

    return results
  } catch (error) {
    console.error('Error syncing to API:', error)
    throw error
  }
}

/**
 * Lưu dữ liệu vào localStorage
 */
const syncToLocalStorage = async (data, onProgress) => {
  const results = {
    success: [],
    failed: [],
    total: 0,
  }

  try {
    const totalItems = Object.keys(data).length
    let currentItem = 0

    for (const [key, value] of Object.entries(data)) {
      try {
        localStorage.setItem(key, JSON.stringify(value))
        results.success.push(key)
        currentItem++

        if (onProgress) {
          onProgress({
            step: currentItem,
            total: totalItems,
            type: key,
            count: Array.isArray(value) ? value.length : 1,
            percentage: Math.round((currentItem / totalItems) * 100),
          })
        }
      } catch (error) {
        console.error(`Error saving ${key} to localStorage:`, error)
        results.failed.push({ key, error: error.message })
      }
    }

    // Lưu metadata
    localStorage.setItem('syncMetadata', JSON.stringify({
      lastSync: new Date().toISOString(),
      dataTypes: Object.keys(data),
      totalItems: Object.values(data).reduce((sum, arr) => sum + (Array.isArray(arr) ? arr.length : 0), 0),
    }))

    results.total = Object.values(data).reduce((sum, arr) => sum + (Array.isArray(arr) ? arr.length : 0), 0)

    return results
  } catch (error) {
    console.error('Error syncing to localStorage:', error)
    throw error
  }
}

/**
 * Xuất dữ liệu ra file Excel
 */
const exportToExcel = (data, filename = 'Thuần Chay VN-sync') => {
  try {
    const workbook = XLSX.utils.book_new()

    // Tạo sheet cho mỗi loại dữ liệu
    Object.entries(data).forEach(([key, value]) => {
      if (Array.isArray(value) && value.length > 0) {
        const worksheet = XLSX.utils.json_to_sheet(value)
        XLSX.utils.book_append_sheet(workbook, worksheet, key)
      }
    })

    // Xuất file
    const dateStr = new Date().toISOString().split('T')[0]
    const fileName = `${filename}-${dateStr}.xlsx`
    XLSX.writeFile(workbook, fileName)

    return {
      success: true,
      filename: fileName,
      totalItems: Object.values(data).reduce((sum, arr) => sum + (Array.isArray(arr) ? arr.length : 0), 0),
    }
  } catch (error) {
    console.error('Error exporting to Excel:', error)
    throw error
  }
}

/**
 * Xuất dữ liệu ra file JSON
 */
const exportToJSON = (data, filename = 'Thuần Chay VN-sync') => {
  try {
    const jsonData = {
      metadata: {
        exportDate: new Date().toISOString(),
        version: '1.0.0',
        dataTypes: Object.keys(data),
        totalItems: Object.values(data).reduce((sum, arr) => sum + (Array.isArray(arr) ? arr.length : 0), 0),
      },
      data,
    }

    const jsonString = JSON.stringify(jsonData, null, 2)
    const blob = new Blob([jsonString], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url

    const dateStr = new Date().toISOString().split('T')[0]
    const fileName = `${filename}-${dateStr}.json`
    link.download = fileName
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    return {
      success: true,
      filename: fileName,
      totalItems: jsonData.metadata.totalItems,
    }
  } catch (error) {
    console.error('Error exporting to JSON:', error)
    throw error
  }
}

/**
 * Service chính để đồng bộ tất cả dữ liệu
 */
export const syncService = {
  /**
   * Đồng bộ tất cả dữ liệu
   * @param {Object} options - Tùy chọn đồng bộ
   * @param {string} options.method - Phương thức đồng bộ (api, localStorage, exportFile)
   * @param {string} options.targetEndpoint - Endpoint API nếu method là 'api'
   * @param {string} options.exportFormat - Format xuất file ('excel' hoặc 'json')
   * @param {string} options.filename - Tên file khi export
   * @param {Array} options.dataTypes - Danh sách loại dữ liệu cần đồng bộ (mặc định: tất cả)
   * @param {Function} options.onProgress - Callback để theo dõi tiến trình
   * @param {boolean} options.useLocalStorage - Có sử dụng dữ liệu từ localStorage không
   * @returns {Promise<Object>} Kết quả đồng bộ
   */
  syncAll: async (options = {}) => {
    const {
      method = SYNC_METHODS.LOCAL_STORAGE,
      targetEndpoint = '/sync',
      exportFormat = 'excel',
      filename = 'Thuần Chay VN-sync',
      dataTypes = Object.values(SYNC_DATA_TYPES),
      onProgress,
      useLocalStorage = false,
      useApiCredentials = false,
    } = options

    try {
      if (method === SYNC_METHODS.WEBHOOK) {
        const registration = await webhookService.registerWebhook(options.webhookConfig || {})
        return {
          success: true,
          method,
          results: registration,
          dataSummary: {},
          timestamp: new Date().toISOString(),
        }
      }

      // Bước 1: Lấy dữ liệu
      let allData
      if (useLocalStorage) {
        allData = getLocalStorageData()
        if (onProgress) {
          onProgress({
            step: 0,
            total: 100,
            type: 'fetching',
            message: 'Đang lấy dữ liệu từ localStorage...',
            percentage: 0,
          })
        }
      } else {
        allData = await fetchAllDataFromAPI(onProgress)
      }

      // Lọc dữ liệu theo dataTypes được chọn
      const filteredData = {}
      dataTypes.forEach(type => {
        if (allData[type]) {
          filteredData[type] = allData[type]
        }
      })

      // Bước 2: Đồng bộ theo phương thức đã chọn
      let results

      switch (method) {
        case SYNC_METHODS.API:
          results = await syncToAPI(filteredData, targetEndpoint, onProgress, options.useApiCredentials || false)
          break

        case SYNC_METHODS.LOCAL_STORAGE:
          results = await syncToLocalStorage(filteredData, onProgress)
          break

        case SYNC_METHODS.EXPORT_FILE:
          if (exportFormat === 'json') {
            results = exportToJSON(filteredData, filename)
          } else {
            results = exportToExcel(filteredData, filename)
          }
          break

        default:
          throw new Error(`Phương thức đồng bộ không hợp lệ: ${method}`)
      }

      return {
        success: true,
        method,
        results,
        dataSummary: Object.entries(filteredData).reduce((acc, [key, value]) => {
          acc[key] = Array.isArray(value) ? value.length : 0
          return acc
        }, {}),
        timestamp: new Date().toISOString(),
      }
    } catch (error) {
      console.error('Sync error:', error)
      return {
        success: false,
        error: error.message,
        method,
        timestamp: new Date().toISOString(),
      }
    }
  },

  /**
   * Lấy thông tin đồng bộ cuối cùng
   */
  getLastSyncInfo: () => {
    try {
      const metadata = localStorage.getItem('syncMetadata')
      return metadata ? JSON.parse(metadata) : null
    } catch (error) {
      console.error('Error getting last sync info:', error)
      return null
    }
  },

  /**
   * Xóa dữ liệu đồng bộ trong localStorage
   */
  clearLocalStorageSync: () => {
    try {
      const dataTypes = Object.values(SYNC_DATA_TYPES)
      dataTypes.forEach(type => {
        localStorage.removeItem(type)
      })
      localStorage.removeItem('syncMetadata')
      return { success: true }
    } catch (error) {
      console.error('Error clearing localStorage sync:', error)
      return { success: false, error: error.message }
    }
  },

  resetApplicationData: () => {
    try {
      const removedKeys = new Set()

      const dataTypes = Object.values(SYNC_DATA_TYPES)
      dataTypes.forEach(type => {
        if (localStorage.getItem(type) !== null) {
          localStorage.removeItem(type)
          removedKeys.add(type)
        }
      })

      if (localStorage.getItem('syncMetadata') !== null) {
        localStorage.removeItem('syncMetadata')
        removedKeys.add('syncMetadata')
      }

      ADDITIONAL_RESET_KEYS.forEach(key => {
        if (localStorage.getItem(key) !== null) {
          localStorage.removeItem(key)
          removedKeys.add(key)
        }
      })

      localStorage.setItem('disableFallbackData', 'true')
      removedKeys.add('disableFallbackData')

      return {
        success: true,
        removedKeys: Array.from(removedKeys),
        timestamp: new Date().toISOString(),
      }
    } catch (error) {
      console.error('Error resetting application data:', error)
      return { success: false, error: error.message }
    }
  },

  getWebhookConfig: () => webhookService.getConfig(),

  saveWebhookConfig: (config) => webhookService.saveConfig(config),

  clearWebhookConfig: () => webhookService.clearConfig(),

  registerWebhook: (config) => webhookService.registerWebhook(config),

  unregisterWebhook: (id) => webhookService.unregisterWebhook(id),

  listRemoteWebhooks: () => webhookService.listRemoteWebhooks(),

  getWebhookLogs: () => webhookService.getLogs(),

  clearWebhookLogs: () => webhookService.clearLogs(),

  getWebhookMetadata: () => webhookService.getMetadata(),

  processWebhookPayload: (payload) => webhookService.processIncomingEvent(payload),

  simulateWebhookPayload: (payload) => webhookService.simulateIncomingPayload(payload),
}

export default syncService


