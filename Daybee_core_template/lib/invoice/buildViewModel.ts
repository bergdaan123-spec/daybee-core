// ─── Invoice view model builder ───────────────────────────────────────────────
// Maps a raw Prisma invoice payload + the user's logoUrl into a clean
// InvoiceViewModel that all templates can consume without touching Prisma types.

import type { Prisma } from '@prisma/client'
import type { InvoiceViewModel } from './types'
import { calculateTotals } from './calculateTotals'

export type RawInvoice = Prisma.InvoiceGetPayload<{
  include: {
    tenant:   true
    identity: true
    rentalContract: { include: { property: true } }
    charges:  true
  }
}>

export function buildInvoiceViewModel(
  invoice:    RawInvoice,
  logoUrl:    string | null | undefined,
  brandColor: string,
): InvoiceViewModel {
  const { identity, tenant, rentalContract } = invoice

  const charges = (invoice.charges ?? [])
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map(c => ({
      label:     c.label,
      reference: c.reference ?? null,
      amount:    Number(c.amount),
      sortOrder: c.sortOrder,
    }))

  const vatRate = invoice.vatRate ? Number(invoice.vatRate) : null
  const totals  = calculateTotals(Number(invoice.amount), charges, vatRate)

  return {
    id:            invoice.id,
    invoiceNumber: invoice.invoiceNumber,
    issueDate:     invoice.issueDate,
    dueDate:       invoice.dueDate,
    status:        invoice.status,
    // Auto-build description from property + invoice number.
    // If the user entered a custom description, that takes precedence.
    description:   invoice.description?.trim() ||
                   `Huurrekening ${rentalContract.property.name} \u2013 ${invoice.invoiceNumber}`,
    amount:        totals.totalAmount,
    totals,

    sender: {
      name:       identity.name,
      type:       identity.type as 'PRIVATE' | 'BV',
      address:    identity.address,
      postalCode: identity.postalCode,
      city:       identity.city,
      country:    identity.country,
      email:      identity.email,
      phone:      identity.phone      ?? null,
      kvkNumber:  identity.kvkNumber  ?? null,
      btwNumber:  identity.btwNumber  ?? null,
      iban:       identity.iban       ?? null,
    },

    recipient: {
      name:       tenant.name,
      address:    tenant.address,
      postalCode: tenant.postalCode,
      city:       tenant.city,
      country:    tenant.country,
      email:      tenant.email,
      phone:      tenant.phone ?? null,
    },

    property: {
      name: rentalContract.property.name,
    },

    contract: {
      monthlyRent: Number(rentalContract.monthlyRent),
      startDate:   rentalContract.startDate,
      endDate:     rentalContract.endDate ?? null,
    },

    logoUrl:    logoUrl ?? null,
    brandColor,
  }
}
