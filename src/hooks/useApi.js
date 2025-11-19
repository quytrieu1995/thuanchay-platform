import { useState, useEffect, useCallback } from 'react'

/**
 * Custom hook để quản lý API calls với loading và error states
 * @param {Function} apiFunction - API function to call
 * @param {Array} dependencies - Dependencies array for useEffect
 * @param {boolean} immediate - Whether to call API immediately on mount
 */
export function useApi(apiFunction, dependencies = [], immediate = true) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(immediate)
  const [error, setError] = useState(null)

  const execute = useCallback(async (...args) => {
    try {
      setLoading(true)
      setError(null)
      const result = await apiFunction(...args)
      setData(result)
      return result
    } catch (err) {
      setError(err.message || 'Có lỗi xảy ra')
      throw err
    } finally {
      setLoading(false)
    }
  }, [apiFunction])

  useEffect(() => {
    if (immediate) {
      execute()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies)

  const reset = useCallback(() => {
    setData(null)
    setError(null)
    setLoading(false)
  }, [])

  return { data, loading, error, execute, reset }
}

/**
 * Custom hook cho CRUD operations
 */
export function useCrud(apiService) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchAll = useCallback(async (params = {}) => {
    try {
      setLoading(true)
      setError(null)
      const result = await apiService.getAll(params)
      // Handle both paginated and non-paginated responses
      const data = result.data || result
      setItems(Array.isArray(data) ? data : [])
      return result
    } catch (err) {
      // Không set error cho API_UNAVAILABLE hoặc API_DISABLED để cho phép fallback
      const errorMessage = err.message || ''
      if (errorMessage !== 'API_UNAVAILABLE' && errorMessage !== 'API_DISABLED') {
        const errorMsg = errorMessage || 'Không thể tải dữ liệu'
        setError(errorMsg)
      }
      throw err
    } finally {
      setLoading(false)
    }
  }, [apiService])

  const fetchById = useCallback(async (id) => {
    try {
      setLoading(true)
      setError(null)
      const result = await apiService.getById(id)
      return result
    } catch (err) {
      const errorMessage = err.message || 'Không thể tải dữ liệu'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [apiService])

  const create = useCallback(async (data) => {
    try {
      setLoading(true)
      setError(null)
      const result = await apiService.create(data)
      setItems(prev => [...prev, result])
      return result
    } catch (err) {
      const errorMessage = err.message || 'Không thể tạo mới'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [apiService])

  const update = useCallback(async (id, data) => {
    try {
      setLoading(true)
      setError(null)
      const result = await apiService.update(id, data)
      setItems(prev => prev.map(item => item.id === id ? result : item))
      return result
    } catch (err) {
      const errorMessage = err.message || 'Không thể cập nhật'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [apiService])

  const remove = useCallback(async (id) => {
    try {
      setLoading(true)
      setError(null)
      await apiService.delete(id)
      setItems(prev => prev.filter(item => item.id !== id))
      return true
    } catch (err) {
      const errorMessage = err.message || 'Không thể xóa'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [apiService])

  return {
    items,
    loading,
    error,
    fetchAll,
    fetchById,
    create,
    update,
    remove,
    setItems,
  }
}

