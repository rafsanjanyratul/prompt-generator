const variants = {
  primary: 'bg-[var(--brand)] text-[var(--background)]',
  secondary: 'border border-[var(--border)] bg-[var(--surface)] text-[var(--text)]',
  ghost: 'border border-[var(--border)] bg-transparent text-[var(--text)]',
}

const sizes = {
  sm: 'px-3 py-2 text-sm',
  md: 'px-5 py-3 text-base',
  lg: 'px-6 py-3.5 text-base',
}

function Button({
  children,
  variant = 'primary',
  size = 'md',
  type = 'button',
  className = '',
  ...props
}) {
  return (
    <button
      type={type}
      className={`inline-flex items-center justify-center rounded-full font-semibold transition-transform duration-200 hover:-translate-y-0.5 ${variants[variant]} ${sizes[size]} ${className}`.trim()}
      {...props}
    >
      {children}
    </button>
  )
}

export default Button
