import { useState } from 'react'
import { useVersionCheck } from '../hooks/useVersionCheck'
import VersionUpdateNotification from './VersionUpdateNotification'

const VersionCheckWrapper = ({ children }) => {
  const [dismissed, setDismissed] = useState(false)
  const updateInfo = useVersionCheck(5 * 60 * 1000, true) // Kiểm tra mỗi 5 phút

  const handleDismiss = () => {
    setDismissed(true)
    // Lưu vào localStorage để không hiển thị lại trong session này
    localStorage.setItem('version_update_dismissed', Date.now().toString())
  }

  // Kiểm tra xem đã dismiss chưa (trong vòng 1 giờ)
  const isDismissed = () => {
    if (dismissed) return true
    const dismissedTime = localStorage.getItem('version_update_dismissed')
    if (dismissedTime) {
      const timeDiff = Date.now() - parseInt(dismissedTime)
      // Nếu đã dismiss trong vòng 1 giờ, không hiển thị lại
      return timeDiff < 60 * 60 * 1000
    }
    return false
  }

  return (
    <>
      {children}
      {updateInfo.hasUpdate && !isDismissed() && (
        <VersionUpdateNotification
          updateInfo={updateInfo}
          onDismiss={handleDismiss}
        />
      )}
    </>
  )
}

export default VersionCheckWrapper




