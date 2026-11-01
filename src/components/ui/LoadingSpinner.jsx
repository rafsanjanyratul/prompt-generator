function LoadingSpinner({ label = 'Loading', size = 'md', className = '' }) {
  const sizeClasses = {
    sm: 'size-6',
    md: 'size-10',
    lg: 'size-14',
  }

  return (
    <div className={`inline-flex items-center gap-3 ${className}`.trim()} role="status" aria-live="polite">
      <span
        className={`relative inline-flex ${sizeClasses[size] || sizeClasses.md} rounded-full border-[3px] border-[color:var(--brand-soft)] border-t-[color:var(--brand)] border-r-[color:var(--accent)] border-b-[color:var(--success)] animate-spin shadow-[0_0_20px_rgba(168,85,247,0.18)]`}
        aria-hidden="true"
      />
      <span className="text-sm font-medium text-[var(--text-muted)]">{label}</span>
    </div>
  )
}

export default LoadingSpinner
