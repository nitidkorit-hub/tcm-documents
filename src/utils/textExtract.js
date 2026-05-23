// Client-side text extraction from PDF / DOCX / XLSX / TXT
// Used for content-based search in AI Smart Search

const MAX_TEXT_LENGTH = 50000 // limit storage per file (50KB text)

// PDF.js setup using CDN worker (more reliable across builds)
let pdfjsInstance = null
async function getPDFJS() {
  if (pdfjsInstance) return pdfjsInstance
  const pdfjs = await import('pdfjs-dist')
  try {
    if (!pdfjs.GlobalWorkerOptions.workerSrc) {
      pdfjs.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`
    }
  } catch (e) {
    console.warn('Failed to set PDF worker URL:', e)
  }
  pdfjsInstance = pdfjs
  return pdfjs
}

const RESULT = {
  SUCCESS: 'success',
  EMPTY: 'empty',
  UNSUPPORTED: 'unsupported',
  ERROR: 'error',
}

// Extract from PDF using pdfjs with robust options
async function extractFromPDF(file) {
  const pdfjs = await getPDFJS()
  const arrayBuffer = await file.arrayBuffer()

  if (arrayBuffer.byteLength === 0) {
    throw new Error('ไฟล์ว่างเปล่า (0 bytes)')
  }

  // Check PDF magic bytes
  const sig = new Uint8Array(arrayBuffer, 0, 5)
  if (!(sig[0] === 0x25 && sig[1] === 0x50 && sig[2] === 0x44 && sig[3] === 0x46)) {
    throw new Error('ไฟล์ไม่ใช่ PDF มาตรฐาน (ไม่มี %PDF header)')
  }

  // Use robust loading options for problematic PDFs
  const loadingTask = pdfjs.getDocument({
    data: arrayBuffer,
    // Use CDN cMaps for non-Latin character maps (Thai, special chars)
    cMapUrl: `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjs.version}/cmaps/`,
    cMapPacked: true,
    standardFontDataUrl: `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjs.version}/standard_fonts/`,
    useSystemFonts: true,
    isEvalSupported: false, // safer
    disableFontFace: false,
    verbosity: 0, // suppress warnings
  })

  const pdf = await loadingTask.promise
  const numPages = Math.min(pdf.numPages, 200)

  let fullText = ''
  let extractedPages = 0
  for (let i = 1; i <= numPages; i++) {
    try {
      const page = await pdf.getPage(i)
      const content = await page.getTextContent({
        includeMarkedContent: false,
        disableNormalization: false,
      })
      const pageText = content.items
        .filter((it) => it.str)
        .map((it) => it.str)
        .join(' ')
      if (pageText.trim()) {
        fullText += pageText + '\n'
        extractedPages++
      }
      if (fullText.length >= MAX_TEXT_LENGTH) break
    } catch (pageErr) {
      console.warn(`PDF page ${i} extraction failed:`, pageErr.message)
      // Continue with next page (don't fail whole document)
    }
  }

  // Cleanup
  try {
    await pdf.destroy()
  } catch (_) {}

  if (extractedPages === 0 && numPages > 0) {
    throw new Error(`อ่านได้ 0 หน้าจาก ${numPages} หน้า — PDF อาจเป็นภาพสแกนหรือใช้ font พิเศษ`)
  }

  return fullText.slice(0, MAX_TEXT_LENGTH).trim()
}

// Extract from DOCX with format validation
async function extractFromDOCX(file) {
  const arrayBuffer = await file.arrayBuffer()

  if (arrayBuffer.byteLength === 0) {
    throw new Error('ไฟล์ว่างเปล่า (0 bytes)')
  }

  // Validate ZIP signature (DOCX = ZIP container)
  const sig = new Uint8Array(arrayBuffer, 0, 4)
  const isZip = sig[0] === 0x50 && sig[1] === 0x4b // "PK"

  if (!isZip) {
    // Check if it's old .doc (OLE compound document)
    if (sig[0] === 0xd0 && sig[1] === 0xcf && sig[2] === 0x11 && sig[3] === 0xe0) {
      throw new Error('ไฟล์เป็น .doc รูปแบบเก่า (Word 97-2003) — กรุณาเปิดด้วย Word แล้ว "Save As" เป็น .docx แล้ว Upload ใหม่')
    }
    // Check if it's RTF
    const text = new TextDecoder().decode(new Uint8Array(arrayBuffer, 0, Math.min(10, arrayBuffer.byteLength)))
    if (text.startsWith('{\\rtf')) {
      throw new Error('ไฟล์เป็น RTF ไม่ใช่ .docx — กรุณา Save As เป็น .docx')
    }
    throw new Error(`ไฟล์ไม่ใช่ .docx มาตรฐาน (signature: ${Array.from(sig).map((b) => b.toString(16).padStart(2, '0')).join(' ')})`)
  }

  const mammoth = await import('mammoth')
  const result = await mammoth.extractRawText({ arrayBuffer })
  const text = (result.value || '').trim()

  // Log mammoth warnings if any
  if (result.messages && result.messages.length > 0) {
    console.log('Mammoth warnings for', file.name, ':', result.messages)
  }

  return text.slice(0, MAX_TEXT_LENGTH)
}

// Extract from XLSX with format validation
async function extractFromXLSX(file) {
  const arrayBuffer = await file.arrayBuffer()

  if (arrayBuffer.byteLength === 0) {
    throw new Error('ไฟล์ว่างเปล่า (0 bytes)')
  }

  const XLSX = await import('xlsx')
  const workbook = XLSX.read(arrayBuffer, { type: 'array', cellDates: true })

  let text = ''
  for (const sheetName of workbook.SheetNames) {
    const sheet = workbook.Sheets[sheetName]
    const csv = XLSX.utils.sheet_to_csv(sheet, { blankrows: false })
    if (csv && csv.trim()) {
      text += `[${sheetName}]\n${csv}\n\n`
    }
    if (text.length >= MAX_TEXT_LENGTH) break
  }
  return text.slice(0, MAX_TEXT_LENGTH).trim()
}

// Extract from plain text
async function extractFromText(file) {
  const text = await file.text()
  return text.slice(0, MAX_TEXT_LENGTH).trim()
}

/**
 * Main extraction function — returns detailed result
 */
export async function extractTextDetailed(file, filename) {
  if (!file) return { status: RESULT.ERROR, text: '', error: 'No file provided' }
  const name = (filename || file.name || '').toLowerCase()
  const ext = name.split('.').pop()

  try {
    let text = ''
    switch (ext) {
      case 'pdf':
        text = await extractFromPDF(file)
        break
      case 'docx':
        text = await extractFromDOCX(file)
        break
      case 'doc':
        throw new Error('.doc รูปแบบเก่า (Word 97-2003) ไม่รองรับ — กรุณา Save As เป็น .docx')
      case 'xlsx':
      case 'xls':
        text = await extractFromXLSX(file)
        break
      case 'csv':
      case 'txt':
      case 'md':
      case 'json':
        text = await extractFromText(file)
        break
      default:
        return { status: RESULT.UNSUPPORTED, text: '', error: `รูปแบบ .${ext} ยังไม่รองรับ` }
    }

    if (!text || text.length < 5) {
      return {
        status: RESULT.EMPTY,
        text: '',
        error: ext === 'pdf' ? 'PDF อาจเป็นภาพสแกน (ไม่มี text layer) — ต้อง OCR ก่อน' : 'ไม่พบข้อความในไฟล์',
      }
    }
    return { status: RESULT.SUCCESS, text, error: null }
  } catch (err) {
    console.error('Extract text error:', filename, err)
    return {
      status: RESULT.ERROR,
      text: '',
      error: err?.message || String(err),
    }
  }
}

export async function extractText(file, filename) {
  const result = await extractTextDetailed(file, filename)
  return result.text
}

export async function extractTextFromBlob(blob, filename) {
  return extractText(blob, filename)
}

export async function extractTextFromBlobDetailed(blob, filename) {
  return extractTextDetailed(blob, filename)
}

export function findSnippet(text, keyword, contextLen = 60) {
  if (!text || !keyword) return ''
  const idx = text.toLowerCase().indexOf(keyword.toLowerCase())
  if (idx < 0) return ''
  const start = Math.max(0, idx - contextLen)
  const end = Math.min(text.length, idx + keyword.length + contextLen)
  let snippet = text.slice(start, end)
  if (start > 0) snippet = '...' + snippet
  if (end < text.length) snippet = snippet + '...'
  return snippet.replace(/\s+/g, ' ').trim()
}

export { RESULT }
