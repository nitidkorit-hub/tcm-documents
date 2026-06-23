// Best-effort visual analysis of a real MOM PDF: pulls the first embedded
// image (logo) and guesses serif/sans-serif so the MOM template settings can
// be auto-populated instead of typed by hand. PDF-only — DOCX/other formats
// just skip this (topics extraction via AI still works for any format).

import { getPDFJS } from './textExtract.js'
import { MOM_FONT_OPTIONS } from './momDefaults.js'

function imageToDataUrl(imgObj) {
  const { width, height, data } = imgObj
  if (!width || !height || !data) return null
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  const imageData = ctx.createImageData(width, height)
  const total = width * height
  if (data.length === total * 4) {
    imageData.data.set(data)
  } else if (data.length === total * 3) {
    for (let i = 0; i < total; i++) {
      imageData.data[i * 4] = data[i * 3]
      imageData.data[i * 4 + 1] = data[i * 3 + 1]
      imageData.data[i * 4 + 2] = data[i * 3 + 2]
      imageData.data[i * 4 + 3] = 255
    }
  } else if (data.length === total) {
    for (let i = 0; i < total; i++) {
      const v = data[i]
      imageData.data[i * 4] = v
      imageData.data[i * 4 + 1] = v
      imageData.data[i * 4 + 2] = v
      imageData.data[i * 4 + 3] = 255
    }
  } else {
    return null
  }
  ctx.putImageData(imageData, 0, 0)
  return canvas.toDataURL('image/png')
}

// Map a detected generic font classification to one of our curated options
export function fontHintToOption(hint) {
  if (hint === 'sans-serif') return 'Sarabun'
  if (hint === 'serif') return 'Angsana New'
  return MOM_FONT_OPTIONS[0].value
}

/**
 * @param {Blob} blob - the PDF file blob
 * @returns {Promise<{logo: string|null, fontHint: 'serif'|'sans-serif'|null}>}
 */
export async function extractPdfFormHints(blob) {
  const result = { logo: null, fontHint: null }
  try {
    const pdfjs = await getPDFJS()
    const arrayBuffer = await blob.arrayBuffer()
    const pdf = await pdfjs.getDocument({ data: new Uint8Array(arrayBuffer), verbosity: 0 }).promise
    const page = await pdf.getPage(1)
    const opList = await page.getOperatorList()

    const reverseOps = {}
    Object.keys(pdfjs.OPS).forEach((k) => (reverseOps[pdfjs.OPS[k]] = k))
    let imgName = null
    for (let i = 0; i < opList.fnArray.length; i++) {
      if (reverseOps[opList.fnArray[i]] === 'paintImageXObject') {
        imgName = opList.argsArray[i][0]
        break
      }
    }
    if (imgName) {
      try {
        const imgObj = page.objs.get(imgName)
        result.logo = imageToDataUrl(imgObj)
      } catch (e) {
        console.warn('logo extraction failed:', e.message)
      }
    }

    try {
      const tc = await page.getTextContent()
      const families = Object.values(tc.styles || {}).map((s) => s.fontFamily)
      if (families.includes('sans-serif')) result.fontHint = 'sans-serif'
      else if (families.includes('serif')) result.fontHint = 'serif'
      else if (families.includes('monospace')) result.fontHint = 'sans-serif'
    } catch (e) {
      console.warn('font hint detection failed:', e.message)
    }

    try {
      await pdf.destroy()
    } catch (_) {}
  } catch (err) {
    console.warn('extractPdfFormHints failed:', err.message)
  }
  return result
}
