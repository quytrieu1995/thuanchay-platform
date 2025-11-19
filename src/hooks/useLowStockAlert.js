import { useEffect, useRef } from 'react'
import { checkAndSendLowStockAlerts } from '../services/notificationService'

/**
 * Hook để tự động kiểm tra và gửi cảnh báo tồn kho thấp
 * @param {Array} products - Danh sách sản phẩm
 * @param {Object} settings - Cài đặt thông báo
 * @param {boolean} enabled - Bật/tắt tự động kiểm tra
 * @param {number} interval - Khoảng thời gian kiểm tra (ms), mặc định 5 phút
 */
export const useLowStockAlert = (products, settings, enabled = true, interval = 5 * 60 * 1000) => {
  const notifiedProductsRef = useRef(new Set())
  const intervalRef = useRef(null)

  useEffect(() => {
    if (!enabled || !products || products.length === 0) {
      return
    }

    // Kiểm tra ngay lập tức khi products thay đổi
    const checkProducts = async () => {
      try {
        const alerts = await checkAndSendLowStockAlerts(
          products,
          settings,
          notifiedProductsRef.current
        )
        
        if (alerts.length > 0) {
          console.log(`📢 Đã gửi ${alerts.length} cảnh báo tồn kho thấp`)
        }
      } catch (error) {
        console.error('Error checking low stock alerts:', error)
      }
    }

    // Kiểm tra ngay lập tức
    checkProducts()

    // Thiết lập interval để kiểm tra định kỳ
    if (interval > 0) {
      intervalRef.current = setInterval(checkProducts, interval)
    }

    // Cleanup
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [products, settings, enabled, interval])

  // Reset notified products khi products thay đổi đáng kể (ví dụ: sau khi nhập hàng)
  useEffect(() => {
    // Reset nếu có sản phẩm mới hoặc tồn kho được cập nhật
    notifiedProductsRef.current.clear()
  }, [products?.length])

  return {
    resetNotifiedProducts: () => {
      notifiedProductsRef.current.clear()
    }
  }
}




