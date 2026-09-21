import type { SimId } from "../lib/types"

export function CoverArt({ id }: { id: SimId }) {
  if (id === "aether") {
    return (
      <svg viewBox="0 0 640 400" className="h-full w-full">
        <rect width="640" height="400" fill="#141820" />
        <rect x="0" y="260" width="640" height="140" fill="#0e1218" />
        <path d="M40 300 L160 220 L280 300 L400 180 L520 250 L640 160" fill="none" stroke="#c4a35a" strokeWidth="2" opacity="0.7" />
        <path d="M80 330 C140 250, 180 250, 240 310 S360 200, 460 280 600 210 640 240" fill="none" stroke="#2f9a8d" strokeWidth="1.5" opacity="0.7" />
        <ellipse cx="430" cy="210" rx="150" ry="36" fill="#1b2230" />
        <path d="M300 210 C340 170, 380 150, 430 148 C500 146, 560 175, 575 210 C540 195, 480 188, 430 192 C380 196, 330 205, 300 210Z" fill="#c4a35a" opacity="0.9" />
        <path d="M318 208 C350 188, 390 178, 430 178 C490 178, 540 196, 558 212 C520 200, 470 196, 430 198 C380 200, 340 206, 318 208Z" fill="#171d28" />
        <circle cx="96" cy="88" r="3" fill="#c4a35a" />
        <circle cx="118" cy="102" r="2" fill="#2f9a8d" />
        <circle cx="84" cy="112" r="1.5" fill="#e8e0d0" />
        <text x="40" y="56" fill="#c4a35a" fontFamily="IBM Plex Mono" fontSize="11">
          YR 0  ·  AETH
        </text>
      </svg>
    )
  }
  if (id === "harborline") {
    return (
      <svg viewBox="0 0 640 400" className="h-full w-full">
        <rect width="640" height="400" fill="#102027" />
        <rect x="0" y="240" width="640" height="160" fill="#0b3a44" />
        <path d="M0 250 Q160 230 320 255 T640 240 L640 400 L0 400Z" fill="#0e4a52" />
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <g key={i} transform={`translate(${80 + i * 90} 210)`}>
            <rect x="0" y="0" width="54" height="36" fill={i % 2 ? "#c45c26" : "#1f6f66"} />
            <rect x="8" y="-36" width="54" height="36" fill={i % 2 ? "#1f6f66" : "#c4a35a"} opacity="0.9" />
          </g>
        ))}
        <rect x="500" y="80" width="12" height="180" fill="#c4a35a" />
        <rect x="470" y="80" width="90" height="8" fill="#e0c37a" />
        <path d="M40 300 L200 300" stroke="#e0c37a" strokeWidth="6" />
        <text x="40" y="56" fill="#9ad4cc" fontFamily="IBM Plex Mono" fontSize="11">
          BERTH 4  ·  inbound
        </text>
      </svg>
    )
  }
  if (id === "northwind") {
    return (
      <svg viewBox="0 0 640 400" className="h-full w-full">
        <rect width="640" height="400" fill="#1a1714" />
        <rect x="70" y="70" width="220" height="260" fill="#2a241c" />
        <rect x="90" y="100" width="180" height="8" fill="#c4a35a" opacity="0.5" />
        <rect x="90" y="128" width="140" height="8" fill="#e8e0d0" opacity="0.25" />
        <rect x="90" y="156" width="160" height="8" fill="#e8e0d0" opacity="0.2" />
        <circle cx="430" cy="200" r="88" fill="none" stroke="#c4a35a" strokeWidth="2" />
        <circle cx="430" cy="200" r="54" fill="none" stroke="#c45c26" strokeWidth="1.5" opacity="0.7" />
        <circle cx="402" cy="176" r="7" fill="#c4a35a" />
        <circle cx="458" cy="210" r="7" fill="#2f9a8d" />
        <circle cx="424" cy="236" r="7" fill="#c45c26" />
        <text x="40" y="56" fill="#d9cfbb" fontFamily="IBM Plex Mono" fontSize="11">
          WK 1  ·  180 stores
        </text>
      </svg>
    )
  }
  return (
    <svg viewBox="0 0 640 400" className="h-full w-full">
      <rect width="640" height="400" fill="#16141f" />
      <line x1="80" y1="320" x2="560" y2="320" stroke="#2a3342" />
      <line x1="80" y1="80" x2="80" y2="320" stroke="#2a3342" />
      <circle cx="210" cy="210" r="16" fill="#c4a35a" />
      <circle cx="340" cy="150" r="16" fill="#2f9a8d" />
      <circle cx="460" cy="240" r="16" fill="#c45c26" />
      <circle cx="280" cy="260" r="10" fill="#6b8cae" />
      <text x="88" y="70" fill="#8b96a8" fontFamily="IBM Plex Mono" fontSize="11">
        performance →
      </text>
      <text x="40" y="56" fill="#c4a35a" fontFamily="IBM Plex Mono" fontSize="11">
        MAP  ·  4 segments
      </text>
    </svg>
  )
}

export function CoverCard({ id, className = "" }: { id: SimId; className?: string }) {
  return (
    <div className={`overflow-hidden rounded-[28px] border border-ink/10 bg-ink ${className}`}>
      <CoverArt id={id} />
    </div>
  )
}
