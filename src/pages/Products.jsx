import { useState, useMemo, useCallback, useEffect } from 'react'
import { Plus, Search, Edit, Trash2, Eye, Image as ImageIcon, X, Loader2, AlertCircle } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useDebounce } from '../hooks/useDebounce'
import { usePagination } from '../hooks/usePagination'
import { fastSearch } from '../utils/filterUtils'
import Pagination from '../components/Pagination'
import { useCrud } from '../hooks/useApi'
import { productsApi } from '../services/productsApi'
import { useLowStockAlert } from '../hooks/useLowStockAlert'

// Fallback data khi API chưa sẵn sàng
const FALLBACK_PRODUCTS = [
    { 
      id: 1, 
      name: 'Áo thun nam', 
      sku: 'AT001', 
      category: 'Áo', 
      price: 250000, 
      stock: 150, 
      minStock: 50,
      status: 'Còn hàng',
      image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400',
      description: 'Áo thun nam chất liệu cotton cao cấp, thoáng mát, thấm hút mồ hôi tốt. Phù hợp cho mọi hoạt động hàng ngày.'
    },
    { 
      id: 2, 
      name: 'Quần jean nữ', 
      sku: 'QJ002', 
      category: 'Quần', 
      price: 450000, 
      stock: 80, 
      minStock: 100,
      status: 'Còn hàng',
      image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=400',
      description: 'Quần jean nữ form slim fit, co giãn tốt, thiết kế hiện đại. Có nhiều size từ S đến XL.'
    },
    { 
      id: 3, 
      name: 'Giày thể thao', 
      sku: 'GT003', 
      category: 'Giày', 
      price: 800000, 
      stock: 45, 
      minStock: 30,
      status: 'Còn hàng',
      image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400',
      description: 'Giày thể thao chạy bộ, đế cao su chống trơn trượt, đệm lót êm ái. Phù hợp cho vận động viên và người tập thể thao.'
    },
    { 
      id: 4, 
      name: 'Túi xách', 
      sku: 'TX004', 
      category: 'Phụ kiện', 
      price: 350000, 
      stock: 0, 
      minStock: 20,
      status: 'Hết hàng',
      image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400',
      description: 'Túi xách da thật, thiết kế sang trọng, nhiều ngăn tiện lợi. Phù hợp cho công sở và dạo phố.'
    },
    { 
      id: 5, 
      name: 'Ví da', 
      sku: 'VD005', 
      category: 'Phụ kiện', 
      price: 200000, 
      stock: 120, 
      minStock: 50,
      status: 'Còn hàng',
      image: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=400',
      description: 'Ví da nam cao cấp, nhiều ngăn đựng thẻ và tiền mặt. Thiết kế gọn nhẹ, bền đẹp.'
    },
  ]

const Products = () => {
  const { hasPermission, FEATURES, PERMISSIONS } = useAuth()
  
  // Kiểm tra quyền
  const canCreate = hasPermission(FEATURES.products, PERMISSIONS.CREATE)
  const canUpdate = hasPermission(FEATURES.products, PERMISSIONS.UPDATE)
  const canDelete = hasPermission(FEATURES.products, PERMISSIONS.DELETE)

  // Sử dụng API với fallback
  const {
    items: products,
    loading,
    error,
    fetchAll,
    create: createProduct,
    update: updateProduct,
    remove: deleteProduct,
    setItems: setProducts,
  } = useCrud(productsApi)

  // Load data khi component mount
  useEffect(() => {
    const loadProducts = async () => {
      try {
        await fetchAll()
      } catch (err) {
        // Nếu API fail, sử dụng fallback data
        const disableFallback = localStorage.getItem('disableFallbackData') === 'true'
        if (disableFallback) {
          console.warn('API không khả dụng và fallback đã bị vô hiệu hóa. Danh sách sản phẩm được đặt rỗng.')
          setProducts([])
        } else {
          console.warn('API không khả dụng, sử dụng dữ liệu mẫu:', err)
          setProducts(FALLBACK_PRODUCTS)
        }
      }
    }
    loadProducts()
  }, [fetchAll, setProducts])

  // Lấy cài đặt thông báo từ localStorage
  const notificationSettings = useMemo(() => {
    try {
      const saved = localStorage.getItem('appSettings')
      if (saved) {
        const settings = JSON.parse(saved)
        return settings
      }
    } catch (error) {
      console.error('Error loading settings:', error)
    }
    return null
  }, [])

  // Tự động kiểm tra và gửi cảnh báo tồn kho thấp
  useLowStockAlert(
    products,
    notificationSettings,
    notificationSettings?.notifications?.emailSettings?.notifications?.lowStock || 
    notificationSettings?.notifications?.googleChat?.notifications?.lowStock || 
    false,
    5 * 60 * 1000 // Kiểm tra mỗi 5 phút
  )

  const [searchTerm, setSearchTerm] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    category: '',
    price: '',
    stock: '',
    minStock: '',
    status: 'Còn hàng',
    image: '',
    description: ''
  })
  const [submitLoading, setSubmitLoading] = useState(false)

  // Debounce search term để giảm số lần filter
  const debouncedSearchTerm = useDebounce(searchTerm, 300)

  // Memoize search index cho performance
  const searchIndex = useMemo(() => {
    return null // Có thể tạo index nếu cần, nhưng với dữ liệu nhỏ thì không cần
  }, [products])

  // Memoize filtered products với debounced search
  const filteredProducts = useMemo(() => {
    if (!debouncedSearchTerm) {
      return products
    }
    return fastSearch(products, debouncedSearchTerm, ['name', 'sku'], searchIndex)
  }, [products, debouncedSearchTerm, searchIndex])

  // Pagination
  const {
    currentPage,
    totalPages,
    paginatedData,
    totalItems,
    startIndex,
    endIndex,
    goToPage,
    nextPage,
    prevPage,
    resetPagination,
  } = usePagination(filteredProducts, 50)

  // Reset pagination khi search thay đổi
  useEffect(() => {
    resetPagination()
  }, [debouncedSearchTerm, resetPagination])

  const handleAdd = () => {
    if (!canCreate) {
      alert('Bạn không có quyền tạo sản phẩm mới')
      return
    }
    setEditingProduct(null)
    setFormData({
      name: '',
      sku: '',
      category: '',
      price: '',
      stock: '',
      minStock: '',
      status: 'Còn hàng',
      image: '',
      description: ''
    })
    setShowModal(true)
  }

  const handleEdit = (product) => {
    if (!canUpdate) {
      alert('Bạn không có quyền chỉnh sửa sản phẩm')
      return
    }
    setEditingProduct(product)
    setFormData({
      name: product.name,
      sku: product.sku,
      category: product.category,
      price: product.price,
      stock: product.stock,
      minStock: product.minStock || '',
      status: product.status,
      image: product.image || '',
      description: product.description || ''
    })
    setShowModal(true)
  }

  const handleDelete = useCallback(async (id) => {
    if (!canDelete) {
      alert('Bạn không có quyền xóa sản phẩm')
      return
    }
    if (window.confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) {
      try {
        await deleteProduct(id)
        alert('Xóa sản phẩm thành công!')
      } catch (err) {
        alert('Không thể xóa sản phẩm: ' + (err.message || 'Có lỗi xảy ra'))
        // Fallback: xóa local nếu API fail
        setProducts(prev => prev.filter(p => p.id !== id))
      }
    }
  }, [canDelete, deleteProduct, setProducts])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitLoading(true)

    try {
      const productData = {
        ...formData,
        price: parseInt(formData.price),
        stock: parseInt(formData.stock),
        minStock: formData.minStock ? parseInt(formData.minStock) : 0,
        image: formData.image || '',
        description: formData.description || ''
      }

      if (editingProduct) {
        await updateProduct(editingProduct.id, productData)
        alert('Cập nhật sản phẩm thành công!')
      } else {
        await createProduct(productData)
        alert('Tạo sản phẩm mới thành công!')
      }
      setShowModal(false)
      setFormData({
        name: '',
        sku: '',
        category: '',
        price: '',
        stock: '',
        minStock: '',
        status: 'Còn hàng',
        image: '',
        description: ''
      })
    } catch (err) {
      alert('Không thể lưu sản phẩm: ' + (err.message || 'Có lỗi xảy ra'))
      // Fallback: update local nếu API fail
      if (editingProduct) {
        setProducts(prev => prev.map(p => 
          p.id === editingProduct.id ? { 
            ...p, 
            ...formData, 
            price: parseInt(formData.price), 
            stock: parseInt(formData.stock),
            minStock: formData.minStock ? parseInt(formData.minStock) : 0,
            image: formData.image || p.image || '',
            description: formData.description || ''
          } : p
        ))
        setShowModal(false)
      } else {
        const newProduct = {
          id: Date.now(), // Temporary ID
          ...formData,
          price: parseInt(formData.price),
          stock: parseInt(formData.stock),
          minStock: formData.minStock ? parseInt(formData.minStock) : 0,
          image: formData.image || '',
          description: formData.description || ''
        }
        setProducts(prev => [...prev, newProduct])
        setShowModal(false)
      }
    } finally {
      setSubmitLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Quản lý Sản phẩm</h1>
          <p className="text-gray-600">Quản lý danh sách sản phẩm của cửa hàng</p>
        </div>
        {canCreate && (
          <button onClick={handleAdd} className="btn-primary flex items-center gap-2">
            <Plus size={20} />
            Thêm sản phẩm
          </button>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="card bg-red-50 border border-red-200">
          <div className="flex items-center gap-2 text-red-800">
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="card">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Tìm kiếm sản phẩm theo tên hoặc mã SKU..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field pl-10"
            disabled={loading}
          />
        </div>
      </div>

      {/* Products Table */}
      <div className="card">
        {loading && products.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="animate-spin text-primary-600" size={32} />
            <span className="ml-3 text-gray-600">Đang tải dữ liệu...</span>
          </div>
        ) : (
          <>
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>Hình ảnh</th>
                <th>Mã SKU</th>
                <th>Tên sản phẩm</th>
                <th>Danh mục</th>
                <th>Giá</th>
                <th>Tồn kho</th>
                <th>Mức tồn tối thiểu</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.map((product) => (
                <tr key={product.id}>
                  <td>
                    {product.image ? (
                      <div className="w-16 h-16 rounded-lg overflow-hidden border border-gray-200">
                        <img 
                          src={product.image} 
                          alt={product.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.src = 'https://via.placeholder.com/64x64?text=No+Image'
                          }}
                        />
                      </div>
                    ) : (
                      <div className="w-16 h-16 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center">
                        <ImageIcon size={24} className="text-gray-400" />
                      </div>
                    )}
                  </td>
                  <td className="font-mono text-sm">{product.sku}</td>
                  <td>
                    <div>
                      <div className="font-medium">{product.name}</div>
                      {product.description && (
                        <div className="text-xs text-gray-500 mt-1 max-w-xs truncate" title={product.description}>
                          {product.description}
                        </div>
                      )}
                    </div>
                  </td>
                  <td>{product.category}</td>
                  <td className="font-semibold">{product.price.toLocaleString('vi-VN')} đ</td>
                  <td>
                    <div className="flex items-center gap-2">
                      <span className={product.minStock && product.stock < product.minStock ? 'text-red-600 font-semibold' : ''}>
                        {product.stock}
                      </span>
                      {product.minStock && product.stock < product.minStock && (
                        <span className="text-xs text-red-600" title="Dưới mức tồn tối thiểu">⚠️</span>
                      )}
                    </div>
                  </td>
                  <td>
                    {product.minStock !== undefined ? (
                      <span className="text-sm text-gray-600">{product.minStock}</span>
                    ) : (
                      <span className="text-xs text-gray-400">Chưa đặt</span>
                    )}
                  </td>
                  <td>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      product.status === 'Còn hàng' 
                        ? product.minStock && product.stock < product.minStock
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {product.minStock && product.stock < product.minStock ? 'Sắp hết' : product.status}
                    </span>
                  </td>
                  <td>
                    <div className="flex items-center gap-2">
                      {canUpdate && (
                        <button
                          onClick={() => handleEdit(product)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Sửa"
                        >
                          <Edit size={16} />
                        </button>
                      )}
                      {canDelete && (
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Xóa"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                      {!canUpdate && !canDelete && (
                        <span className="text-xs text-gray-400">Không có quyền</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          startIndex={startIndex}
          endIndex={endIndex}
          onPageChange={goToPage}
          onNext={nextPage}
          onPrev={prevPage}
        />
          </>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl my-8">
            <h2 className="text-2xl font-bold mb-6">
              {editingProduct ? 'Sửa sản phẩm' : 'Thêm sản phẩm mới'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tên sản phẩm</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mã SKU</label>
                  <input
                    type="text"
                    required
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    className="input-field"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Danh mục</label>
                  <input
                    type="text"
                    required
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="input-field"
                  >
                    <option value="Còn hàng">Còn hàng</option>
                    <option value="Hết hàng">Hết hàng</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Giá (đ)</label>
                  <input
                    type="number"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tồn kho</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    className="input-field"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mức tồn tối thiểu
                  <span className="text-gray-500 text-xs ml-1">(Cảnh báo khi tồn kho dưới mức này)</span>
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.minStock}
                  onChange={(e) => setFormData({ ...formData, minStock: e.target.value })}
                  className="input-field"
                  placeholder="Nhập mức tồn tối thiểu (tùy chọn)"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">URL Hình ảnh</label>
                <div className="space-y-2">
                  <input
                    type="url"
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    placeholder="https://example.com/image.jpg"
                    className="input-field"
                  />
                  {formData.image && (
                    <div className="relative">
                      <div className="w-full h-48 rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
                        <img 
                          src={formData.image} 
                          alt="Preview"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.style.display = 'none'
                            const errorDiv = document.createElement('div')
                            errorDiv.className = 'w-full h-full flex items-center justify-center text-gray-400'
                            errorDiv.innerHTML = '<p>Không thể tải hình ảnh</p>'
                            e.target.parentElement.appendChild(errorDiv)
                          }}
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, image: '' })}
                        className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-1">Nhập URL hình ảnh hoặc để trống</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả sản phẩm</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="input-field"
                  rows="4"
                  placeholder="Nhập mô tả chi tiết về sản phẩm..."
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button 
                  type="submit" 
                  className="btn-primary flex-1 flex items-center justify-center gap-2"
                  disabled={submitLoading}
                >
                  {submitLoading && <Loader2 className="animate-spin" size={18} />}
                  {editingProduct ? 'Cập nhật' : 'Thêm mới'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn-secondary flex-1"
                >
                  Hủy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Products

