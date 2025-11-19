import { useState, useEffect, useCallback } from 'react'

const parseStoredList = (key) => {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (Array.isArray(parsed)) return parsed
    if (parsed && Array.isArray(parsed.data)) return parsed.data
    return []
  } catch (error) {
    console.error(`Error parsing localStorage key ${key}:`, error)
    return []
  }
}

const useSyncedData = () => {
  const loadData = useCallback(() => ({
    orders: parseStoredList('orders'),
    products: parseStoredList('products'),
    customers: parseStoredList('customers'),
    returns: parseStoredList('returns'),
    inventory: parseStoredList('inventory'),
    suppliers: parseStoredList('suppliers'),
    purchaseOrders: parseStoredList('purchaseOrders'),
    supplierReturns: parseStoredList('supplierReturns'),
    destroyOrders: parseStoredList('destroyOrders'),
  }), [])

  const [data, setData] = useState(loadData)

  useEffect(() => {
    setData(loadData())
  }, [loadData])

  useEffect(() => {
    const handler = () => setData(loadData())
    window.addEventListener('Thuần Chay VN-data-updated', handler)
    return () => window.removeEventListener('Thuần Chay VN-data-updated', handler)
  }, [loadData])

  return data
}

export default useSyncedData

