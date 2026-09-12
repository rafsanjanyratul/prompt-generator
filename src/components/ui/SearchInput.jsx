import { Search } from 'lucide-react'

function SearchInput({ value, onChange, placeholder = 'Search styles', ...props }) {
  return (
    <label
      className="flex w-full max-w-[32rem] items-center gap-3 rounded-[14px] border border-[var(--border)] bg-[var(--surface)] px-3 py-3 text-[var(--text-muted)] transition-colors focus-within:border-[var(--brand)] focus-within:ring-2 focus-within:ring-[var(--brand-soft)]"
      {...props}
    >
      <Search className="size-4 shrink-0" aria-hidden="true" />
      <input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        aria-label="Search styles"
        className="w-full border-0 bg-transparent text-[var(--text)] outline-none placeholder:text-[var(--text-muted)]"
      />
    </label>
  )
}

export default SearchInput
