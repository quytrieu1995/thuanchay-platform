const INTEGRATIONS_KEY = 'kv_shipping_integrations_v1'
const SHIPMENTS_KEY = 'kv_shipping_shipments_v1'
const SYNC_LOG_KEY = 'kv_shipping_sync_logs_v1'

const DEFAULT_CARRIERS = [
  {
    id: 'ghn',
    name: 'Giao Hàng Nhanh',
    shortName: 'GHN',
    logo: 'https://static.kvcdn.vn/ghn-logo.svg',
    description: 'Đối tác giao hàng toàn quốc với mạng lưới rộng khắp.',
    features: ['Giao chuẩn', 'Giao nhanh', 'COD', 'Đổi trả'],
    status: 'not_connected',
    lastSyncedAt: null,
    credentials: null,
  },
  {
    id: 'vtp',
    name: 'Viettel Post',
    shortName: 'Viettel Post',
    logo: 'https://static.kvcdn.vn/viettelpost-logo.svg',
    description: 'Dịch vụ giao hàng nhanh, phủ sóng 63 tỉnh thành.',
    features: ['Giao hỏa tốc', 'COD', 'Hẹn giờ', 'Tiết kiệm'],
    status: 'not_connected',
    lastSyncedAt: null,
    credentials: null,
  },
  {
    id: 'ghtk',
    name: 'Giao Hàng Tiết Kiệm',
    shortName: 'GHTK',
    logo: 'https://static.kvcdn.vn/ghtk-logo.svg',
    description: 'Tối ưu chi phí với dịch vụ giao hàng tiết kiệm.',
    features: ['Tiết kiệm', 'COD', 'Đối tác shop online'],
    status: 'not_connected',
    lastSyncedAt: null,
    credentials: null,
  },
  {
    id: 'jt',
    name: 'J&T Express',
    shortName: 'J&T',
    logo: 'https://static.kvcdn.vn/jt-logo.svg',
    description: 'Giao hàng nhanh toàn quốc với mạng lưới phân phối phủ rộng.',
    features: ['Giao nhanh', 'COD', 'Door-to-door', 'Hỏa tốc nội thành'],
    status: 'not_connected',
    lastSyncedAt: null,
    credentials: null,
  },
  {
    id: 'ahamove',
    name: 'AhaMove',
    shortName: 'AhaMove',
    logo: 'https://static.kvcdn.vn/ahamove-logo.svg',
    description: 'Giải pháp giao hàng tức thời trong đô thị với đội ngũ tài xế đông đảo.',
    features: ['Siêu tốc', 'Giao nội thành', 'Giao Grab/xe tải', 'Ship theo tuyến'],
    status: 'not_connected',
    lastSyncedAt: null,
    credentials: null,
  },
]

const readJSON = (key, fallback) => {
  if (typeof window === 'undefined') return fallback
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

const writeJSON = (key, value) => {
  if (typeof window === 'undefined') return
  localStorage.setItem(key, JSON.stringify(value))
}

const ensureCarriers = () => {
  const stored = readJSON(INTEGRATIONS_KEY, [])
  const map = new Map(stored.map(item => [item.id, item]))
  const merged = DEFAULT_CARRIERS.map((carrier) => ({
    ...carrier,
    ...(map.get(carrier.id) || {}),
  }))
  writeJSON(INTEGRATIONS_KEY, merged)
  return merged
}

export const getCarrierIntegrations = () => ensureCarriers()

export const getCarrierById = (id) => ensureCarriers().find(carrier => carrier.id === id)

export const saveCarrierCredentials = (id, credentials) => {
  const carriers = ensureCarriers().map(carrier => {
    if (carrier.id !== id) return carrier
    return {
      ...carrier,
      credentials: {
        ...credentials,
        connectedAt: new Date().toISOString(),
      },
      status: 'connected',
      lastSyncedAt: carrier.lastSyncedAt || null,
      error: null,
    }
  })
  writeJSON(INTEGRATIONS_KEY, carriers)
  return carriers
}

export const disconnectCarrier = (id) => {
  const carriers = ensureCarriers().map(carrier => {
    if (carrier.id !== id) return carrier
    return {
      ...carrier,
      status: 'not_connected',
      credentials: null,
      lastSyncedAt: null,
      error: null,
    }
  })
  writeJSON(INTEGRATIONS_KEY, carriers)
  return carriers
}

const STATUS_FLOW = ['Chờ lấy hàng', 'Đang vận chuyển', 'Đã giao', 'Hoàn trả', 'Đã hủy']

const getNextStatus = (current) => {
  if (!current) return STATUS_FLOW[0]
  const idx = STATUS_FLOW.indexOf(current)
  if (idx === -1) return STATUS_FLOW[0]
  if (idx >= STATUS_FLOW.length - 2) return STATUS_FLOW[idx] // keep cuối
  return STATUS_FLOW[idx + 1]
}

export const getStoredShipments = () => readJSON(SHIPMENTS_KEY, null)

export const persistShipments = (shipments) => {
  writeJSON(SHIPMENTS_KEY, shipments)
}

const appendSyncLog = (entry) => {
  const logs = readJSON(SYNC_LOG_KEY, [])
  logs.unshift(entry)
  writeJSON(SYNC_LOG_KEY, logs.slice(0, 20))
}

export const getSyncLogs = () => readJSON(SYNC_LOG_KEY, [])

export const simulateCarrierSync = (carrierId, currentShipments = []) => {
  const carrier = getCarrierById(carrierId)
  if (!carrier) {
    throw new Error('Không tìm thấy đối tác giao vận')
  }
  if (carrier.status !== 'connected') {
    throw new Error('Đối tác chưa được liên kết')
  }

  const now = new Date()
  const updatedShipments = currentShipments.map((shipment) => {
    if (!shipment.doiTacGiaoHang) return shipment
    const matchName = shipment.doiTacGiaoHang.toLowerCase()
    if (
      matchName.includes((carrier.shortName || carrier.name).toLowerCase()) ||
      matchName.includes(carrier.name.toLowerCase())
    ) {
      const nextStatus = getNextStatus(shipment.trangThaiGiaoHang)
      return {
        ...shipment,
        trangThaiGiaoHang: nextStatus,
        trangThai: nextStatus,
        thoiGianGiaoHang: nextStatus === 'Đã giao'
          ? new Date(now.getTime() - 30 * 60 * 1000).toISOString().replace('T', ' ').slice(0, 19)
          : shipment.thoiGianGiaoHang,
        ghiChu: nextStatus === 'Đang vận chuyển'
          ? 'Điều phối viên đã nhận hàng'
          : shipment.ghiChu,
      }
    }
    return shipment
  })

  const totals = {
    total: currentShipments.length,
    affected: updatedShipments.filter((ship, idx) => ship !== currentShipments[idx]).length,
    timestamp: now.toISOString(),
  }

  const carriers = ensureCarriers().map((item) => {
    if (item.id !== carrierId) return item
    return {
      ...item,
      lastSyncedAt: now.toISOString(),
      status: 'connected',
      error: null,
    }
  })
  writeJSON(INTEGRATIONS_KEY, carriers)
  persistShipments(updatedShipments)

  appendSyncLog({
    id: `${carrierId}-${now.getTime()}`,
    carrierId,
    carrierName: carrier.name,
    syncedAt: now.toISOString(),
    impactedShipments: totals.affected,
    totalShipments: totals.total,
  })

  return {
    shipments: updatedShipments,
    meta: totals,
    carrier: carriers.find(item => item.id === carrierId),
  }
}

