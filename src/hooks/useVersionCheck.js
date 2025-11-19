import { useState, useEffect, useCallback } from 'react'
import { checkForNewVersion, getCurrentVersion, compareVersions } from '../services/versionService'

/**
 * Hook để kiểm tra phiên bản mới định kỳ
 * @param {number} interval - Khoảng thời gian kiểm tra (ms), mặc định 5 phút
 * @param {boolean} enabled - Bật/tắt kiểm tra tự động
 */
export function useVersionCheck(interval = 5 * 60 * 1000, enabled = true) {
  const [updateInfo, setUpdateInfo] = useState({
    hasUpdate: false,
    currentVersion: getCurrentVersion(),
    newVersion: null,
    checking: false,
    error: null
  })

  const checkVersion = useCallback(async () => {
    if (!enabled) return

    setUpdateInfo(prev => ({ ...prev, checking: true, error: null }))

    try {
      const result = await checkForNewVersion()
      
      if (result.hasUpdate) {
        const currentVersion = getCurrentVersion()
        const versionComparison = compareVersions(currentVersion, result.newVersion || result.currentVersion)
        
        // Chỉ thông báo nếu phiên bản mới hơn
        if (versionComparison < 0 || result.buildHash || result.buildTime) {
          setUpdateInfo({
            hasUpdate: true,
            currentVersion: result.currentVersion,
            newVersion: result.newVersion || result.currentVersion,
            checking: false,
            error: null,
            buildHash: result.buildHash,
            buildTime: result.buildTime
          })
        } else {
          setUpdateInfo(prev => ({
            ...prev,
            hasUpdate: false,
            checking: false
          }))
        }
      } else {
        setUpdateInfo(prev => ({
          ...prev,
          hasUpdate: false,
          checking: false
        }))
      }
    } catch (error) {
      setUpdateInfo(prev => ({
        ...prev,
        checking: false,
        error: error.message
      }))
    }
  }, [enabled])

  useEffect(() => {
    if (!enabled) return

    // Kiểm tra ngay khi mount
    checkVersion()

    // Kiểm tra định kỳ
    const intervalId = setInterval(checkVersion, interval)

    return () => {
      clearInterval(intervalId)
    }
  }, [checkVersion, interval, enabled])

  return {
    ...updateInfo,
    checkVersion
  }
}




