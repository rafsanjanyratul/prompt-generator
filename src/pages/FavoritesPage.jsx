import { useEffect, useState } from 'react'
import { Heart, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import StyleCard from '../components/discover/StyleCard'
import Button from '../components/ui/Button'
import EmptyState from '../components/ui/EmptyState'
import LoadingSpinner from '../components/ui/LoadingSpinner.jsx'
import { useAuth } from '../contexts/AuthContext.jsx'
import useDocumentMeta from '../hooks/useDocumentMeta'
import { getFavoritePrompts, removeFavoritePrompt } from '../lib/authApi.js'

function FavoritesPage() {
  const { user } = useAuth()
  const [favoritePrompts, setFavoritePrompts] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [removingSlug, setRemovingSlug] = useState('')

  useDocumentMeta({
    title: 'My Favorites',
    description: 'View and manage the public prompts you have saved to your favorites list.',
    ogTitle: 'My Favorites',
    ogDescription: 'Browse and unfavorite the prompts you have saved in PromptMuse.',
  })

  useEffect(() => {
    let isMounted = true

    async function loadFavorites() {
      if (!user) {
        if (isMounted) {
          setFavoritePrompts([])
          setError('')
          setIsLoading(false)
        }
        return
      }

      try {
        setIsLoading(true)
        setError('')
        const favorites = await getFavoritePrompts()

        if (isMounted) {
          const normalized = (favorites || [])
            .map((favorite) => favorite?.prompt || favorite)
            .filter(Boolean)
            .map((prompt) => ({ ...prompt, slug: prompt.slug || prompt._id }))

          setFavoritePrompts(normalized)
        }
      } catch (loadError) {
        if (isMounted) {
          setError(loadError.message || 'Unable to load your favorites right now.')
          setFavoritePrompts([])
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadFavorites()

    return () => {
      isMounted = false
    }
  }, [user])

  const handleRemoveFavorite = async (slug) => {
    if (!slug || removingSlug === slug) {
      return
    }

    setRemovingSlug(slug)

    try {
      await removeFavoritePrompt(slug)
      setFavoritePrompts((current) => current.filter((item) => (item.slug || item.id || item._id) !== slug))
      toast.success('Removed from favorites.')
    } catch (removeError) {
      toast.error(removeError.message || 'Unable to remove this prompt from favorites.')
    } finally {
      setRemovingSlug('')
    }
  }

  if (isLoading) {
    return (
      <div className="mx-auto w-[min(var(--container-width),calc(100%-2rem))] py-8 pb-16">
        <div className="mt-8 flex justify-center rounded-[28px] border border-[var(--border)] bg-[var(--surface)] p-8 shadow-[0_12px_32px_rgba(15,23,42,0.04)]">
          <LoadingSpinner label="Loading favorites" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="mx-auto w-[min(var(--container-width),calc(100%-2rem))] py-8 pb-16">
        <EmptyState
          title="Favorites unavailable"
          description={error}
          action={
            <Link to="/explore">
              <Button variant="secondary" className="inline-flex items-center gap-2">
                <Sparkles className="size-4" />
                Explore prompts
              </Button>
            </Link>
          }
        />
      </div>
    )
  }

  return (
    <div className="mx-auto w-[min(var(--container-width),calc(100%-2rem))] py-8 pb-16">
      <div className="mb-6 flex items-center justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">Saved</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-[-0.05em] text-[var(--text)] md:text-4xl">
            Favorites
          </h1>
        </div>
        <div className="flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--text-muted)]">
          <Heart className="size-4 fill-current text-[var(--brand)]" />
          <span>{favoritePrompts.length}</span>
        </div>
      </div>

      {favoritePrompts.length === 0 ? (
        <EmptyState
          title="No saved favorites yet"
          description="Explore public prompts and save the ones you want to revisit later."
          action={
            <Link to="/explore">
              <Button variant="secondary" className="inline-flex items-center gap-2">
                <Sparkles className="size-4" />
                Explore prompts
              </Button>
            </Link>
          }
        />
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:gap-5 xl:grid-cols-3">
          {favoritePrompts.map((item) => (
            <StyleCard
              key={item.slug || item.id || item._id}
              item={item}
              favorite
              showFavoriteButton
              onToggleFavorite={handleRemoveFavorite}
              isFavoriteLoading={removingSlug === (item.slug || item.id || item._id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default FavoritesPage
