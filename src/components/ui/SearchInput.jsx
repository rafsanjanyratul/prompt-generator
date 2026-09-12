function SearchInput({ value, onChange, placeholder = 'Search styles', ...props }) {
  return (
    <label className="search-input" {...props}>
      <span className="search-input__icon" aria-hidden="true">
        ⌕
      </span>
      <input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        aria-label="Search styles"
      />
    </label>
  )
}

export default SearchInput
