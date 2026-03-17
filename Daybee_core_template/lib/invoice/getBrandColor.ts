// ─── Brand color extractor ────────────────────────────────────────────────────
// Extracts the dominant visible color from a base64 logo data-URL.
// Uses jimp (pure JavaScript) to decode PNG and JPEG images.
//
// Scoring: saturation² × count so vivid colors (orange, blue) beat grays.
// Falls back to BRAND_COLOR_FALLBACK when no logo is provided or extraction
// fails for any reason (unsupported format, parse error, grayscale logo with
// no recognizable neutral, etc.).
//
// Usage (async — safe in Server Components and API routes):
//   const brandColor = await getBrandColor(user.logoUrl)  // → '#F97316' | '#1F3A5F'
//
// To reuse in future templates:
//   import { getBrandColor } from '@/lib/invoice/getBrandColor'

import Jimp from 'jimp'

export const BRAND_COLOR_FALLBACK = '#1F3A5F'

// ─── Public ───────────────────────────────────────────────────────────────────

/**
 * Returns a CSS hex color string for the dominant brand color in the logo.
 * Returns BRAND_COLOR_FALLBACK when no logo is provided or extraction fails.
 */
export async function getBrandColor(logoUrl: string | null | undefined): Promise<string> {
  if (!logoUrl) return BRAND_COLOR_FALLBACK
  try {
    const match = logoUrl.match(/^data:image\/(png|jpeg|jpg|webp|gif|bmp);base64,(.+)$/)
    if (!match) return BRAND_COLOR_FALLBACK

    const b64 = match[2]
    const buf = Buffer.from(b64, 'base64')

    const img   = await Jimp.read(buf)
    const color = dominantColor(img)
    const hex   = color ? rgbToHex(color) : BRAND_COLOR_FALLBACK

    console.debug('[getBrandColor] extracted:', hex)
    return hex
  } catch (err) {
    console.debug('[getBrandColor] extraction failed:', err)
    return BRAND_COLOR_FALLBACK
  }
}

/**
 * Returns true if text on top of the given hex color should be dark (not white).
 * Uses perceived luminance (ITU-R BT.709) so the template can pick the right
 * text color regardless of how light or dark the brand color is.
 */
export function brandColorNeedsDarkText(hex: string): boolean {
  const h = hex.replace('#', '')
  const r = parseInt(h.substring(0, 2), 16)
  const g = parseInt(h.substring(2, 4), 16)
  const b = parseInt(h.substring(4, 6), 16)
  const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b
  return luminance > 160
}

// ─── HSL saturation ───────────────────────────────────────────────────────────

function hslSaturation(r: number, g: number, b: number): number {
  const rn = r / 255
  const gn = g / 255
  const bn = b / 255
  const max   = Math.max(rn, gn, bn)
  const min   = Math.min(rn, gn, bn)
  const delta = max - min
  if (delta === 0) return 0
  const l = (max + min) / 2
  return delta / (1 - Math.abs(2 * l - 1))
}

// ─── Most saturated frequent color ────────────────────────────────────────────
// 1. Skip transparent, near-white, near-black pixels.
// 2. Skip pixels with HSL saturation < MIN_SAT (filters all grays).
// 3. Score each bucket: saturation² × count.
//    Vivid colors always beat muted ones.
// 4. If no chromatic pixels found, fall back to most frequent neutral pixel.

const MIN_SAT = 0.20

type RGB = { r: number; g: number; b: number }

function dominantColor(img: Jimp): RGB | null {
  const width  = img.getWidth()
  const height = img.getHeight()
  const total  = width * height
  const step   = Math.max(1, Math.floor(total / 500))

  type Bucket = { count: number; r: number; g: number; b: number; sat: number }
  const chromatic = new Map<string, Bucket>()
  const neutral   = new Map<string, number>()

  for (let i = 0; i < total; i += step) {
    const x = i % width
    const y = Math.floor(i / width)

    const pixel = Jimp.intToRGBA(img.getPixelColor(x, y))
    const { r, g, b, a } = pixel

    if (a < 128) continue
    if (r > 230 && g > 230 && b > 230) continue  // near-white
    if (r < 30  && g < 30  && b < 30)  continue  // near-black

    const key = `${r >> 3},${g >> 3},${b >> 3}`
    const sat = hslSaturation(r, g, b)

    if (sat >= MIN_SAT) {
      const existing = chromatic.get(key)
      if (existing) {
        existing.count++
      } else {
        chromatic.set(key, { count: 1, r, g, b, sat })
      }
    } else {
      neutral.set(key, (neutral.get(key) ?? 0) + 1)
    }
  }

  // Primary: highest saturation² × count
  if (chromatic.size > 0) {
    let best: Bucket | null = null
    let bestScore = -1
    for (const bucket of Array.from(chromatic.values())) {
      const score = bucket.sat * bucket.sat * bucket.count
      if (score > bestScore) {
        bestScore = score
        best = bucket
      }
    }
    if (best) {
      const qr = best.r >> 3
      const qg = best.g >> 3
      const qb = best.b >> 3
      return {
        r: (qr << 3) | (qr >> 2),
        g: (qg << 3) | (qg >> 2),
        b: (qb << 3) | (qb >> 2),
      }
    }
  }

  // Fallback: grayscale logo — most frequent neutral pixel
  if (neutral.size > 0) {
    const top = Array.from(neutral.entries()).sort((a, b) => b[1] - a[1])[0]
    const [qr, qg, qb] = top[0].split(',').map(Number)
    return {
      r: (qr << 3) | (qr >> 2),
      g: (qg << 3) | (qg >> 2),
      b: (qb << 3) | (qb >> 2),
    }
  }

  return null
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function rgbToHex({ r, g, b }: RGB): string {
  return `#${hex2(r)}${hex2(g)}${hex2(b)}`
}

function hex2(n: number): string {
  return n.toString(16).padStart(2, '0')
}
