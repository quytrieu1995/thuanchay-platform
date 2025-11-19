/**
 * Products API Service
 * CRUD operations cho Products
 */
import { apiClient } from './apiClient'

const ENDPOINT = '/products'

export const productsApi = {
  /**
   * Lấy danh sách tất cả sản phẩm
   * @param {Object} params - Query parameters (page, limit, search, category, status)
   * @returns {Promise<Object>} { data: Array, total: number, page: number, limit: number }
   */
  getAll: async (params = {}) => {
    return apiClient.get(ENDPOINT, params)
  },

  /**
   * Lấy thông tin một sản phẩm theo ID
   * @param {string|number} id - Product ID
   * @returns {Promise<Object>} Product object
   */
  getById: async (id) => {
    return apiClient.get(`${ENDPOINT}/${id}`)
  },

  /**
   * Tạo sản phẩm mới
   * @param {Object} productData - Product data
   * @returns {Promise<Object>} Created product
   */
  create: async (productData) => {
    return apiClient.post(ENDPOINT, productData)
  },

  /**
   * Cập nhật sản phẩm
   * @param {string|number} id - Product ID
   * @param {Object} productData - Updated product data
   * @returns {Promise<Object>} Updated product
   */
  update: async (id, productData) => {
    return apiClient.put(`${ENDPOINT}/${id}`, productData)
  },

  /**
   * Xóa sản phẩm
   * @param {string|number} id - Product ID
   * @returns {Promise<Object>} Success message
   */
  delete: async (id) => {
    return apiClient.delete(`${ENDPOINT}/${id}`)
  },

  /**
   * Tìm kiếm sản phẩm
   * @param {string} searchTerm - Search term
   * @param {Object} filters - Additional filters
   * @returns {Promise<Array>} Array of products
   */
  search: async (searchTerm, filters = {}) => {
    return apiClient.get(ENDPOINT, {
      search: searchTerm,
      ...filters,
    })
  },

  /**
   * Cập nhật số lượng tồn kho
   * @param {string|number} id - Product ID
   * @param {number} quantity - New stock quantity
   * @returns {Promise<Object>} Updated product
   */
  updateStock: async (id, quantity) => {
    return apiClient.patch(`${ENDPOINT}/${id}/stock`, { stock: quantity })
  },

  /**
   * Lấy sản phẩm theo danh mục
   * @param {string} category - Category name
   * @returns {Promise<Array>} Array of products
   */
  getByCategory: async (category) => {
    return apiClient.get(ENDPOINT, { category })
  },
}




