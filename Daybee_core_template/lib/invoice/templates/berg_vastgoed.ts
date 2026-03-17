// ─── Berg Vastgoed invoice template ──────────────────────────────────────────
// Professional Dutch rental invoice.
//
// Layout:
//   - WHITE header area — logo left, invoice number right, gray separator
//   - Two-column Van / Aan address block
//   - Light-gray metadata strip (number, issue date, due date)
//   - Clean line-item table with auto-built description
//   - Brand-color total bar  ← color extracted automatically from the logo
//   - Bordered payment details box
//
// The brand color comes from invoice.brandColor (set by getBrandColor in the
// page / API route). Text on the brand bar adapts to light/dark colors.
//
// To add a new client template: copy this file, adjust colors/layout, register
// in lib/invoice/registry.ts.

import type { PDFFont } from 'pdf-lib'
import { rgb }          from 'pdf-lib'
import type { InvoiceViewModel } from '../types'
import { brandColorNeedsDarkText } from '../getBrandColor'
import {
  createA4Document, drawRule, savePDF, fromTop, embedBase64Image,
  BLACK, GRAY, LGRAY,
} from '@/lib/pdf'

// ─── Static palette ───────────────────────────────────────────────────────────
const WHITE    = rgb(1, 1, 1)
const LIGHT_BG = rgb(0.961, 0.965, 0.973)
const HEADER_H = 68   // height of the white logo/header area (pt)
const TOTAL_H  = 30   // height of the brand-color total bar (pt)

// ─── Helpers ──────────────────────────────────────────────────────────────────

const MONTHS_NL = [
  'jan', 'feb', 'mrt', 'apr', 'mei', 'jun',
  'jul', 'aug', 'sep', 'okt', 'nov', 'dec',
]

function fmtDate(d: Date): string {
  return `${d.getDate()} ${MONTHS_NL[d.getMonth()]} ${d.getFullYear()}`
}

function fmtCurrency(value: number): string {
  const [int, dec] = value.toFixed(2).split('.')
  return `\u20AC ${int.replace(/\B(?=(\d{3})+(?!\d))/g, '.')},${dec}`
}

function wrapText(text: string, font: PDFFont, size: number, maxWidth: number): string[] {
  const words = text.split(' ')
  const lines: string[] = []
  let cur = ''
  for (const word of words) {
    const candidate = cur ? `${cur} ${word}` : word
    if (font.widthOfTextAtSize(candidate, size) <= maxWidth) {
      cur = candidate
    } else {
      if (cur) lines.push(cur)
      cur = word
    }
  }
  if (cur) lines.push(cur)
  return lines.length ? lines : ['']
}

/** Parse a CSS hex color string to pdf-lib RGB (values 0–1). */
function hexToRgbPdf(hex: string) {
  const h = hex.replace('#', '')
  return rgb(
    parseInt(h.substring(0, 2), 16) / 255,
    parseInt(h.substring(2, 4), 16) / 255,
    parseInt(h.substring(4, 6), 16) / 255,
  )
}

// ─── Template render ──────────────────────────────────────────────────────────

export async function renderPdf(invoice: InvoiceViewModel): Promise<Buffer> {
  const { doc, page, regular, bold, width, height } = await createA4Document()
  const ft = (y: number) => fromTop(y, height)

  const ML    = 50
  const RIGHT = width - 50
  const CW    = RIGHT - ML

  const { sender, recipient } = invoice
  const BRAND = hexToRgbPdf(invoice.brandColor)
  const onBrand = brandColorNeedsDarkText(invoice.brandColor) ? BLACK : WHITE

  // ─── White header area ──────────────────────────────────────────────────────
  // No fill needed (page is already white). Just place logo + invoice number,
  // then draw a separator rule.

  const logo = await embedBase64Image(doc, invoice.logoUrl)
  if (logo) {
    const dims  = logo.scaleToFit(120, 46)
    const logoY = ft(HEADER_H) + (HEADER_H - dims.height) / 2
    page.drawImage(logo, { x: ML, y: logoY, width: dims.width, height: dims.height })
  } else {
    // Fallback: company initial in dark
    page.drawText(sender.name.charAt(0).toUpperCase(), {
      x: ML, y: ft(HEADER_H - 16), font: bold, size: 34, color: BLACK,
    })
  }

  // "FACTUUR" label
  const factuurLabel = 'FACTUUR'
  const factuurW     = bold.widthOfTextAtSize(factuurLabel, 8.5)
  page.drawText(factuurLabel, {
    x: RIGHT - factuurW, y: ft(22), font: bold, size: 8.5, color: GRAY,
  })

  // Invoice number (large, dark)
  const numW = bold.widthOfTextAtSize(invoice.invoiceNumber, 18)
  page.drawText(invoice.invoiceNumber, {
    x: RIGHT - numW, y: ft(50), font: bold, size: 18, color: BLACK,
  })

  // Separator below header
  drawRule(page, ft(HEADER_H + 2), { color: LGRAY, thickness: 0.8 })

  // ─── Van / Aan two-column block ──────────────────────────────────────────────
  const blockY  = HEADER_H + 20
  const COL_MID = ML + CW / 2 + 10

  page.drawText('VAN', { x: ML,      y: ft(blockY), font: bold, size: 8, color: GRAY })
  page.drawText('AAN', { x: COL_MID, y: ft(blockY), font: bold, size: 8, color: GRAY })

  let senderY = blockY + 14
  const senderLines = [
    sender.name,
    sender.address,
    `${sender.postalCode}  ${sender.city}`,
    sender.country,
    sender.email,
    ...(sender.phone     ? [sender.phone]               : []),
    ...(sender.kvkNumber ? [`KVK: ${sender.kvkNumber}`] : []),
    ...(sender.btwNumber ? [`BTW: ${sender.btwNumber}`] : []),
  ]
  for (let i = 0; i < senderLines.length; i++) {
    page.drawText(senderLines[i], {
      x: ML, y: ft(senderY),
      font:  i === 0 ? bold   : regular,
      size:  i === 0 ? 11    : 9,
      color: i === 0 ? BLACK : GRAY,
    })
    senderY += i === 0 ? 15 : 13
  }

  let recipY = blockY + 14
  const recipLines = [
    recipient.name,
    recipient.address,
    `${recipient.postalCode}  ${recipient.city}`,
    recipient.country,
    recipient.email,
    ...(recipient.phone ? [recipient.phone] : []),
  ]
  for (let i = 0; i < recipLines.length; i++) {
    page.drawText(recipLines[i], {
      x: COL_MID, y: ft(recipY),
      font:  i === 0 ? bold   : regular,
      size:  i === 0 ? 11    : 9,
      color: i === 0 ? BLACK : GRAY,
    })
    recipY += i === 0 ? 15 : 13
  }

  // ─── Metadata strip (light gray background) ──────────────────────────────────
  const META_Y = Math.max(senderY, recipY) + 16
  const META_H = 38

  page.drawRectangle({
    x: ML, y: ft(META_Y + META_H), width: CW, height: META_H, color: LIGHT_BG,
  })

  const C1 = ML + 10
  const C2 = ML + CW * 0.37
  const C3 = ML + CW * 0.67

  const metaLblY = META_Y + 14
  for (const [label, x] of [
    ['FACTUURNUMMER', C1],
    ['FACTUURDATUM',  C2],
    ['VERVALDATUM',   C3],
  ] as [string, number][]) {
    page.drawText(label, { x, y: ft(metaLblY), font: bold, size: 7, color: GRAY })
  }

  const metaValY = metaLblY + 13
  page.drawText(invoice.invoiceNumber,      { x: C1, y: ft(metaValY), font: bold,    size: 9.5, color: BLACK })
  page.drawText(fmtDate(invoice.issueDate), { x: C2, y: ft(metaValY), font: regular, size: 9.5, color: BLACK })
  page.drawText(fmtDate(invoice.dueDate),   { x: C3, y: ft(metaValY), font: bold,    size: 9.5, color: BLACK })

  // ─── Line items table ────────────────────────────────────────────────────────
  const tableY = META_Y + META_H + 20
  drawRule(page, ft(tableY), { color: BLACK, thickness: 0.8 })

  const tHdrY = tableY + 14
  page.drawText('OMSCHRIJVING', { x: ML, y: ft(tHdrY), font: bold, size: 8, color: GRAY })
  const amtHdrW = bold.widthOfTextAtSize('BEDRAG', 8)
  page.drawText('BEDRAG', { x: RIGHT - amtHdrW, y: ft(tHdrY), font: bold, size: 8, color: GRAY })
  drawRule(page, ft(tHdrY + 7), { color: LGRAY, thickness: 0.4 })

  const descText  = invoice.description ?? ''
  const descLines = wrapText(descText, regular, 9.5, CW - 110)

  let itemY = tHdrY + 20
  for (const line of descLines) {
    page.drawText(line, { x: ML, y: ft(itemY), font: regular, size: 9.5, color: BLACK })
    itemY += 14
  }

  const baseStr  = fmtCurrency(invoice.totals.baseAmount)
  const baseStrW = bold.widthOfTextAtSize(baseStr, 10)
  page.drawText(baseStr, { x: RIGHT - baseStrW, y: ft(tHdrY + 20), font: bold, size: 10, color: BLACK })

  // Extra charge lines
  for (const charge of invoice.totals.extraCharges) {
    drawRule(page, ft(itemY + 2), { color: LGRAY, thickness: 0.3 })
    itemY += 14
    const chargeLabel = charge.reference ? `${charge.label} (${charge.reference})` : charge.label
    page.drawText(chargeLabel, { x: ML, y: ft(itemY), font: regular, size: 9.5, color: BLACK })
    const cStr  = fmtCurrency(charge.amount)
    const cStrW = bold.widthOfTextAtSize(cStr, 10)
    page.drawText(cStr, { x: RIGHT - cStrW, y: ft(itemY), font: bold, size: 10, color: BLACK })
    itemY += 14
  }

  // Subtotal + VAT lines (only when VAT applies)
  const { vatRate, vatAmount, subtotalExclVat, totalAmount } = invoice.totals
  if (vatRate && vatRate > 0) {
    drawRule(page, ft(itemY + 4), { color: LGRAY, thickness: 0.4 })
    itemY += 16
    page.drawText('Subtotaal excl. BTW', { x: ML, y: ft(itemY), font: regular, size: 9, color: GRAY })
    const subStr  = fmtCurrency(subtotalExclVat)
    const subStrW = regular.widthOfTextAtSize(subStr, 9)
    page.drawText(subStr, { x: RIGHT - subStrW, y: ft(itemY), font: regular, size: 9, color: GRAY })
    itemY += 14
    page.drawText(`BTW ${vatRate}%`, { x: ML, y: ft(itemY), font: regular, size: 9, color: GRAY })
    const vatStr  = fmtCurrency(vatAmount)
    const vatStrW = regular.widthOfTextAtSize(vatStr, 9)
    page.drawText(vatStr, { x: RIGHT - vatStrW, y: ft(itemY), font: regular, size: 9, color: GRAY })
    itemY += 14
  }

  // ─── Brand-color total bar ────────────────────────────────────────────────────
  const totalBandY = Math.max(itemY, tHdrY + 34) + 12
  const amtStr = fmtCurrency(totalAmount)

  page.drawRectangle({
    x: ML, y: ft(totalBandY + TOTAL_H), width: CW, height: TOTAL_H, color: BRAND,
  })

  const totalTextY = totalBandY + TOTAL_H - 11
  page.drawText('TOTAAL TE BETALEN', {
    x: ML + 10, y: ft(totalTextY), font: bold, size: 9, color: onBrand,
  })
  const totalAmtW = bold.widthOfTextAtSize(amtStr, 12)
  page.drawText(amtStr, {
    x: RIGHT - totalAmtW - 10, y: ft(totalTextY), font: bold, size: 12, color: onBrand,
  })

  // ─── Betaalgegevens (bordered box) ───────────────────────────────────────────
  let nextY = totalBandY + TOTAL_H + 20

  if (sender.iban) {
    page.drawText('BETAALGEGEVENS', { x: ML, y: ft(nextY), font: bold, size: 8, color: GRAY })
    nextY += 14

    const payRows: [string, string][] = [
      ['IBAN',             sender.iban],
      ['Betalingskenmerk', invoice.invoiceNumber],
      ['Te betalen',       fmtCurrency(totalAmount)],
    ]
    const BOX_H = payRows.length * 16 + 14

    page.drawRectangle({
      x: ML, y: ft(nextY + BOX_H),
      width: CW * 0.62, height: BOX_H,
      color: WHITE, borderColor: LGRAY, borderWidth: 0.8,
    })

    for (const [label, value] of payRows) {
      nextY += 16
      page.drawText(label, { x: ML + 10,  y: ft(nextY), font: regular, size: 8.5, color: GRAY  })
      page.drawText(value, { x: ML + 140, y: ft(nextY), font: bold,    size: 8.5, color: BLACK })
    }
    nextY += 14
  }

  // ─── Footer rule ─────────────────────────────────────────────────────────────
  // Branding text ("Powered by Daybee") is added automatically by
  // lib/invoicePdf.ts after render — no need to draw it here.
  drawRule(page, ft(820))

  return savePDF(doc)
}
