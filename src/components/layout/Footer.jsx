function Footer() {
  return (
    <footer className="border-t border-[var(--border)] bg-[var(--surface)]">
      <div className="mx-auto flex w-[min(var(--container-width),calc(100%-2rem))] flex-col items-start justify-between gap-4 py-6 md:flex-row md:items-center md:py-8">
        <div>
          <p className="m-0 text-base font-bold tracking-[-0.04em] text-[var(--text)]">PromptMuse</p>
          <p className="mt-1 m-0 text-sm text-[var(--text-muted)]">
            Curated AI photo styles for creative inspiration.
          </p>
        </div>
        <div className="flex flex-wrap justify-end gap-3 text-sm text-[var(--text-muted)] md:gap-5">
          <span className="transition-colors hover:text-[var(--text)]">Discovery</span>
          <span className="transition-colors hover:text-[var(--text)]">Prompt ideas</span>
          <span className="transition-colors hover:text-[var(--text)]">Visual inspiration</span>
        </div>
      </div>
    </footer>
  )
}

export default Footer
