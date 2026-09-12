const tones = {
  neutral: 'border border-[var(--border)] bg-[var(--surface)] text-[var(--text-muted)]',
  brand: 'border border-[var(--border)] bg-[var(--brand-soft)] text-[var(--text)]',
  success: 'border border-transparent bg-[rgba(28,124,84,0.12)] text-[var(--success)]',
}

function Badge({ children, tone = 'neutral', className = '' }) {
  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-[11px] font-semibold ${tones[tone]} ${className}`.trim()}>
      {children}
    </span>
  )
}

export default Badge
