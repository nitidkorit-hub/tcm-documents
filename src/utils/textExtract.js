// Client-side text extraction from PDF / DOCX / XLSX / TXT
// Used for content-based search in AI Smart Search

const MAX_TEXT_LENGTH = 50000 // limit storage per file (50KB text)

// PDF.js setup using CDN worker (more reliable across builds)
let pdfjsInstance = null
async function getPDFJS() {
  if (pdfjsInstance) return pdfjsInstance
  const pdfjs = await import('pdfjs-dist')
  // Try CDN worker first (most reliable)
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

// Result types
const RESULT = {
  SUCCESS: 'success', // text extracted
  EMPTY: 'empty', // extraction worked but no text (e.g., scanned PDF)
  UNSUPPORTED: 'unsupported', // format not supported
  ERROR: 'error', // actual error/exception
}

// Extract from PDF using pdfjs
async function extractFromPDF(file) {
  const pdfjs = await getPDFJS()
  const arrayBuffer = await file.arrayBuffer()
  const loadingTask = pdfjs.getDocument({
    data: arrayBuffer,
    // Allow loading even for problematic PDFs
    disableAutoFetch: false,
    disableStream: false,
  })

  const pdf = await loadingTask.promise
  const numPages = Math.min(pdf.numPages, 200)

  let fullText = ''
  for (let i = 1; i <= numPages; i++) {
    try {
      const page = await pdf.getPage(i)
      const content = await page.getTextContent()
      const pageText = content.items.map((it) => it.str).join(' ')
      fullText += pageText + '\n'
      if (fullText.length >= MAX_TEXT_LENGTH) break
    } catch (pageErr) {
      console.warn(`Failed page ${i}:`, pageErr.message)
      // Continue with next page
    }
  }
  return fullText.slice(0, MAX_TEXT_LENGTH).trim()
}

// Extract from DOCX using mammoth
async function extractFromDOCX(file) {
  const mammoth = await import('mammoth')
  const arrayBuffer = await file.arrayBuffer()
  const result = await mammoth.extractRawText({ arrayBuffer })
  return (result.value || '').slice(0, MAX_TEXT_LENGTH).trim()
}

// Extract from XLSX using SheetJS
async function extractFromXLSX(file) {
  const XLSX = await import('xlsx')
  const arrayBuffer = await file.arrayBuffer()
  const workbook = XLSX.read(arrayBuffer, { type: 'array' })
  let text = ''
  for (const sheetName of workbook.SheetNames) {
    const sheet = workbook.Sheets[sheetName]
    const csv = XLSX.utils.sheet_to_csv(sheet)
    text += `[${sheetName}]\n${csv}\n\n`
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
 * @param {File|Blob} file
 * @param {string} filename
 * @returns {Promise<{status, text, error}>}
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
      case 'doc':
        text = await extractFromDOCX(file)
        break
      case 'xlsx':
      case 'xls':
      case 'csv':
        text = await extractFromXLSX(file)
        break
      case 'txt':
      case 'md':
      case 'json':
        text = await extractFromText(file)
        break
      default:
        return { status: RESULT.UNSUPPORTED, text: '', error: `Unsupported format: .${ext}` }
    }

    if (!text || text.length < 5) {
      return {
        status: RESULT.EMPTY,
        text: '',
        error: ext === 'pdf' ? 'PDF อาจเป็นภาพสแกน (ไม่มี text layer)' : 'ไม่พบข้อความในไฟล์',
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

/**
 * Simple extraction — returns text or empty string
 * Backward compatibility
 */
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

/**
 * Find snippet around keyword
 */
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
