// ─── Invoice totals calculator ────────────────────────────────────────────────
// Single source of truth for all invoice arithmetic.
// Called by buildViewModel so templates never compute money themselves.

export type InvoiceChargeLine = {
  label:     string
  reference: string | null
  amount:    number
  sortOrder: number
}

export type InvoiceTotals = {
  /** The main rent line amount. */
  baseAmount:      number
  /** Extra cost lines (e.g. OZBG, service costs). Empty array when none. */
  extraCharges:    InvoiceChargeLine[]
  /** baseAmount + sum of extraCharges — the taxable subtotal. */
  subtotalExclVat: number
  /** VAT rate percentage (e.g. 21), or null when no VAT applies. */
  vatRate:         number | null
  /** VAT amount in euros. Zero when vatRate is null. */
  vatAmount:       number
  /** The final total the tenant owes. */
  totalAmount:     number
}

export function calculateTotals(
  baseAmount: number,
  charges:    InvoiceChargeLine[],
  vatRate:    number | null,
): InvoiceTotals {
  const chargesTotal    = charges.reduce((sum, c) => sum + c.amount, 0)
  const subtotalExclVat = round2(baseAmount + chargesTotal)
  const vatAmount       = vatRate ? round2(subtotalExclVat * vatRate / 100) : 0
  const totalAmount     = round2(subtotalExclVat + vatAmount)

  return {
    baseAmount,
    extraCharges:    charges,
    subtotalExclVat,
    vatRate,
    vatAmount,
    totalAmount,
  }
}

function round2(n: number): number {
  return Math.round(n * 100) / 100
}
