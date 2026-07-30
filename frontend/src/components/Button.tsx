interface ButtonProps {
  children: React.ReactNode
  onClick?: () => void
  type?: 'button' | 'submit'
  variant?: 'primary' | 'secondary'
}

function Button({ children, onClick, type = 'button', variant = 'primary' }: ButtonProps) {
  const baseStyles = 'rounded-full px-6 py-3 font-sans text-sm font-medium transition-colors'

  const variantStyles =
    variant === 'primary'
      ? 'bg-terracotta text-cream hover:bg-terracotta/90'
      : 'bg-transparent text-charcoal border border-charcoal/20 hover:bg-charcoal/5'

  return (
    <button
      type={type}
      onClick={onClick}
      className={`${baseStyles} ${variantStyles}`}
    >
      {children}
    </button>
  )
}

export default Button