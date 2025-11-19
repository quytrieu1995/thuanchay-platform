import { useState } from 'react'
import { RefreshCw, X, Download } from 'lucide-react'
import { updateVersion } from '../services/versionService'

const VersionUpdateNotification = ({ updateInfo, onDismiss }) => {
  const [isUpdating, setIsUpdating] = useState(false)

  if (!updateInfo.hasUpdate) return null

  const handleUpdate = () => {
    setIsUpdating(true)
    updateVersion(
      updateInfo.newVersion,
      updateInfo.buildTime,
      updateInfo.buildHash
    )
  }

  const handleDismiss = () => {
    if (onDismiss) {
      onDismiss()
    }
  }

  return (
    <div className="fixed top-4 right-4 z-50 max-w-md animate-slide-in">
      <div className="bg-white rounded-xl shadow-2xl border-2 border-primary-500 p-4">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-primary-100 rounded-lg">
            <Download className="text-primary-600" size={20} />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-gray-900">Có phiên bản mới!</h3>
              <button
                onClick={handleDismiss}
                className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                title="Đóng"
              >
                <X size={16} className="text-gray-500" />
              </button>
            </div>
            <p className="text-sm text-gray-600 mb-3">
              Phiên bản hiện tại: <span className="font-medium">{updateInfo.currentVersion}</span>
              {updateInfo.newVersion && (
                <>
                  <br />
                  Phiên bản mới: <span className="font-medium text-primary-600">{updateInfo.newVersion}</span>
                </>
              )}
            </p>
            {updateInfo.buildTime && (
              <p className="text-xs text-gray-500 mb-3">
                Thời gian build: {new Date(updateInfo.buildTime).toLocaleString('vi-VN')}
              </p>
            )}
            <div className="flex items-center gap-2">
              <button
                onClick={handleUpdate}
                disabled={isUpdating}
                className="btn-primary flex items-center gap-2 text-sm px-4 py-2"
              >
                {isUpdating ? (
                  <>
                    <RefreshCw size={16} className="animate-spin" />
                    Đang cập nhật...
                  </>
                ) : (
                  <>
                    <Download size={16} />
                    Cập nhật ngay
                  </>
                )}
              </button>
              <button
                onClick={handleDismiss}
                className="btn-secondary text-sm px-4 py-2"
                disabled={isUpdating}
              >
                Để sau
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default VersionUpdateNotification

