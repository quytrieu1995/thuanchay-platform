/**
 * Notification Service
 * Gửi cảnh báo qua Email, Google Chat và trung tâm thông báo nội bộ
 */

const IN_APP_NOTIFICATIONS_KEY = 'kv_notifications_center_v1'
const NOTIFICATION_EVENT = 'kv-notifications-updated'

const readNotifications = () => {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(IN_APP_NOTIFICATIONS_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

const writeNotifications = (list) => {
  if (typeof window === 'undefined') return
  localStorage.setItem(IN_APP_NOTIFICATIONS_KEY, JSON.stringify(list.slice(0, 100)))
  window.dispatchEvent(new CustomEvent(NOTIFICATION_EVENT))
}

export const getInAppNotifications = () => readNotifications()

export const addInAppNotification = ({ type, title, message, meta }) => {
  const notifications = readNotifications()
  const entry = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    type,
    title: title || 'Thông báo',
    message: message || '',
    meta: meta || {},
    createdAt: new Date().toISOString(),
    read: false,
  }
  writeNotifications([entry, ...notifications])
  return entry
}

export const markNotificationRead = (id) => {
  const notifications = readNotifications().map((item) =>
    item.id === id ? { ...item, read: true } : item
  )
  writeNotifications(notifications)
}

export const markAllNotificationsRead = () => {
  const notifications = readNotifications().map((item) => ({ ...item, read: true }))
  writeNotifications(notifications)
}

export const clearNotifications = () => {
  writeNotifications([])
}

export const subscribeNotificationUpdates = (handler) => {
  if (typeof window === 'undefined') {
    return () => {}
  }
  window.addEventListener(NOTIFICATION_EVENT, handler)
  return () => window.removeEventListener(NOTIFICATION_EVENT, handler)
}

/**
 * Gửi email cảnh báo
 * @param {Object} options - { to, subject, body }
 * @returns {Promise<Object>}
 */
export const sendEmailAlert = async ({ to, subject, body }) => {
  try {
    // Trong thực tế, sẽ gọi API backend để gửi email
    // const response = await apiClient.post('/notifications/email', { to, subject, body })
    
    // Mock implementation - trong thực tế sẽ gọi API
    console.log('📧 Sending email alert:', { to, subject, body })
    
    // Lưu vào localStorage để demo (trong thực tế sẽ gửi qua API)
    const emailLogs = JSON.parse(localStorage.getItem('emailLogs') || '[]')
    emailLogs.push({
      to,
      subject,
      body,
      timestamp: new Date().toISOString(),
      status: 'sent'
    })
    localStorage.setItem('emailLogs', JSON.stringify(emailLogs.slice(-50))) // Giữ 50 email gần nhất
    
    return { success: true, message: 'Email đã được gửi thành công' }
  } catch (error) {
    console.error('Error sending email:', error)
    throw new Error('Không thể gửi email: ' + (error.message || 'Có lỗi xảy ra'))
  }
}

/**
 * Gửi cảnh báo qua Google Chat
 * @param {Object} options - { webhookUrl, message }
 * @returns {Promise<Object>}
 */
export const sendGoogleChatAlert = async ({ webhookUrl, message }) => {
  try {
    if (!webhookUrl) {
      throw new Error('Google Chat webhook URL chưa được cấu hình')
    }

    // Gửi message đến Google Chat webhook
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: message
      })
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    // Lưu vào localStorage để demo
    const chatLogs = JSON.parse(localStorage.getItem('chatLogs') || '[]')
    chatLogs.push({
      webhookUrl: webhookUrl.substring(0, 50) + '...', // Ẩn URL đầy đủ
      message,
      timestamp: new Date().toISOString(),
      status: 'sent'
    })
    localStorage.setItem('chatLogs', JSON.stringify(chatLogs.slice(-50))) // Giữ 50 message gần nhất

    return { success: true, message: 'Google Chat message đã được gửi thành công' }
  } catch (error) {
    console.error('Error sending Google Chat message:', error)
    throw new Error('Không thể gửi Google Chat message: ' + (error.message || 'Có lỗi xảy ra'))
  }
}

/**
 * Gửi cảnh báo tồn kho thấp
 * @param {Object} product - Thông tin sản phẩm
 * @param {Object} settings - Cài đặt thông báo
 * @returns {Promise<Object>}
 */
export const sendLowStockAlert = async (product, settings) => {
  const results = {
    email: null,
    googleChat: null
  }

  const alertMessage = `⚠️ CẢNH BÁO: Sản phẩm "${product.name}" (SKU: ${product.sku}) đã đạt mức tồn tối thiểu!\n\n` +
    `📦 Tồn kho hiện tại: ${product.stock}\n` +
    `📊 Mức tồn tối thiểu: ${product.minStock}\n` +
    `🔴 Cần nhập hàng ngay!`

  const emailSubject = `⚠️ Cảnh báo tồn kho thấp: ${product.name}`

  // Gửi email nếu được bật
  if (settings?.notifications?.emailSettings?.notifications?.lowStock) {
    const emailSettings = settings.notifications.emailSettings
    if (emailSettings?.fromEmail && emailSettings?.smtpUser) {
      try {
        // Trong thực tế, sẽ lấy danh sách email từ settings
        const recipientEmail = emailSettings.fromEmail // Hoặc từ danh sách người nhận
        results.email = await sendEmailAlert({
          to: recipientEmail,
          subject: emailSubject,
          body: alertMessage
        })
      } catch (error) {
        results.email = { success: false, error: error.message }
      }
    }
  }

  // Gửi Google Chat nếu được bật và có webhook URL
  if (settings?.notifications?.googleChat?.enabled && settings?.notifications?.googleChat?.webhookUrl) {
    try {
      results.googleChat = await sendGoogleChatAlert({
        webhookUrl: settings.notifications.googleChat.webhookUrl,
        message: alertMessage
      })
    } catch (error) {
      results.googleChat = { success: false, error: error.message }
    }
  }

  return results
}

/**
 * Kiểm tra và gửi cảnh báo cho danh sách sản phẩm
 * @param {Array} products - Danh sách sản phẩm
 * @param {Object} settings - Cài đặt thông báo
 * @param {Set} notifiedProducts - Set các sản phẩm đã được cảnh báo (để tránh spam)
 * @returns {Promise<Array>} Danh sách sản phẩm đã được cảnh báo
 */
export const checkAndSendLowStockAlerts = async (products, settings, notifiedProducts = new Set()) => {
  const lowStockProducts = products.filter(product => {
    if (!product.minStock || product.minStock === 0) return false
    if (product.stock >= product.minStock) return false
    // Chỉ cảnh báo nếu chưa được cảnh báo trước đó
    return !notifiedProducts.has(product.id)
  })

  const alerts = []
  for (const product of lowStockProducts) {
    try {
      const result = await sendLowStockAlert(product, settings)
      alerts.push({ product, result })
      // Đánh dấu đã cảnh báo
      notifiedProducts.add(product.id)
    } catch (error) {
      console.error(`Error sending alert for product ${product.id}:`, error)
    }
  }

  return alerts
}




