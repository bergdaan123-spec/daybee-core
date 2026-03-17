// ─── Normalized invoice view model ───────────────────────────────────────────
// All invoice templates (PDF + web preview) receive this type.
// Extend here when future templates need additional data.
// Never import Prisma types in template files — use this contract instead.

import type { InvoiceChargeLine, InvoiceTotals } from './calculateTotals'
export type { InvoiceChargeLine, InvoiceTotals }

export type InvoiceSender = {
  name:       string
  type:       'PRIVATE' | 'BV'
  address:    string
  postalCode: string
  city:       string
  country:    string
  email:      string
  phone:      string | null
  kvkNumber:  string | null
  btwNumber:  string | null
  iban:       string | null
}

export type InvoiceRecipient = {
  name:       string
  address:    string
  postalCode: string
  city:       string
  country:    string
  email:      string
  phone:      string | null
}

export type InvoiceContract = {
  monthlyRent: number
  startDate:   Date
  endDate:     Date | null
}

export type InvoiceViewModel = {
  id:            string
  invoiceNumber: string
  issueDate:     Date
  dueDate:       Date
  status:        string
  description:   string | null
  /** Total amount (= totals.totalAmount). Kept for backwards compat with templates. */
  amount:        number

  sender:    InvoiceSender
  recipient: InvoiceRecipient

  property: {
    name: string
  }

  contract: InvoiceContract

  /** Full breakdown: base + extra charges + VAT = total. */
  totals: InvoiceTotals

  // Company logo stored as a base64 data-URL (from User.logoUrl).
  // Templates must handle null gracefully.
  logoUrl: string | null

  // Dominant brand color extracted from the logo (hex string, e.g. '#F97316').
  // Falls back to BRAND_COLOR_FALLBACK when no logo or extraction fails.
  // Templates use this for accent bars, separators, and highlights.
  brandColor: string

  // Optional: per-identity template override. Currently unused;
  // wire to identity.invoiceTemplate when ready.
  templateId?: string

  // Set to true to suppress the "Powered by Daybee" branding footer.
  // Use for premium tenants or white-label deployments.
  hideBranding?: boolean
}
