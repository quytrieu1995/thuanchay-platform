/**
 * Utility functions cho filtering tối ưu
 * Sử dụng các kỹ thuật như early return, indexing để tăng tốc độ
 */

/**
 * Tạo index map cho việc tìm kiếm nhanh
 * @param {Array} data - Mảng dữ liệu
 * @param {Array} fields - Các trường cần index
 * @returns {Object} Index map
 */
export function createSearchIndex(data, fields = []) {
  const index = {}
  
  data.forEach((item, idx) => {
    fields.forEach(field => {
      const value = item[field]
      if (value) {
        const lowerValue = String(value).toLowerCase()
        // Tạo n-gram index cho tìm kiếm nhanh hơn
        for (let i = 0; i <= lowerValue.length - 2; i++) {
          const gram = lowerValue.substring(i, i + 2)
          if (!index[gram]) {
            index[gram] = new Set()
          }
          index[gram].add(idx)
        }
      }
    })
  })
  
  return index
}

/**
 * Tìm kiếm nhanh sử dụng index
 * @param {Array} data - Mảng dữ liệu
 * @param {string} searchTerm - Từ khóa tìm kiếm
 * @param {Array} fields - Các trường cần tìm
 * @param {Object} searchIndex - Index đã tạo
 * @returns {Array} Kết quả tìm kiếm
 */
export function fastSearch(data, searchTerm, fields = [], searchIndex = null) {
  if (!searchTerm || searchTerm.trim() === '') {
    return data
  }

  const lowerSearch = searchTerm.toLowerCase().trim()
  
  // Nếu có index và từ khóa đủ dài, sử dụng index
  if (searchIndex && lowerSearch.length >= 2) {
    const grams = []
    for (let i = 0; i <= lowerSearch.length - 2; i++) {
      grams.push(lowerSearch.substring(i, i + 2))
    }
    
    // Tìm intersection của các sets
    let candidateIndices = null
    grams.forEach(gram => {
      if (searchIndex[gram]) {
        if (candidateIndices === null) {
          candidateIndices = new Set(searchIndex[gram])
        } else {
          candidateIndices = new Set([...candidateIndices].filter(x => searchIndex[gram].has(x)))
        }
      }
    })
    
    if (candidateIndices && candidateIndices.size > 0) {
      const results = Array.from(candidateIndices)
        .map(idx => data[idx])
        .filter(item => {
          return fields.some(field => {
            const value = item[field]
            return value && String(value).toLowerCase().includes(lowerSearch)
          })
        })
      return results
    }
  }

  // Fallback về tìm kiếm thông thường
  return data.filter(item => {
    return fields.some(field => {
      const value = item[field]
      return value && String(value).toLowerCase().includes(lowerSearch)
    })
  })
}

/**
 * Filter với nhiều điều kiện, tối ưu với early return
 * @param {Array} data - Mảng dữ liệu
 * @param {Object} filters - Object chứa các điều kiện filter
 * @returns {Array} Kết quả đã filter
 */
export function multiFilter(data, filters) {
  return data.filter(item => {
    // Early return pattern để tăng tốc
    for (const [key, condition] of Object.entries(filters)) {
      if (condition === null || condition === undefined || condition === 'all' || condition === '') {
        continue
      }

      switch (key) {
        case 'search':
          // Search đã được xử lý riêng
          break
        case 'status':
          if (item.trangThai !== condition && item.status !== condition) {
            return false
          }
          break
        case 'dateFrom':
          const itemDate = item.thoiGianTao?.split(' ')[0] || item.date || item.ngayNhap || ''
          if (itemDate < condition) {
            return false
          }
          break
        case 'dateTo':
          const itemDate2 = item.thoiGianTao?.split(' ')[0] || item.date || item.ngayNhap || ''
          if (itemDate2 > condition) {
            return false
          }
          break
        case 'priceMin':
          const price = item.khachCanTra || item.total || item.price || item.tongTien || 0
          if (price < Number(condition)) {
            return false
          }
          break
        case 'priceMax':
          const price2 = item.khachCanTra || item.total || item.price || item.tongTien || 0
          if (price2 > Number(condition)) {
            return false
          }
          break
        case 'customer':
          const customerName = item.tenKhachHang || item.customer || ''
          if (!customerName.toLowerCase().includes(condition.toLowerCase())) {
            return false
          }
          break
        case 'channel':
          const channel = item.kenhBan || item.channel || ''
          if (channel !== condition) {
            return false
          }
          break
        default:
          // Custom field matching
          if (item[key] !== condition) {
            return false
          }
      }
    }
    return true
  })
}

/**
 * Sắp xếp dữ liệu tối ưu
 * @param {Array} data - Mảng dữ liệu
 * @param {string} sortBy - Trường cần sắp xếp
 * @param {string} order - 'asc' hoặc 'desc'
 * @returns {Array} Dữ liệu đã sắp xếp
 */
export function sortData(data, sortBy, order = 'asc') {
  if (!sortBy) return data

  return [...data].sort((a, b) => {
    const aVal = a[sortBy]
    const bVal = b[sortBy]

    if (aVal === null || aVal === undefined) return 1
    if (bVal === null || bVal === undefined) return -1

    if (typeof aVal === 'string' && typeof bVal === 'string') {
      return order === 'asc' 
        ? aVal.localeCompare(bVal, 'vi')
        : bVal.localeCompare(aVal, 'vi')
    }

    if (typeof aVal === 'number' && typeof bVal === 'number') {
      return order === 'asc' ? aVal - bVal : bVal - aVal
    }

    return 0
  })
}

