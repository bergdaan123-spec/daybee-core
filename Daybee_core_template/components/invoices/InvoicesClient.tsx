'use client'

import React, { useState } from 'react'
import { useFetch, apiFetch } from '@/hooks/useApi'
import Modal from '@/components/ui/Modal'
import Card from '@/components/ui/Card'
import PageShell from '@/components/layout/PageShell'
import InvoiceTable from './InvoiceTable'
import InvoiceForm, {
  type InvoiceFormValues,
  type InvoiceChargeFormLine,
  type ContractOption,
  type SelectOption,
  type IdentityOption,
} from './InvoiceForm'
import { primaryButtonStyle, errorBoxStyle } from '@/styles/shared'
import { Plus } from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────

// Shape returned by the API — Decimal → string, DateTime → ISO string
export type InvoiceRow = {
  id:               string
  invoiceNumber:    string
  rentalContractId: string
  tenantId:         string
  identityId:       string
  issueDate:        string
  dueDate:          string
  amount:           string   // Prisma Decimal serialised as string (base amount)
  vatRate:          string | null
  status:           string
  description:      string | null
  pdfUrl:           string | null
  createdAt:        string
  updatedAt:        string
  tenant:           { name: string }
  identity:         { name: string; type: string }
  rentalContract:   { property: { name: string } }
  charges:          { id: string; label: string; reference: string | null; amount: string; sortOrder: number }[]
}

type Props = {
  contracts:  ContractOption[]
  tenants:    SelectOption[]
  identities: IdentityOption[]
}

type ModalMode = 'create' | 'edit' | 'delete' | null

// ─── Helpers ──────────────────────────────────────────────────────────────────

function toDateInput(isoString: string | null | undefined): string {
  if (!isoString) return ''
  return new Date(isoString).toISOString().split('T')[0]
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function InvoicesClient({ contracts, tenants, identities }: Props) {
  const { data: invoices, loading, error: fetchError, refetch } =
    useFetch<InvoiceRow[]>('/api/invoices')

  const [mode, setMode]           = useState<ModalMode>(null)
  const [selected, setSelected]   = useState<InvoiceRow | null>(null)
  const [saving, setSaving]       = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  function openCreate()              { setSelected(null); setFormError(null); setMode('create') }
  function openEdit(i: InvoiceRow)   { setSelected(i);    setFormError(null); setMode('edit')   }
  function openDelete(i: InvoiceRow) { setSelected(i);    setFormError(null); setMode('delete') }
  function closeModal()              { setMode(null); setSelected(null); setFormError(null) }

  async function handleCreate(values: InvoiceFormValues) {
    setSaving(true); setFormError(null)
    const { error } = await apiFetch('/api/invoices', {
      method: 'POST', body: JSON.stringify(values),
    })
    setSaving(false)
    if (error) { setFormError(error); return }
    closeModal(); refetch()
  }

  async function handleEdit(values: InvoiceFormValues) {
    if (!selected) return
    setSaving(true); setFormError(null)
    const { error } = await apiFetch(`/api/invoices/${selected.id}`, {
      method: 'PUT', body: JSON.stringify(values),
    })
    setSaving(false)
    if (error) { setFormError(error); return }
    closeModal(); refetch()
  }

  async function handleDelete() {
    if (!selected) return
    setSaving(true); setFormError(null)
    const { error } = await apiFetch(`/api/invoices/${selected.id}`, { method: 'DELETE' })
    setSaving(false)
    if (error) { setFormError(error); return }
    closeModal(); refetch()
  }

  // Map the selected InvoiceRow back to form values for the edit modal
  const initialValues: Partial<InvoiceFormValues> | undefined = selected
    ? {
        rentalContractId: selected.rentalContractId,
        tenantId:         selected.tenantId,
        identityId:       selected.identityId,
        invoiceNumber:    selected.invoiceNumber,
        issueDate:        toDateInput(selected.issueDate),
        dueDate:          toDateInput(selected.dueDate),
        amount:           parseFloat(selected.amount).toFixed(2),
        vatRate:          selected.vatRate ? String(parseFloat(selected.vatRate)) : '',
        charges:          (selected.charges ?? [])
                            .sort((a, b) => a.sortOrder - b.sortOrder)
                            .map((c): InvoiceChargeFormLine => ({
                              label:     c.label,
                              reference: c.reference ?? '',
                              amount:    parseFloat(c.amount).toFixed(2),
                            })),
        status:           selected.status,
        description:      selected.description ?? '',
      }
    : undefined

  return (
    <>
      <PageShell
        title="Facturen"
        description="Maak huurfacturen aan op basis van uw huurcontracten en beheer ze."
        action={
          <button
            onClick={openCreate}
            style={{ ...primaryButtonStyle, display: 'flex', alignItems: 'center', gap: '7px' }}
          >
            <Plus size={15} strokeWidth={2.5} /> Nieuwe factuur
          </button>
        }
      >
        {/* Warning when no contracts exist */}
        {!loading && contracts.length === 0 && (
          <div style={{ marginBottom: '16px', padding: '12px 16px', backgroundColor: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: '8px', fontSize: '13px', color: '#92400E' }}>
            Geen huurcontracten gevonden. Maak eerst een contract aan voordat u facturen aanmaakt.
          </div>
        )}

        <Card padding="sm">
          {loading && (
            <p style={{ textAlign: 'center', padding: '40px 0', color: '#9CA3AF', fontSize: '14px' }}>
              Laden…
            </p>
          )}
          {fetchError && <div style={errorBoxStyle}>{fetchError}</div>}
          {!loading && !fetchError && (
            <InvoiceTable
              invoices={invoices ?? []}
              onEdit={openEdit}
              onDelete={openDelete}
            />
          )}
        </Card>
      </PageShell>

      {/* Create */}
      <Modal open={mode === 'create'} title="Nieuwe factuur" onClose={closeModal} maxWidth={600}>
        <InvoiceForm
          contracts={contracts}
          tenants={tenants}
          identities={identities}
          initial={{}}
          onSubmit={handleCreate}
          onCancel={closeModal}
          loading={saving}
          error={formError}
          submitLabel="Factuur aanmaken"
        />
      </Modal>

      {/* Edit */}
      <Modal open={mode === 'edit'} title="Factuur bewerken" onClose={closeModal} maxWidth={600}>
        <InvoiceForm
          contracts={contracts}
          tenants={tenants}
          identities={identities}
          initial={initialValues}
          onSubmit={handleEdit}
          onCancel={closeModal}
          loading={saving}
          error={formError}
          submitLabel="Wijzigingen opslaan"
        />
      </Modal>

      {/* Delete confirmation */}
      <Modal open={mode === 'delete'} title="Factuur verwijderen" onClose={closeModal} maxWidth={420}>
        <p style={{ fontSize: '14px', color: '#374151', marginBottom: '6px' }}>
          Weet u zeker dat u factuur{' '}
          <strong>{selected?.invoiceNumber}</strong> wilt verwijderen?
        </p>
        <p style={{ fontSize: '13px', color: '#9CA3AF', marginBottom: '24px' }}>
          Deze actie kan niet ongedaan worden gemaakt.
        </p>
        {formError && <div style={{ ...errorBoxStyle, marginBottom: '16px' }}>{formError}</div>}
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
          <button
            onClick={closeModal}
            style={{ padding: '10px 20px', borderRadius: '6px', fontSize: '14px', background: 'none', border: '1px solid #E5E7EB', color: '#374151', cursor: 'pointer' }}
          >
            Annuleren
          </button>
          <button
            onClick={handleDelete}
            disabled={saving}
            style={{ padding: '10px 20px', borderRadius: '6px', fontSize: '14px', fontWeight: 600, border: 'none', backgroundColor: '#DC2626', color: '#FFFFFF', cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.6 : 1 }}
          >
            {saving ? 'Verwijderen…' : 'Verwijderen'}
          </button>
        </div>
      </Modal>
    </>
  )
}
