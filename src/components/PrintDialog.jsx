import { useEffect, useMemo, useState } from 'react'
import { Printer, Eye, X, Settings } from 'lucide-react'
import { getPrintTemplates, getTemplatesByType } from '../services/printTemplateService'
import { renderPreviewHtml, printDocument } from '../services/printEngine'
import { composePrintData } from '../utils/printUtils'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'

const PrintDialog = ({ open, onClose, type = 'invoice', orderData, shipmentData }) => {
  const { currentUser } = useAuth()
  const navigate = useNavigate()
  const [templates, setTemplates] = useState([])
  const [selectedTemplateId, setSelectedTemplateId] = useState(null)
  const [previewHtml, setPreviewHtml] = useState('')
  const [isPreviewLoading, setIsPreviewLoading] = useState(false)

  const printContext = useMemo(
    () => composePrintData({ order: orderData, shipment: shipmentData }),
    [orderData, shipmentData]
  )

  const refreshTemplates = () => {
    const list = type ? getTemplatesByType(type) : getPrintTemplates()
    setTemplates(list)
    setSelectedTemplateId((current) => {
      if (current && list.some((tpl) => tpl.id === current)) return current
      return list[0]?.id || null
    })
  }

  useEffect(() => {
    if (open) {
      refreshTemplates()
      setPreviewHtml('')
    }
  }, [open, type])

  if (!open) return null

  const selectedTemplate = templates.find((tpl) => tpl.id === selectedTemplateId)

  const handlePreview = async () => {
    if (!selectedTemplate) return
    setIsPreviewLoading(true)
    try {
      const html = renderPreviewHtml({ template: selectedTemplate, data: printContext })
      setPreviewHtml(html)
    } catch (error) {
      console.error(error)
      alert('Không thể tạo bản xem trước. Vui lòng kiểm tra nội dung template.')
    } finally {
      setIsPreviewLoading(false)
    }
  }

  const handlePrint = () => {
    if (!selectedTemplate) {
      alert('Chưa có mẫu in nào. Vui lòng tạo mẫu tại mục Cài đặt > Mẫu in.')
      return
    }
    try {
      printDocument({
        template: selectedTemplate,
        data: printContext,
        userId: currentUser?.username,
        orderId: orderData?.maHoaDon || orderData?.id,
      })
      onClose()
    } catch (error) {
      console.error(error)
      alert(error.message || 'Không thể in tài liệu.')
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
      <div className="w-full max-w-4xl rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div>
            <p className="text-lg font-semibold text-slate-900">
              {type === 'invoice' ? 'In hóa đơn' : 'In vận đơn'}
            </p>
            <p className="text-sm text-slate-500">Chọn mẫu in và xem trước trước khi in.</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/settings', { state: { tab: 'print' } })}
              className="btn-secondary inline-flex items-center gap-2"
            >
              <Settings size={16} />
              Quản lý mẫu
            </button>
            <button onClick={onClose} className="rounded-full p-2 hover:bg-slate-100">
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6 px-6 py-6">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-600">Mẫu in</label>
              <select
                className="input-field mt-1"
                value={selectedTemplateId || ''}
                onChange={(e) => setSelectedTemplateId(e.target.value)}
              >
                {templates.map((tpl) => (
                  <option key={tpl.id} value={tpl.id}>
                    {tpl.name} · {tpl.paperSize}
                  </option>
                ))}
              </select>
              {templates.length === 0 && (
                <p className="mt-2 text-xs text-rose-500">
                  Chưa có mẫu {type === 'invoice' ? 'hóa đơn' : 'vận đơn'}. Vui lòng tạo ở mục Cài đặt.
                </p>
              )}
            </div>

            <div>
              <label className="text-sm font-medium text-slate-600">Thông tin nhanh</label>
              <div className="rounded-2xl border border-slate-200 p-4 text-sm text-slate-600 space-y-2">
                <p>
                  <span className="font-semibold text-slate-700">Mã đơn:</span>{' '}
                  {orderData?.maHoaDon || orderData?.id || '-'}
                </p>
                <p>
                  <span className="font-semibold text-slate-700">Khách:</span> {orderData?.tenKhachHang}
                </p>
                <p>
                  <span className="font-semibold text-slate-700">Vận đơn:</span>{' '}
                  {orderData?.maVanDon || shipmentData?.maVanDon || '-'}
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <button
                onClick={handlePrint}
                disabled={!selectedTemplate}
                className="btn-primary inline-flex items-center justify-center gap-2 disabled:opacity-40"
              >
                <Printer size={18} />
                In ngay
              </button>
              <button
                onClick={handlePreview}
                disabled={!selectedTemplate || isPreviewLoading}
                className="btn-secondary inline-flex items-center justify-center gap-2"
              >
                <Eye size={18} />
                {isPreviewLoading ? 'Đang xây dựng...' : 'Xem trước'}
              </button>
            </div>
          </div>

          <div className="border border-slate-200 rounded-2xl overflow-hidden min-h-[500px]">
            {previewHtml ? (
              <iframe title="preview" className="w-full h-full min-h-[500px]" srcDoc={previewHtml} />
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-slate-500">
                Nhấn “Xem trước” để tải bản mẫu.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default PrintDialog


