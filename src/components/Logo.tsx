import logoImage from "../assets/logo.png"

export function Logo({ className = "h-8", light = false }: { className?: string; light?: boolean }) {
  const ink = light ? "#f3eee4" : "#10141c"
  return (
    <span className={`inline-flex items-baseline gap-2 ${className}`}>
      <img src={logoImage} alt="" className="h-[1.15em] w-[1.15em] rounded-[0.28em] object-cover" aria-hidden />
      <span className="font-display text-[1.05em] font-semibold tracking-tight" style={{ color: light ? "#f3eee4" : ink }}>
        Praxium
      </span>
    </span>
  )
}
