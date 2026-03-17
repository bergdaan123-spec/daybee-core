// ─── Invoice template registry ───────────────────────────────────────────────
// To add a new client template:
//   1. Create lib/invoice/templates/<client_id>.ts exporting renderPdf()
//   2. Add an entry to TEMPLATES below
//   3. Add the id to InvoiceTemplateId
//   4. Set ACTIVE_TEMPLATE_ID (or later: read from identity.invoiceTemplate)

import { renderPdf as defaultRenderPdf }       from './templates/default'
import { renderPdf as bergVastgoedRenderPdf }   from './templates/berg_vastgoed'
import type { InvoiceViewModel }               from './types'

export type InvoiceTemplateId = 'default' | 'berg_vastgoed'

export type InvoiceTemplate = {
  id:        InvoiceTemplateId
  label:     string
  renderPdf: (vm: InvoiceViewModel) => Promise<Buffer>
}

const TEMPLATES: Record<InvoiceTemplateId, InvoiceTemplate> = {
  default: {
    id:        'default',
    label:     'Standaard',
    renderPdf: defaultRenderPdf,
  },
  berg_vastgoed: {
    id:        'berg_vastgoed',
    label:     'Berg Vastgoed',
    renderPdf: bergVastgoedRenderPdf,
  },
}

// ── Active template ───────────────────────────────────────────────────────────
// Change this constant to switch the global active template.
// Future: replace with identity.invoiceTemplate ?? user.invoiceTemplate ?? 'default'
export const ACTIVE_TEMPLATE_ID: InvoiceTemplateId = 'berg_vastgoed'

export function getTemplate(id: InvoiceTemplateId = ACTIVE_TEMPLATE_ID): InvoiceTemplate {
  return TEMPLATES[id] ?? TEMPLATES.default
}
