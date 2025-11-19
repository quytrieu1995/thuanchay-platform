const PRINT_LOG_KEY = 'kv_print_logs_v1'

const readLogs = () => {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(PRINT_LOG_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

const writeLogs = (logs) => {
  if (typeof window === 'undefined') return
  localStorage.setItem(PRINT_LOG_KEY, JSON.stringify(logs))
}

export const getPrintLogs = () => readLogs()

export const logPrintAction = ({ type, orderId, templateId, userId, channel = 'manual', metadata = {} }) => {
  const logs = readLogs()
  const entry = {
    id: `print_${Date.now()}`,
    type,
    orderId,
    templateId,
    channel,
    metadata,
    userId: userId || 'system',
    printedAt: new Date().toISOString(),
  }
  logs.unshift(entry)
  writeLogs(logs.slice(0, 200))
  return entry
}

export const clearPrintLogs = () => {
  writeLogs([])
}


