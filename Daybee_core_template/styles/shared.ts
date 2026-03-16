/**
 * Shared inline style objects.
 *
 * Import these instead of repeating style literals across pages and components.
 * Where possible, values reference CSS custom properties defined in globals.css
 * so that re-theming only requires updating :root variables — not these objects.
 */
import type React from 'react'

// ─── Form controls ────────────────────────────────────────────────────────────

export const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '11px 14px',
  border: '1px solid var(--color-border)',
  borderRadius: 'var(--radius-sm)',
  fontSize: '14px',
  color: 'var(--color-text-primary)',
  backgroundColor: 'var(--color-surface)',
  outline: 'none',
}

export const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '13px',
  fontWeight: 500,
  color: '#374151',
  marginBottom: '6px',
}

// ─── Buttons ──────────────────────────────────────────────────────────────────

export const primaryButtonStyle: React.CSSProperties = {
  padding: '11px 28px',
  backgroundColor: 'var(--color-text-primary)',
  color: 'var(--color-surface)',
  border: 'none',
  borderRadius: 'var(--radius-sm)',
  fontSize: '14px',
  fontWeight: 600,
  cursor: 'pointer',
  transition: 'background-color 0.15s ease',
}

export const disabledButtonStyle: React.CSSProperties = {
  ...primaryButtonStyle,
  backgroundColor: 'var(--color-text-muted)',
  cursor: 'not-allowed',
}

// ─── Feedback ─────────────────────────────────────────────────────────────────

export const errorBoxStyle: React.CSSProperties = {
  marginBottom: '20px',
  padding: '12px 14px',
  backgroundColor: '#FEF2F2',
  border: '1px solid #FECACA',
  borderRadius: 'var(--radius-sm)',
  fontSize: '13px',
  color: '#B91C1C',
}

// ─── Typography ───────────────────────────────────────────────────────────────

export const sectionTitleStyle: React.CSSProperties = {
  fontSize: '11px',
  fontWeight: 600,
  color: 'var(--color-text-muted)',
  textTransform: 'uppercase',
  letterSpacing: '0.6px',
  marginBottom: '16px',
}

// ─── Focus/blur helpers ───────────────────────────────────────────────────────

export function onFocusBorder(e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) {
  e.target.style.borderColor = 'var(--color-text-muted)'
}

export function onBlurBorder(e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) {
  e.target.style.borderColor = 'var(--color-border)'
}
