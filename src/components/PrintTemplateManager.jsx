import { useEffect, useMemo, useState } from 'react'
import { Plus, Copy, Trash2, Save, Eye } from 'lucide-react'
import {
  getPrintTemplates,
  createPrintTemplate,
  updatePrintTemplate,
  deletePrintTemplate,
  duplicatePrintTemplate,
  PAPER_SIZES,
} from '../services/printTemplateService'
import { renderPreviewHtml } from '../services/printEngine'
import { getSamplePrintData } from '../utils/printUtils'

const PrintTemplateManager = () => {
  const [templates, setTemplates] = useState([])
  const [selectedId, setSelectedId] = useState(null)
  const [form, setForm] = useState(null)
  const [previewHtml, setPreviewHtml] = useState('')
  const [isPreviewLoading, setIsPreviewLoading] = useState(false)
  const sampleData = useMemo(() => getSamplePrintData(), [])

  useEffect(() => {
    const data = getPrintTemplates()
    setTemplates(data)
    setSelectedId((current) => current || data[0]?.id || null)
  }, [])

  useEffect(() => {
    const template = templates.find((tpl) => tpl.id === selectedId)
    setForm(template || null)
    setPreviewHtml('')
  }, [selectedId, templates])

  const refreshTemplates = () => {
    const data = getPrintTemplates()
    setTemplates(data)
  }

  const handleCreate = () => {
    const template = createPrintTemplate({
      name: 'Mẫu in mới',
      type: 'invoice',
      paperSize: 'A4',
      content: '<div>Nội dung mẫu in...</div>',
    })
    refreshTemplates()
    setSelectedId(template.id)
  }

  const handleDuplicate = () => {
    if (!selectedId) return
    const copy = duplicatePrintTemplate(selectedId)
    refreshTemplates()
    if (copy) setSelectedId(copy.id)
  }

  const handleDelete = () => {
    if (!selectedId) return
    if (!window.confirm('Xóa mẫu in này?')) return
    deletePrintTemplate(selectedId)
    refreshTemplates()
    setSelectedId((prev) => {
      const remaining = getPrintTemplates()
      if (!remaining.length) return null
      if (remaining.some((tpl) => tpl.id === prev)) return prev
      return remaining[0].id
    })
  }

  const handleSave = () => {
    if (!form) return
    updatePrintTemplate(form.id, form)
    refreshTemplates()
  }

  const handlePreview = async () => {
    if (!form) return
    setIsPreviewLoading(true)
    try {
      const html = renderPreviewHtml({ template: form, data: sampleData })
      setPreviewHtml(html)
    } catch (error) {
      console.error(error)
      alert('Không thể tạo preview cho mẫu in. Vui lòng kiểm tra nội dung template.')
    } finally {
      setIsPreviewLoading(false)
    }
  }

  const tokens = [
    { label: 'Mã hóa đơn', value: '{{order.maHoaDon}}' },
    { label: 'Tên khách hàng', value: '{{customer.tenKhachHang}}' },
    { label: 'Địa chỉ khách', value: '{{customer.diaChiKhachHang}}' },
    { label: 'Mã vận đơn', value: '{{shipping.maVanDon}}' },
    { label: 'Tiền cần thu', value: '{{currency totals.khachCanTra}}' },
    { label: 'Tổng sản phẩm', value: '{{orderSummary.itemCount}}' },
    { label: 'Tên cửa hàng', value: '{{store.name}}' },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">Mẫu in</h2>
          <p className="text-sm text-slate-500">Quản lý mẫu hóa đơn và vận đơn, hỗ trợ giấy A4/K80.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={handleCreate} className="btn-secondary inline-flex items-center gap-2">
            <Plus size={16} />
            Mẫu mới
          </button>
          <button
            onClick={handleDuplicate}
            disabled={!selectedId}
            className="btn-secondary inline-flex items-center gap-2 disabled:opacity-40"
          >
            <Copy size={16} />
            Nhân bản
          </button>
          <button
            onClick={handleDelete}
            disabled={!selectedId}
            className="inline-flex items-center gap-2 rounded-xl border border-rose-200 px-4 py-2 text-sm font-semibold text-rose-600 hover:bg-rose-50 disabled:opacity-40"
          >
            <Trash2 size={16} />
            Xóa
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[280px_1fr] gap-6">
        <div className="card p-4 space-y-3">
          <p className="text-sm font-semibold text-slate-600">Danh sách mẫu</p>
          <div className="space-y-2 max-h-[420px] overflow-y-auto pr-2">
            {templates.map((tpl) => (
              <button
                key={tpl.id}
                onClick={() => setSelectedId(tpl.id)}
                className={`w-full text-left rounded-2xl border px-4 py-3 transition ${
                  tpl.id === selectedId
                    ? 'border-primary-300 bg-primary-50 text-primary-700'
                    : 'border-slate-200 hover:border-primary-200'
                }`}
              >
                <p className="font-semibold">{tpl.name}</p>
                <p className="text-xs text-slate-500 capitalize">
                  {tpl.type === 'invoice' ? 'Hóa đơn' : 'Vận đơn'} · {tpl.paperSize}
                </p>
              </button>
            ))}
            {templates.length === 0 && (
              <div className="text-sm text-slate-500">
                Chưa có mẫu nào. Nhấn “Mẫu mới” để tạo mẫu in đầu tiên.
              </div>
            )}
          </div>
        </div>

        <div className="card space-y-6">
          {form ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-600">Tên mẫu</label>
                  <input
                    type="text"
                    className="input-field mt-1"
                    value={form.name}
                    onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600">Loại</label>
                  <select
                    className="input-field mt-1"
                    value={form.type}
                    onChange={(e) => setForm((prev) => ({ ...prev, type: e.target.value }))}
                  >
                    <option value="invoice">Hóa đơn</option>
                    <option value="shipping">Vận đơn</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600">Khổ giấy</label>
                  <select
                    className="input-field mt-1"
                    value={form.paperSize}
                    onChange={(e) => setForm((prev) => ({ ...prev, paperSize: e.target.value }))}
                  >
                    {PAPER_SIZES.map((size) => (
                      <option key={size.id} value={size.id}>
                        {size.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600">Mô tả</label>
                  <input
                    type="text"
                    className="input-field mt-1"
                    value={form.description || ''}
                    onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-600">Nội dung template</label>
                <textarea
                  className="input-field mt-1 font-mono text-xs min-h-[260px]"
                  value={form.content}
                  onChange={(e) => setForm((prev) => ({ ...prev, content: e.target.value }))}
                />
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap gap-2">
                  <button onClick={handleSave} className="btn-primary inline-flex items-center gap-2">
                    <Save size={16} />
                    Lưu mẫu
                  </button>
                  <button
                    onClick={handlePreview}
                    className="btn-secondary inline-flex items-center gap-2"
                    disabled={isPreviewLoading}
                  >
                    <Eye size={16} />
                    {isPreviewLoading ? 'Đang tạo preview...' : 'Xem trước'}
                  </button>
                </div>
                <p className="text-xs text-slate-500">
                  Có thể sử dụng các token như <code>{'{{order.maHoaDon}}'}</code>,{' '}
                  <code>{'{{customer.tenKhachHang}}'}</code>, <code>{'{{currency totals.khachCanTra}}'}</code>.
                </p>
              </div>
            </>
          ) : (
            <div className="text-center text-slate-500 py-10">
              Chọn một mẫu ở danh sách bên trái để chỉnh sửa.
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Preview</h3>
          {previewHtml ? (
            <iframe
              title="Print Preview"
              className="w-full min-h-[480px] border border-slate-200 rounded-2xl"
              srcDoc={previewHtml}
            />
          ) : (
            <div className="text-sm text-slate-500">Nhấn “Xem trước” để hiển thị bản in mẫu.</div>
          )}
        </div>
        <div className="card space-y-3">
          <h3 className="text-lg font-semibold">Token thông dụng</h3>
          <ul className="space-y-2 text-sm">
            {tokens.map((token) => (
              <li
                key={token.value}
                className="rounded-xl border border-slate-200 px-3 py-2 flex flex-col"
              >
                <span className="font-medium text-slate-700">{token.label}</span>
                <span className="font-mono text-xs text-slate-500">{token.value}</span>
              </li>
            ))}
            <li className="rounded-xl border border-dashed border-slate-200 px-3 py-2 text-xs text-slate-500">
              Dùng <code>{'{{#each items}} ... {{/each}}'}</code> để lặp sản phẩm. Hỗ trợ helper
              <code>{'{{currency value}}'}</code>, <code>{'{{inc @index}}'}</code>.
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default PrintTemplateManager


