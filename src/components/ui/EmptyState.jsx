function EmptyState({ title, description, action }) {
  return (
    <div className="grid min-h-[240px] place-items-center gap-3 rounded-[28px] border border-dashed border-[var(--border)] bg-[var(--surface)] p-8 text-center shadow-[0_8px_24px_rgba(15,23,42,0.03)]">
      <div className="flex h-12 w-12 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface-muted)] text-[var(--text-muted)]">
        <span aria-hidden="true">•</span>
      </div>
      <h3 className="m-0 text-2xl font-medium text-[var(--text)]">{title}</h3>
      {description ? <p className="m-0 max-w-[32rem] text-[var(--text-muted)]">{description}</p> : null}
      {action ? <div className="mt-1">{action}</div> : null}
    </div>
  )
}

export default EmptyState
