import * as pdfParse from 'pdf-parse'
import mammoth from 'mammoth'

/**
 * Extracts readable text from uploaded files for AI processing.
 *
 * Supported:
 *   PDF  → pdf-parse
 *   DOCX → mammoth
 *   TXT  → raw UTF-8
 *   PPTX → JSZip (unzip) + XML <a:t> text extraction
 *
 * Returns null for images (PNG, JPG) and unsupported types.
 */
export async function extractTextFromFile(file: File): Promise<string | null> {
  try {
    const fileType = file.type
    const buffer = await file.arrayBuffer()

    // ── PDF ──────────────────────────────────────────────
    if (fileType === 'application/pdf') {
      const data = await pdfParse(Buffer.from(buffer))
      return data.text || null
    }

    // ── DOCX ─────────────────────────────────────────────
    if (
      fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      file.name.endsWith('.docx')
    ) {
      const result = await mammoth.extractRawText({ arrayBuffer: buffer })
      return result.value || null
    }

    // ── TXT ──────────────────────────────────────────────
    if (fileType === 'text/plain' || file.name.endsWith('.txt')) {
      return Buffer.from(buffer).toString('utf-8') || null
    }

    // ── PPTX ─────────────────────────────────────────────
    if (
      fileType === 'application/vnd.openxmlformats-officedocument.presentationml.presentation' ||
      file.name.endsWith('.pptx')
    ) {
      return await extractTextFromPptx(buffer)
    }

    // ── Images (no text) ─────────────────────────────────
    if (
      fileType === 'image/png' ||
      fileType === 'image/jpeg' ||
      file.name.endsWith('.png') ||
      file.name.endsWith('.jpg') ||
      file.name.endsWith('.jpeg')
    ) {
      return null
    }

    return null
  } catch (error) {
    console.error('Error extracting text from file:', error)
    return null
  }
}

/**
 * Extract text from a PPTX file.
 *
 * PPTX = ZIP archive containing XML slide files at ppt/slides/slide*.xml
 * Text lives inside <a:t>…</a:t> elements within each slide XML.
 */
async function extractTextFromPptx(buffer: ArrayBuffer): Promise<string | null> {
  try {
    // Dynamic import so the bundle stays lean for non-PPTX users
    const JSZip = (await import('jszip')).default

    const zip = await JSZip.loadAsync(buffer)

    // Collect all slide files in order: slide1.xml, slide2.xml, …
    const slideEntries = Object.keys(zip.files)
      .filter((name) => /^ppt\/slides\/slide\d+\.xml$/.test(name))
      .sort((a, b) => {
        const numA = parseInt(a.match(/\d+/)?.[0] ?? '0', 10)
        const numB = parseInt(b.match(/\d+/)?.[0] ?? '0', 10)
        return numA - numB
      })

    if (slideEntries.length === 0) return null

    const slideTexts: string[] = []

    for (const slidePath of slideEntries) {
      const xml = await zip.files[slidePath].async('string')

      // Extract all <a:t>…</a:t> text nodes (the actual text on the slide)
      const matches = xml.match(/<a:t(?:\s[^>]*)?>([^<]*)<\/a:t>/g) ?? []
      const slideText = matches
        .map((tag) => tag.replace(/<[^>]+>/g, '').trim())
        .filter(Boolean)
        .join(' ')

      if (slideText) {
        slideTexts.push(`[Slide ${slideEntries.indexOf(slidePath) + 1}]\n${slideText}`)
      }
    }

    return slideTexts.length > 0 ? slideTexts.join('\n\n') : null
  } catch (err) {
    console.error('PPTX text extraction failed:', err)
    return null
  }
}
