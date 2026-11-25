const variants = {
  primary: 'bg-[linear-gradient(110deg,#8801FC_0%,#2600B9_50%,#0052FE_100%)] text-white shadow-[0_10px_20px_rgba(136,1,252,0.25)] hover:brightness-110',
  dark: 'bg-[linear-gradient(110deg,#8801FC_0%,#2600B9_50%,#000142_100%)] text-white shadow-[0_10px_20px_rgba(0,1,66,0.25)] hover:brightness-110',
  secondary: 'border border-[var(--border)] bg-[var(--surface)] text-[var(--text)]',
  ghost: 'border border-[var(--border)] bg-transparent text-[var(--text)]',
}

const sizes = {
  sm: 'min-h-[40px] px-3 py-2 text-sm',
  md: 'min-h-[44px] px-5 py-3 text-base',
  lg: 'min-h-[48px] px-6 py-3.5 text-base',
}

function Button({
  children,
  variant = 'primary',
  size = 'md',
  type = 'button',
  className = '',
  asChild = false,
  ...props
}) {
  const base = `inline-flex items-center justify-center rounded-full font-semibold transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)] disabled:cursor-not-allowed disabled:opacity-60 ${variants[variant]} ${sizes[size]} ${className}`.trim()

  if (asChild) {
    return (
      <span className={base} {...props}>
        {children}
      </span>
    )
  }

  return (
    <button
      type={type}
      className={base}
      {...props}
    >
      {children}
    </button>
  )
}

export default Button
