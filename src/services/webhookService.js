import { apiClient } from './apiClient'

const STORAGE_KEY = 'Thuần Chay VNWebhookConfig'
const LOGS_STORAGE_KEY = 'Thuần Chay VNWebhookLogs'
const WEBHOOK_METADATA_KEY = 'Thuần Chay VNWebhookMetadata'

export const DEFAULT_WEBHOOK_EVENTS = [
  'product.created',
  'product.updated',
  'product.deleted',
  'order.created',
  'order.updated',
  'order.deleted',
  'customer.created',
  'customer.updated',
  'customer.deleted',
  'inventory.updated',
]

const EVENT_DATA_TYPE_MAP = {
  'product.created': 'products',
  'product.updated': 'products',
  'product.deleted': 'products',
  'order.created': 'orders',
  'order.updated': 'orders',
  'order.deleted': 'orders',
  'customer.created': 'customers',
  'customer.updated': 'customers',
  'customer.deleted': 'customers',
  'inventory.updated': 'inventory',
  'supplier.created': 'suppliers',
  'supplier.updated': 'suppliers',
  'supplier.deleted': 'suppliers',
  'purchaseorder.created': 'purchaseOrders',
  'purchaseorder.updated': 'purchaseOrders',
  'supplierreturn.created': 'supplierReturns',
  'supplierreturn.updated': 'supplierReturns',
  'destroyorder.created': 'destroyOrders',
  'destroyorder.updated': 'destroyOrders',
}

const getStoredJson = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch (error) {
    console.error(`webhookService: error parsing ${key}`, error)
    return fallback
  }
}

const saveJson = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (error) {
    console.error(`webhookService: error saving ${key}`, error)
  }
}

const normalizeEvents = (events) => {
  if (!Array.isArray(events) || events.length === 0) {
    return [...DEFAULT_WEBHOOK_EVENTS]
  }
  return Array.from(new Set(events.filter(Boolean).map(event => event.toLowerCase())))
}

const appendWebhookLog = (entry) => {
  const logs = getStoredJson(LOGS_STORAGE_KEY, [])
  logs.unshift({
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    timestamp: new Date().toISOString(),
    ...entry,
  })
  // Giữ tối đa 200 log để tránh phình localStorage
  const limitedLogs = logs.slice(0, 200)
  saveJson(LOGS_STORAGE_KEY, limitedLogs)
  return limitedLogs
}

const updateMetadata = (updater) => {
  const metadata = getStoredJson(WEBHOOK_METADATA_KEY, {
    totalEvents: 0,
    lastEventAt: null,
    registeredAt: null,
    registeredBy: null,
  })
  const nextMetadata = typeof updater === 'function' ? updater(metadata) : { ...metadata, ...updater }
  saveJson(WEBHOOK_METADATA_KEY, nextMetadata)
  return nextMetadata
}

const processUpsert = (storageKey, incomingRecords, idFieldCandidates = ['id', 'Id', 'ID', 'code', 'Code']) => {
  if (!Array.isArray(incomingRecords)) {
    return { success: false, message: 'Payload không chứa danh sách dữ liệu hợp lệ' }
  }

  const existingRecords = getStoredJson(storageKey, [])
  const buildIdentifier = (record = {}) => {
    for (const field of idFieldCandidates) {
      if (record[field] !== undefined && record[field] !== null && record[field] !== '') {
        return String(record[field])
      }
    }
    if (record.sku) return String(record.sku)
    if (record.productId) return String(record.productId)
    if (record.orderId) return String(record.orderId)
    return null
  }

  const clone = [...existingRecords]
  const now = new Date().toISOString()

  incomingRecords.forEach(payload => {
    const identifier = buildIdentifier(payload)
    const enhanced = {
      ...payload,
      updatedFromWebhookAt: now,
      source: payload?.source || 'Thuần Chay VN-webhook',
    }

    if (!identifier) {
      clone.push(enhanced)
      return
    }

    const index = clone.findIndex(item => buildIdentifier(item) === identifier)
    if (index >= 0) {
      clone[index] = { ...clone[index], ...enhanced }
    } else {
      clone.push(enhanced)
    }
  })

  saveJson(storageKey, clone)
  return { success: true, count: incomingRecords.length }
}

export const webhookService = {
  getConfig() {
    return getStoredJson(STORAGE_KEY, {
      callbackUrl: '',
      secret: '',
      events: [...DEFAULT_WEBHOOK_EVENTS],
      description: 'Thuần Chay VN realtime sync',
      active: false,
      lastRegisteredAt: null,
      remoteId: null,
      verifyToken: '',
    })
  },

  saveConfig(config = {}) {
    const normalized = {
      ...this.getConfig(),
      ...config,
      events: normalizeEvents(config.events || this.getConfig().events),
    }
    saveJson(STORAGE_KEY, normalized)
    return normalized
  },

  clearConfig() {
    localStorage.removeItem(STORAGE_KEY)
    localStorage.removeItem(WEBHOOK_METADATA_KEY)
  },

  getLogs() {
    return getStoredJson(LOGS_STORAGE_KEY, [])
  },

  clearLogs() {
    localStorage.removeItem(LOGS_STORAGE_KEY)
  },

  getMetadata() {
    return getStoredJson(WEBHOOK_METADATA_KEY, null)
  },

  async registerWebhook(config) {
    const credentials = apiClient.getThuanChayVNCredentials()
    if (!credentials?.storeDomain) {
      throw new Error('Chưa cấu hình tên miền gian hàng Thuần Chay VN (Retailer).')
    }

    const accessToken = await apiClient.ensureThuanChayVNToken()
    if (!accessToken) {
      throw new Error('Chưa có access token Thuần Chay VN. Vui lòng nhập token thủ công trước khi đăng ký webhook.')
    }

    const currentConfig = this.saveConfig(config)
    if (!currentConfig.callbackUrl) {
      throw new Error('Vui lòng nhập URL nhận webhook (callbackUrl).')
    }

    const payload = {
      retailer: credentials.storeDomain,
      callbackUrl: currentConfig.callbackUrl,
      secret: currentConfig.secret || undefined,
      verifyToken: currentConfig.verifyToken || undefined,
      events: normalizeEvents(currentConfig.events),
      description: currentConfig.description || 'Thuần Chay VN realtime sync',
    }

    const endpoint = currentConfig.endpoint || '/webhooks'
    const response = await apiClient.post(endpoint, payload, true)

    const savedConfig = this.saveConfig({
      ...currentConfig,
      active: true,
      remoteId: response?.id || response?.webhookId || response?.data?.id || null,
      lastRegisteredAt: new Date().toISOString(),
    })

    updateMetadata(prev => ({
      ...prev,
      registeredAt: savedConfig.lastRegisteredAt,
      registeredBy: credentials.storeDomain,
    }))

    appendWebhookLog({
      level: 'info',
      action: 'register',
      message: 'Đăng ký webhook thành công',
      data: {
        endpoint,
        events: payload.events,
        response,
      },
    })

    return {
      config: savedConfig,
      response,
    }
  },

  async unregisterWebhook(webhookId = null) {
    const config = this.getConfig()
    const targetId = webhookId || config.remoteId
    if (!targetId) {
      throw new Error('Không tìm thấy mã webhook đã đăng ký.')
    }

    const endpoint = `${config.endpoint || '/webhooks'}/${targetId}`
    const response = await apiClient.delete(endpoint, true)

    const savedConfig = this.saveConfig({
      ...config,
      active: false,
      remoteId: null,
    })

    appendWebhookLog({
      level: 'info',
      action: 'unregister',
      message: 'Hủy đăng ký webhook thành công',
      data: { endpoint, response },
    })

    return { config: savedConfig, response }
  },

  async listRemoteWebhooks() {
    const config = this.getConfig()
    const endpoint = config.endpoint || '/webhooks'
    const response = await apiClient.get(endpoint, { pageSize: 50 }, true)
    appendWebhookLog({
      level: 'info',
      action: 'list',
      message: 'Đã lấy danh sách webhook từ Thuần Chay VN',
      data: { endpoint },
    })
    return response
  },

  processIncomingEvent(payload = {}) {
    if (!payload) {
      return { success: false, message: 'Payload rỗng' }
    }

    const eventName = (payload.event || payload.Event || payload.eventName || payload.EventName || '').toLowerCase()
    const dataType = EVENT_DATA_TYPE_MAP[eventName]

    const records = Array.isArray(payload.data) ? payload.data
      : Array.isArray(payload.Data) ? payload.Data
      : payload.record ? [payload.record]
      : payload.Record ? [payload.Record]
      : payload.body ? [payload.body]
      : payload

    const normalizedRecords = Array.isArray(records) ? records : [records]

    const result = dataType
      ? processUpsert(dataType, normalizedRecords)
      : { success: false, message: `Không xác định được loại dữ liệu cho event ${eventName}` }

    const metadata = updateMetadata(prev => ({
      ...prev,
      totalEvents: (prev.totalEvents || 0) + 1,
      lastEventAt: new Date().toISOString(),
      lastEventName: eventName || payload.event || payload.EventName || 'unknown',
    }))

    appendWebhookLog({
      level: result.success ? 'info' : 'warn',
      action: 'incoming-event',
      message: result.success ? `Đã xử lý ${normalizedRecords.length} bản ghi từ webhook` : result.message,
      data: { eventName, metadata },
    })

    if (result.success) {
      localStorage.setItem('disableFallbackData', 'true')
      window.dispatchEvent(new Event('Thuần Chay VN-data-updated'))
    }

    return { ...result, metadata }
  },

  simulateIncomingPayload(payload) {
    return this.processIncomingEvent(payload)
  },
}

export default webhookService

