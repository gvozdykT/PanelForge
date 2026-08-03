import type { SVGProps } from 'react'

type IconProps = SVGProps<SVGSVGElement> & { size?: number }

const defaults = (size: number, props: IconProps) => ({
  width: size,
  height: size,
  viewBox: '0 0 48 80',
  fill: 'none',
  xmlns: 'http://www.w3.org/2000/svg',
  ...props,
})

export function IconMcb({ size = 48, ...props }: IconProps) {
  return (
    <svg {...defaults(size, props)}>
      <rect x="2" y="2" width="44" height="76" rx="2" fill="#f5f5f0" stroke="#ccc" strokeWidth="1" />
      <rect x="6" y="8" width="12" height="6" rx="1" fill="#c0392b" />
      <text x="24" y="13" textAnchor="middle" fontSize="5" fill="#c0392b" fontWeight="bold">ABB</text>
      <rect x="18" y="28" width="12" height="20" rx="2" fill="#333" />
      <rect x="20" y="30" width="8" height="8" rx="1" fill="#222" />
      <rect x="16" y="52" width="16" height="4" rx="1" fill="#27ae60" />
      <text x="24" y="68" textAnchor="middle" fontSize="7" fill="#333" fontWeight="bold">C25A</text>
      <circle cx="24" cy="6" r="2" fill="#888" />
      <circle cx="24" cy="74" r="2" fill="#888" />
    </svg>
  )
}

export function IconRcd({ size = 48, ...props }: IconProps) {
  return (
    <svg {...defaults(size, props)}>
      <rect x="2" y="2" width="44" height="76" rx="2" fill="#eef6ff" stroke="#4a90d9" strokeWidth="1" />
      <text x="24" y="18" textAnchor="middle" fontSize="6" fill="#2563eb" fontWeight="bold">ПЗВ</text>
      <rect x="14" y="28" width="20" height="18" rx="2" fill="#333" />
      <text x="24" y="40" textAnchor="middle" fontSize="5" fill="#fff">30mA</text>
      <rect x="10" y="54" width="28" height="3" rx="1" fill="#0066CC" />
      <rect x="10" y="60" width="28" height="3" rx="1" fill="#8B4513" />
    </svg>
  )
}

export function IconRcbo({ size = 48, ...props }: IconProps) {
  return (
    <svg {...defaults(size, props)}>
      <rect x="2" y="2" width="44" height="76" rx="2" fill="#f0f8f0" stroke="#27ae60" strokeWidth="1" />
      <text x="24" y="16" textAnchor="middle" fontSize="6" fill="#27ae60" fontWeight="bold">АВДТ</text>
      <rect x="16" y="24" width="16" height="14" rx="2" fill="#333" />
      <text x="24" y="58" textAnchor="middle" fontSize="5" fill="#333">C16 30mA</text>
    </svg>
  )
}

export function IconDistribution({ size = 48, ...props }: IconProps) {
  return (
    <svg {...defaults(size, props)}>
      <rect x="2" y="2" width="44" height="76" rx="2" fill="#555" stroke="#333" strokeWidth="1" />
      <text x="24" y="14" textAnchor="middle" fontSize="5" fill="#ccc">EKF</text>
      <text x="24" y="22" textAnchor="middle" fontSize="4" fill="#aaa">KPB-125</text>
      <circle cx="24" cy="32" r="5" fill="#888" stroke="#666" />
      {[38, 46, 54, 62, 68, 74].map((y, i) => (
        <circle key={i} cx={12 + (i % 2) * 24} cy={y} r="3" fill="#777" stroke="#555" />
      ))}
    </svg>
  )
}

export function IconMeter({ size = 48, ...props }: IconProps) {
  return (
    <svg {...defaults(size, props)}>
      <rect x="2" y="2" width="44" height="76" rx="2" fill="#fafafa" stroke="#bbb" strokeWidth="1" />
      <rect x="4" y="6" width="8" height="4" fill="#FFD700" stroke="#00AA44" strokeWidth="0.5" />
      <rect x="14" y="6" width="8" height="4" fill="#0066CC" />
      <rect x="24" y="6" width="8" height="4" fill="#8B4513" />
      <text x="24" y="22" textAnchor="middle" fontSize="4" fill="#333">WB-MAP6S</text>
      <rect x="8" y="28" width="32" height="20" rx="1" fill="#eee" stroke="#ccc" />
      <text x="24" y="38" textAnchor="middle" fontSize="3" fill="#666">Modbus</text>
      <rect x="6" y="58" width="36" height="6" rx="1" fill="#27ae60" opacity="0.7" />
      <text x="24" y="63" textAnchor="middle" fontSize="3" fill="#fff">RS-485</text>
    </svg>
  )
}

export function IconSpd({ size = 48, ...props }: IconProps) {
  return (
    <svg {...defaults(size, props)}>
      <rect x="2" y="2" width="44" height="76" rx="2" fill="#fff8e1" stroke="#f59e0b" strokeWidth="1" />
      <path d="M24 12 L18 28 L22 28 L20 42 L30 24 L25 24 Z" fill="#f59e0b" />
      <text x="24" y="58" textAnchor="middle" fontSize="5" fill="#333">ПЗІП</text>
    </svg>
  )
}

export function IconContactor({ size = 48, ...props }: IconProps) {
  return (
    <svg {...defaults(size, props)}>
      <rect x="2" y="2" width="44" height="76" rx="2" fill="#f0f0f0" stroke="#999" strokeWidth="1" />
      <rect x="10" y="20" width="28" height="30" rx="2" fill="#444" />
      <text x="24" y="38" textAnchor="middle" fontSize="5" fill="#fff">KM</text>
      <circle cx="16" cy="60" r="3" fill="#0066CC" />
      <circle cx="32" cy="60" r="3" fill="#8B4513" />
    </svg>
  )
}

export function IconRelay({ size = 48, ...props }: IconProps) {
  return (
    <svg {...defaults(size, props)}>
      <rect x="2" y="2" width="44" height="76" rx="2" fill="#f5f5f5" stroke="#aaa" strokeWidth="1" />
      <circle cx="24" cy="32" r="12" fill="none" stroke="#666" strokeWidth="2" />
      <line x1="24" y1="20" x2="24" y2="44" stroke="#666" strokeWidth="2" />
      <text x="24" y="60" textAnchor="middle" fontSize="5" fill="#666">R</text>
    </svg>
  )
}

export function IconSwitch({ size = 48, ...props }: IconProps) {
  return (
    <svg {...defaults(size, props)}>
      <rect x="2" y="2" width="44" height="76" rx="2" fill="#eee" stroke="#888" strokeWidth="1" />
      <circle cx="16" cy="36" r="6" fill="none" stroke="#333" strokeWidth="2" />
      <circle cx="32" cy="36" r="6" fill="none" stroke="#333" strokeWidth="2" />
      <line x1="16" y1="36" x2="32" y2="28" stroke="#333" strokeWidth="2" />
      <text x="24" y="58" textAnchor="middle" fontSize="5" fill="#333">1-0-2</text>
    </svg>
  )
}

export function IconAfdd({ size = 48, ...props }: IconProps) {
  return (
    <svg {...defaults(size, props)}>
      <rect x="2" y="2" width="44" height="76" rx="2" fill="#fff0f0" stroke="#e74c3c" strokeWidth="1" />
      <path d="M16 20 Q24 10 32 20 Q24 30 16 20" fill="none" stroke="#e74c3c" strokeWidth="2" />
      <text x="24" y="50" textAnchor="middle" fontSize="5" fill="#e74c3c">AFDD</text>
    </svg>
  )
}

export function IconTerminal({ size = 48, ...props }: IconProps) {
  return (
    <svg {...defaults(size, props)}>
      <rect x="2" y="2" width="44" height="76" rx="2" fill="#ddd" stroke="#999" strokeWidth="1" />
      {[14, 24, 34, 44, 54].map((y, i) => (
        <rect key={i} x="10" y={y} width="28" height="4" rx="1" fill="#888" />
      ))}
    </svg>
  )
}

export function IconBusbar({ size = 48, ...props }: IconProps) {
  return (
    <svg {...defaults(size, props)}>
      <rect x="2" y="30" width="44" height="20" rx="2" fill="#0066CC" opacity="0.8" />
      {[8, 16, 24, 32, 40].map((x, i) => (
        <rect key={i} x={x} y="26" width="4" height="28" rx="1" fill="#888" />
      ))}
      <text x="24" y="44" textAnchor="middle" fontSize="5" fill="#fff">N/PE</text>
    </svg>
  )
}

function iconBox(size: number, props: IconProps, fill: string, stroke: string, label: string) {
  return (
    <svg {...defaults(size, props)}>
      <rect x="2" y="2" width="44" height="76" rx="2" fill={fill} stroke={stroke} strokeWidth="1" />
      <text x="24" y="44" textAnchor="middle" fontSize="6" fill="#333" fontWeight="bold">
        {label}
      </text>
    </svg>
  )
}

export function IconFuse({ size = 48, ...props }: IconProps) {
  return iconBox(size, props, '#fff8e1', '#f59e0b', 'FUSE')
}

export function IconIsolator({ size = 48, ...props }: IconProps) {
  return iconBox(size, props, '#f1f5f9', '#64748b', 'QS')
}

export function IconAts({ size = 48, ...props }: IconProps) {
  return iconBox(size, props, '#fef3c7', '#d97706', 'ATS')
}

export function IconRelayVoltage({ size = 48, ...props }: IconProps) {
  return (
    <svg {...defaults(size, props)}>
      <rect x="2" y="2" width="44" height="76" rx="2" fill="#eff6ff" stroke="#3b82f6" strokeWidth="1" />
      <text x="24" y="20" textAnchor="middle" fontSize="5" fill="#2563eb" fontWeight="bold">RV</text>
      <text x="24" y="40" textAnchor="middle" fontSize="8" fill="#333">V</text>
      <text x="24" y="58" textAnchor="middle" fontSize="4" fill="#666">170-270V</text>
    </svg>
  )
}

export function IconIndicator({ size = 48, ...props }: IconProps) {
  return (
    <svg {...defaults(size, props)}>
      <rect x="2" y="2" width="44" height="76" rx="2" fill="#1e293b" stroke="#64748b" strokeWidth="1" />
      <circle cx="24" cy="40" r="10" fill="#22c55e" opacity="0.9" />
    </svg>
  )
}

export function IconPsu({ size = 48, ...props }: IconProps) {
  return iconBox(size, props, '#ecfdf5', '#10b981', 'PSU')
}

export function IconSocket({ size = 48, ...props }: IconProps) {
  return (
    <svg {...defaults(size, props)}>
      <rect x="2" y="2" width="44" height="76" rx="2" fill="#f5f5f0" stroke="#999" strokeWidth="1" />
      <rect x="10" y="20" width="28" height="36" rx="3" fill="#eee" stroke="#bbb" />
      <circle cx="18" cy="38" r="3" fill="#333" />
      <circle cx="30" cy="38" r="3" fill="#333" />
    </svg>
  )
}

export function IconSmart({ size = 48, ...props }: IconProps) {
  return iconBox(size, props, '#faf5ff', '#9333ea', 'SC')
}

export function IconDimmer({ size = 48, ...props }: IconProps) {
  return iconBox(size, props, '#fff7ed', '#ea580c', 'DIM')
}

export function IconBell({ size = 48, ...props }: IconProps) {
  return (
    <svg {...defaults(size, props)}>
      <rect x="2" y="2" width="44" height="76" rx="2" fill="#fef9c3" stroke="#ca8a04" strokeWidth="1" />
      <path d="M24 18 L16 42 H32 Z" fill="#ca8a04" />
      <circle cx="24" cy="48" r="3" fill="#ca8a04" />
    </svg>
  )
}

export function IconBlank({ size = 48, ...props }: IconProps) {
  return (
    <svg {...defaults(size, props)}>
      <rect x="2" y="2" width="44" height="76" rx="2" fill="#374151" stroke="#4b5563" strokeWidth="1" />
      <line x1="12" y1="40" x2="36" y2="40" stroke="#6b7280" strokeWidth="1" strokeDasharray="4 3" />
    </svg>
  )
}

const ICON_MAP = {
  mcb: IconMcb,
  rcd: IconRcd,
  rcbo: IconRcbo,
  distribution: IconDistribution,
  meter: IconMeter,
  spd: IconSpd,
  contactor: IconContactor,
  relay: IconRelay,
  'relay-voltage': IconRelayVoltage,
  switch: IconSwitch,
  afdd: IconAfdd,
  terminal: IconTerminal,
  busbar: IconBusbar,
  fuse: IconFuse,
  isolator: IconIsolator,
  ats: IconAts,
  indicator: IconIndicator,
  psu: IconPsu,
  socket: IconSocket,
  smart: IconSmart,
  dimmer: IconDimmer,
  bell: IconBell,
  blank: IconBlank,
  other: IconMcb,
} as const

export function ModuleIcon({ type, size = 48 }: { type: string; size?: number }) {
  const Icon = ICON_MAP[type as keyof typeof ICON_MAP] ?? IconMcb
  return <Icon size={size} />
}
