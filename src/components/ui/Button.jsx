const variants = {
  primary: 'button--primary',
  secondary: 'button--secondary',
  ghost: 'button--ghost',
}

const sizes = {
  sm: 'button--sm',
  md: 'button--md',
  lg: 'button--lg',
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
      className={`button ${variants[variant]} ${sizes[size]} ${className}`.trim()}
      {...props}
    >
      {children}
    </button>
  )
}

export default Button
