// ─── Invoice PDF entry point ──────────────────────────────────────────────────
// Delegates to the active template from the invoice registry.
// Call sites only need to import this function — they never know which
// template is active. Template selection lives in lib/invoice/registry.ts.

import type { InvoiceViewModel } from './invoice/types'
import { getTemplate }           from './invoice/registry'
import { applyBrandingFooter }   from './invoice/brandingFooter'

export type { InvoiceViewModel }

/**
 * Generate a PDF buffer for the given invoice view model.
 * The active template is determined by ACTIVE_TEMPLATE_ID in registry.ts,
 * or optionally overridden by invoice.templateId.
 *
 * The "Powered by Daybee" branding footer is applied automatically after
 * every template renders. Set invoice.hideBranding = true to suppress it
 * (e.g. for premium or white-label tenants).
 */
export async function generateInvoicePdf(invoice: InvoiceViewModel): Promise<Buffer> {
  const template = getTemplate(invoice.templateId as never)
  const buffer   = await template.renderPdf(invoice)
  if (invoice.hideBranding) return buffer
  return applyBrandingFooter(buffer)
}
