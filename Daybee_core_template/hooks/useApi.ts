'use client'

import { useState, useEffect, useCallback } from 'react'

// ─── Data fetching hook ───────────────────────────────────────────────────────

/**
 * useFetch — lightweight hook for loading data from an API route.
 *
 * Usage (in a client component):
 *   const { data, loading, error, refetch } = useFetch<Entity[]>('/api/entities')
 *
 * On 401, the user is redirected to /login automatically.
 */
export function useFetch<T>(url: string) {
  const [data, setData]       = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(url)
      if (res.status === 401) { window.location.href = '/login'; return }
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? 'Request failed')
      setData(json as T)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }, [url])

  useEffect(() => { load() }, [load])

  return { data, loading, error, refetch: load }
}

// ─── Mutation helper ──────────────────────────────────────────────────────────

/**
 * apiFetch — thin wrapper around fetch for POST / PATCH / DELETE calls.
 *
 * Always sends JSON. Always parses the response as JSON.
 * Returns { data, error } — never throws.
 *
 * Usage (in an event handler):
 *   const { data, error } = await apiFetch('/api/entities', {
 *     method: 'POST',
 *     body: JSON.stringify({ name: 'New entity' }),
 *   })
 *   if (error) setError(error)
 *   else setItems((prev) => [...prev, data])
 */
export async function apiFetch<T = unknown>(
  url: string,
  options?: RequestInit,
): Promise<{ data: T | null; error: string | null }> {
  try {
    const res = await fetch(url, {
      headers: { 'Content-Type': 'application/json' },
      ...options,
    })
    const json = await res.json()
    if (!res.ok) return { data: null, error: json.error ?? 'Request failed' }
    return { data: json as T, error: null }
  } catch (e) {
    return { data: null, error: e instanceof Error ? e.message : 'Network error' }
  }
}
