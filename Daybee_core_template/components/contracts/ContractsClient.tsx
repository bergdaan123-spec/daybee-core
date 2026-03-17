'use client'

import React, { useState } from 'react'
import { useFetch, apiFetch } from '@/hooks/useApi'
import Modal from '@/components/ui/Modal'
import Card from '@/components/ui/Card'
import PageShell from '@/components/layout/PageShell'
import ContractTable from './ContractTable'
import ContractForm, { type ContractFormValues, type SelectOption, type IdentityOption } from './ContractForm'
import { primaryButtonStyle, errorBoxStyle } from '@/styles/shared'
import { Plus } from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────

// Shape returned by the API (Decimal serialises to string, Date to ISO string)
export type ContractRow = {
  id:                string
  tenantId:          string
  propertyId:        string
  identityId:        string
  monthlyRent:       string   // Prisma Decimal → JSON string
  paymentDayOfMonth: number
  startDate:         string   // ISO date string
  endDate:           string | null
  active:            boolean
  createdAt:         string
  updatedAt:         string
  tenant:            { name: string }
  property:          { name: string }
  identity:          { name: string; type: string }
}

type Props = {
  tenants:    SelectOption[]
  properties: SelectOption[]
  identities: IdentityOption[]
}

type ModalMode = 'create' | 'edit' | 'delete' | null

// ─── Date helper ──────────────────────────────────────────────────────────────

function toDateInput(isoString: string | null | undefined): string {
  if (!isoString) return ''
  return new Date(isoString).toISOString().split('T')[0]
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ContractsClient({ tenants, properties, identities }: Props) {
  const { data: contracts, loading, error: fetchError, refetch } =
    useFetch<ContractRow[]>('/api/contracts')

  const [mode, setMode]           = useState<ModalMode>(null)
  const [selected, setSelected]   = useState<ContractRow | null>(null)
  const [saving, setSaving]       = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  function openCreate()              { setSelected(null); setFormError(null); setMode('create') }
  function openEdit(c: ContractRow)  { setSelected(c);    setFormError(null); setMode('edit')   }
  function openDelete(c: ContractRow){ setSelected(c);    setFormError(null); setMode('delete') }
  function closeModal()              { setMode(null); setSelected(null); setFormError(null) }

  async function handleCreate(values: ContractFormValues) {
    setSaving(true); setFormError(null)
    const { error } = await apiFetch('/api/contracts', {
      method: 'POST', body: JSON.stringify(values),
    })
    setSaving(false)
    if (error) { setFormError(error); return }
    closeModal(); refetch()
  }

  async function handleEdit(values: ContractFormValues) {
    if (!selected) return
    setSaving(true); setFormError(null)
    const { error } = await apiFetch(`/api/contracts/${selected.id}`, {
      method: 'PUT', body: JSON.stringify(values),
    })
    setSaving(false)
    if (error) { setFormError(error); return }
    closeModal(); refetch()
  }

  async function handleDelete() {
    if (!selected) return
    setSaving(true); setFormError(null)
    const { error } = await apiFetch(`/api/contracts/${selected.id}`, { method: 'DELETE' })
    setSaving(false)
    if (error) { setFormError(error); return }
    closeModal(); refetch()
  }

  const initialValues: Partial<ContractFormValues> | undefined = selected
    ? {
        tenantId:          selected.tenantId,
        propertyId:        selected.propertyId,
        identityId:        selected.identityId,
        monthlyRent:       parseFloat(selected.monthlyRent).toFixed(2),
        paymentDayOfMonth: String(selected.paymentDayOfMonth),
        startDate:         toDateInput(selected.startDate),
        endDate:           toDateInput(selected.endDate),
        active:            selected.active,
      }
    : undefined

  // Human-readable summary for the delete confirmation
  const deleteLabel = selected
    ? `${selected.tenant.name} — ${selected.property.name}`
    : ''

  return (
    <>
      <PageShell
        title="Contracten"
        description="Beheer huurovereenkomsten tussen huurders, panden en afzenderidentiteiten."
        action={
          <button
            onClick={openCreate}
            style={{ ...primaryButtonStyle, display: 'flex', alignItems: 'center', gap: '7px' }}
          >
            <Plus size={15} strokeWidth={2.5} /> Contract toevoegen
          </button>
        }
      >
        {/* Empty-state hint when reference data is missing */}
        {!loading && (tenants.length === 0 || properties.length === 0 || identities.length === 0) && (
          <div style={{ marginBottom: '16px', padding: '12px 16px', backgroundColor: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: '8px', fontSize: '13px', color: '#92400E' }}>
            Voeg eerst minimaal één{' '}
            {tenants.length === 0 && <strong>huurder</strong>}
            {tenants.length === 0 && (properties.length === 0 || identities.length === 0) && ', '}
            {properties.length === 0 && <strong>pand</strong>}
            {properties.length === 0 && identities.length === 0 && ', '}
            {identities.length === 0 && <strong>identiteit</strong>}
            {' '}toe voordat u een contract aanmaakt.
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
            <ContractTable
              contracts={contracts ?? []}
              onEdit={openEdit}
              onDelete={openDelete}
            />
          )}
        </Card>
      </PageShell>

      {/* Create */}
      <Modal open={mode === 'create'} title="Contract toevoegen" onClose={closeModal} maxWidth={580}>
        <ContractForm
          tenants={tenants}
          properties={properties}
          identities={identities}
          onSubmit={handleCreate}
          onCancel={closeModal}
          loading={saving}
          error={formError}
          submitLabel="Contract aanmaken"
        />
      </Modal>

      {/* Edit */}
      <Modal open={mode === 'edit'} title="Contract bewerken" onClose={closeModal} maxWidth={580}>
        <ContractForm
          tenants={tenants}
          properties={properties}
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
      <Modal open={mode === 'delete'} title="Contract verwijderen" onClose={closeModal} maxWidth={420}>
        <p style={{ fontSize: '14px', color: '#374151', marginBottom: '6px' }}>
          Weet u zeker dat u het contract voor{' '}
          <strong>{deleteLabel}</strong> wilt verwijderen?
        </p>
        <p style={{ fontSize: '13px', color: '#9CA3AF', marginBottom: '24px' }}>
          Deze actie kan niet ongedaan worden gemaakt. Contracten met gekoppelde facturen kunnen niet worden verwijderd.
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
