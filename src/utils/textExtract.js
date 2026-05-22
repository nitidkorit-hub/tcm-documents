// Client-side text extraction from PDF / DOCX / XLSX / TXT
// Used for content-based search in AI Smart Search

const MAX_TEXT_LENGTH = 50000 // limit storage per file (50KB text)

// Extract from PDF using pdfjs
async function extractFromPDF(file) {
  try {
    const pdfjs = await import('pdfjs-dist')
    // Set worker source
    if (!pdfjs.GlobalWorkerOptions.workerSrc) {
      const workerUrl = await import('pdfjs-dist/build/pdf.worker.min.mjs?url')
      pdfjs.GlobalWorkerOptions.workerSrc = workerUrl.default
    }

    const arrayBuffer = await file.arrayBuffer()
    const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise
    const numPages = Math.min(pdf.numPages, 200) // limit to 200 pages

    let fullText = ''
    for (let i = 1; i <= numPages; i++) {
      const page = await pdf.getPage(i)
      const content = await page.getTextContent()
      const pageText = content.items.map((it) => it.str).join(' ')
      fullText += pageText + '\n'
      if (fullText.length >= MAX_TEXT_LENGTH) break
    }
    return fullText.slice(0, MAX_TEXT_LENGTH).trim()
  } catch (err) {
    console.warn('PDF extraction failed:', err)
    return ''
  }
}

// Extract from DOCX using mammoth
async function extractFromDOCX(file) {
  try {
    const mammoth = await import('mammoth')
    const arrayBuffer = await file.arrayBuffer()
    const result = await mammoth.extractRawText({ arrayBuffer })
    return (result.value || '').slice(0, MAX_TEXT_LENGTH).trim()
  } catch (err) {
    console.warn('DOCX extraction failed:', err)
    return ''
  }
}

// Extract from XLSX using SheetJS
async function extractFromXLSX(file) {
  try {
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
  } catch (err) {
    console.warn('XLSX extraction failed:', err)
    return ''
  }
}

// Extract from plain text
async function extractFromText(file) {
  try {
    const text = await file.text()
    return text.slice(0, MAX_TEXT_LENGTH).trim()
  } catch (err) {
    console.warn('Text extraction failed:', err)
    return ''
  }
}

/**
 * Main extraction function — auto-detect format
 * @param {File|Blob} file - File object
 * @param {string} filename - Original filename
 * @returns {Promise<string>} Extracted text (empty string if unsupported/failed)
 */
export async function extractText(file, filename) {
  if (!file) return ''
  const name = (filename || file.name || '').toLowerCase()
  const ext = name.split('.').pop()

  try {
    switch (ext) {
      case 'pdf':
        return await extractFromPDF(file)
      case 'docx':
      case 'doc':
        return await extractFromDOCX(file)
      case 'xlsx':
      case 'xls':
      case 'csv':
        return await extractFromXLSX(file)
      case 'txt':
      case 'md':
      case 'json':
        return await extractFromText(file)
      default:
        return ''
    }
  } catch (err) {
    console.error('Extract text error:', err)
    return ''
  }
}

/**
 * Extract text from a Supabase storage Blob (for re-indexing existing files)
 */
export async function extractTextFromBlob(blob, filename) {
  return extractText(blob, filename)
}

/**
 * Find snippet around keyword (returns ~120 chars context)
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
