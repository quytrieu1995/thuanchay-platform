/**
 * API Client Utility
 * Xử lý tất cả các request HTTP với error handling và interceptors
 */

// Kiểm tra xem có muốn disable API không (cho development)
const DISABLE_API = import.meta.env.VITE_DISABLE_API === 'true' || false

const FALLBACK_API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'
const THUAN_CHAY_VN_DEFAULT_API_URL = 'https://public.thuanchayvn.vn'
const THUAN_CHAY_VN_TOKEN_ENDPOINT = 'https://id.thuanchayvn.vn/connect/token'
const AUTH_TOKEN_KEY = 'authToken'
const AUTH_TOKEN_EXPIRES_KEY = 'authTokenExpires'
const CREDENTIALS_STORAGE_KEY = 'ThuanChayVNCredentials'
const API_CONFIG_KEY = 'apiConfig'

const getNowInSeconds = () => Math.floor(Date.now() / 1000)

class ApiClient {
  constructor(baseURL = FALLBACK_API_BASE_URL) {
    this.baseURL = baseURL
  }

  /**
   * Tạo headers cho request
   */
  getHeaders(useApiCredentials = false) {
    const headers = {
      'Content-Type': 'application/json',
    }

    // Nếu sử dụng API credentials (client_ID và secret key)
    if (useApiCredentials) {
      const token = this.getStoredToken()
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
        const credentials = this.getThuanChayVNCredentials()
        if (credentials?.storeDomain) {
          headers['Retailer'] = credentials.storeDomain
        }
      }
    } else {
      // Thêm token nếu có (cho authentication thông thường)
      const token = localStorage.getItem(AUTH_TOKEN_KEY)
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }
    }

    return headers
  }

  /**
   * Lấy cấu hình API từ localStorage
   */
  getApiConfig() {
    try {
      const stored = localStorage.getItem(API_CONFIG_KEY)
      const credentials = this.getThuanChayVNCredentials()
      return stored ? {
        ...JSON.parse(stored),
        storeDomain: credentials?.storeDomain || '',
      } : {
        apiUrl: this.baseURL,
        storeDomain: credentials?.storeDomain || '',
      }
    } catch {
      return {
        apiUrl: this.baseURL,
        clientId: '',
        secretKey: '',
      }
    }
  }

  /**
   * Lấy base URL từ cấu hình
   */
  getBaseURL() {
    const credentials = this.getThuanChayVNCredentials()
    if (credentials?.useThuanChayVNApi) {
      return THUAN_CHAY_VN_DEFAULT_API_URL
    }
    const config = this.getApiConfig()
    return config.apiUrl || this.baseURL
  }

  getThuanChayVNCredentials() {
    try {
      const raw = localStorage.getItem(CREDENTIALS_STORAGE_KEY)
      return raw ? JSON.parse(raw) : null
    } catch {
      return null
    }
  }

  saveThuanChayVNCredentials({ storeDomain }) {
    const payload = {
      storeDomain: storeDomain || '',
      useThuanChayVNApi: Boolean(storeDomain),
      savedAt: new Date().toISOString(),
    }
    localStorage.setItem(CREDENTIALS_STORAGE_KEY, JSON.stringify(payload))
  }

  clearThuanChayVNCredentials() {
    localStorage.removeItem(CREDENTIALS_STORAGE_KEY)
    localStorage.removeItem(AUTH_TOKEN_KEY)
    localStorage.removeItem(AUTH_TOKEN_EXPIRES_KEY)
  }

  setAuthToken(token, expiresInSeconds) {
    localStorage.setItem(AUTH_TOKEN_KEY, token)
    if (expiresInSeconds) {
      const expiresAt = getNowInSeconds() + Number(expiresInSeconds) - 30 // trừ 30s margin
      localStorage.setItem(AUTH_TOKEN_EXPIRES_KEY, expiresAt.toString())
    } else {
      localStorage.removeItem(AUTH_TOKEN_EXPIRES_KEY)
    }
  }

  saveManualToken(token, expiresAtSeconds = null) {
    if (!token) {
      localStorage.removeItem(AUTH_TOKEN_KEY)
      localStorage.removeItem(AUTH_TOKEN_EXPIRES_KEY)
      return
    }
    localStorage.setItem(AUTH_TOKEN_KEY, token)
    if (expiresAtSeconds) {
      localStorage.setItem(AUTH_TOKEN_EXPIRES_KEY, expiresAtSeconds.toString())
    } else {
      localStorage.removeItem(AUTH_TOKEN_EXPIRES_KEY)
    }
  }

  getStoredToken() {
    const token = localStorage.getItem(AUTH_TOKEN_KEY)
    if (!token) return null

    const expiresRaw = localStorage.getItem(AUTH_TOKEN_EXPIRES_KEY)
    if (!expiresRaw) return token

    const expiresAt = Number(expiresRaw)
    if (Number.isNaN(expiresAt)) return token

    if (getNowInSeconds() >= expiresAt) {
      localStorage.removeItem(AUTH_TOKEN_KEY)
      localStorage.removeItem(AUTH_TOKEN_EXPIRES_KEY)
      return null
    }

    return token
  }

  async authenticateThuanChayVN(credentials = null) {
    throw new Error('Không hỗ trợ tạo token tự động. Vui lòng nhập token Thuần Chay VN thủ công.')
  }

  async ensureThuanChayVNToken() {
    const token = this.getStoredToken()
    if (token) {
      return token
    }
    throw new Error('Chưa có token Thuần Chay VN. Vui lòng nhập token thủ công trong cấu hình đồng bộ.')
  }

  /**
   * Xử lý response
   */
  async handleResponse(response) {
    if (!response.ok) {
      let errorMessage = response.statusText || 'Có lỗi xảy ra'
      try {
        const error = await response.json()
        errorMessage = error.message || error.error || errorMessage
      } catch {
        // Nếu không parse được JSON, dùng statusText
      }
      throw new Error(errorMessage || `HTTP error! status: ${response.status}`)
    }

    // Nếu response không có body, return null
    const contentType = response.headers.get('content-type')
    if (!contentType || !contentType.includes('application/json')) {
      return null
    }

    return response.json()
  }

  /**
   * GET request
   */
  async get(endpoint, params = {}, useApiCredentials = false) {
    // Nếu API bị disable, throw error ngay để trigger fallback
    if (DISABLE_API) {
      throw new Error('API_DISABLED')
    }

    try {
      if (useApiCredentials) {
        await this.ensureThuanChayVNToken()
      }
      const baseURL = useApiCredentials ? this.getBaseURL() : this.baseURL
      const url = new URL(`${baseURL}${endpoint}`)
      Object.keys(params).forEach(key => {
        if (params[key] !== null && params[key] !== undefined) {
          url.searchParams.append(key, params[key])
        }
      })

      const response = await fetch(url, {
        method: 'GET',
        headers: this.getHeaders(useApiCredentials),
      })

      return this.handleResponse(response)
    } catch (error) {
      // Xử lý lỗi network (Failed to fetch)
      if (error.message === 'Failed to fetch' || error.name === 'TypeError') {
        throw new Error('API_UNAVAILABLE')
      }
      console.error('GET request failed:', error)
      throw error
    }
  }

  /**
   * POST request
   */
  async post(endpoint, data = {}, useApiCredentials = false) {
    try {
      if (useApiCredentials) {
        await this.ensureThuanChayVNToken()
      }
      const baseURL = useApiCredentials ? this.getBaseURL() : this.baseURL
      const response = await fetch(`${baseURL}${endpoint}`, {
        method: 'POST',
        headers: this.getHeaders(useApiCredentials),
        body: JSON.stringify(data),
      })

      return this.handleResponse(response)
    } catch (error) {
      if (error.message === 'Failed to fetch' || error.name === 'TypeError') {
        throw new Error('Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng hoặc cấu hình API.')
      }
      console.error('POST request failed:', error)
      throw error
    }
  }

  /**
   * PUT request
   */
  async put(endpoint, data = {}, useApiCredentials = false) {
    try {
      if (useApiCredentials) {
        await this.ensureThuanChayVNToken()
      }
      const baseURL = useApiCredentials ? this.getBaseURL() : this.baseURL
      const response = await fetch(`${baseURL}${endpoint}`, {
        method: 'PUT',
        headers: this.getHeaders(useApiCredentials),
        body: JSON.stringify(data),
      })

      return this.handleResponse(response)
    } catch (error) {
      if (error.message === 'Failed to fetch' || error.name === 'TypeError') {
        throw new Error('Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng hoặc cấu hình API.')
      }
      console.error('PUT request failed:', error)
      throw error
    }
  }

  /**
   * PATCH request
   */
  async patch(endpoint, data = {}, useApiCredentials = false) {
    try {
      if (useApiCredentials) {
        await this.ensureThuanChayVNToken()
      }
      const baseURL = useApiCredentials ? this.getBaseURL() : this.baseURL
      const response = await fetch(`${baseURL}${endpoint}`, {
        method: 'PATCH',
        headers: this.getHeaders(useApiCredentials),
        body: JSON.stringify(data),
      })

      return this.handleResponse(response)
    } catch (error) {
      if (error.message === 'Failed to fetch' || error.name === 'TypeError') {
        throw new Error('Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng hoặc cấu hình API.')
      }
      console.error('PATCH request failed:', error)
      throw error
    }
  }

  /**
   * DELETE request
   */
  async delete(endpoint, useApiCredentials = false) {
    try {
      if (useApiCredentials) {
        await this.ensureThuanChayVNToken()
      }
      const baseURL = useApiCredentials ? this.getBaseURL() : this.baseURL
      const response = await fetch(`${baseURL}${endpoint}`, {
        method: 'DELETE',
        headers: this.getHeaders(useApiCredentials),
      })

      return this.handleResponse(response)
    } catch (error) {
      if (error.message === 'Failed to fetch' || error.name === 'TypeError') {
        throw new Error('Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng hoặc cấu hình API.')
      }
      console.error('DELETE request failed:', error)
      throw error
    }
  }

  testThuanChayVNToken() {
    const token = this.getStoredToken()
    if (!token) {
      throw new Error('Chưa có token Thuần Chay VN')
    }
    const credentials = this.getThuanChayVNCredentials()
    if (!credentials?.storeDomain) {
      throw new Error('Chưa cấu hình tên gian hàng Thuần Chay VN')
    }
    const expires = localStorage.getItem(AUTH_TOKEN_EXPIRES_KEY)
    return {
      tokenPreview: `${token.slice(0, 8)}...${token.slice(-4)}`,
      expiresAt: expires ? new Date(Number(expires) * 1000).toISOString() : null,
      storeDomain: credentials.storeDomain,
    }
  }
}

// Export singleton instance
export const apiClient = new ApiClient()

// Export class để có thể tạo instance mới nếu cần
export default ApiClient

export const DEFAULT_API_BASE_URL = FALLBACK_API_BASE_URL
export const THUAN_CHAY_VN_API_BASE_URL = THUAN_CHAY_VN_DEFAULT_API_URL
export const THUAN_CHAY_VN_TOKEN_ENDPOINT_URL = THUAN_CHAY_VN_TOKEN_ENDPOINT


