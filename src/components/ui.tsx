import type { ReactNode } from "react"

export function Button({
  children,
  onClick,
  href,
  variant = "brass",
  type = "button",
  disabled,
  className = "",
}: {
  children: ReactNode
  onClick?: () => void
  href?: string
  variant?: "brass" | "ink" | "ghost" | "paper" | "danger"
  type?: "button" | "submit"
  disabled?: boolean
  className?: string
}) {
  const styles: Record<string, string> = {
    brass: "bg-brass text-ink hover:bg-brass-2",
    ink: "bg-ink text-paper hover:bg-ink-2",
    ghost: "bg-transparent text-ink border border-ink/15 hover:border-ink/40",
    paper: "bg-paper text-ink hover:bg-paper-2",
    danger: "bg-signal text-paper hover:opacity-90",
  }
  const cls = `inline-flex items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition disabled:opacity-40 ${styles[variant]} ${className}`
  if (href) {
    return (
      <a href={href} className={cls}>
        {children}
      </a>
    )
  }
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={cls}>
      {children}
    </button>
  )
}

export function Field({
  label,
  hint,
  value,
  onChange,
  min,
  max,
  step = 1,
  suffix,
  prefix,
  theme = "dark",
}: {
  label: string
  hint?: string
  value: number
  onChange: (n: number) => void
  min: number
  max: number
  step?: number
  suffix?: string
  prefix?: string
  theme?: "dark" | "light"
}) {
  const labelClass = theme === "light" ? "text-ink/75" : "text-snow/80"
  const hintClass = theme === "light" ? "text-ink/50" : "text-mist"
  return (
    <label className="block">
      <div className="mb-1.5 flex items-baseline justify-between gap-3">
        <span className={`text-sm ${labelClass}`}>{label}</span>
        <span className={`font-mono text-sm ${theme === "light" ? "text-ink/80" : "text-brass-2"}`}>
          {prefix}
          {typeof value === "number" ? Number(value.toFixed(step < 1 ? 1 : 0)) : value}
          {suffix}
        </span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} />
      {hint ? <p className={`mt-1 text-xs ${hintClass}`}>{hint}</p> : null}
    </label>
  )
}

export function Kpi({
  label,
  value,
  hint,
  tone = "plain",
}: {
  label: string
  value: string
  hint?: string
  tone?: "plain" | "good" | "bad" | "brass"
}) {
  const color =
    tone === "good" ? "text-sea-2" : tone === "bad" ? "text-rose" : tone === "brass" ? "text-brass-2" : "text-snow"
  return (
    <div className="rounded-2xl border border-line bg-ink-2/70 px-4 py-3">
      <div className="text-[11px] uppercase tracking-[0.16em] text-mist">{label}</div>
      <div className={`mt-1 font-mono text-xl ${color}`}>{value}</div>
      {hint ? <div className="mt-1 text-xs text-mist">{hint}</div> : null}
    </div>
  )
}

export function Panel({ title, children, aside }: { title?: string; children: ReactNode; aside?: ReactNode }) {
  return (
    <section className="rounded-3xl border border-line bg-ink-2/80 p-5">
      {(title || aside) && (
        <div className="mb-4 flex items-center justify-between gap-3">
          {title ? <h3 className="font-display text-lg text-paper">{title}</h3> : <span />}
          {aside}
        </div>
      )}
      {children}
    </section>
  )
}

export function Pill({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-brass/40 bg-brass/10 px-2.5 py-0.5 text-[11px] uppercase tracking-[0.14em] text-brass-2">
      {children}
    </span>
  )
}
