import { useState, useMemo, useEffect, useRef } from 'react'
import { 
  Search, 
  Plus, 
  X, 
  Download, 
  Upload, 
  Edit,
  Trash2,
  Save,
  ChevronDown
} from 'lucide-react'
import * as XLSX from 'xlsx'
import { useDebounce } from '../hooks/useDebounce'
import { fastSearch } from '../utils/filterUtils'
import { 
  getPriceLists, 
  createPriceList, 
  updatePriceList, 
  deletePriceList,
  getPriceRules,
  createPriceRule,
  updatePriceRule,
  deletePriceRule,
  applyPricesToProducts
} from '../services/priceService'
import { addInAppNotification } from '../services/notificationService'

// Mock data sản phẩm
const MOCK_PRODUCTS = [
  { id: 'BTT', name: 'Bánh Trung Thu', sku: 'BTT', costPrice: 0, lastImportPrice: 0, category: 'Thực phẩm', stock: 100 },
  { id: 'SP000002', name: 'Bột Đậu Nành Đại Phước (Túi)', sku: 'SP000002', costPrice: 70000, lastImportPrice: 70000, category: 'Thực phẩm', stock: 50 },
  { id: 'THUNGCARTON16', name: 'Thùng Carton 20 x 10 x 10 - 3 lớp (Cái)', sku: 'THUNGCARTON16', costPrice: 0, lastImportPrice: 0, category: 'Bao bì', stock: 200 },
  { id: 'SP000001', name: 'Thư từ', sku: 'SP000001', costPrice: 0, lastImportPrice: 0, category: 'Văn phòng', stock: 0 },
  { id: 'Website1757810175', name: 'Mật Táo Đỏ Hoa Hồng Tâm An 250ml Phục Hồi Da Từ Sâu Bên Trong - Website', sku: 'Website1757810175', costPrice: 395000, lastImportPrice: 395000, category: 'Mỹ phẩm', stock: 30 },
  { id: 'WebsiteGLUCOTC001', name: 'Bột Ngũ Cốc Thực Dưỡng 420g Dành Cho Người Tiểu Đường (Thay Thế: Non Gluco 420g) - Website', sku: 'WebsiteGLUCOTC001', costPrice: 220000, lastImportPrice: 220000, category: 'Thực phẩm', stock: 25 },
  { id: 'THUNGCARTON17', name: 'Thùng Carton 40 x 30 x 20 - 3 lớp (Cái)', sku: 'THUNGCARTON17', costPrice: 0, lastImportPrice: 0, category: 'Bao bì', stock: 150 },
  { id: 'DECALINNHIETA7', name: 'Decal In Nhiệt A7 Xấp - 75x100mm - 500 tem (Cái)', sku: 'DECALINNHIETA7', costPrice: 0, lastImportPrice: 0, category: 'Bao bì', stock: 80 },
  { id: 'BANGKEOMATTAODO', name: 'Băng Keo Mật Táo Đỏ (Cái)', sku: 'BANGKEOMATTAODO', costPrice: 0, lastImportPrice: 0, category: 'Bao bì', stock: 200 },
  { id: 'THUNGCARTON15', name: 'Thùng Carton 30 x 25 x 20 (Cái)', sku: 'THUNGCARTON15', costPrice: 0, lastImportPrice: 0, category: 'Bao bì', stock: 100 },
]

const PRODUCT_GROUPS = ['Tất cả', 'Thực phẩm', 'Mỹ phẩm', 'Bao bì', 'Văn phòng']
const CUSTOMER_GROUPS = ['Khách lẻ', 'Khách sỉ', 'Đại lý', 'VIP']
const INVENTORY_OPTIONS = ['Tất cả', 'Còn hàng', 'Hết hàng', 'Sắp hết hàng']
const PRICE_CONDITIONS = ['Bằng', 'Lớn hơn', 'Nhỏ hơn', 'Trong khoảng']
const COMPARE_PRICES = ['Giá vốn', 'Giá nhập cuối', 'Giá bán hiện tại']

const Pricing = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedPriceList, setSelectedPriceList] = useState('default')
  const [selectedProductGroup, setSelectedProductGroup] = useState('Tất cả')
  const [selectedInventory, setSelectedInventory] = useState('Tất cả')
  const [priceCondition, setPriceCondition] = useState('')
  const [comparePrice, setComparePrice] = useState('')
  const [priceLists, setPriceLists] = useState([])
  const [showPriceListModal, setShowPriceListModal] = useState(false)
  const [editingPriceList, setEditingPriceList] = useState(null)
  const [newPriceListName, setNewPriceListName] = useState('')
  const [newPriceListDescription, setNewPriceListDescription] = useState('')
  const [selectedCustomerGroup, setSelectedCustomerGroup] = useState('')
  const [editingProducts, setEditingProducts] = useState({}) // { productId: { price: number, type: string } }
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [showPriceListDropdown, setShowPriceListDropdown] = useState(false)
  const fileInputRef = useRef(null)

  const debouncedSearchTerm = useDebounce(searchTerm, 300)

  // Load price lists
  useEffect(() => {
    const lists = getPriceLists()
    setPriceLists(lists)
    if (lists.length > 0 && !selectedPriceList) {
      const defaultList = lists.find(l => l.isDefault) || lists[0]
      setSelectedPriceList(defaultList.id)
    }
  }, [])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showPriceListDropdown && !event.target.closest('.price-list-dropdown')) {
        setShowPriceListDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showPriceListDropdown])

  // Filter products
  const filteredProducts = useMemo(() => {
    let products = [...MOCK_PRODUCTS]

    // Search filter
    if (debouncedSearchTerm) {
      products = fastSearch(products, debouncedSearchTerm, ['sku', 'name'])
    }

    // Product group filter
    if (selectedProductGroup && selectedProductGroup !== 'Tất cả') {
      products = products.filter(p => p.category === selectedProductGroup)
    }

    // Inventory filter
    if (selectedInventory === 'Còn hàng') {
      products = products.filter(p => p.stock > 0)
    } else if (selectedInventory === 'Hết hàng') {
      products = products.filter(p => p.stock === 0)
    } else if (selectedInventory === 'Sắp hết hàng') {
      products = products.filter(p => p.stock > 0 && p.stock < 20)
    }

    // Apply prices based on customer group
    if (selectedCustomerGroup) {
      products = applyPricesToProducts(products, selectedCustomerGroup, selectedPriceList)
    }

    return products
  }, [debouncedSearchTerm, selectedProductGroup, selectedInventory, selectedCustomerGroup, selectedPriceList])

  // Handle create/update price list
  const handleSavePriceList = () => {
    if (!newPriceListName.trim()) {
      addInAppNotification('Vui lòng nhập tên bảng giá', 'error')
      return
    }

    if (editingPriceList) {
      updatePriceList(editingPriceList.id, {
        name: newPriceListName.trim(),
        description: newPriceListDescription.trim(),
      })
      addInAppNotification('Đã cập nhật bảng giá', 'success')
    } else {
      const newList = createPriceList({
        name: newPriceListName.trim(),
        description: newPriceListDescription.trim(),
      })
      setSelectedPriceList(newList.id)
      addInAppNotification('Đã tạo bảng giá mới', 'success')
    }
    
    setPriceLists(getPriceLists())
    setNewPriceListName('')
    setNewPriceListDescription('')
    setEditingPriceList(null)
    setShowPriceListModal(false)
  }

  // Handle edit price list
  const handleEditPriceList = (priceList) => {
    setEditingPriceList(priceList)
    setNewPriceListName(priceList.name)
    setNewPriceListDescription(priceList.description || '')
    setShowPriceListModal(true)
  }

  // Handle open create modal
  const handleOpenCreateModal = () => {
    setEditingPriceList(null)
    setNewPriceListName('')
    setNewPriceListDescription('')
    setShowPriceListModal(true)
  }

  // Handle delete price list
  const handleDeletePriceList = (id) => {
    if (!window.confirm('Bạn có chắc muốn xóa bảng giá này?')) return
    
    deletePriceList(id)
    setPriceLists(getPriceLists())
    if (selectedPriceList === id) {
      const lists = getPriceLists()
      setSelectedPriceList(lists[0]?.id || 'default')
    }
    addInAppNotification('Đã xóa bảng giá', 'success')
  }

  // Handle edit product price
  const handleEditProductPrice = (product) => {
    setEditingProduct(product)
    const existingRule = getPriceRules().find(
      r => r.productId === product.id && 
           r.customerGroupId === selectedCustomerGroup &&
           r.priceListId === selectedPriceList
    )
    
    if (existingRule) {
      setEditingProducts({
        ...editingProducts,
        [product.id]: {
          price: existingRule.price,
          type: existingRule.type || 'fixed',
        }
      })
    }
    setShowEditModal(true)
  }

  // Handle save product price
  const handleSaveProductPrice = (productId) => {
    const editData = editingProducts[productId]
    if (!editData || !editData.price) {
      addInAppNotification('Vui lòng nhập giá', 'error')
      return
    }

    const rules = getPriceRules()
    const existingRule = rules.find(
      r => r.productId === productId &&
           r.customerGroupId === selectedCustomerGroup &&
           r.priceListId === selectedPriceList
    )

    if (existingRule) {
      updatePriceRule(existingRule.id, {
        price: Number(editData.price),
        type: editData.type,
      })
    } else {
      createPriceRule({
        productId,
        productGroupId: editingProduct?.category,
        customerGroupId: selectedCustomerGroup,
        priceListId: selectedPriceList,
        price: Number(editData.price),
        type: editData.type || 'fixed',
      })
    }

    setEditingProducts({})
    setShowEditModal(false)
    setEditingProduct(null)
    addInAppNotification('Đã lưu giá sản phẩm', 'success')
  }

  // Handle import file
  const handleImportFile = (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result)
        const workbook = XLSX.read(data, { type: 'array' })
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]]
        const jsonData = XLSX.utils.sheet_to_json(firstSheet)

        if (!selectedCustomerGroup) {
          addInAppNotification('Vui lòng chọn nhóm khách hàng trước khi import', 'error')
          return
        }

        let importedCount = 0
        let errorCount = 0

        jsonData.forEach((row) => {
          try {
            // Tìm sản phẩm theo mã SKU hoặc tên
            const product = MOCK_PRODUCTS.find(
              p => p.sku === row['Mã hàng'] || 
                   p.sku === row['SKU'] || 
                   p.name === row['Tên hàng']
            )

            if (!product) {
              errorCount++
              return
            }

            const price = parseFloat(row['Giá bán'] || row['Giá'] || row['Price'])
            if (isNaN(price) || price <= 0) {
              errorCount++
              return
            }

            // Tạo hoặc cập nhật quy tắc giá
            const rules = getPriceRules()
            const existingRule = rules.find(
              r => r.productId === product.id &&
                   r.customerGroupId === selectedCustomerGroup &&
                   r.priceListId === selectedPriceList
            )

            if (existingRule) {
              updatePriceRule(existingRule.id, {
                price: price,
                type: 'fixed',
              })
            } else {
              createPriceRule({
                productId: product.id,
                productGroupId: product.category,
                customerGroupId: selectedCustomerGroup,
                priceListId: selectedPriceList,
                price: price,
                type: 'fixed',
              })
            }

            importedCount++
          } catch (err) {
            console.error('Error importing row:', err)
            errorCount++
          }
        })

        addInAppNotification(
          `Đã import ${importedCount} sản phẩm${errorCount > 0 ? `, ${errorCount} lỗi` : ''}`,
          importedCount > 0 ? 'success' : 'error'
        )

        // Reset file input
        if (fileInputRef.current) {
          fileInputRef.current.value = ''
        }
      } catch (error) {
        console.error('Error reading file:', error)
        addInAppNotification('Không thể đọc file. Vui lòng kiểm tra định dạng file.', 'error')
      }
    }
    reader.readAsArrayBuffer(file)
  }

  // Handle export file
  const handleExportFile = () => {
    if (!selectedCustomerGroup) {
      addInAppNotification('Vui lòng chọn nhóm khách hàng trước khi xuất file', 'error')
      return
    }

    const rules = getPriceRules()
    const currentList = priceLists.find(pl => pl.id === selectedPriceList)

    // Tạo dữ liệu export
    const exportData = filteredProducts.map(product => {
      const rule = rules.find(
        r => r.productId === product.id &&
             r.customerGroupId === selectedCustomerGroup &&
             r.priceListId === selectedPriceList
      )

      return {
        'Mã hàng': product.sku,
        'Tên hàng': product.name,
        'Nhóm hàng': product.category,
        'Giá vốn': product.costPrice || 0,
        'Giá nhập cuối': product.lastImportPrice || 0,
        'Giá bán': rule?.price || product.costPrice || product.lastImportPrice || 0,
        'Tồn kho': product.stock || 0,
      }
    })

    // Tạo worksheet
    const ws = XLSX.utils.json_to_sheet(exportData)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Bảng giá')

    // Xuất file
    const fileName = `Bang_gia_${currentList?.name || 'chung'}_${selectedCustomerGroup}_${new Date().toISOString().split('T')[0]}.xlsx`
    XLSX.writeFile(wb, fileName)

    addInAppNotification('Đã xuất file thành công', 'success')
  }

  const currentPriceList = priceLists.find(pl => pl.id === selectedPriceList)

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="flex">
        {/* Sidebar Filters */}
        <div className="w-80 bg-white border-r border-slate-200 p-6 space-y-6">
          <h1 className="text-2xl font-bold text-slate-900">Bảng giá chung</h1>

          {/* Bảng giá */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Bảng giá</label>
            <div className="relative price-list-dropdown">
              <button
                onClick={() => setShowPriceListDropdown(!showPriceListDropdown)}
                className="w-full flex items-center justify-between px-3 py-2 border border-slate-300 rounded-lg bg-white hover:bg-slate-50 text-sm"
              >
                <span className="text-slate-700">
                  {currentPriceList?.name || 'Chọn bảng giá'}
                </span>
                <ChevronDown size={16} className="text-slate-400" />
              </button>
              {showPriceListDropdown && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {priceLists.map((list) => (
                    <div
                      key={list.id}
                      className={`px-3 py-2 hover:bg-slate-50 cursor-pointer border-b border-slate-100 last:border-b-0 ${
                        selectedPriceList === list.id ? 'bg-blue-50' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div
                          className="flex-1"
                          onClick={() => {
                            setSelectedPriceList(list.id)
                            setShowPriceListDropdown(false)
                          }}
                        >
                          <div className="text-sm font-medium text-slate-700">{list.name}</div>
                          {list.description && (
                            <div className="text-xs text-slate-500 mt-0.5">{list.description}</div>
                          )}
                        </div>
                        <div className="flex items-center gap-1">
                          {!list.isDefault && (
                            <>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleEditPriceList(list)
                                  setShowPriceListDropdown(false)
                                }}
                                className="p-1 hover:bg-blue-100 rounded text-blue-600"
                                title="Sửa"
                              >
                                <Edit size={14} />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleDeletePriceList(list.id)
                                  setShowPriceListDropdown(false)
                                }}
                                className="p-1 hover:bg-rose-100 rounded text-rose-600"
                                title="Xóa"
                              >
                                <Trash2 size={14} />
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  <div className="border-t border-slate-200 p-2">
                    <button
                      onClick={() => {
                        handleOpenCreateModal()
                        setShowPriceListDropdown(false)
                      }}
                      className="w-full btn-primary text-sm px-3 py-1.5"
                    >
                      <Plus size={14} className="inline mr-1" />
                      Tạo mới
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Nhóm hàng */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Nhóm hàng</label>
            <select
              value={selectedProductGroup}
              onChange={(e) => setSelectedProductGroup(e.target.value)}
              className="input-field w-full"
            >
              {PRODUCT_GROUPS.map(group => (
                <option key={group} value={group}>{group}</option>
              ))}
            </select>
          </div>

          {/* Tồn kho */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Tồn kho</label>
            <select
              value={selectedInventory}
              onChange={(e) => setSelectedInventory(e.target.value)}
              className="input-field w-full"
            >
              {INVENTORY_OPTIONS.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>

          {/* Giá bán */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Giá bán</label>
            <select
              value={priceCondition}
              onChange={(e) => setPriceCondition(e.target.value)}
              className="input-field w-full mb-2"
            >
              <option value="">Chọn điều kiện</option>
              {PRICE_CONDITIONS.map(condition => (
                <option key={condition} value={condition}>{condition}</option>
              ))}
            </select>
            <select
              value={comparePrice}
              onChange={(e) => setComparePrice(e.target.value)}
              className="input-field w-full"
            >
              <option value="">Chọn giá so sánh</option>
              {COMPARE_PRICES.map(price => (
                <option key={price} value={price}>{price}</option>
              ))}
            </select>
          </div>

          {/* Nhóm khách hàng */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Nhóm khách hàng</label>
            <select
              value={selectedCustomerGroup}
              onChange={(e) => setSelectedCustomerGroup(e.target.value)}
              className="input-field w-full"
            >
              <option value="">Tất cả</option>
              {CUSTOMER_GROUPS.map(group => (
                <option key={group} value={group}>{group}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6">
          {/* Top Bar */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
                <input
                  type="text"
                  placeholder="Theo mã, tên hàng"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input-field pl-10 w-full"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={handleOpenCreateModal}
                className="btn-primary inline-flex items-center gap-2"
              >
                <Plus size={16} />
                Bảng giá
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleImportFile}
                className="hidden"
              />
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="btn-secondary inline-flex items-center gap-2"
              >
                <Upload size={16} />
                Import
              </button>
              <button 
                onClick={handleExportFile}
                className="btn-secondary inline-flex items-center gap-2"
              >
                <Download size={16} />
                Export file
              </button>
            </div>
          </div>

          {/* Products Table */}
          <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Mã hàng</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Tên hàng</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-slate-700">Giá vốn</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-slate-700">Giá nhập cuối</th>
                    {selectedCustomerGroup && (
                      <th className="px-4 py-3 text-right text-sm font-semibold text-slate-700">Giá bán ({selectedCustomerGroup})</th>
                    )}
                    <th className="px-4 py-3 text-center text-sm font-semibold text-slate-700">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredProducts.length === 0 ? (
                    <tr>
                      <td colSpan={selectedCustomerGroup ? 6 : 5} className="px-4 py-8 text-center text-slate-500">
                        Không tìm thấy sản phẩm nào
                      </td>
                    </tr>
                  ) : (
                    filteredProducts.map((product) => {
                      const sellingPrice = product.sellingPrice || product.costPrice || product.lastImportPrice || 0
                      return (
                        <tr key={product.id} className="hover:bg-slate-50">
                          <td className="px-4 py-3 text-sm font-mono text-slate-900">{product.sku}</td>
                          <td className="px-4 py-3 text-sm text-slate-700">{product.name}</td>
                          <td className="px-4 py-3 text-sm text-right text-slate-700">
                            {product.costPrice ? product.costPrice.toLocaleString('vi-VN') : '0'} đ
                          </td>
                          <td className="px-4 py-3 text-sm text-right text-slate-700">
                            {product.lastImportPrice ? product.lastImportPrice.toLocaleString('vi-VN') : '0'} đ
                          </td>
                          {selectedCustomerGroup && (
                            <td className="px-4 py-3 text-sm text-right">
                              {editingProducts[product.id] ? (
                                <div className="flex items-center justify-end gap-2">
                                  <input
                                    type="number"
                                    value={editingProducts[product.id].price || ''}
                                    onChange={(e) => setEditingProducts({
                                      ...editingProducts,
                                      [product.id]: {
                                        ...editingProducts[product.id],
                                        price: e.target.value
                                      }
                                    })}
                                    className="input-field w-32 text-right"
                                    placeholder="Nhập giá"
                                  />
                                  <button
                                    onClick={() => handleSaveProductPrice(product.id)}
                                    className="btn-primary p-1.5"
                                    title="Lưu"
                                  >
                                    <Save size={14} />
                                  </button>
                                  <button
                                    onClick={() => {
                                      const newEditing = { ...editingProducts }
                                      delete newEditing[product.id]
                                      setEditingProducts(newEditing)
                                    }}
                                    className="btn-secondary p-1.5"
                                    title="Hủy"
                                  >
                                    <X size={14} />
                                  </button>
                                </div>
                              ) : (
                                <div className="flex items-center justify-end gap-2">
                                  <span className="font-medium text-slate-900">
                                    {sellingPrice.toLocaleString('vi-VN')} đ
                                  </span>
                                  <button
                                    onClick={() => {
                                      setEditingProduct(product)
                                      setEditingProducts({
                                        ...editingProducts,
                                        [product.id]: {
                                          price: sellingPrice,
                                          type: 'fixed'
                                        }
                                      })
                                    }}
                                    className="btn-secondary p-1.5"
                                    title="Chỉnh sửa giá"
                                  >
                                    <Edit size={14} />
                                  </button>
                                </div>
                              )}
                            </td>
                          )}
                          <td className="px-4 py-3 text-center">
                            {!selectedCustomerGroup && (
                              <span className="text-xs text-slate-400">Chọn nhóm KH để thiết lập giá</span>
                            )}
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Price List Modal */}
      {showPriceListModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">
                {editingPriceList ? 'Sửa bảng giá' : 'Tạo bảng giá mới'}
              </h2>
              <button
                onClick={() => {
                  setShowPriceListModal(false)
                  setNewPriceListName('')
                  setNewPriceListDescription('')
                  setEditingPriceList(null)
                }}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Tên bảng giá <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={newPriceListName}
                  onChange={(e) => setNewPriceListName(e.target.value)}
                  placeholder="Nhập tên bảng giá"
                  className="input-field w-full"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Mô tả
                </label>
                <textarea
                  value={newPriceListDescription}
                  onChange={(e) => setNewPriceListDescription(e.target.value)}
                  placeholder="Nhập mô tả bảng giá (tùy chọn)"
                  className="input-field w-full min-h-[80px] resize-none"
                  rows={3}
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => {
                    setShowPriceListModal(false)
                    setNewPriceListName('')
                    setNewPriceListDescription('')
                    setEditingPriceList(null)
                  }}
                  className="btn-secondary"
                >
                  Hủy
                </button>
                <button
                  onClick={handleSavePriceList}
                  className="btn-primary"
                >
                  {editingPriceList ? 'Cập nhật' : 'Tạo mới'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Pricing

