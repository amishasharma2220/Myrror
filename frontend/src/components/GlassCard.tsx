// Oriel-style floating glass card: small caps label, then content.
import type { ReactNode } from 'react'

export default function GlassCard({ label, children, className = '' }: { label: string; children: ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl border border-white/60 bg-white/55 px-4 py-3 shadow-[0_20px_50px_-25px_rgba(43,38,34,0.5)] backdrop-blur-md ${className}`}>
      <p className="mb-1.5 flex items-center gap-1.5 text-[9px] tracking-[0.22em] uppercase text-muted">
        <span className="h-1.5 w-1.5 rounded-full bg-terracotta" />
        {label}
      </p>
      {children}
    </div>
  )
}

export function StatRow({ name, value, unit }: { name: string; value: ReactNode; unit?: string }) {
  return (
    <div className="flex items-baseline justify-between gap-6 py-0.5">
      <span className="text-xs text-muted">{name}</span>
      <span className="font-serif text-2xl leading-none text-charcoal">
        {value}
        {unit && <span className="ml-0.5 font-sans text-[10px] text-muted">{unit}</span>}
      </span>
    </div>
  )
}
