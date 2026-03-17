// ─── PDF invoice branding footer ─────────────────────────────────────────────
// Post-processes a rendered PDF buffer to append "Powered by Daybee" at the
// bottom-right of the first page, right-aligned to the standard page margin.
//
// Called once in lib/invoicePdf.ts (the single PDF entry point) so every
// template gets the branding automatically — templates themselves never need
// to know about it.
//
// Design matches the web InvoiceBrandingFooter component:
//   - "Powered by" in light gray regular
//   - "Daybee"     in light gray bold
//   - Opacity via color values (PDF has no CSS opacity)
//   - Right-aligned at the same baseline as the existing footer text (Y=833 from top)
//   - Sits below the footer rule that templates draw at Y=820 from top

import { PDFDocument, StandardFonts } from 'pdf-lib'
import { BLACK }                       from '@/lib/pdf'

const FOOTER_Y_FROM_TOP = 833  // matches the template footer baseline (pt from top)
const RIGHT_MARGIN      = 50   // standard page right margin (pt)

/**
 * Load the given PDF buffer, draw the Daybee branding on page 1, return the
 * updated buffer. Returns the original buffer unchanged if any error occurs.
 */
export async function applyBrandingFooter(buffer: Buffer): Promise<Buffer> {
  try {
    const doc     = await PDFDocument.load(buffer)
    const page    = doc.getPage(0)
    const regular = await doc.embedFont(StandardFonts.Helvetica)
    const bold    = await doc.embedFont(StandardFonts.HelveticaBold)

    const { width, height } = page.getSize()
    const y = height - FOOTER_Y_FROM_TOP

    const poweredBy = 'Powered by '
    const brand     = 'Daybee'
    const size      = 10

    const pwW   = regular.widthOfTextAtSize(poweredBy, size)
    const brW   = bold.widthOfTextAtSize(brand, size)
    const right = width - RIGHT_MARGIN

    page.drawText(poweredBy, {
      x: right - pwW - brW,
      y,
      font:  regular,
      size,
      color: BLACK,
    })
    page.drawText(brand, {
      x: right - brW,
      y,
      font:  bold,
      size,
      color: BLACK,
    })

    return Buffer.from(await doc.save())
  } catch {
    // Never break PDF delivery over a cosmetic footer
    return buffer
  }
}
