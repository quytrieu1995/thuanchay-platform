import { useState, useEffect, useCallback, useMemo } from 'react'
import { RefreshCw, Download, Database, Cloud, FileText, CheckCircle, XCircle, Loader2, AlertCircle, Info, Settings, Save, RotateCcw, Share2, ClipboardList, Trash2, FileCode, List } from 'lucide-react'
import { syncService, SYNC_METHODS, SYNC_DATA_TYPES } from '../services/syncService'
import { DEFAULT_WEBHOOK_EVENTS } from '../services/webhookService'
import { apiClient } from '../services/apiClient'

const DataSync = () => {
  const [isSyncing, setIsSyncing] = useState(false)
  const [syncProgress, setSyncProgress] = useState(null)
  const [syncResult, setSyncResult] = useState(null)
  const [selectedMethod, setSelectedMethod] = useState(SYNC_METHODS.LOCAL_STORAGE)
  const [selectedDataTypes, setSelectedDataTypes] = useState(Object.values(SYNC_DATA_TYPES))
  const [exportFormat, setExportFormat] = useState('excel')
  const [useLocalStorage, setUseLocalStorage] = useState(false)
  const [isResetting, setIsResetting] = useState(false)
  const [manualToken, setManualToken] = useState('')
  const [manualTokenExpires, setManualTokenExpires] = useState('')
  
  // API Configuration state
  const [showApiConfig, setShowApiConfig] = useState(false)
  const [apiConfig, setApiConfig] = useState({
    clientId: '',
    secretKey: '',
    storeDomain: '',
  })
  const [apiConfigSaved, setApiConfigSaved] = useState(false)

  const DEFAULT_WEBHOOK_CONFIG = {
    callbackUrl: '',
    secret: '',
    verifyToken: '',
    description: 'Thuần Chay VN realtime sync',
    endpoint: '/webhooks',
    events: [...DEFAULT_WEBHOOK_EVENTS],
    active: false,
    remoteId: null,
    lastRegisteredAt: null,
  }

  const [webhookConfig, setWebhookConfig] = useState(() => ({
    ...DEFAULT_WEBHOOK_CONFIG,
    ...(syncService.getWebhookConfig?.() || {}),
  }))
  const [webhookMetadata, setWebhookMetadata] = useState(() => syncService.getWebhookMetadata?.() || null)
  const [webhookLogs, setWebhookLogs] = useState(() => syncService.getWebhookLogs?.() || [])
  const [remoteWebhooks, setRemoteWebhooks] = useState([])
  const [isRegisteringWebhook, setIsRegisteringWebhook] = useState(false)
  const [isLoadingWebhook, setIsLoadingWebhook] = useState(false)
  const [webhookTestPayload, setWebhookTestPayload] = useState('')

  const dataTypeLabels = {
    [SYNC_DATA_TYPES.PRODUCTS]: 'Sản phẩm',
    [SYNC_DATA_TYPES.ORDERS]: 'Đơn hàng',
    [SYNC_DATA_TYPES.CUSTOMERS]: 'Khách hàng',
    [SYNC_DATA_TYPES.RETURNS]: 'Đơn trả hàng',
    [SYNC_DATA_TYPES.SUPPLIERS]: 'Nhà cung cấp',
    [SYNC_DATA_TYPES.PURCHASE_ORDERS]: 'Đơn mua hàng',
    [SYNC_DATA_TYPES.SUPPLIER_RETURNS]: 'Đơn trả nhà cung cấp',
    [SYNC_DATA_TYPES.DESTROY_ORDERS]: 'Đơn hủy',
    [SYNC_DATA_TYPES.RECONCILIATION]: 'Đối soát',
    [SYNC_DATA_TYPES.USERS]: 'Người dùng',
    [SYNC_DATA_TYPES.INVENTORY]: 'Tồn kho',
  }

  const webhookEventLabels = {
    'product.created': 'Sản phẩm - tạo',
    'product.updated': 'Sản phẩm - cập nhật',
    'product.deleted': 'Sản phẩm - xóa',
    'order.created': 'Đơn hàng - tạo',
    'order.updated': 'Đơn hàng - cập nhật',
    'order.deleted': 'Đơn hàng - xóa',
    'customer.created': 'Khách hàng - tạo',
    'customer.updated': 'Khách hàng - cập nhật',
    'customer.deleted': 'Khách hàng - xóa',
    'inventory.updated': 'Tồn kho - cập nhật',
    'supplier.created': 'Nhà cung cấp - tạo',
    'supplier.updated': 'Nhà cung cấp - cập nhật',
    'supplier.deleted': 'Nhà cung cấp - xóa',
    'purchaseorder.created': 'Phiếu nhập - tạo',
    'purchaseorder.updated': 'Phiếu nhập - cập nhật',
    'supplierreturn.created': 'Trả NCC - tạo',
    'supplierreturn.updated': 'Trả NCC - cập nhật',
    'destroyorder.created': 'Xuất hủy - tạo',
    'destroyorder.updated': 'Xuất hủy - cập nhật',
  }

  const allWebhookEvents = useMemo(() => {
    const events = new Set([...(webhookConfig.events || []), ...DEFAULT_WEBHOOK_EVENTS])
    return Array.from(events).sort()
  }, [webhookConfig.events])
 
  const isWebhookMethod = selectedMethod === SYNC_METHODS.WEBHOOK
  const disableSyncButton = isSyncing || (!isWebhookMethod && selectedDataTypes.length === 0)
  const shouldWarnDataType = !isWebhookMethod && selectedDataTypes.length === 0
 
  const handleSync = async () => {
    setIsSyncing(true)
    setSyncProgress(null)
    setSyncResult(null)

    try {
      // Kiểm tra cấu hình API nếu chọn phương thức API
      if (selectedMethod === SYNC_METHODS.API) {
        const credentials = apiClient.getThuanChayVNCredentials?.()
        if (!credentials?.storeDomain) {
          alert('Vui lòng nhập tên gian hàng trước khi đồng bộ!')
          setShowApiConfig(true)
          return
        }
        await apiClient.ensureThuanChayVNToken?.()
      }

      if (isWebhookMethod) {
        if (!webhookConfig.callbackUrl) {
          alert('Vui lòng nhập URL nhận webhook (callbackUrl).')
          return
        }

        const result = await syncService.syncAll({
          method: SYNC_METHODS.WEBHOOK,
          webhookConfig,
        })

        setSyncResult(result)

        if (result.success) {
          const updatedConfig = result?.results?.config || webhookConfig
          setWebhookConfig(prev => ({ ...prev, ...updatedConfig }))
          setWebhookMetadata(syncService.getWebhookMetadata?.() || null)
          setWebhookLogs(syncService.getWebhookLogs?.() || [])
          alert('Đăng ký webhook thành công! Thuần Chay VN sẽ gửi dữ liệu realtime tới callback của bạn.')
        } else {
          alert(`Không thể đăng ký webhook: ${result?.error || 'Không rõ nguyên nhân'}`)
        }
        return
      }

      const result = await syncService.syncAll({
        method: selectedMethod,
        exportFormat,
        filename: 'Thuần Chay VN-sync',
        dataTypes: selectedDataTypes,
        useLocalStorage,
        useApiCredentials: selectedMethod === SYNC_METHODS.API,
        onProgress: (progress) => {
          setSyncProgress(progress)
        },
      })

      setSyncResult(result)

      if (result.success) {
        // Hiển thị thông báo thành công
        if (selectedMethod === SYNC_METHODS.EXPORT_FILE) {
          alert(`Đã xuất dữ liệu thành công!\n\nFile: ${result.results.filename}\nTổng số bản ghi: ${result.results.totalItems}`)
        } else {
          alert('Đồng bộ dữ liệu thành công!')
        }
        window.dispatchEvent(new Event('Thuần Chay VN-data-updated'))
      } else {
        alert(`Lỗi đồng bộ: ${result.error}`)
      }
    } catch (error) {
      console.error('Sync error:', error)
      setSyncResult({
        success: false,
        error: error.message || 'Có lỗi xảy ra khi đồng bộ dữ liệu',
      })
      alert(`Lỗi: ${error.message || 'Có lỗi xảy ra khi đồng bộ dữ liệu'}`)
    } finally {
      setIsSyncing(false)
      setSyncProgress(null)
    }
  }

  const toggleDataType = (type) => {
    if (selectedDataTypes.includes(type)) {
      setSelectedDataTypes(selectedDataTypes.filter(t => t !== type))
    } else {
      setSelectedDataTypes([...selectedDataTypes, type])
    }
  }

  const selectAllDataTypes = () => {
    setSelectedDataTypes(Object.values(SYNC_DATA_TYPES))
  }

  const deselectAllDataTypes = () => {
    setSelectedDataTypes([])
  }

  const lastSyncInfo = syncService.getLastSyncInfo()

  // Load API config từ localStorage
  useEffect(() => {
    const credentials = apiClient.getThuanChayVNCredentials?.() || apiClient.getApiConfig()
    setApiConfig({
      clientId: credentials?.clientId || '',
      secretKey: credentials?.secretKey || '',
      storeDomain: credentials?.storeDomain || '',
    })

    const token = apiClient.getStoredToken?.()
    if (token) {
      setManualToken(token)
      const expires = localStorage.getItem('authTokenExpires')
      if (expires) {
        setManualTokenExpires(new Date(Number(expires) * 1000).toISOString().slice(0, 16))
      }
    }

    const savedWebhookConfig = syncService.getWebhookConfig?.()
    if (savedWebhookConfig) {
      setWebhookConfig(prev => ({ ...prev, ...savedWebhookConfig }))
    }
    setWebhookMetadata(syncService.getWebhookMetadata?.() || null)
    setWebhookLogs(syncService.getWebhookLogs?.() || [])
  }, [])

  // Lưu API config
  const handleSaveApiConfig = () => {
    try {
      apiClient.saveThuanChayVNCredentials?.({ storeDomain: apiConfig.storeDomain })
      setApiConfigSaved(true)
      setTimeout(() => setApiConfigSaved(false), 3000)
      alert('Đã lưu tên gian hàng Thuần Chay VN!')
    } catch (error) {
      console.error('Error saving store information:', error)
      alert('Lỗi khi lưu thông tin gian hàng')
    }
  }

  const handleTestToken = () => {
    try {
      const info = apiClient.testThuanChayVNToken?.()
      if (info) {
        alert(`Token hợp lệ cho gian hàng ${info.storeDomain}.\nToken: ${info.tokenPreview}${info.expiresAt ? `\nHết hạn: ${info.expiresAt}` : ''}`)
      } else {
        alert('Không lấy được thông tin token. Vui lòng nhập lại token.')
      }
    } catch (error) {
      alert(`Không thể kiểm tra token: ${error.message}`)
    }
  }

  const handleSaveManualToken = () => {
    if (!manualToken) {
      apiClient.saveManualToken?.('', null)
      alert('Đã xóa token thủ công. Nếu đang dùng API Thuần Chay VN, hãy tạo token mới.')
      return
    }

    let expiresSeconds = null
    if (manualTokenExpires) {
      const parsed = new Date(manualTokenExpires)
      if (Number.isNaN(parsed.getTime())) {
        alert('Thời gian hết hạn không hợp lệ. Vui lòng nhập theo định dạng yyyy-MM-ddTHH:mm')
        return
      }
      expiresSeconds = Math.floor(parsed.getTime() / 1000)
    }

    apiClient.saveManualToken?.(manualToken, expiresSeconds)
    alert('Đã lưu token thủ công!')
  }

  const normalizeEventArray = (events) => Array.from(new Set((events || []).filter(Boolean))).sort()

  const updateWebhookConfig = (changes) => {
    setWebhookConfig(prev => ({
      ...prev,
      ...changes,
      events: normalizeEventArray(changes.events ?? prev.events ?? []),
    }))
  }

  const handleToggleWebhookEvent = (eventName) => {
    setWebhookConfig(prev => {
      const events = new Set(prev.events || [])
      if (events.has(eventName)) {
        events.delete(eventName)
      } else {
        events.add(eventName)
      }
      const nextEvents = normalizeEventArray(Array.from(events))
      return { ...prev, events: nextEvents }
    })
  }

  const handleSaveWebhookConfigLocal = () => {
    try {
      const saved = syncService.saveWebhookConfig?.(webhookConfig)
      if (saved) {
        setWebhookConfig(saved)
        alert('Đã lưu cấu hình webhook vào trình duyệt.')
      }
    } catch (error) {
      console.error('save webhook config error', error)
      alert(`Không thể lưu cấu hình webhook: ${error.message || 'Không rõ nguyên nhân'}`)
    }
  }

  const handleRegisterWebhookDirect = async () => {
    setIsRegisteringWebhook(true)
    try {
      const result = await syncService.registerWebhookDirect?.(webhookConfig)
      if (result.success) {
        setWebhookConfig(prev => ({ ...prev, ...result.data }))
        setWebhookMetadata(syncService.getWebhookMetadata?.() || null)
        setWebhookLogs(syncService.getWebhookLogs?.() || [])
        alert('Đăng ký webhook thành công! Thuần Chay VN sẽ gửi dữ liệu realtime tới callback của bạn.')
      } else {
        alert(`Không thể đăng ký webhook: ${result?.error || 'Không rõ nguyên nhân'}`)
      }
    } catch (error) {
      console.error('register webhook error', error)
      alert(`Lỗi khi đăng ký webhook: ${error.message || 'Không rõ nguyên nhân'}`)
    } finally {
      setIsRegisteringWebhook(false)
    }
  }

  const handleUnregisterWebhook = async () => {
    setIsRegisteringWebhook(true)
    try {
      const result = await syncService.unregisterWebhook?.(webhookConfig.remoteId)
      if (result.success) {
        setWebhookConfig(prev => ({ ...prev, active: false, remoteId: null, lastRegisteredAt: null }))
        setWebhookMetadata(null)
        setWebhookLogs([])
        alert('Đã hủy đăng ký webhook thành công!')
      } else {
        alert(`Không thể hủy đăng ký webhook: ${result?.error || 'Không rõ nguyên nhân'}`)
      }
    } catch (error) {
      console.error('unregister webhook error', error)
      alert(`Lỗi khi hủy đăng ký webhook: ${error.message || 'Không rõ nguyên nhân'}`)
    } finally {
      setIsRegisteringWebhook(false)
    }
  }

  const handleFetchRemoteWebhooks = async () => {
    setIsLoadingWebhook(true)
    try {
      const response = await syncService.listRemoteWebhooks?.()
      const data = response?.data || response?.items || response?.webhooks || response
      const list = Array.isArray(data) ? data : data ? [data] : []
      setRemoteWebhooks(list)
      handleRefreshWebhookLogs()
    } catch (error) {
      console.error('fetch remote webhooks error', error)
      alert(`Không thể lấy danh sách webhook: ${error.message || 'Không rõ nguyên nhân'}`)
    } finally {
      setIsLoadingWebhook(false)
    }
  }

  const handleRefreshWebhookLogs = () => {
    setWebhookLogs(syncService.getWebhookLogs?.() || [])
  }

  const handleClearWebhookLogs = () => {
    const confirmed = window.confirm('Xóa toàn bộ nhật ký webhook trong trình duyệt?')
    if (!confirmed) return
    syncService.clearWebhookLogs?.()
    setWebhookLogs([])
  }

  const handleSimulateWebhook = () => {
    if (!webhookTestPayload.trim()) {
      alert('Vui lòng nhập payload JSON để giả lập.')
      return
    }
    try {
      const parsed = JSON.parse(webhookTestPayload)
      const result = syncService.simulateWebhookPayload?.(parsed)
      setWebhookLogs(syncService.getWebhookLogs?.() || [])
      setWebhookMetadata(syncService.getWebhookMetadata?.() || null)
      alert(result?.success ? 'Đã xử lý payload webhook giả lập.' : `Payload không hợp lệ: ${result?.message || 'Không rõ nguyên nhân'}`)
    } catch (error) {
      alert(`Payload JSON không hợp lệ: ${error.message}`)
    }
  }

  const formatDateTime = (value) => {
    if (!value) return '—'
    try {
      return new Date(value).toLocaleString('vi-VN')
    } catch {
      return value
    }
  }
 
  const handleResetData = useCallback(() => {
    const confirmed = window.confirm(
      'Thao tác này sẽ xóa toàn bộ dữ liệu đã lưu trên trình duyệt (bao gồm cấu hình, đăng nhập, thiết lập đồng bộ...). Bạn có chắc chắn muốn reset không?'
    )

    if (!confirmed) {
      return
    }

    try {
      setIsResetting(true)
      const result = syncService.resetApplicationData()
      const count = result?.removedKeys?.length || 0
      alert(`Đã reset dữ liệu cục bộ${count ? ` (đã xóa ${count} mục)` : ''}. Trang sẽ được tải lại.`)
      window.location.reload()
      window.dispatchEvent(new Event('Thuần Chay VN-data-updated'))
    } catch (error) {
      console.error('Reset data error:', error)
      alert(`Lỗi khi reset dữ liệu: ${error.message || 'Không rõ nguyên nhân'}`)
      setIsResetting(false)
    }
  }, [])

  const refreshWebhookState = () => {
    const saved = syncService.getWebhookConfig?.() || {}
    setWebhookConfig(prev => ({
      ...prev,
      ...saved,
      events: normalizeEventArray(saved.events ?? prev.events ?? []),
    }))
    setWebhookMetadata(syncService.getWebhookMetadata?.() || null)
    setWebhookLogs(syncService.getWebhookLogs?.() || [])
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-2">Đồng bộ dữ liệu</h2>
        <p className="text-sm text-gray-600">
          Đồng bộ tất cả dữ liệu Thuần Chay VN đến backend API, lưu vào localStorage, hoặc xuất ra file
        </p>
      </div>

      {/* Thông tin đồng bộ cuối */}
      {lastSyncInfo && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Info size={20} className="text-blue-600 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-blue-900">Lần đồng bộ cuối</p>
              <p className="text-xs text-blue-700 mt-1">
                Thời gian: {new Date(lastSyncInfo.lastSync).toLocaleString('vi-VN')}
              </p>
              <p className="text-xs text-blue-700">
                Tổng số bản ghi: {lastSyncInfo.totalItems}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Cấu hình API */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Settings size={20} className="text-primary-600" />
            <h3 className="text-lg font-semibold">Cấu hình API</h3>
          </div>
          <button
            onClick={() => setShowApiConfig(!showApiConfig)}
            className="text-sm text-primary-600 hover:text-primary-700"
          >
            {showApiConfig ? 'Ẩn cấu hình' : 'Hiển thị cấu hình'}
          </button>
        </div>

        {showApiConfig && (
          <div className="space-y-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tên miền gian hàng (Retailer) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={apiConfig.storeDomain}
                  onChange={(e) => setApiConfig({ ...apiConfig, storeDomain: e.target.value.trim() })}
                  className="input-field"
                  placeholder="ví dụ: ten-gian-hang"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Tên miền gian hàng Thuần Chay VN (Retailer). Ví dụ: nếu URL gian hàng là <code>https://ten-gian-hang.Thuần Chay VN.vn</code>, nhập <code>ten-gian-hang</code>.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleSaveApiConfig}
                className="btn-primary flex items-center gap-2"
              >
                <Save size={16} />
                Lưu cấu hình
              </button>
            </div>

            {apiConfigSaved && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <p className="text-sm text-green-800">Đã lưu cấu hình API thành công!</p>
              </div>
            )}

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-xs text-blue-800">
                <strong>Lưu ý:</strong> Chỉ cần nhập Tên miền gian hàng Thuần Chay VN và token (có thể lấy từ backend/Postman). Hệ thống đã biết sẵn URL và sẽ tự động gắn header <code>Retailer</code> đúng gian hàng.
              </p>
            </div>

            <div className="pt-4 border-t border-gray-200 space-y-3">
              <h4 className="text-md font-semibold text-gray-800">Token Thuần Chay VN (nhập thủ công)</h4>
              <p className="text-xs text-gray-500">Bạn có thể paste access token lấy từ backend/Postman vào đây. Nếu có thời gian hết hạn, nhập theo múi giờ hiện tại.</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Access Token
                  </label>
                  <textarea
                    value={manualToken}
                    onChange={(e) => setManualToken(e.target.value)}
                    className="input-field h-24"
                    placeholder="Paste token Thuần Chay VN tại đây"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Hết hạn (yyyy-MM-ddTHH:mm)
                  </label>
                  <input
                    type="datetime-local"
                    value={manualTokenExpires}
                    onChange={(e) => setManualTokenExpires(e.target.value)}
                    className="input-field"
                    placeholder=""
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleSaveManualToken}
                  className="btn-secondary flex items-center gap-2"
                >
                  <Save size={16} />
                  Lưu token thủ công
                </button>
                <button
                  onClick={handleTestToken}
                  className="btn-secondary flex items-center gap-2"
                >
                  <CheckCircle size={16} />
                  Kiểm tra token
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Chọn phương thức đồng bộ */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">Phương thức đồng bộ</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <button
            onClick={() => setSelectedMethod(SYNC_METHODS.LOCAL_STORAGE)}
            className={`p-4 border-2 rounded-lg transition-all ${
              selectedMethod === SYNC_METHODS.LOCAL_STORAGE
                ? 'border-primary-500 bg-primary-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <Database size={24} className={`mb-2 ${selectedMethod === SYNC_METHODS.LOCAL_STORAGE ? 'text-primary-600' : 'text-gray-400'}`} />
            <p className="font-medium">LocalStorage</p>
            <p className="text-xs text-gray-600 mt-1">Lưu vào trình duyệt</p>
          </button>

          <button
            onClick={() => setSelectedMethod(SYNC_METHODS.API)}
            className={`p-4 border-2 rounded-lg transition-all ${
              selectedMethod === SYNC_METHODS.API
                ? 'border-primary-500 bg-primary-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <Cloud size={24} className={`mb-2 ${selectedMethod === SYNC_METHODS.API ? 'text-primary-600' : 'text-gray-400'}`} />
            <p className="font-medium">Backend API</p>
            <p className="text-xs text-gray-600 mt-1">Đồng bộ đến server</p>
          </button>

          <button
            onClick={() => setSelectedMethod(SYNC_METHODS.EXPORT_FILE)}
            className={`p-4 border-2 rounded-lg transition-all ${
              selectedMethod === SYNC_METHODS.EXPORT_FILE
                ? 'border-primary-500 bg-primary-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <Download size={24} className={`mb-2 ${selectedMethod === SYNC_METHODS.EXPORT_FILE ? 'text-primary-600' : 'text-gray-400'}`} />
            <p className="font-medium">Xuất file</p>
            <p className="text-xs text-gray-600 mt-1">Tải về máy tính</p>
          </button>

          <button
            onClick={() => setSelectedMethod(SYNC_METHODS.WEBHOOK)}
            className={`p-4 border-2 rounded-lg transition-all ${
              selectedMethod === SYNC_METHODS.WEBHOOK
                ? 'border-primary-500 bg-primary-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <Share2 size={24} className={`mb-2 ${selectedMethod === SYNC_METHODS.WEBHOOK ? 'text-primary-600' : 'text-gray-400'}`} />
            <p className="font-medium">Webhook realtime</p>
            <p className="text-xs text-gray-600 mt-1">Nhận dữ liệu tự động từ Thuần Chay VN</p>
          </button>
        </div>

        {/* Tùy chọn xuất file */}
        {selectedMethod === SYNC_METHODS.EXPORT_FILE && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Định dạng file
            </label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  value="excel"
                  checked={exportFormat === 'excel'}
                  onChange={(e) => setExportFormat(e.target.value)}
                  className="w-4 h-4 text-primary-600"
                />
                <FileText size={16} />
                <span>Excel (.xlsx)</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  value="json"
                  checked={exportFormat === 'json'}
                  onChange={(e) => setExportFormat(e.target.value)}
                  className="w-4 h-4 text-primary-600"
                />
                <FileText size={16} />
                <span>JSON (.json)</span>
              </label>
            </div>
          </div>
        )}
      </div>

      {/* Webhook realtime */}
      <div className="card space-y-6">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Share2 size={20} className="text-primary-600" />
              Webhook Thuần Chay VN (Realtime)
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Thuần Chay VN sẽ gửi sự kiện realtime (sản phẩm, đơn hàng, khách hàng...) đến URL webhook của bạn để dữ liệu trong ứng dụng luôn được cập nhật.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <span className={`px-3 py-1 rounded-full border ${webhookConfig.active ? 'bg-green-50 border-green-200 text-green-700' : 'bg-gray-100 border-gray-200 text-gray-600'}`}>
              Trạng thái: {webhookConfig.active ? 'Đang hoạt động' : 'Chưa kích hoạt'}
            </span>
            {webhookConfig.remoteId && (
              <span className="px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700">
                ID: {webhookConfig.remoteId}
              </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              URL nhận webhook (Callback URL) <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={webhookConfig.callbackUrl}
              onChange={(e) => updateWebhookConfig({ callbackUrl: e.target.value })}
              className="input-field"
              placeholder="https://your-domain.com/api/Thuần Chay VN/webhook"
            />
            <p className="text-xs text-gray-500 mt-1">
              URL này phải public và hỗ trợ HTTPS để Thuần Chay VN gửi sự kiện.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Secret (tùy chọn)
            </label>
            <input
              type="text"
              value={webhookConfig.secret}
              onChange={(e) => updateWebhookConfig({ secret: e.target.value })}
              className="input-field"
              placeholder="Chuỗi bí mật để xác thực chữ ký"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Verify token (tùy chọn)
            </label>
            <input
              type="text"
              value={webhookConfig.verifyToken}
              onChange={(e) => updateWebhookConfig({ verifyToken: e.target.value })}
              className="input-field"
              placeholder="Token xác thực challenge"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mô tả
            </label>
            <input
              type="text"
              value={webhookConfig.description}
              onChange={(e) => updateWebhookConfig({ description: e.target.value })}
              className="input-field"
              placeholder="Mô tả webhook (ví dụ: Đồng bộ realtime về dashboard)"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Endpoint Thuần Chay VN (mặc định /webhooks)
            </label>
            <input
              type="text"
              value={webhookConfig.endpoint || '/webhooks'}
              onChange={(e) => updateWebhookConfig({ endpoint: e.target.value || '/webhooks' })}
              className="input-field"
              placeholder="/webhooks"
            />
            <p className="text-xs text-gray-500 mt-1">
              Đường dẫn API công khai của Thuần Chay VN để đăng ký webhook. Chỉ chỉnh khi bạn có tài liệu chính thức.
            </p>
          </div>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-gray-800 mb-2 flex items-center gap-2">
            <ClipboardList size={16} />
            Sự kiện nhận từ Thuần Chay VN
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {allWebhookEvents.map((event) => (
              <label key={event} className="flex items-center gap-2 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer text-sm">
                <input
                  type="checkbox"
                  checked={(webhookConfig.events || []).includes(event)}
                  onChange={() => handleToggleWebhookEvent(event)}
                  className="w-4 h-4 text-primary-600"
                />
                <span>{webhookEventLabels[event] || event}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleSaveWebhookConfigLocal}
            className="btn-secondary flex items-center gap-2"
          >
            <Save size={16} />
            Lưu cấu hình webhook
          </button>
          <button
            onClick={handleRegisterWebhookDirect}
            disabled={isRegisteringWebhook}
            className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isRegisteringWebhook ? <Loader2 size={18} className="animate-spin" /> : <Share2 size={18} />}
            {isRegisteringWebhook ? 'Đang đăng ký...' : 'Đăng ký webhook với Thuần Chay VN'}
          </button>
          {webhookConfig.active && (
            <button
              onClick={handleUnregisterWebhook}
              disabled={isRegisteringWebhook}
              className="btn-secondary flex items-center gap-2 text-red-600 border-red-200 hover:bg-red-50"
            >
              <Trash2 size={16} />
              Hủy đăng ký webhook
            </button>
          )}
          <button
            onClick={handleFetchRemoteWebhooks}
            disabled={isLoadingWebhook}
            className="btn-secondary flex items-center gap-2"
          >
            {isLoadingWebhook ? <Loader2 size={16} className="animate-spin" /> : <List size={16} />}
            {isLoadingWebhook ? 'Đang kiểm tra...' : 'Kiểm tra trạng thái từ Thuần Chay VN'}
          </button>
        </div>

        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-2 text-sm text-gray-700">
          <div className="flex gap-2">
            <span className="font-medium w-48">Lần đăng ký cuối</span>
            <span>{formatDateTime(webhookConfig.lastRegisteredAt)}</span>
          </div>
          <div className="flex gap-2">
            <span className="font-medium w-48">Sự kiện gần nhất</span>
            <span>{webhookMetadata?.lastEventName || 'Chưa nhận'}</span>
          </div>
          <div className="flex gap-2">
            <span className="font-medium w-48">Thời gian nhận gần nhất</span>
            <span>{formatDateTime(webhookMetadata?.lastEventAt)}</span>
          </div>
          <div className="flex gap-2">
            <span className="font-medium w-48">Tổng số sự kiện</span>
            <span>{webhookMetadata?.totalEvents ?? 0}</span>
          </div>
        </div>

        {remoteWebhooks.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
              <List size={16} />
              Danh sách webhook trên Thuần Chay VN ({remoteWebhooks.length})
            </h4>
            <div className="overflow-x-auto">
              <table className="table text-sm">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Callback URL</th>
                    <th>Sự kiện</th>
                    <th>Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  {remoteWebhooks.map((item, idx) => (
                    <tr key={item.id || item.webhookId || idx}>
                      <td>{item.id || item.webhookId || '—'}</td>
                      <td className="font-medium max-w-xs truncate" title={item.callbackUrl}>{item.callbackUrl}</td>
                      <td>{Array.isArray(item.events) ? item.events.join(', ') : '—'}</td>
                      <td>{item.active === false ? 'Tắt' : 'Bật'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="pt-4 border-t border-gray-200">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
            <h4 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
              <ClipboardList size={16} />
              Nhật ký webhook ({webhookLogs.length})
            </h4>
            <div className="flex gap-2">
              <button onClick={handleRefreshWebhookLogs} className="btn-secondary flex items-center gap-2">
                <RefreshCw size={16} /> Tải lại
              </button>
              <button onClick={handleClearWebhookLogs} className="btn-secondary flex items-center gap-2 text-red-600 border-red-200 hover:bg-red-50">
                <Trash2 size={16} /> Xóa nhật ký
              </button>
            </div>
          </div>
          <div className="max-h-52 overflow-y-auto space-y-3 border border-gray-200 rounded-lg p-3 bg-white">
            {webhookLogs.length === 0 ? (
              <p className="text-xs text-gray-500">Chưa có nhật ký webhook nào.</p>
            ) : (
              webhookLogs.slice(0, 20).map((log) => (
                <div key={log.id} className="border-b last:border-b-0 border-gray-100 pb-2">
                  <p className="text-xs text-gray-500">{formatDateTime(log.timestamp)} · {log.action}</p>
                  <p className="text-sm font-medium text-gray-800">{log.message}</p>
                  {log.data && (
                    <pre className="mt-1 bg-gray-50 text-[11px] text-gray-600 rounded p-2 overflow-x-auto">
{JSON.stringify(log.data, null, 2)}
                    </pre>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        <div className="pt-4 border-t border-gray-200 space-y-3">
          <h4 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
            <FileCode size={16} />
            Giả lập payload webhook (debug)
          </h4>
          <textarea
            value={webhookTestPayload}
            onChange={(e) => setWebhookTestPayload(e.target.value)}
            className="input-field h-32 font-mono text-xs"
            placeholder='{"event":"product.updated","data":[{"id":123,"name":"Sản phẩm A"}]}'
          />
          <div className="flex flex-wrap items-center gap-2">
            <button onClick={handleSimulateWebhook} className="btn-secondary flex items-center gap-2">
              <FileCode size={16} />
              Giả lập nhận webhook
            </button>
            <button onClick={() => setWebhookTestPayload('')} className="btn-secondary text-gray-500">
              Xóa nội dung
            </button>
            <span className="text-xs text-gray-500">
              Dán payload JSON Thuần Chay VN gửi vào đây để kiểm tra cách hệ thống xử lý và lưu trữ dữ liệu.
            </span>
          </div>
        </div>
      </div>

      {/* Chọn loại dữ liệu */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Loại dữ liệu cần đồng bộ</h3>
          <div className="flex gap-2">
            <button
              onClick={selectAllDataTypes}
              className="text-sm text-primary-600 hover:text-primary-700"
            >
              Chọn tất cả
            </button>
            <span className="text-gray-300">|</span>
            <button
              onClick={deselectAllDataTypes}
              className="text-sm text-gray-600 hover:text-gray-700"
            >
              Bỏ chọn tất cả
            </button>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {Object.entries(dataTypeLabels).map(([type, label]) => (
            <label
              key={type}
              className="flex items-center gap-2 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={selectedDataTypes.includes(type)}
                onChange={() => toggleDataType(type)}
                className="w-4 h-4 text-primary-600 rounded"
              />
              <span className="text-sm font-medium">{label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Tùy chọn nguồn dữ liệu */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">Nguồn dữ liệu</h3>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={useLocalStorage}
            onChange={(e) => setUseLocalStorage(e.target.checked)}
            className="w-4 h-4 text-primary-600 rounded"
          />
          <span className="text-sm">Sử dụng dữ liệu từ localStorage (thay vì API)</span>
        </label>
        <p className="text-xs text-gray-500 mt-2">
          Nếu bật, hệ thống sẽ lấy dữ liệu từ localStorage thay vì gọi API. Hữu ích khi API chưa sẵn sàng.
        </p>
      </div>

      {/* Reset dữ liệu */}
      <div className="card border border-red-200 bg-red-50">
        <div className="flex items-start gap-3">
          <RotateCcw size={20} className="mt-1 text-red-600" />
          <div className="flex-1 space-y-3">
            <div>
              <h3 className="text-lg font-semibold text-red-700">Reset dữ liệu cục bộ</h3>
              <p className="text-sm text-red-600">
                Xóa toàn bộ dữ liệu đã lưu trên trình duyệt (cấu hình API, đồng bộ, người dùng, thiết lập, logs...).
                Sau khi reset, ứng dụng sẽ quay về trạng thái mặc định và yêu cầu đăng nhập lại.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleResetData}
                disabled={isResetting}
                className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isResetting ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Đang reset...
                  </>
                ) : (
                  <>
                    <RotateCcw size={18} />
                    Reset dữ liệu
                  </>
                )}
              </button>
              <span className="text-xs text-red-600">
                Thao tác này không thể hoàn tác. Trang sẽ tự tải lại sau khi reset.
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tiến trình đồng bộ */}
      {isSyncing && syncProgress && (
        <div className="card">
          <div className="flex items-center gap-3 mb-4">
            <Loader2 size={20} className="animate-spin text-primary-600" />
            <h3 className="text-lg font-semibold">Đang đồng bộ...</h3>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">
                {syncProgress.type && dataTypeLabels[syncProgress.type]
                  ? `Đang xử lý: ${dataTypeLabels[syncProgress.type]}`
                  : syncProgress.message || 'Đang xử lý...'}
              </span>
              <span className="font-medium">{syncProgress.percentage}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${syncProgress.percentage}%` }}
              />
            </div>
            {syncProgress.count !== undefined && (
              <p className="text-xs text-gray-500">
                Đã xử lý: {syncProgress.count} bản ghi
              </p>
            )}
          </div>
        </div>
      )}

      {/* Kết quả đồng bộ */}
      {syncResult && !isSyncing && (
        <div className={`card ${syncResult.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
          <div className="flex items-start gap-3">
            {syncResult.success ? (
              <CheckCircle size={20} className="text-green-600 mt-0.5" />
            ) : (
              <XCircle size={20} className="text-red-600 mt-0.5" />
            )}
            <div className="flex-1">
              <p className={`font-medium ${syncResult.success ? 'text-green-900' : 'text-red-900'}`}>
                {syncResult.success ? 'Đồng bộ thành công!' : 'Đồng bộ thất bại'}
              </p>
              {syncResult.success && syncResult.dataSummary && (
                <div className="mt-2 space-y-1">
                  {Object.entries(syncResult.dataSummary).map(([type, count]) => (
                    <p key={type} className="text-sm text-green-700">
                      {dataTypeLabels[type]}: {count} bản ghi
                    </p>
                  ))}
                </div>
              )}
              {syncResult.error && (
                <p className="text-sm text-red-700 mt-2">{syncResult.error}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Nút đồng bộ */}
      <div className="flex gap-4 items-center">
        <button
          onClick={handleSync}
          disabled={disableSyncButton}
          className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSyncing ? (
            <>
              <Loader2 size={20} className="animate-spin" />
              Đang đồng bộ...
            </>
          ) : (
            <>
              <RefreshCw size={20} />
              Bắt đầu đồng bộ
            </>
          )}
        </button>
        {shouldWarnDataType && (
          <div className="flex items-center gap-2 text-sm text-amber-600">
            <AlertCircle size={16} />
            <span>Vui lòng chọn ít nhất một loại dữ liệu</span>
          </div>
        )}
        {selectedMethod === SYNC_METHODS.API && (
          <div className="flex items-center gap-2 text-sm text-blue-600">
            <Info size={16} />
            <span>Đảm bảo đã cấu hình API trước khi đồng bộ</span>
          </div>
        )}
        {selectedMethod === SYNC_METHODS.WEBHOOK && (
          <div className="flex items-center gap-2 text-sm text-blue-600">
            <Info size={16} />
            <span>Webhook sẽ dùng cấu hình ở trên để đăng ký nhận dữ liệu realtime.</span>
          </div>
        )}
      </div>
    </div>
  )
}

export default DataSync


