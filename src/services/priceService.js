// Service quản lý thiết lập giá cho nhóm sản phẩm và nhóm khách hàng

const PRICE_LISTS_KEY = 'kv_price_lists_v1'
const PRICE_RULES_KEY = 'kv_price_rules_v1'

// Lấy danh sách bảng giá
export const getPriceLists = () => {
  try {
    const raw = localStorage.getItem(PRICE_LISTS_KEY)
    if (!raw) {
      // Tạo bảng giá mặc định
      const defaultPriceList = {
        id: 'default',
        name: 'Bảng giá chung',
        description: 'Bảng giá mặc định cho tất cả khách hàng',
        isDefault: true,
        createdAt: new Date().toISOString(),
      }
      localStorage.setItem(PRICE_LISTS_KEY, JSON.stringify([defaultPriceList]))
      return [defaultPriceList]
    }
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

// Lưu danh sách bảng giá
export const savePriceLists = (priceLists) => {
  localStorage.setItem(PRICE_LISTS_KEY, JSON.stringify(priceLists))
}

// Tạo bảng giá mới
export const createPriceList = (priceList) => {
  const priceLists = getPriceLists()
  const newPriceList = {
    ...priceList,
    id: `pl_${Date.now()}`,
    createdAt: new Date().toISOString(),
    isDefault: false,
  }
  savePriceLists([...priceLists, newPriceList])
  return newPriceList
}

// Cập nhật bảng giá
export const updatePriceList = (id, updates) => {
  const priceLists = getPriceLists()
  const updated = priceLists.map(pl => 
    pl.id === id ? { ...pl, ...updates, updatedAt: new Date().toISOString() } : pl
  )
  savePriceLists(updated)
  return updated.find(pl => pl.id === id)
}

// Xóa bảng giá
export const deletePriceList = (id) => {
  const priceLists = getPriceLists()
  const filtered = priceLists.filter(pl => pl.id !== id && pl.isDefault !== true)
  savePriceLists(filtered)
  
  // Xóa các quy tắc giá liên quan
  const rules = getPriceRules()
  const filteredRules = rules.filter(rule => rule.priceListId !== id)
  savePriceRules(filteredRules)
}

// Lấy quy tắc giá
export const getPriceRules = () => {
  try {
    const raw = localStorage.getItem(PRICE_RULES_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

// Lưu quy tắc giá
export const savePriceRules = (rules) => {
  localStorage.setItem(PRICE_RULES_KEY, JSON.stringify(rules))
}

// Tạo quy tắc giá mới
export const createPriceRule = (rule) => {
  const rules = getPriceRules()
  const newRule = {
    ...rule,
    id: `pr_${Date.now()}`,
    createdAt: new Date().toISOString(),
  }
  savePriceRules([...rules, newRule])
  return newRule
}

// Cập nhật quy tắc giá
export const updatePriceRule = (id, updates) => {
  const rules = getPriceRules()
  const updated = rules.map(r => 
    r.id === id ? { ...r, ...updates, updatedAt: new Date().toISOString() } : r
  )
  savePriceRules(updated)
  return updated.find(r => r.id === id)
}

// Xóa quy tắc giá
export const deletePriceRule = (id) => {
  const rules = getPriceRules()
  const filtered = rules.filter(r => r.id !== id)
  savePriceRules(filtered)
}

// Lấy giá cho sản phẩm dựa trên nhóm sản phẩm và nhóm khách hàng
export const getProductPrice = (productId, productGroupId, customerGroupId, priceListId = 'default') => {
  const rules = getPriceRules()
  
  // Tìm quy tắc phù hợp nhất
  // Ưu tiên: priceListId > customerGroupId > productGroupId > default
  const matchingRule = rules.find(rule => 
    rule.priceListId === priceListId &&
    (rule.productGroupId === productGroupId || !rule.productGroupId) &&
    (rule.customerGroupId === customerGroupId || !rule.customerGroupId) &&
    (rule.productId === productId || !rule.productId)
  )
  
  return matchingRule || null
}

// Áp dụng giá cho danh sách sản phẩm
export const applyPricesToProducts = (products, customerGroupId, priceListId = 'default') => {
  const rules = getPriceRules()
  
  return products.map(product => {
    const matchingRule = rules.find(rule => 
      rule.priceListId === priceListId &&
      (rule.productId === product.id || rule.productId === product.sku) &&
      (rule.customerGroupId === customerGroupId || !rule.customerGroupId)
    )
    
    if (matchingRule) {
      return {
        ...product,
        sellingPrice: matchingRule.price,
        priceType: matchingRule.type || 'fixed', // fixed, percentage, discount
        originalPrice: product.price || product.costPrice || 0,
      }
    }
    
    return {
      ...product,
      sellingPrice: product.price || product.costPrice || 0,
      priceType: 'default',
      originalPrice: product.price || product.costPrice || 0,
    }
  })
}

