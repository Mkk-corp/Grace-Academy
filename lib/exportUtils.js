function esc(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function download(blob, name) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = name
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export function exportToExcel(cols, data, filename) {
  const header = cols.map(c =>
    `<Cell><Data ss:Type="String">${esc(c.header)}</Data></Cell>`
  ).join('')
  const rows = data.map(row =>
    `<Row>${cols.map(c =>
      `<Cell><Data ss:Type="String">${esc(c.value(row))}</Data></Cell>`
    ).join('')}</Row>`
  ).join('\n')

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<?mso-application progid="Excel.Sheet"?>',
    '<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"',
    ' xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">',
    '<Styles>',
    '<Style ss:ID="h"><Font ss:Bold="1"/><Interior ss:Color="#C9932C" ss:Pattern="Solid"/><Font ss:Color="#FFFFFF"/></Style>',
    '</Styles>',
    '<Worksheet ss:Name="Sheet1"><Table>',
    `<Row>${cols.map(c => `<Cell ss:StyleID="h"><Data ss:Type="String">${esc(c.header)}</Data></Cell>`).join('')}</Row>`,
    rows,
    '</Table></Worksheet></Workbook>',
  ].join('\n')

  download(
    new Blob([xml], { type: 'application/vnd.ms-excel;charset=utf-8' }),
    `${filename}.xls`,
  )
}

export function exportToPDF(cols, data, filename, title = '') {
  const displayTitle = title || filename
  const dateStr = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })

  const headerRow = `<tr>${cols.map(c => `<th>${esc(c.header)}</th>`).join('')}</tr>`
  const bodyRows = data.map(row =>
    `<tr>${cols.map(c => `<td>${esc(c.value(row))}</td>`).join('')}</tr>`
  ).join('\n')

  const html = `<!DOCTYPE html>
<html dir="auto">
<head>
<meta charset="UTF-8">
<title>${esc(displayTitle)}</title>
<style>
  @page { margin: 18mm 14mm; size: A4 landscape; }
  * { box-sizing: border-box; }
  body { font-family: Arial, Helvetica, sans-serif; font-size: 11px; color: #111; margin: 0; padding: 0; }
  .toolbar { padding: 12px 0 16px; display: flex; gap: 10px; }
  .btn { padding: 8px 20px; background: #c9932c; color: #fff; border: none; border-radius: 6px; cursor: pointer; font-size: 13px; font-family: inherit; font-weight: 700; }
  h1 { font-size: 15px; color: #c9932c; margin: 0 0 3px; }
  .meta { font-size: 9.5px; color: #6b7280; margin-bottom: 14px; }
  table { width: 100%; border-collapse: collapse; }
  thead th { background: #c9932c; color: #fff; padding: 7px 10px; text-align: left; font-size: 10px; font-weight: 700; white-space: nowrap; }
  tbody td { padding: 6px 10px; border-bottom: 1px solid #e5e7eb; font-size: 10px; }
  tbody tr:nth-child(even) td { background: #f9fafb; }
  @media print { .toolbar { display: none !important; } }
</style>
</head>
<body>
<div class="toolbar">
  <button class="btn" onclick="window.print()">⬇ Save as PDF / Print</button>
</div>
<h1>${esc(displayTitle)}</h1>
<div class="meta">Exported ${dateStr} &nbsp;·&nbsp; ${data.length} record${data.length !== 1 ? 's' : ''}</div>
<table>
  <thead>${headerRow}</thead>
  <tbody>${bodyRows}</tbody>
</table>
</body>
</html>`

  const w = window.open('', '_blank', 'width=1000,height=700')
  if (!w) { alert('Please allow pop-ups to export PDF.'); return }
  w.document.write(html)
  w.document.close()
  w.focus()
  setTimeout(() => w.print(), 400)
}
