/**
 * Returns API Service
 * CRUD operations cho Returns (Hàng trả)
 */
import { apiClient } from './apiClient'

const ENDPOINT = '/returns'

export const returnsApi = {
  /**
   * Lấy danh sách tất cả đơn trả hàng
   * @param {Object} params - Query parameters (page, limit, search, status, dateFrom, dateTo)
   * @returns {Promise<Object>} { data: Array, total: number, page: number, limit: number }
   */
  getAll: async (params = {}) => {
    return apiClient.get(ENDPOINT, params)
  },

  /**
   * Lấy thông tin một đơn trả hàng theo ID
   * @param {string|number} id - Return ID hoặc mã trả hàng
   * @returns {Promise<Object>} Return object
   */
  getById: async (id) => {
    return apiClient.get(`${ENDPOINT}/${id}`)
  },

  /**
   * Tạo đơn trả hàng mới
   * @param {Object} returnData - Return data
   * @returns {Promise<Object>} Created return
   */
  create: async (returnData) => {
    return apiClient.post(ENDPOINT, returnData)
  },

  /**
   * Cập nhật đơn trả hàng
   * @param {string|number} id - Return ID
   * @param {Object} returnData - Updated return data
   * @returns {Promise<Object>} Updated return
   */
  update: async (id, returnData) => {
    return apiClient.put(`${ENDPOINT}/${id}`, returnData)
  },

  /**
   * Xóa đơn trả hàng
   * @param {string|number} id - Return ID
   * @returns {Promise<Object>} Success message
   */
  delete: async (id) => {
    return apiClient.delete(`${ENDPOINT}/${id}`)
  },

  /**
   * Cập nhật trạng thái đơn trả hàng
   * @param {string|number} id - Return ID
   * @param {string} status - New status
   * @returns {Promise<Object>} Updated return
   */
  updateStatus: async (id, status) => {
    return apiClient.patch(`${ENDPOINT}/${id}/status`, { status })
  },

  /**
   * Tìm kiếm đơn trả hàng
   * @param {string} searchTerm - Search term
   * @param {Object} filters - Additional filters
   * @returns {Promise<Array>} Array of returns
   */
  search: async (searchTerm, filters = {}) => {
    return apiClient.get(ENDPOINT, {
      search: searchTerm,
      ...filters,
    })
  },

  /**
   * Lấy đơn trả hàng theo đơn hàng gốc
   * @param {string|number} orderId - Original order ID
   * @returns {Promise<Array>} Array of returns
   */
  getByOrder: async (orderId) => {
    return apiClient.get(ENDPOINT, { orderId })
  },

  /**
   * Lấy đơn trả hàng theo khách hàng
   * @param {string|number} customerId - Customer ID
   * @returns {Promise<Array>} Array of returns
   */
  getByCustomer: async (customerId) => {
    return apiClient.get(ENDPOINT, { customerId })
  },

  /**
   * Lấy đơn trả hàng theo khoảng thời gian
   * @param {string} dateFrom - Start date (YYYY-MM-DD)
   * @param {string} dateTo - End date (YYYY-MM-DD)
   * @returns {Promise<Array>} Array of returns
   */
  getByDateRange: async (dateFrom, dateTo) => {
    return apiClient.get(ENDPOINT, { dateFrom, dateTo })
  },
}




