'use client'

import React, { useState } from 'react'
import type { Tenant } from '@prisma/client'
import { useFetch, apiFetch } from '@/hooks/useApi'
import Modal from '@/components/ui/Modal'
import Card from '@/components/ui/Card'
import PageShell from '@/components/layout/PageShell'
import TenantTable from './TenantTable'
import TenantForm, { type TenantFormValues } from './TenantForm'
import { primaryButtonStyle, errorBoxStyle } from '@/styles/shared'
import { Plus } from 'lucide-react'

type ModalMode = 'create' | 'edit' | 'delete' | null

export default function TenantsClient() {
  const { data: tenants, loading, error: fetchError, refetch } =
    useFetch<Tenant[]>('/api/tenants')

  const [mode, setMode]           = useState<ModalMode>(null)
  const [selected, setSelected]   = useState<Tenant | null>(null)
  const [saving, setSaving]       = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  function openCreate()            { setSelected(null); setFormError(null); setMode('create') }
  function openEdit(t: Tenant)     { setSelected(t);    setFormError(null); setMode('edit')   }
  function openDelete(t: Tenant)   { setSelected(t);    setFormError(null); setMode('delete') }
  function closeModal()            { setMode(null); setSelected(null); setFormError(null) }

  async function handleCreate(values: TenantFormValues) {
    setSaving(true); setFormError(null)
    const { error } = await apiFetch('/api/tenants', {
      method: 'POST', body: JSON.stringify(values),
    })
    setSaving(false)
    if (error) { setFormError(error); return }
    closeModal(); refetch()
  }

  async function handleEdit(values: TenantFormValues) {
    if (!selected) return
    setSaving(true); setFormError(null)
    const { error } = await apiFetch(`/api/tenants/${selected.id}`, {
      method: 'PUT', body: JSON.stringify(values),
    })
    setSaving(false)
    if (error) { setFormError(error); return }
    closeModal(); refetch()
  }

  async function handleDelete() {
    if (!selected) return
    setSaving(true); setFormError(null)
    const { error } = await apiFetch(`/api/tenants/${selected.id}`, { method: 'DELETE' })
    setSaving(false)
    if (error) { setFormError(error); return }
    closeModal(); refetch()
  }

  const initialValues: Partial<TenantFormValues> | undefined = selected
    ? {
        name:          selected.name,
        email:         selected.email,
        phone:         selected.phone         ?? '',
        address:       selected.address,
        postalCode:    selected.postalCode,
        city:          selected.city,
        country:       selected.country,
        companyName:   selected.companyName   ?? '',
        contactPerson: selected.contactPerson ?? '',
        kvkNumber:     selected.kvkNumber     ?? '',
        btwNumber:     selected.btwNumber     ?? '',
      }
    : undefined

  return (
    <>
      <PageShell
        title="Huurders"
        description="Beheer uw huurders — de ontvangers van uw huurfacturen."
        action={
          <button
            onClick={openCreate}
            style={{ ...primaryButtonStyle, display: 'flex', alignItems: 'center', gap: '7px' }}
          >
            <Plus size={15} strokeWidth={2.5} /> Huurder toevoegen
          </button>
        }
      >
        <Card padding="sm">
          {loading && (
            <p style={{ textAlign: 'center', padding: '40px 0', color: '#9CA3AF', fontSize: '14px' }}>
              Laden…
            </p>
          )}
          {fetchError && <div style={errorBoxStyle}>{fetchError}</div>}
          {!loading && !fetchError && (
            <TenantTable
              tenants={tenants ?? []}
              onEdit={openEdit}
              onDelete={openDelete}
            />
          )}
        </Card>
      </PageShell>

      {/* Create */}
      <Modal open={mode === 'create'} title="Huurder toevoegen" onClose={closeModal} maxWidth={520}>
        <TenantForm
          onSubmit={handleCreate}
          onCancel={closeModal}
          loading={saving}
          error={formError}
          submitLabel="Huurder aanmaken"
        />
      </Modal>

      {/* Edit */}
      <Modal open={mode === 'edit'} title="Huurder bewerken" onClose={closeModal} maxWidth={520}>
        <TenantForm
          initial={initialValues}
          onSubmit={handleEdit}
          onCancel={closeModal}
          loading={saving}
          error={formError}
          submitLabel="Wijzigingen opslaan"
        />
      </Modal>

      {/* Delete confirmation */}
      <Modal open={mode === 'delete'} title="Huurder verwijderen" onClose={closeModal} maxWidth={420}>
        <p style={{ fontSize: '14px', color: '#374151', marginBottom: '6px' }}>
          Weet u zeker dat u <strong>{selected?.name}</strong> wilt verwijderen?
        </p>
        <p style={{ fontSize: '13px', color: '#9CA3AF', marginBottom: '24px' }}>
          Deze actie kan niet ongedaan worden gemaakt. Huurders die zijn gekoppeld aan actieve contracten of facturen kunnen niet worden verwijderd.
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
