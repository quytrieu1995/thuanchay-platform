const PRINT_TEMPLATES_KEY = 'kv_print_templates_v1'

const defaultTemplates = [
  {
    id: 'tpl_invoice_a4_default',
    name: 'Hóa đơn bán hàng (A4)',
    type: 'invoice',
    paperSize: 'A4',
    margin: { top: 15, right: 15, bottom: 20, left: 15 },
    description: 'Mẫu hóa đơn đầy đủ thông tin cho giấy A4',
    content: `
      <div style="font-family: 'Inter', sans-serif; font-size: 12px; color: #0f172a;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
          <div>
            <p style="font-size:20px; font-weight:700; margin:0;">{{store.name}}</p>
            <p style="margin:2px 0 0 0;">Mã số thuế: {{store.taxCode}}</p>
            <p style="margin:2px 0 0 0;">{{store.address}}</p>
            <p style="margin:2px 0 0 0;">Hotline: {{store.phone}}</p>
          </div>
          <div style="text-align:right;">
            <p style="font-size:24px; font-weight:700; margin:0; color:#2563eb;">HÓA ĐƠN</p>
            <p style="margin:4px 0 0 0;">Mã hóa đơn: {{order.maHoaDon}}</p>
            <p style="margin:2px 0 0 0;">Ngày tạo: {{order.thoiGianTao}}</p>
          </div>
        </div>

        <table style="width:100%; border-collapse:collapse; margin-bottom:16px; font-size:12px;">
          <tbody>
            <tr>
              <td style="padding:6px 8px; border:1px solid #e2e8f0; width:50%;">
                <strong>Thông tin khách hàng</strong><br/>
                {{customer.tenKhachHang}}<br/>
                {{customer.diaChiKhachHang}}<br/>
                Điện thoại: {{customer.dienThoai}}<br/>
                Nhóm: {{customer.group}}
              </td>
              <td style="padding:6px 8px; border:1px solid #e2e8f0;">
                <strong>Thông tin giao hàng</strong><br/>
                Người nhận: {{shipping.nguoiNhan}}<br/>
                Địa chỉ: {{shipping.diaChiNguoiNhan}}<br/>
                Đối tác: {{shipping.doiTacGiaoHang}}<br/>
                Mã vận đơn: {{shipping.maVanDon}}
              </td>
            </tr>
          </tbody>
        </table>

        <table style="width:100%; border-collapse:collapse; font-size:12px;">
          <thead>
            <tr style="background:#eff6ff; color:#1d4ed8;">
              <th style="border:1px solid #e2e8f0; padding:8px; text-align:left;">#</th>
              <th style="border:1px solid #e2e8f0; padding:8px; text-align:left;">Sản phẩm</th>
              <th style="border:1px solid #e2e8f0; padding:8px;">SL</th>
              <th style="border:1px solid #e2e8f0; padding:8px;">Đơn giá</th>
              <th style="border:1px solid #e2e8f0; padding:8px;">Giảm</th>
              <th style="border:1px solid #e2e8f0; padding:8px;">Thành tiền</th>
            </tr>
          </thead>
          <tbody>
            {{#each items}}
            <tr>
              <td style="border:1px solid #e2e8f0; padding:6px;">{{inc @index}}</td>
              <td style="border:1px solid #e2e8f0; padding:6px;">
                <strong>{{tenHang}}</strong><br/>
                <span style="color:#475569">{{maHang}}</span>
              </td>
              <td style="border:1px solid #e2e8f0; padding:6px; text-align:center;">{{soLuong}}</td>
              <td style="border:1px solid #e2e8f0; padding:6px; text-align:right;">{{currency donGia}}</td>
              <td style="border:1px solid #e2e8f0; padding:6px; text-align:right;">{{currency giamGia}}</td>
              <td style="border:1px solid #e2e8f0; padding:6px; text-align:right;">{{currency thanhTien}}</td>
            </tr>
            {{/each}}
          </tbody>
        </table>

        <div style="display:flex; justify-content:flex-end; margin-top:16px;">
          <table style="width:320px; border-collapse:collapse; font-size:12px;">
            <tbody>
              <tr>
                <td style="padding:6px; border:1px solid #e2e8f0;">Tổng tiền hàng</td>
                <td style="padding:6px; border:1px solid #e2e8f0; text-align:right;">{{currency totals.tongTienHang}}</td>
              </tr>
              <tr>
                <td style="padding:6px; border:1px solid #e2e8f0;">Giảm giá</td>
                <td style="padding:6px; border:1px solid #e2e8f0; text-align:right;">{{currency totals.giamGiaHoaDon}}</td>
              </tr>
              <tr>
                <td style="padding:6px; border:1px solid #e2e8f0;">Phí vận chuyển</td>
                <td style="padding:6px; border:1px solid #e2e8f0; text-align:right;">{{currency shipping.phiTraDTGH}}</td>
              </tr>
              <tr>
                <td style="padding:10px; border:1px solid #e2e8f0; font-size:14px; font-weight:600;">Khách cần trả</td>
                <td style="padding:10px; border:1px solid #e2e8f0; font-size:14px; font-weight:700; text-align:right; color:#dc2626;">
                  {{currency totals.khachCanTra}}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div style="display:flex; justify-content:space-between; margin-top:40px; font-size:12px;">
          <div>
            <p style="font-weight:600; margin-bottom:60px;">Người lập hóa đơn</p>
            <p>__________________________</p>
          </div>
          <div style="text-align:right;">
            <p style="font-weight:600; margin-bottom:60px;">Khách hàng</p>
            <p>__________________________</p>
          </div>
        </div>
      </div>
    `,
  },
  {
    id: 'tpl_shipping_k80_default',
    name: 'Tem vận đơn K80',
    type: 'shipping',
    paperSize: 'K80',
    margin: { top: 8, right: 5, bottom: 8, left: 5 },
    description: 'Tem vận đơn khổ 80mm cho máy in nhiệt',
    content: `
      <div style="font-family: 'Inter', sans-serif; font-size: 11px; color:#0f172a; width:100%;">
        <div style="text-align:center; margin-bottom:8px;">
          <p style="font-size:16px; font-weight:700; margin:0;">{{store.name}}</p>
          <p style="margin:0;">Hotline: {{store.phone}}</p>
        </div>

        <div style="border:1px dashed #94a3b8; padding:8px; margin-bottom:8px;">
          <p style="margin:0; font-weight:600;">Mã vận đơn: {{shipping.maVanDon}}</p>
          <p style="margin:2px 0 0 0;">Đối tác: {{shipping.doiTacGiaoHang}}</p>
          <p style="margin:2px 0 0 0;">Dịch vụ: {{shipping.dichVu}}</p>
        </div>

        <div style="display:flex; gap:6px; margin-bottom:8px;">
          <div style="flex:1;">
            <p style="margin:0 0 4px 0; font-weight:600;">Người gửi</p>
            <p style="margin:0;">{{store.name}}</p>
            <p style="margin:0;">{{store.address}}</p>
            <p style="margin:0;">{{store.phone}}</p>
          </div>
          <div style="flex:1;">
            <p style="margin:0 0 4px 0; font-weight:600;">Người nhận</p>
            <p style="margin:0;">{{shipping.nguoiNhan}}</p>
            <p style="margin:0;">{{shipping.diaChiNguoiNhan}}</p>
            <p style="margin:0;">{{shipping.dienThoaiNguoiNhan}}</p>
          </div>
        </div>

        <div style="border:1px solid #cbd5f5; padding:6px; margin-bottom:8px;">
          <p style="margin:0;">Sản phẩm: {{orderSummary.itemCount}} SP</p>
          <p style="margin:0;">Khối lượng: {{shipping.trongLuong}} gram</p>
          <p style="margin:0;">Tiền thu hộ: {{currency totals.conCanThuCOD}}</p>
        </div>

        <div style="text-align:center; padding:4px 0;">
          <p style="margin:0 0 4px 0; font-weight:600;">Barcode: {{shipping.maVanDon}}</p>
          <div style="height:60px; background:repeating-linear-gradient(
            90deg,
            #0f172a 0,
            #0f172a 2px,
            transparent 2px,
            transparent 4px
          ); border-radius:4px;"></div>
        </div>
      </div>
    `,
  },
]

const readTemplates = () => {
  if (typeof window === 'undefined') return defaultTemplates
  try {
    const stored = localStorage.getItem(PRINT_TEMPLATES_KEY)
    if (!stored) {
      localStorage.setItem(PRINT_TEMPLATES_KEY, JSON.stringify(defaultTemplates))
      return defaultTemplates
    }
    return JSON.parse(stored)
  } catch {
    return defaultTemplates
  }
}

const writeTemplates = (templates) => {
  if (typeof window === 'undefined') return
  localStorage.setItem(PRINT_TEMPLATES_KEY, JSON.stringify(templates))
}

export const getPrintTemplates = () => readTemplates()

export const getTemplatesByType = (type) => readTemplates().filter((tpl) => tpl.type === type)

export const getTemplateById = (id) => readTemplates().find((tpl) => tpl.id === id)

export const createPrintTemplate = (data) => {
  const templates = readTemplates()
  const newTemplate = {
    id: `tpl_${Date.now()}`,
    name: data.name || 'Mẫu in mới',
    type: data.type || 'invoice',
    paperSize: data.paperSize || 'A4',
    margin: data.margin || { top: 10, right: 10, bottom: 10, left: 10 },
    description: data.description || '',
    content: data.content || '<div>Nội dung template</div>',
  }
  const updated = [newTemplate, ...templates]
  writeTemplates(updated)
  return newTemplate
}

export const updatePrintTemplate = (id, patch) => {
  const templates = readTemplates().map((tpl) =>
    tpl.id === id
      ? {
          ...tpl,
          ...patch,
        }
      : tpl
  )
  writeTemplates(templates)
  return templates.find((tpl) => tpl.id === id)
}

export const deletePrintTemplate = (id) => {
  const templates = readTemplates().filter((tpl) => tpl.id !== id)
  writeTemplates(templates)
  return templates
}

export const duplicatePrintTemplate = (id) => {
  const template = getTemplateById(id)
  if (!template) return null
  const copy = {
    ...template,
    id: `tpl_${Date.now()}`,
    name: `${template.name} (bản sao)`,
    createdAt: new Date().toISOString(),
  }
  const templates = [copy, ...readTemplates()]
  writeTemplates(templates)
  return copy
}

export const PAPER_SIZES = [
  { id: 'A4', label: 'A4 (210 x 297 mm)' },
  { id: 'A5', label: 'A5 (148 x 210 mm)' },
  { id: 'K80', label: 'K80 (80mm x cuộn)' },
  { id: 'K58', label: 'K58 (58mm x cuộn)' },
]


