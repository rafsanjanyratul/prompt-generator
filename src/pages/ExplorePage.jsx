import SectionHeader from '../components/ui/SectionHeader'
import SearchInput from '../components/ui/SearchInput'

function ExplorePage() {
  return (
    <div className="mx-auto w-[min(var(--container-width),calc(100%-2rem))] py-8 pb-16">
      <SectionHeader
        eyebrow="Browse"
        title="Explore AI photo styles"
        description="Search and browse visual ideas across photo styles, categories, and editor-friendly prompts."
      />

      <div className="mt-6 flex">
        <SearchInput value="" onChange={() => {}} placeholder="Search styles or tags" />
      </div>
    </div>
  )
}

export default ExplorePage
