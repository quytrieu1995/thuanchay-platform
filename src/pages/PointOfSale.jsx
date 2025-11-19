import { useMemo, useState } from 'react'
import { MinusCircle, PlusCircle, Search, Trash2 } from 'lucide-react'

const mockProducts = [
  { id: 'SP001', name: 'Áo thun basic', sku: 'ATB-01', price: 180000, stock: 42 },
  { id: 'SP002', name: 'Áo sơ mi linen', sku: 'ASM-03', price: 260000, stock: 15 },
  { id: 'SP003', name: 'Quần jeans slim', sku: 'QJ-02', price: 320000, stock: 28 },
  { id: 'SP004', name: 'Váy midi caro', sku: 'VMC-07', price: 410000, stock: 12 },
  { id: 'SP005', name: 'Giày sneaker trắng', sku: 'GST-05', price: 540000, stock: 9 },
]

const branches = ['Quận 1', 'Quận 3', 'Phú Nhuận', 'Hà Nội']

const formatCurrency = (value) =>
  value.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })

const PointOfSale = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedBranch, setSelectedBranch] = useState(branches[0])
  const [cartItems, setCartItems] = useState([])
  const [orderNote, setOrderNote] = useState('')
  const [couponCode, setCouponCode] = useState('')
  const [discount, setDiscount] = useState(0)
  const [includeVat, setIncludeVat] = useState(false)
  const [otherFee, setOtherFee] = useState(0)
  const [codEnabled, setCodEnabled] = useState(true)
  const [deliveryInfo, setDeliveryInfo] = useState({
    customerName: '',
    phone: '',
    address: '',
    district: '',
    ward: '',
    locationCode: 'VP43+GM Quận 12, Hồ Chí Minh, Việt Nam, Phường An Phú Đông',
    weight: 500,
    unit: 'gram',
    length: 10,
    width: 10,
    height: 10,
    noteForCourier: '',
  })

  const filteredProducts = useMemo(() => {
    if (!searchTerm.trim()) return []
    return mockProducts.filter(
      (item) =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.sku.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [searchTerm])

  const handleAddProduct = (product) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.id === product.id)
      if (existing) {
        return prev.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      }
      return [...prev, { ...product, quantity: 1 }]
    })
    setSearchTerm('')
  }

  const handleUpdateQuantity = (id, nextQuantity) => {
    setCartItems((prev) =>
      prev
        .map((item) =>
          item.id === id ? { ...item, quantity: Math.max(1, nextQuantity) } : item
        )
        .filter((item) => item.quantity > 0)
    )
  }

  const handleRemoveItem = (id) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id))
  }

  const subtotal = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [cartItems]
  )
  const vatAmount = includeVat ? subtotal * 0.1 : 0
  const grandTotal = Math.max(subtotal - discount + vatAmount + otherFee, 0)

  const handleDeliveryChange = (field, value) => {
    setDeliveryInfo((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
            Giao diện bán hàng
          </p>
          <h1 className="text-2xl font-semibold text-slate-900">Tạo hóa đơn mới</h1>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <p className="font-semibold text-slate-700 dark:text-slate-100">{selectedBranch}</p>
          <p className="text-xs text-slate-500">
            {new Date().toLocaleString('vi-VN', {
              hour: '2-digit',
              minute: '2-digit',
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
            })}
          </p>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.8fr_1fr]">
        <section className="card p-0">
          <div className="border-b border-slate-200 bg-slate-50 px-6 py-4">
            <div className="relative">
              <Search
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                size={20}
              />
              <input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                className="input-field h-14 rounded-2xl border-2 border-primary-100 bg-white pl-12 text-base font-medium text-slate-800 focus:border-primary-400 focus:ring-primary-200"
                placeholder="Tìm hàng hóa (F3)"
              />
              {filteredProducts.length > 0 && (
                <div className="absolute z-10 mt-2 w-full rounded-2xl border border-slate-200 bg-white text-sm shadow-lg">
                  {filteredProducts.map((product) => (
                    <button
                      key={product.id}
                      type="button"
                      onClick={() => handleAddProduct(product)}
                      className="flex w-full items-center justify-between px-4 py-3 text-left hover:bg-primary-50"
                    >
                      <div>
                        <p className="font-semibold text-slate-900">{product.name}</p>
                        <p className="text-xs text-slate-500">
                          {product.sku} • Còn {product.stock}
                        </p>
                      </div>
                      <span className="text-sm font-semibold text-primary-600">
                        {formatCurrency(product.price)}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="min-h-[380px] divide-y divide-slate-100">
            {cartItems.length === 0 ? (
              <div className="flex h-[360px] flex-col items-center justify-center text-center text-slate-400">
                <div className="rounded-full border border-dashed border-slate-200 px-6 py-3 text-sm font-semibold uppercase tracking-[0.3em]">
                  Chưa có sản phẩm
                </div>
                <p className="mt-4 text-sm">
                  Sử dụng ô tìm kiếm hoặc quét mã để thêm hàng hóa vào hóa đơn
                </p>
              </div>
            ) : (
              cartItems.map((item) => (
                <div key={item.id} className="grid grid-cols-[1fr_auto_auto_auto] items-center gap-4 px-6 py-4">
                  <div>
                    <p className="font-semibold text-slate-900">{item.name}</p>
                    <p className="text-xs text-slate-500">
                      {item.sku} • {formatCurrency(item.price)}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      className="text-slate-400 hover:text-primary-600"
                      onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                    >
                      <MinusCircle size={20} />
                    </button>
                    <input
                      type="number"
                      min="1"
                      className="w-16 rounded-xl border border-slate-200 py-1 text-center text-sm font-semibold"
                      value={item.quantity}
                      onChange={(event) =>
                        handleUpdateQuantity(item.id, Number(event.target.value) || 1)
                      }
                    />
                    <button
                      type="button"
                      className="text-slate-400 hover:text-primary-600"
                      onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                    >
                      <PlusCircle size={20} />
                    </button>
                  </div>
                  <p className="text-right text-sm font-semibold text-slate-900">
                    {formatCurrency(item.price * item.quantity)}
                  </p>
                  <button
                    type="button"
                    onClick={() => handleRemoveItem(item.id)}
                    className="text-slate-400 hover:text-rose-500"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))
            )}
          </div>

          <div className="grid gap-6 border-t border-slate-100 p-6 lg:grid-cols-[1.2fr_0.8fr]">
            <div>
              <p className="mb-2 text-sm font-semibold text-slate-700">Ghi chú đơn hàng</p>
              <textarea
                value={orderNote}
                onChange={(event) => setOrderNote(event.target.value)}
                className="input-field min-h-[90px]"
                placeholder="Thêm lưu ý cho hóa đơn..."
              />
            </div>
            <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4 text-sm text-slate-600">
              <div className="flex justify-between py-1">
                <span>Tổng tiền hàng</span>
                <span className="font-semibold text-slate-900">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex flex-col gap-2 py-2">
                <label className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
                  Giảm giá hóa đơn
                </label>
                <input
                  type="number"
                  min="0"
                  className="input-field"
                  value={discount}
                  onChange={(event) => setDiscount(Number(event.target.value) || 0)}
                />
              </div>
              <div className="flex flex-col gap-2 py-2">
                <label className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
                  Mã coupon
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    className="input-field flex-1"
                    value={couponCode}
                    onChange={(event) => setCouponCode(event.target.value)}
                    placeholder="Nhập mã"
                  />
                  <button
                    type="button"
                    className="rounded-xl border border-slate-200 px-4 text-xs font-semibold uppercase tracking-[0.3em] text-slate-500 hover:border-primary-200 hover:text-primary-600"
                  >
                    Áp dụng
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-between py-2">
                <span>VAT</span>
                <button
                  type="button"
                  onClick={() => setIncludeVat((prev) => !prev)}
                  className={`inline-flex h-6 w-12 items-center rounded-full px-1 transition ${
                    includeVat ? 'bg-primary-500' : 'bg-slate-200'
                  }`}
                >
                  <span
                    className={`h-4 w-4 rounded-full bg-white shadow transition ${
                      includeVat ? 'translate-x-6' : ''
                    }`}
                  />
                </button>
              </div>
              {includeVat && (
                <div className="flex items-center justify-between pb-2 text-xs text-slate-500">
                  <span>VAT 10%</span>
                  <span className="font-semibold text-slate-700">{formatCurrency(vatAmount)}</span>
                </div>
              )}
              <div className="flex flex-col gap-2 py-2">
                <label className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
                  Thu khác
                </label>
                <input
                  type="number"
                  min="0"
                  className="input-field"
                  value={otherFee}
                  onChange={(event) => setOtherFee(Number(event.target.value) || 0)}
                />
              </div>
              <div className="mt-3 border-t border-dashed border-slate-200 pt-3 text-base font-semibold text-slate-900">
                <div className="flex items-center justify-between">
                  <span>Khách cần trả</span>
                  <span className="text-2xl font-bold text-primary-600">
                    {formatCurrency(grandTotal)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <div className="rounded-3xl border border-slate-200 bg-white p-0 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <div>
                <p className="text-sm font-semibold text-slate-400">Quầy</p>
                <p className="text-lg font-bold text-slate-900">Quý</p>
              </div>
              <select
                value={selectedBranch}
                onChange={(event) => setSelectedBranch(event.target.value)}
                className="rounded-2xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 focus:border-primary-300 focus:outline-none"
              >
                {branches.map((branch) => (
                  <option key={branch} value={branch}>
                    {branch}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-4 px-6 py-4 text-sm text-slate-700">
              <div>
                <label className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
                  Tìm khách hàng (F4)
                </label>
                <input
                  type="text"
                  className="input-field mt-2"
                  placeholder="Nhập tên hoặc số điện thoại"
                  value={deliveryInfo.customerName}
                  onChange={(event) => handleDeliveryChange('customerName', event.target.value)}
                />
              </div>
              <div className="space-y-3 rounded-2xl border border-slate-100 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
                  Thông tin nhận hàng
                </p>
                <input
                  type="text"
                  className="input-field"
                  value={deliveryInfo.locationCode}
                  onChange={(event) => handleDeliveryChange('locationCode', event.target.value)}
                />
                <div className="grid gap-3 md:grid-cols-2">
                  <input
                    type="text"
                    className="input-field"
                    placeholder="Tên người nhận"
                    value={deliveryInfo.customerName}
                    onChange={(event) => handleDeliveryChange('customerName', event.target.value)}
                  />
                  <input
                    type="tel"
                    className="input-field"
                    placeholder="Số điện thoại"
                    value={deliveryInfo.phone}
                    onChange={(event) => handleDeliveryChange('phone', event.target.value)}
                  />
                </div>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Địa chỉ chi tiết (Số nhà, ngõ, đường)"
                  value={deliveryInfo.address}
                  onChange={(event) => handleDeliveryChange('address', event.target.value)}
                />
                <div className="grid gap-3 md:grid-cols-2">
                  <input
                    type="text"
                    className="input-field"
                    placeholder="Tỉnh/TP - Quận/Huyện"
                    value={deliveryInfo.district}
                    onChange={(event) => handleDeliveryChange('district', event.target.value)}
                  />
                  <input
                    type="text"
                    className="input-field"
                    placeholder="Phường/Xã"
                    value={deliveryInfo.ward}
                    onChange={(event) => handleDeliveryChange('ward', event.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-3 rounded-2xl border border-slate-100 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
                  Quy cách kiện hàng
                </p>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    className="input-field"
                    value={deliveryInfo.weight}
                    onChange={(event) =>
                      handleDeliveryChange('weight', Number(event.target.value) || 0)
                    }
                  />
                  <select
                    className="input-field"
                    value={deliveryInfo.unit}
                    onChange={(event) => handleDeliveryChange('unit', event.target.value)}
                  >
                    <option value="gram">gram</option>
                    <option value="kilogram">kilogram</option>
                  </select>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {['length', 'width', 'height'].map((field) => (
                    <input
                      key={field}
                      type="number"
                      min="0"
                      className="input-field"
                      placeholder={field === 'length' ? 'Dài' : field === 'width' ? 'Rộng' : 'Cao'}
                      value={deliveryInfo[field]}
                      onChange={(event) =>
                        handleDeliveryChange(field, Number(event.target.value) || 0)
                      }
                    />
                  ))}
                </div>
                <textarea
                  className="input-field min-h-[60px]"
                  placeholder="Ghi chú cho bưu tá"
                  value={deliveryInfo.noteForCourier}
                  onChange={(event) => handleDeliveryChange('noteForCourier', event.target.value)}
                />
              </div>

              <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
                    Thu hộ tiền (COD)
                  </p>
                  <p className="text-lg font-bold text-primary-600">
                    {codEnabled ? formatCurrency(grandTotal) : formatCurrency(0)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setCodEnabled((prev) => !prev)}
                  className={`inline-flex h-8 w-16 items-center rounded-full px-1 transition ${
                    codEnabled ? 'bg-primary-600' : 'bg-slate-300'
                  }`}
                >
                  <span
                    className={`h-6 w-6 rounded-full bg-white shadow transition ${
                      codEnabled ? 'translate-x-8' : ''
                    }`}
                  />
                </button>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <button
                  type="button"
                  className="rounded-2xl border border-primary-200 bg-primary-50 py-3 text-center font-semibold text-primary-600 transition hover:-translate-y-0.5 hover:bg-primary-100"
                >
                  GIAO HÀNG
                </button>
                <button
                  type="button"
                  className="rounded-2xl border border-primary-600 bg-primary-600 py-3 text-center font-semibold text-white shadow-soft-glow transition hover:-translate-y-0.5 hover:bg-primary-700"
                >
                  THANH TOÁN
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}

export default PointOfSale


