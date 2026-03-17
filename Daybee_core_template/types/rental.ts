import type { Identity, Tenant, Property, RentalContract, Invoice } from '@prisma/client'

// ─── Re-exports ───────────────────────────────────────────────────────────────
// Prisma generated types are the source of truth.
// Import from here to keep domain imports centralised.

export type { Identity, Tenant, Property, RentalContract, Invoice }
export { IdentityType, InvoiceStatus } from '@prisma/client'

// ─── Enriched / joined types ──────────────────────────────────────────────────
// Used when relations are loaded alongside the base model.

export type RentalContractWithRelations = RentalContract & {
  tenant: Tenant
  property: Property
  identity: Identity
}

export type InvoiceWithRelations = Invoice & {
  tenant: Tenant
  identity: Identity
  rentalContract: RentalContract & {
    property: Property
  }
}

// ─── Form / input types ───────────────────────────────────────────────────────
// Used for create / update API payloads — omit server-managed fields.

export type CreateIdentityInput = Omit<Identity, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
export type UpdateIdentityInput = Partial<CreateIdentityInput>

export type CreateTenantInput = Omit<Tenant, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
export type UpdateTenantInput = Partial<CreateTenantInput>

export type CreatePropertyInput = Omit<Property, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
export type UpdatePropertyInput = Partial<CreatePropertyInput>

export type CreateRentalContractInput = Omit<RentalContract, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
export type UpdateRentalContractInput = Partial<CreateRentalContractInput>

export type CreateInvoiceInput = Omit<Invoice, 'id' | 'userId' | 'invoiceNumber' | 'pdfUrl' | 'createdAt' | 'updatedAt'>
export type UpdateInvoiceInput = Partial<Pick<Invoice, 'status' | 'dueDate' | 'description' | 'pdfUrl'>>
