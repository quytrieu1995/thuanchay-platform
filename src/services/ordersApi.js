/**
 * Orders API Service
 * CRUD operations cho Orders
 */
import { apiClient } from './apiClient'

const ENDPOINT = '/orders'

export const ordersApi = {
  /**
   * Lấy danh sách tất cả đơn hàng
   * @param {Object} params - Query parameters (page, limit, search, status, channel, dateFrom, dateTo)
   * @returns {Promise<Object>} { data: Array, total: number, page: number, limit: number }
   */
  getAll: async (params = {}) => {
    return apiClient.get(ENDPOINT, params)
  },

  /**
   * Lấy thông tin một đơn hàng theo ID
   * @param {string|number} id - Order ID hoặc mã hóa đơn
   * @returns {Promise<Object>} Order object
   */
  getById: async (id) => {
    return apiClient.get(`${ENDPOINT}/${id}`)
  },

  /**
   * Tạo đơn hàng mới
   * @param {Object} orderData - Order data
   * @returns {Promise<Object>} Created order
   */
  create: async (orderData) => {
    return apiClient.post(ENDPOINT, orderData)
  },

  /**
   * Cập nhật đơn hàng
   * @param {string|number} id - Order ID
   * @param {Object} orderData - Updated order data
   * @returns {Promise<Object>} Updated order
   */
  update: async (id, orderData) => {
    return apiClient.put(`${ENDPOINT}/${id}`, orderData)
  },

  /**
   * Xóa đơn hàng
   * @param {string|number} id - Order ID
   * @returns {Promise<Object>} Success message
   */
  delete: async (id) => {
    return apiClient.delete(`${ENDPOINT}/${id}`)
  },

  /**
   * Cập nhật trạng thái đơn hàng
   * @param {string|number} id - Order ID
   * @param {string} status - New status
   * @returns {Promise<Object>} Updated order
   */
  updateStatus: async (id, status) => {
    return apiClient.patch(`${ENDPOINT}/${id}/status`, { status })
  },

  /**
   * Tìm kiếm đơn hàng
   * @param {string} searchTerm - Search term
   * @param {Object} filters - Additional filters
   * @returns {Promise<Array>} Array of orders
   */
  search: async (searchTerm, filters = {}) => {
    return apiClient.get(ENDPOINT, {
      search: searchTerm,
      ...filters,
    })
  },

  /**
   * Lấy đơn hàng theo khách hàng
   * @param {string|number} customerId - Customer ID
   * @returns {Promise<Array>} Array of orders
   */
  getByCustomer: async (customerId) => {
    return apiClient.get(ENDPOINT, { customerId })
  },

  /**
   * Lấy đơn hàng theo kênh bán hàng
   * @param {string} channel - Sales channel
   * @returns {Promise<Array>} Array of orders
   */
  getByChannel: async (channel) => {
    return apiClient.get(ENDPOINT, { channel })
  },

  /**
   * Lấy đơn hàng theo khoảng thời gian
   * @param {string} dateFrom - Start date (YYYY-MM-DD)
   * @param {string} dateTo - End date (YYYY-MM-DD)
   * @returns {Promise<Array>} Array of orders
   */
  getByDateRange: async (dateFrom, dateTo) => {
    return apiClient.get(ENDPOINT, { dateFrom, dateTo })
  },
}




