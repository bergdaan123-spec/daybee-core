import { PDFDocument, PDFImage, StandardFonts, rgb, PageSizes } from 'pdf-lib'

// ─── Generic PDF utility ──────────────────────────────────────────────────────
// This module provides a reusable foundation for generating A4 PDFs with pdf-lib.
// Extend the helpers below to match your document's layout requirements.

export const BLACK = rgb(0.067, 0.067, 0.067)
export const GRAY  = rgb(0.42, 0.447, 0.502)
export const LGRAY = rgb(0.898, 0.91, 0.929)

/**
 * Create a new blank A4 PDF document with Helvetica fonts pre-embedded.
 * Returns the document, the first page, and the regular/bold font instances.
 */
export async function createA4Document() {
  const doc  = await PDFDocument.create()
  const page = doc.addPage(PageSizes.A4)
  const regular = await doc.embedFont(StandardFonts.Helvetica)
  const bold    = await doc.embedFont(StandardFonts.HelveticaBold)
  return { doc, page, regular, bold, width: page.getSize().width, height: page.getSize().height }
}

/**
 * Convert a y-from-top value to the pdf-lib y-from-bottom coordinate system.
 * Usage: page.drawText('Hello', { y: fromTop(60, pageHeight) })
 */
export function fromTop(y: number, pageHeight: number): number {
  return pageHeight - y
}

/**
 * Embed a base64 data-URL image (PNG or JPEG) into the PDF document.
 * Returns null if the URL is empty or unrecognised.
 */
export async function embedBase64Image(
  doc: PDFDocument,
  dataUrl: string | null | undefined
): Promise<PDFImage | null> {
  if (!dataUrl) return null
  try {
    const match = dataUrl.match(/^data:image\/(png|jpeg|jpg);base64,(.+)$/)
    if (!match) return null
    const [, type, b64] = match
    const bytes = Buffer.from(b64, 'base64')
    return type === 'png' ? await doc.embedPng(bytes) : await doc.embedJpg(bytes)
  } catch {
    return null
  }
}

/**
 * Draw a horizontal rule across the page between the given x margins.
 */
export function drawRule(
  page: ReturnType<PDFDocument['addPage']>,
  y: number,
  { marginLeft = 50, marginRight = 50, color = LGRAY, thickness = 0.5 } = {}
) {
  const { width } = page.getSize()
  page.drawLine({
    start: { x: marginLeft, y },
    end:   { x: width - marginRight, y },
    thickness,
    color,
  })
}

/**
 * Convert a PDF document to a Buffer suitable for sending as an HTTP response.
 */
export async function savePDF(doc: PDFDocument): Promise<Buffer> {
  return Buffer.from(await doc.save())
}

/**
 * Build HTTP response headers for serving a PDF as a file download.
 */
export function pdfResponseHeaders(filename: string, byteLength: number): Record<string, string> {
  return {
    'Content-Type': 'application/pdf',
    'Content-Disposition': `attachment; filename="${filename}"`,
    'Content-Length': String(byteLength),
  }
}
