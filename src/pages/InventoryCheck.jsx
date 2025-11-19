import { useState, useEffect, useRef, useMemo } from 'react'
import {
  Search,
  Plus,
  X,
  Save,
  CheckCircle,
  AlertTriangle,
  Package,
  Scale,
  FileText,
  Trash2,
  Edit,
  Eye,
  Download,
  Printer,
  ArrowLeft,
} from 'lucide-react'
import { useDebounce } from '../hooks/useDebounce'
import { fastSearch } from '../utils/filterUtils'
import {
  createInventoryCheck,
  updateInventoryCheck,
  deleteInventoryCheck,
  getInventoryChecks,
  getInventoryCheckById,
  getInventoryCheckItems,
  addInventoryCheckItem,
  updateInventoryCheckItem,
  deleteInventoryCheckItem,
  completeInventoryCheck,
  getInventoryCheckHistory,
} from '../services/inventoryCheckService'
import { addInAppNotification } from '../services/notificationService'

// Mock data sản phẩm (trong thực tế sẽ lấy từ API)
const MOCK_PRODUCTS = [
  { id: 'BTT', name: 'Bánh Trung Thu', sku: 'BTT', stock: 100, unit: 'Cái', price: 50000 },
  { id: 'SP000002', name: 'Bột Đậu Nành Đại Phước (Túi)', sku: 'SP000002', stock: 50, unit: 'Túi', price: 70000 },
  { id: 'THUNGCARTON16', name: 'Thùng Carton 20 x 10 x 10 - 3 lớp', sku: 'THUNGCARTON16', stock: 200, unit: 'Cái', price: 15000 },
  { id: 'SP000001', name: 'Thư từ', sku: 'SP000001', stock: 0, unit: 'Cái', price: 10000 },
  { id: 'Website1757810175', name: 'Mật Táo Đỏ Hoa Hồng Tâm An 250ml', sku: 'Website1757810175', stock: 30, unit: 'Chai', price: 395000 },
  { id: 'WebsiteGLUCOTC001', name: 'Bột Ngũ Cốc Thực Dưỡng 420g', sku: 'WebsiteGLUCOTC001', stock: 25, unit: 'Hộp', price: 220000 },
]

const InventoryCheck = () => {
  const [currentCheck, setCurrentCheck] = useState(null)
  const [checkItems, setCheckItems] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [showHistory, setShowHistory] = useState(false)
  const [history, setHistory] = useState([])
  const [editingItem, setEditingItem] = useState(null)
  const [actualQuantity, setActualQuantity] = useState('')
  const [notes, setNotes] = useState('')
  const searchInputRef = useRef(null)

  const debouncedSearchTerm = useDebounce(searchTerm, 300)

  // Load lịch sử
  useEffect(() => {
    if (showHistory) {
      setHistory(getInventoryCheckHistory())
    }
  }, [showHistory])

  // Tạo phiếu kiểm kho mới
  const handleCreateNewCheck = () => {
    const newCheck = createInventoryCheck({
      name: `Kiểm kho ${new Date().toLocaleString('vi-VN')}`,
      description: '',
      warehouse: 'Kho chính',
      checkedBy: 'Nhân viên',
    })
    setCurrentCheck(newCheck)
    setCheckItems([])
    setSearchTerm('')
    setNotes('')
    addInAppNotification('Đã tạo phiếu kiểm kho mới', 'success')
  }

  // Load phiếu kiểm kho hiện tại
  useEffect(() => {
    if (currentCheck) {
      const items = getInventoryCheckItems(currentCheck.id)
      setCheckItems(items)
    }
  }, [currentCheck])

  // Tìm sản phẩm
  const filteredProducts = useMemo(() => {
    if (!debouncedSearchTerm.trim()) return []
    return fastSearch(MOCK_PRODUCTS, debouncedSearchTerm, ['sku', 'name'])
  }, [debouncedSearchTerm])

  // Thêm sản phẩm vào phiếu kiểm kho
  const handleAddProduct = (product) => {
    if (!currentCheck) {
      addInAppNotification('Vui lòng tạo phiếu kiểm kho trước', 'error')
      return
    }

    // Kiểm tra xem sản phẩm đã có trong phiếu chưa
    const existingItem = checkItems.find(item => item.productId === product.id)
    if (existingItem) {
      addInAppNotification('Sản phẩm đã có trong phiếu kiểm kho', 'error')
      return
    }

    const newItem = addInventoryCheckItem({
      checkId: currentCheck.id,
      productId: product.id,
      productSku: product.sku,
      productName: product.name,
      productUnit: product.unit,
      unitPrice: product.price,
      systemQuantity: product.stock,
      actualQuantity: product.stock, // Mặc định bằng số lượng hệ thống
      difference: 0,
      notes: '',
    })

    setCheckItems([...checkItems, newItem])
    setSearchTerm('')
    searchInputRef.current?.focus()
  }

  // Cập nhật số lượng thực tế
  const handleUpdateQuantity = (itemId, quantity) => {
    const item = checkItems.find(i => i.id === itemId)
    if (!item) return

    const actualQty = Number(quantity) || 0
    const systemQty = item.systemQuantity || 0
    const difference = actualQty - systemQty

    const updatedItem = updateInventoryCheckItem(itemId, {
      actualQuantity: actualQty,
      difference,
    })

    setCheckItems(checkItems.map(i => i.id === itemId ? updatedItem : i))
  }

  // Xóa item khỏi phiếu
  const handleRemoveItem = (itemId) => {
    deleteInventoryCheckItem(itemId)
    setCheckItems(checkItems.filter(i => i.id !== itemId))
    addInAppNotification('Đã xóa sản phẩm khỏi phiếu', 'success')
  }

  // Lưu phiếu kiểm kho
  const handleSaveCheck = () => {
    if (!currentCheck) return

    updateInventoryCheck(currentCheck.id, {
      description: notes,
      status: checkItems.length > 0 ? 'in_progress' : 'draft',
    })

    addInAppNotification('Đã lưu phiếu kiểm kho', 'success')
  }

  // Hoàn thành phiếu kiểm kho
  const handleCompleteCheck = () => {
    if (!currentCheck || checkItems.length === 0) {
      addInAppNotification('Phiếu kiểm kho chưa có sản phẩm nào', 'error')
      return
    }

    if (!window.confirm('Bạn có chắc muốn hoàn thành phiếu kiểm kho? Tồn kho sẽ được cập nhật.')) {
      return
    }

    try {
      completeInventoryCheck(currentCheck.id, true)
      setCurrentCheck(null)
      setCheckItems([])
      setNotes('')
      addInAppNotification('Đã hoàn thành phiếu kiểm kho và cập nhật tồn kho', 'success')
    } catch (error) {
      addInAppNotification('Không thể hoàn thành phiếu kiểm kho', 'error')
    }
  }

  // Tính tổng chênh lệch
  const totalDifference = checkItems.reduce((sum, item) => sum + (item.difference || 0), 0)
  const totalValue = checkItems.reduce((sum, item) => sum + (item.difference || 0) * (item.unitPrice || 0), 0)

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Kiểm kho & Cân kho</h1>
            <p className="text-sm text-slate-500 mt-1">Quản lý kiểm tra tồn kho và cân hàng hóa</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="btn-secondary inline-flex items-center gap-2"
            >
              <FileText size={16} />
              Lịch sử
            </button>
            {!currentCheck && (
              <button
                onClick={handleCreateNewCheck}
                className="btn-primary inline-flex items-center gap-2"
              >
                <Plus size={16} />
                Tạo phiếu kiểm kho
              </button>
            )}
          </div>
        </div>

        {showHistory ? (
          /* Lịch sử kiểm kho */
          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Lịch sử kiểm kho</h2>
              <button
                onClick={() => setShowHistory(false)}
                className="btn-secondary inline-flex items-center gap-2"
              >
                <ArrowLeft size={16} />
                Quay lại
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Mã phiếu</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Tên phiếu</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Ngày kiểm</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-slate-700">Số sản phẩm</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-slate-700">Chênh lệch</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-slate-700">Giá trị</th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-slate-700">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {history.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                        Chưa có lịch sử kiểm kho
                      </td>
                    </tr>
                  ) : (
                    history.map((check) => (
                      <tr key={check.id} className="hover:bg-slate-50">
                        <td className="px-4 py-3 text-sm font-mono text-slate-900">{check.code}</td>
                        <td className="px-4 py-3 text-sm text-slate-700">{check.name}</td>
                        <td className="px-4 py-3 text-sm text-slate-700">
                          {new Date(check.completedAt || check.createdAt).toLocaleString('vi-VN')}
                        </td>
                        <td className="px-4 py-3 text-sm text-right text-slate-700">{check.totalItems || 0}</td>
                        <td className={`px-4 py-3 text-sm text-right font-medium ${
                          (check.totalDifference || 0) > 0 ? 'text-green-600' : 
                          (check.totalDifference || 0) < 0 ? 'text-rose-600' : 'text-slate-700'
                        }`}>
                          {check.totalDifference > 0 ? '+' : ''}{check.totalDifference || 0}
                        </td>
                        <td className="px-4 py-3 text-sm text-right text-slate-700">
                          {((check.totalValue || 0) / 1000).toFixed(0)}k đ
                        </td>
                        <td className="px-4 py-3 text-center">
                          <button className="btn-secondary p-1.5" title="Xem chi tiết">
                            <Eye size={14} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : currentCheck ? (
          /* Form kiểm kho */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Tìm và thêm sản phẩm */}
            <div className="lg:col-span-1 space-y-4">
              <div className="bg-white rounded-lg border border-slate-200 p-4">
                <h3 className="text-lg font-semibold mb-4">Thông tin phiếu</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Mã phiếu</label>
                    <div className="text-sm font-mono text-slate-900">{currentCheck.code}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Tên phiếu</label>
                    <input
                      type="text"
                      value={currentCheck.name}
                      onChange={(e) => {
                        const updated = updateInventoryCheck(currentCheck.id, { name: e.target.value })
                        setCurrentCheck(updated)
                      }}
                      className="input-field w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Ghi chú</label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Nhập ghi chú..."
                      className="input-field w-full min-h-[80px] resize-none"
                      rows={3}
                    />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg border border-slate-200 p-4">
                <h3 className="text-lg font-semibold mb-4">Tìm sản phẩm</h3>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    ref={searchInputRef}
                    type="text"
                    placeholder="Quét mã hoặc tìm tên sản phẩm"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="input-field pl-10 w-full"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && filteredProducts.length > 0) {
                        handleAddProduct(filteredProducts[0])
                      }
                    }}
                  />
                </div>
                {filteredProducts.length > 0 && (
                  <div className="mt-2 border border-slate-200 rounded-lg max-h-60 overflow-y-auto">
                    {filteredProducts.map((product) => (
                      <button
                        key={product.id}
                        onClick={() => handleAddProduct(product)}
                        className="w-full text-left px-3 py-2 hover:bg-slate-50 border-b border-slate-100 last:border-b-0"
                      >
                        <div className="font-medium text-sm text-slate-900">{product.name}</div>
                        <div className="text-xs text-slate-500 mt-0.5">
                          {product.sku} • Tồn: {product.stock} {product.unit}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Tổng kết */}
              <div className="bg-white rounded-lg border border-slate-200 p-4">
                <h3 className="text-lg font-semibold mb-4">Tổng kết</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Số sản phẩm:</span>
                    <span className="font-medium">{checkItems.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Chênh lệch:</span>
                    <span className={`font-medium ${
                      totalDifference > 0 ? 'text-green-600' : 
                      totalDifference < 0 ? 'text-rose-600' : 'text-slate-700'
                    }`}>
                      {totalDifference > 0 ? '+' : ''}{totalDifference}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Giá trị:</span>
                    <span className="font-medium">{(totalValue / 1000).toFixed(0)}k đ</span>
                  </div>
                </div>
                <div className="mt-4 space-y-2">
                  <button
                    onClick={handleSaveCheck}
                    className="btn-secondary w-full inline-flex items-center justify-center gap-2"
                  >
                    <Save size={16} />
                    Lưu phiếu
                  </button>
                  <button
                    onClick={handleCompleteCheck}
                    className="btn-primary w-full inline-flex items-center justify-center gap-2"
                  >
                    <CheckCircle size={16} />
                    Hoàn thành
                  </button>
                  <button
                    onClick={() => {
                      setCurrentCheck(null)
                      setCheckItems([])
                      setNotes('')
                    }}
                    className="btn-secondary w-full inline-flex items-center justify-center gap-2"
                  >
                    <ArrowLeft size={16} />
                    Hủy phiếu
                  </button>
                </div>
              </div>
            </div>

            {/* Right: Danh sách sản phẩm đã kiểm */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg border border-slate-200">
                <div className="p-4 border-b border-slate-200">
                  <h3 className="text-lg font-semibold">Danh sách sản phẩm đã kiểm</h3>
                </div>
                <div className="overflow-x-auto">
                  {checkItems.length === 0 ? (
                    <div className="p-8 text-center text-slate-500">
                      <Package size={48} className="mx-auto mb-3 text-slate-300" />
                      <p>Chưa có sản phẩm nào. Tìm kiếm để thêm vào phiếu.</p>
                    </div>
                  ) : (
                    <table className="w-full">
                      <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Mã SP</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Tên sản phẩm</th>
                          <th className="px-4 py-3 text-right text-sm font-semibold text-slate-700">Tồn hệ thống</th>
                          <th className="px-4 py-3 text-right text-sm font-semibold text-slate-700">Thực tế</th>
                          <th className="px-4 py-3 text-right text-sm font-semibold text-slate-700">Chênh lệch</th>
                          <th className="px-4 py-3 text-center text-sm font-semibold text-slate-700">Thao tác</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {checkItems.map((item) => {
                          const diff = item.difference || 0
                          return (
                            <tr key={item.id} className="hover:bg-slate-50">
                              <td className="px-4 py-3 text-sm font-mono text-slate-900">{item.productSku}</td>
                              <td className="px-4 py-3 text-sm text-slate-700">{item.productName}</td>
                              <td className="px-4 py-3 text-sm text-right text-slate-700">
                                {item.systemQuantity || 0} {item.productUnit}
                              </td>
                              <td className="px-4 py-3">
                                <input
                                  type="number"
                                  value={item.actualQuantity || ''}
                                  onChange={(e) => handleUpdateQuantity(item.id, e.target.value)}
                                  className="input-field w-24 text-right"
                                  min="0"
                                />
                              </td>
                              <td className={`px-4 py-3 text-sm text-right font-medium ${
                                diff > 0 ? 'text-green-600' : 
                                diff < 0 ? 'text-rose-600' : 'text-slate-700'
                              }`}>
                                {diff > 0 ? '+' : ''}{diff}
                                {diff !== 0 && (
                                  <span className="ml-1">
                                    {diff > 0 ? <AlertTriangle size={14} className="inline text-green-600" /> : 
                                     <AlertTriangle size={14} className="inline text-rose-600" />}
                                  </span>
                                )}
                              </td>
                              <td className="px-4 py-3 text-center">
                                <button
                                  onClick={() => handleRemoveItem(item.id)}
                                  className="btn-secondary p-1.5 text-rose-600 hover:bg-rose-50"
                                  title="Xóa"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Empty state */
          <div className="bg-white rounded-lg border border-slate-200 p-12 text-center">
            <Scale size={64} className="mx-auto mb-4 text-slate-300" />
            <h2 className="text-xl font-semibold text-slate-900 mb-2">Chưa có phiếu kiểm kho</h2>
            <p className="text-slate-500 mb-6">Tạo phiếu kiểm kho mới để bắt đầu kiểm tra tồn kho</p>
            <button
              onClick={handleCreateNewCheck}
              className="btn-primary inline-flex items-center gap-2"
            >
              <Plus size={16} />
              Tạo phiếu kiểm kho
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default InventoryCheck

