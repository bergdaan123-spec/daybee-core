// ─── Default invoice template ─────────────────────────────────────────────────
// Clean single-column layout. Dutch labels. Logo optional top-left.
// Extracted from the original lib/invoicePdf.ts and updated for:
//   - InvoiceViewModel (no Prisma dependency)
//   - Dutch language throughout
//   - Logo rendering via embedBase64Image

import type { PDFFont } from 'pdf-lib'
import type { InvoiceViewModel } from '../types'
import {
  createA4Document, drawRule, savePDF, fromTop, embedBase64Image,
  BLACK, GRAY, LGRAY,
} from '@/lib/pdf'

// ─── Formatters ───────────────────────────────────────────────────────────────

const MONTHS_NL = [
  'jan', 'feb', 'mrt', 'apr', 'mei', 'jun',
  'jul', 'aug', 'sep', 'okt', 'nov', 'dec',
]

function fmtDate(date: Date): string {
  return `${date.getDate()} ${MONTHS_NL[date.getMonth()]} ${date.getFullYear()}`
}

function fmtCurrency(value: number): string {
  const [int, dec] = value.toFixed(2).split('.')
  const intFormatted = int.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  return `\u20AC ${intFormatted},${dec}`
}

function wrapText(text: string, font: PDFFont, size: number, maxWidth: number): string[] {
  const words = text.split(' ')
  const lines: string[] = []
  let current = ''
  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word
    if (font.widthOfTextAtSize(candidate, size) <= maxWidth) {
      current = candidate
    } else {
      if (current) lines.push(current)
      current = word
    }
  }
  if (current) lines.push(current)
  return lines.length ? lines : ['']
}

// ─── Template render ──────────────────────────────────────────────────────────

export async function renderPdf(invoice: InvoiceViewModel): Promise<Buffer> {
  const { doc, page, regular, bold, width, height } = await createA4Document()
  const ft = (y: number) => fromTop(y, height)

  const ML    = 50
  const RIGHT = width - 50
  const CW    = RIGHT - ML

  const { sender, recipient } = invoice

  // ─── Optional logo ──────────────────────────────────────────────────────────
  let headerStartY = 50
  const logo = await embedBase64Image(doc, invoice.logoUrl)
  if (logo) {
    const dims = logo.scaleToFit(100, 36)
    page.drawImage(logo, {
      x: ML,
      y: ft(headerStartY + dims.height),
      width: dims.width,
      height: dims.height,
    })
    headerStartY += dims.height + 10
  }

  // ─── Sender name + type ──────────────────────────────────────────────────────
  page.drawText(sender.name, {
    x: ML, y: ft(headerStartY), font: bold, size: 16, color: BLACK,
  })
  const typeLabel = sender.type === 'BV' ? 'BV' : 'Privé'
  page.drawText(`${typeLabel}  ·  ${sender.city}`, {
    x: ML, y: ft(headerStartY + 16), font: regular, size: 9, color: GRAY,
  })

  // ─── FACTUUR label + number ──────────────────────────────────────────────────
  const invWord  = 'FACTUUR'
  const invWordW = bold.widthOfTextAtSize(invWord, 10)
  page.drawText(invWord, { x: RIGHT - invWordW, y: ft(headerStartY), font: bold, size: 10, color: GRAY })
  const numW = bold.widthOfTextAtSize(invoice.invoiceNumber, 14)
  page.drawText(invoice.invoiceNumber, { x: RIGHT - numW, y: ft(headerStartY + 16), font: bold, size: 14, color: BLACK })

  const ruleY = headerStartY + 30
  drawRule(page, ft(ruleY))

  // ─── Sender details block ────────────────────────────────────────────────────
  let senderY = ruleY + 16
  const senderLines: string[] = [
    sender.address,
    `${sender.postalCode}  ${sender.city}`,
    sender.country,
    sender.email,
    ...(sender.phone     ? [sender.phone]                   : []),
    ...(sender.kvkNumber ? [`KVK: ${sender.kvkNumber}`]     : []),
    ...(sender.btwNumber ? [`BTW: ${sender.btwNumber}`]     : []),
  ]
  for (const line of senderLines) {
    page.drawText(line, { x: ML, y: ft(senderY), font: regular, size: 8.5, color: GRAY })
    senderY += 12
  }

  // ─── Aan (recipient) ─────────────────────────────────────────────────────────
  const billToX = 280
  page.drawText('AAN', { x: billToX, y: ft(ruleY + 16), font: bold, size: 8, color: GRAY })

  let toY = ruleY + 28
  const tenantLines: string[] = [
    recipient.name,
    recipient.address,
    `${recipient.postalCode}  ${recipient.city}`,
    recipient.country,
    recipient.email,
    ...(recipient.phone ? [recipient.phone] : []),
  ]
  for (let i = 0; i < tenantLines.length; i++) {
    page.drawText(tenantLines[i], {
      x: billToX,
      y: ft(toY),
      font:  i === 0 ? bold    : regular,
      size:  i === 0 ? 10     : 8.5,
      color: BLACK,
    })
    toY += i === 0 ? 14 : 12
  }

  // ─── Invoice details bar ─────────────────────────────────────────────────────
  const barY = Math.max(senderY, toY) + 14
  drawRule(page, ft(barY))

  const COL1 = ML
  const COL2 = ML + CW * 0.37
  const COL3 = ML + CW * 0.67

  const barLabelY = barY + 16
  for (const [label, x] of [
    ['FACTUURNUMMER', COL1],
    ['FACTUURDATUM',  COL2],
    ['VERVALDATUM',   COL3],
  ] as [string, number][]) {
    page.drawText(label, { x, y: ft(barLabelY), font: bold, size: 7.5, color: GRAY })
  }

  const barValueY = barLabelY + 13
  page.drawText(invoice.invoiceNumber,      { x: COL1, y: ft(barValueY), font: bold,    size: 10, color: BLACK })
  page.drawText(fmtDate(invoice.issueDate), { x: COL2, y: ft(barValueY), font: regular, size: 10, color: BLACK })
  page.drawText(fmtDate(invoice.dueDate),   { x: COL3, y: ft(barValueY), font: bold,    size: 10, color: BLACK })

  // ─── Line items table ────────────────────────────────────────────────────────
  const tableTopY = barValueY + 22
  drawRule(page, ft(tableTopY), { color: BLACK, thickness: 0.8 })

  const tHeaderY = tableTopY + 16
  page.drawText('OMSCHRIJVING', { x: ML, y: ft(tHeaderY), font: bold, size: 8, color: GRAY })
  const amtHdr  = 'BEDRAG'
  const amtHdrW = bold.widthOfTextAtSize(amtHdr, 8)
  page.drawText(amtHdr, { x: RIGHT - amtHdrW, y: ft(tHeaderY), font: bold, size: 8, color: GRAY })
  drawRule(page, ft(tHeaderY + 7), { color: LGRAY, thickness: 0.5 })

  const descText  = invoice.description ?? ''
  const descMaxW  = CW - 120
  const descLines = wrapText(descText, regular, 9.5, descMaxW)

  let itemY = tHeaderY + 20
  for (const line of descLines) {
    page.drawText(line, { x: ML, y: ft(itemY), font: regular, size: 9.5, color: BLACK })
    itemY += 14
  }

  const baseStr  = fmtCurrency(invoice.totals.baseAmount)
  const baseStrW = bold.widthOfTextAtSize(baseStr, 10)
  page.drawText(baseStr, { x: RIGHT - baseStrW, y: ft(tHeaderY + 20), font: bold, size: 10, color: BLACK })

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

  const amtStr = fmtCurrency(totalAmount)

  // ─── Totaal ───────────────────────────────────────────────────────────────────
  const totalRuleY = Math.max(itemY, tHeaderY + 34) + 10
  drawRule(page, ft(totalRuleY), { color: BLACK, thickness: 0.8 })

  const totalY = totalRuleY + 18
  page.drawText('Totaal te betalen', { x: ML, y: ft(totalY), font: bold, size: 11, color: BLACK })
  const totalAmtW = bold.widthOfTextAtSize(amtStr, 12)
  page.drawText(amtStr, { x: RIGHT - totalAmtW, y: ft(totalY), font: bold, size: 12, color: BLACK })

  // ─── Betaalgegevens ───────────────────────────────────────────────────────────
  let nextY = totalY + 16
  if (sender.iban) {
    nextY += 16
    drawRule(page, ft(nextY))
    nextY += 18
    page.drawText('BETAALGEGEVENS', { x: ML, y: ft(nextY), font: bold, size: 8, color: GRAY })

    const payRows: [string, string][] = [
      ['Rekeningnummer',    sender.iban],
      ['Betalingskenmerk',  invoice.invoiceNumber],
      ['Te betalen bedrag', fmtCurrency(totalAmount)],
    ]
    for (const [label, value] of payRows) {
      nextY += 15
      page.drawText(label, { x: ML,       y: ft(nextY), font: regular, size: 8.5, color: GRAY  })
      page.drawText(value, { x: ML + 120, y: ft(nextY), font: regular, size: 8.5, color: BLACK })
    }
  }

  // ─── Footer rule ─────────────────────────────────────────────────────────────
  // Branding text ("Powered by Daybee") is added automatically by
  // lib/invoicePdf.ts after render — no need to draw it here.
  drawRule(page, ft(820))

  return savePDF(doc)
}
