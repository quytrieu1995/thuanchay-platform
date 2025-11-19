/**
 * Customers API Service
 * CRUD operations cho Customers
 */
import { apiClient } from './apiClient'

const ENDPOINT = '/customers'

export const customersApi = {
  /**
   * Lấy danh sách tất cả khách hàng
   * @param {Object} params - Query parameters (page, limit, search, status)
   * @returns {Promise<Object>} { data: Array, total: number, page: number, limit: number }
   */
  getAll: async (params = {}) => {
    return apiClient.get(ENDPOINT, params)
  },

  /**
   * Lấy thông tin một khách hàng theo ID
   * @param {string|number} id - Customer ID
   * @returns {Promise<Object>} Customer object
   */
  getById: async (id) => {
    return apiClient.get(`${ENDPOINT}/${id}`)
  },

  /**
   * Tạo khách hàng mới
   * @param {Object} customerData - Customer data
   * @returns {Promise<Object>} Created customer
   */
  create: async (customerData) => {
    return apiClient.post(ENDPOINT, customerData)
  },

  /**
   * Cập nhật khách hàng
   * @param {string|number} id - Customer ID
   * @param {Object} customerData - Updated customer data
   * @returns {Promise<Object>} Updated customer
   */
  update: async (id, customerData) => {
    return apiClient.put(`${ENDPOINT}/${id}`, customerData)
  },

  /**
   * Xóa khách hàng
   * @param {string|number} id - Customer ID
   * @returns {Promise<Object>} Success message
   */
  delete: async (id) => {
    return apiClient.delete(`${ENDPOINT}/${id}`)
  },

  /**
   * Tìm kiếm khách hàng
   * @param {string} searchTerm - Search term
   * @param {Object} filters - Additional filters
   * @returns {Promise<Array>} Array of customers
   */
  search: async (searchTerm, filters = {}) => {
    return apiClient.get(ENDPOINT, {
      search: searchTerm,
      ...filters,
    })
  },

  /**
   * Lấy lịch sử đơn hàng của khách hàng
   * @param {string|number} customerId - Customer ID
   * @returns {Promise<Array>} Array of orders
   */
  getOrders: async (customerId) => {
    return apiClient.get(`${ENDPOINT}/${customerId}/orders`)
  },

  /**
   * Cập nhật trạng thái khách hàng
   * @param {string|number} id - Customer ID
   * @param {string} status - New status
   * @returns {Promise<Object>} Updated customer
   */
  updateStatus: async (id, status) => {
    return apiClient.patch(`${ENDPOINT}/${id}/status`, { status })
  },
}




