import { useState, useRef } from 'react'
import { useTheme } from '../contexts/ThemeContext'
import { Upload, X, Image as ImageIcon } from 'lucide-react'

const LogoUpload = () => {
  const { theme, changeLogo, removeLogo } = useTheme()
  const [preview, setPreview] = useState(theme.logoUrl)
  const fileInputRef = useRef(null)

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      // Kiểm tra loại file
      if (!file.type.startsWith('image/')) {
        alert('Vui lòng chọn file hình ảnh')
        return
      }

      // Kiểm tra kích thước (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Kích thước file không được vượt quá 5MB')
        return
      }

      // Tạo preview URL
      const reader = new FileReader()
      reader.onloadend = () => {
        const logoUrl = reader.result
        setPreview(logoUrl)
        changeLogo(file, logoUrl)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleRemove = () => {
    setPreview(null)
    removeLogo()
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-3">Logo ứng dụng</h3>
        
        {preview ? (
          <div className="relative inline-block">
            <div className="w-32 h-32 rounded-lg border-2 border-gray-200 overflow-hidden bg-white p-2 flex items-center justify-center">
              <img
                src={preview}
                alt="Logo preview"
                className="max-w-full max-h-full object-contain"
              />
            </div>
            <button
              onClick={handleRemove}
              className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg"
              title="Xóa logo"
            >
              <X size={16} />
            </button>
          </div>
        ) : (
          <div
            onClick={handleClick}
            className="w-32 h-32 rounded-lg border-2 border-dashed border-gray-300 hover:border-primary-500 cursor-pointer transition-colors flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100"
          >
            <ImageIcon className="text-gray-400 mb-2" size={32} />
            <span className="text-xs text-gray-500 text-center px-2">Nhấn để tải lên</span>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />

        {!preview && (
          <button
            onClick={handleClick}
            className="mt-3 btn-secondary flex items-center gap-2 text-sm"
          >
            <Upload size={16} />
            Tải logo lên
          </button>
        )}

        <p className="text-xs text-gray-500 mt-2">
          Định dạng: JPG, PNG, SVG. Kích thước tối đa: 5MB
        </p>
      </div>
    </div>
  )
}

export default LogoUpload





