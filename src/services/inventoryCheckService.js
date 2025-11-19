// Service quản lý kiểm kho và cân kho

const INVENTORY_CHECKS_KEY = 'kv_inventory_checks_v1'
const INVENTORY_CHECK_ITEMS_KEY = 'kv_inventory_check_items_v1'

// Lấy danh sách phiếu kiểm kho
export const getInventoryChecks = () => {
  try {
    const raw = localStorage.getItem(INVENTORY_CHECKS_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

// Lưu danh sách phiếu kiểm kho
export const saveInventoryChecks = (checks) => {
  localStorage.setItem(INVENTORY_CHECKS_KEY, JSON.stringify(checks))
}

// Tạo phiếu kiểm kho mới
export const createInventoryCheck = (checkData) => {
  const checks = getInventoryChecks()
  const newCheck = {
    ...checkData,
    id: `ic_${Date.now()}`,
    code: `PK${Date.now().toString().slice(-8)}`,
    status: 'draft', // draft, in_progress, completed, cancelled
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  saveInventoryChecks([...checks, newCheck])
  return newCheck
}

// Cập nhật phiếu kiểm kho
export const updateInventoryCheck = (id, updates) => {
  const checks = getInventoryChecks()
  const updated = checks.map(check =>
    check.id === id ? { ...check, ...updates, updatedAt: new Date().toISOString() } : check
  )
  saveInventoryChecks(updated)
  return updated.find(check => check.id === id)
}

// Xóa phiếu kiểm kho
export const deleteInventoryCheck = (id) => {
  const checks = getInventoryChecks()
  const filtered = checks.filter(check => check.id !== id)
  saveInventoryChecks(filtered)
  
  // Xóa các item liên quan
  const items = getInventoryCheckItems()
  const filteredItems = items.filter(item => item.checkId !== id)
  saveInventoryCheckItems(filteredItems)
}

// Lấy chi tiết phiếu kiểm kho
export const getInventoryCheckById = (id) => {
  const checks = getInventoryChecks()
  return checks.find(check => check.id === id)
}

// Lấy danh sách item trong phiếu kiểm kho
export const getInventoryCheckItems = (checkId = null) => {
  try {
    const raw = localStorage.getItem(INVENTORY_CHECK_ITEMS_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    const items = Array.isArray(parsed) ? parsed : []
    if (checkId) {
      return items.filter(item => item.checkId === checkId)
    }
    return items
  } catch {
    return []
  }
}

// Lưu danh sách item kiểm kho
export const saveInventoryCheckItems = (items) => {
  localStorage.setItem(INVENTORY_CHECK_ITEMS_KEY, JSON.stringify(items))
}

// Thêm item vào phiếu kiểm kho
export const addInventoryCheckItem = (itemData) => {
  const items = getInventoryCheckItems()
  const newItem = {
    ...itemData,
    id: `ici_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    createdAt: new Date().toISOString(),
  }
  saveInventoryCheckItems([...items, newItem])
  return newItem
}

// Cập nhật item kiểm kho
export const updateInventoryCheckItem = (id, updates) => {
  const items = getInventoryCheckItems()
  const updated = items.map(item =>
    item.id === id ? { ...item, ...updates } : item
  )
  saveInventoryCheckItems(updated)
  return updated.find(item => item.id === id)
}

// Xóa item kiểm kho
export const deleteInventoryCheckItem = (id) => {
  const items = getInventoryCheckItems()
  const filtered = items.filter(item => item.id !== id)
  saveInventoryCheckItems(filtered)
}

// Hoàn thành phiếu kiểm kho và cập nhật tồn kho
export const completeInventoryCheck = (checkId, updateStock = true) => {
  const check = getInventoryCheckById(checkId)
  if (!check) throw new Error('Không tìm thấy phiếu kiểm kho')

  const items = getInventoryCheckItems(checkId)
  
  // Tính toán chênh lệch
  let totalDifference = 0
  let totalValue = 0
  
  items.forEach(item => {
    const difference = (item.actualQuantity || 0) - (item.systemQuantity || 0)
    totalDifference += difference
    totalValue += difference * (item.unitPrice || 0)
  })

  // Cập nhật trạng thái phiếu
  const updatedCheck = updateInventoryCheck(checkId, {
    status: 'completed',
    completedAt: new Date().toISOString(),
    totalItems: items.length,
    totalDifference,
    totalValue,
  })

  // Cập nhật tồn kho nếu được yêu cầu
  if (updateStock) {
    // Lưu thông tin cập nhật tồn kho vào localStorage
    // Trong thực tế, đây sẽ gọi API để cập nhật tồn kho
    const stockUpdates = items.map(item => ({
      productId: item.productId,
      productSku: item.productSku,
      newQuantity: item.actualQuantity,
      oldQuantity: item.systemQuantity,
      difference: (item.actualQuantity || 0) - (item.systemQuantity || 0),
    }))
    
    // Lưu vào localStorage để có thể xử lý sau
    localStorage.setItem(`stock_update_${checkId}`, JSON.stringify(stockUpdates))
  }

  return updatedCheck
}

// Lấy lịch sử kiểm kho
export const getInventoryCheckHistory = (limit = 50) => {
  const checks = getInventoryChecks()
  return checks
    .filter(check => check.status === 'completed')
    .sort((a, b) => new Date(b.completedAt || b.createdAt) - new Date(a.completedAt || a.createdAt))
    .slice(0, limit)
}

