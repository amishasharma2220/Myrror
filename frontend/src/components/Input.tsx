interface InputProps {
  label: string
  type?: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

function Input({ label, type = 'text', value, onChange, placeholder }: InputProps) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs tracking-widest uppercase text-muted">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="border-b border-charcoal/20 bg-transparent py-2 font-sans text-charcoal
                   focus:outline-none focus:border-terracotta transition-colors"
      />
    </div>
  )
}

export default Input