function EmptyState({ title, description, action }) {
  return (
    <div className="grid min-h-[240px] place-items-center gap-3 rounded-[var(--radius-lg)] border border-dashed border-[var(--border)] bg-[var(--surface)] p-8 text-center">
      <h3 className="m-0 text-2xl font-medium text-[var(--text)]">{title}</h3>
      {description ? <p className="m-0 text-[var(--text-muted)]">{description}</p> : null}
      {action ? <div className="mt-1">{action}</div> : null}
    </div>
  )
}

export default EmptyState
