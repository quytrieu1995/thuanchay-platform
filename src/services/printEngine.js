import { logPrintAction } from './printLogService'

const PAPER_PRESETS = {
  A4: { width: '210mm', bodyClass: 'paper-a4' },
  A5: { width: '148mm', bodyClass: 'paper-a5' },
  K80: { width: '80mm', bodyClass: 'paper-k80' },
  K58: { width: '58mm', bodyClass: 'paper-k58' },
}

const toCurrency = (value) => {
  const amount = Number(value) || 0
  return amount.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })
}

const helperFns = {
  currency: (value) => toCurrency(value),
  uppercase: (value) => String(value || '').toUpperCase(),
  lowercase: (value) => String(value || '').toLowerCase(),
  inc: (value) => Number(value || 0) + 1,
  datetime: (value) =>
    value
      ? new Date(value).toLocaleString('vi-VN', {
          hour: '2-digit',
          minute: '2-digit',
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
        })
      : '',
}

const createContext = (data, parent = null, loopMeta = null) => ({
  ...data,
  __parent: parent,
  __loop: loopMeta,
})

const resolvePath = (context, path) => {
  if (!path) return ''
  if (path === 'this') return context
  if (path === '@index') return context.__loop?.index ?? 0

  const parts = path.split('.')
  let currentContext = context
  while (currentContext) {
    let value = currentContext
    let found = true
    for (const part of parts) {
      if (value == null) {
        found = false
        break
      }
      value = value[part]
    }
    if (found && value !== undefined) {
      return value
    }
    currentContext = currentContext.__parent
  }
  return ''
}

const renderSimpleTokens = (template, context) => {
  return template.replace(/{{\s*([^{}]+?)\s*}}/g, (_, expression) => {
    const parts = expression.trim().split(/\s+/)
    if (parts.length > 1) {
      const helper = parts[0]
      if (helperFns[helper]) {
        const args = parts.slice(1).map((token) => resolvePath(context, token))
        return helperFns[helper](...args) ?? ''
      }
    }
    const value = resolvePath(context, expression.trim())
    if (Array.isArray(value)) return value.length
    return value ?? ''
  })
}

const renderEachBlocks = (template, context) => {
  const eachRegex = /{{#each\s+([^}]+)}}([\s\S]*?){{\/each}}/g
  return template.replace(eachRegex, (_, path, inner) => {
    const collection = resolvePath(context, path.trim())
    if (!Array.isArray(collection) || collection.length === 0) return ''
    return collection
      .map((item, index) => {
        const childContext = createContext(
          { ...item, this: item },
          context,
          { index }
        )
        return renderTemplateString(inner, childContext)
      })
      .join('')
  })
}

const renderTemplateString = (template, context) => {
  let output = template
  output = renderEachBlocks(output, context)
  output = renderSimpleTokens(output, context)
  return output
}

const buildDocumentHtml = (bodyHtml, { paperSize = 'A4', margin, autoPrint = true } = {}) => {
  const preset = PAPER_PRESETS[paperSize] || PAPER_PRESETS.A4
  const marginCss = margin
    ? `${margin.top || 10}mm ${margin.right || 10}mm ${margin.bottom || 10}mm ${margin.left || 10}mm`
    : '10mm'

  return `
    <!DOCTYPE html>
    <html lang="vi">
      <head>
        <meta charset="UTF-8" />
        <title>Print Preview</title>
        <style>
          @page { size: ${preset.width} auto; margin: ${marginCss}; }
          body {
            margin: ${marginCss};
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            background: #fff;
            color: #0f172a;
          }
          .paper-a4 { width: ${preset.width}; }
          .paper-a5 { width: ${preset.width}; }
          .paper-k80 { width: ${preset.width}; }
          .paper-k58 { width: ${preset.width}; }
          table { border-collapse: collapse; }
        </style>
      </head>
      <body class="${preset.bodyClass}">
        ${bodyHtml}
        ${autoPrint ? `
        <script>
          window.onload = () => {
            window.focus();
            window.print();
            setTimeout(() => window.close(), 300);
          }
        </script>` : ''}
      </body>
    </html>
  `
}

export const printDocument = ({ template, data, userId, orderId }) => {
  if (!template) throw new Error('Không tìm thấy mẫu in phù hợp')
  const context = createContext(data)
  const rendered = renderTemplateString(template.content || '', context)
  const doc = buildDocumentHtml(rendered, { paperSize: template.paperSize, margin: template.margin, autoPrint: true })
  const printWindow = window.open('', '_blank', 'noopener,noreferrer')
  if (!printWindow) {
    throw new Error('Trình duyệt chặn cửa sổ in. Vui lòng cho phép popup.')
  }
  printWindow.document.open()
  printWindow.document.write(doc)
  printWindow.document.close()

  logPrintAction({
    type: template.type,
    orderId,
    templateId: template.id,
    userId,
    metadata: {
      paperSize: template.paperSize,
    },
  })
}

export const renderPreviewHtml = ({ template, data }) => {
  const context = createContext(data)
  const rendered = renderTemplateString(template.content || '', context)
  return buildDocumentHtml(rendered, { paperSize: template.paperSize, margin: template.margin, autoPrint: false })
}


