import { prisma } from '@/lib/prisma'

/**
 * Generates the next invoice number for a user, scoped to the current year.
 * Format: YYYY-NNN (e.g. 2026-001, 2026-002, …)
 *
 * Finds the highest existing numeric suffix for invoices in the current year
 * and increments by 1. If no invoices exist for this year, starts at 001.
 */
export async function generateInvoiceNumber(userId: string): Promise<string> {
  const year   = new Date().getFullYear()
  const prefix = `${year}-`

  const existing = await prisma.invoice.findMany({
    where: { userId, invoiceNumber: { startsWith: prefix } },
    select: { invoiceNumber: true },
  })

  let max = 0
  for (const { invoiceNumber } of existing) {
    const n = parseInt(invoiceNumber.slice(prefix.length), 10)
    if (!isNaN(n) && n > max) max = n
  }

  return `${prefix}${String(max + 1).padStart(3, '0')}`
}
