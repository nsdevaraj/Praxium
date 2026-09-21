export function money(n: number, digits = 0): string {
  const abs = Math.abs(n)
  const sign = n < 0 ? "−" : ""
  if (abs >= 1_000_000_000) return `${sign}$${(abs / 1_000_000_000).toFixed(1)}B`
  if (abs >= 1_000_000) return `${sign}$${(abs / 1_000_000).toFixed(1)}M`
  if (abs >= 10_000) return `${sign}$${(abs / 1_000).toFixed(0)}k`
  return `${sign}$${abs.toLocaleString(undefined, { maximumFractionDigits: digits })}`
}

export function pct(n: number, digits = 1): string {
  return `${(n * 100).toFixed(digits)}%`
}

export function num(n: number, digits = 0): string {
  return n.toLocaleString(undefined, { maximumFractionDigits: digits })
}

export function signed(n: number, digits = 0): string {
  const body = money(Math.abs(n), digits)
  if (n > 0) return `+${body}`
  if (n < 0) return `−${body.slice(1)}`
  return body
}

export function uid(prefix = "id"): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 8)}${Date.now().toString(36).slice(-3)}`
}

export function sessionCode(): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
  let s = ""
  for (let i = 0; i < 4; i++) s += alphabet[Math.floor(Math.random() * alphabet.length)]
  return `PX-${s}`
}

export function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n))
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t
}

export function mulberry32(seed: number): () => number {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
