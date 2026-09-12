import SectionHeader from '../components/ui/SectionHeader'
import SearchInput from '../components/ui/SearchInput'

function ExplorePage() {
  return (
    <div className="container page-shell">
      <SectionHeader
        eyebrow="Browse"
        title="Explore AI photo styles"
        description="Search and browse visual ideas across photo styles, categories, and editor-friendly prompts."
      />

      <div className="toolbar">
        <SearchInput value="" onChange={() => {}} placeholder="Search styles or tags" />
      </div>
    </div>
  )
}

export default ExplorePage
