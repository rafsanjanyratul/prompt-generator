import { useRef, useState } from 'react'
import { Check, Copy, LoaderCircle, Sparkles } from 'lucide-react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import Button from '../components/ui/Button.jsx'
import { useAuth } from '../contexts/AuthContext.jsx'
import useDocumentMeta from '../hooks/useDocumentMeta'
import { createUserPrompt } from '../lib/authApi.js'
import { enhancePromptWithAI } from '../lib/promptsApi.js'

const getPromptTitle = (idea) => {
  const normalizedIdea = idea.replace(/\s+/g, ' ').trim()
  return normalizedIdea.length > 72 ? `${normalizedIdea.slice(0, 69).trim()}...` : normalizedIdea
}

function AIEnhancerPage() {
  const { user, loading: isAuthLoading } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [idea, setIdea] = useState('')
  const [enhancedPrompt, setEnhancedPrompt] = useState('')
  const [isEnhancing, setIsEnhancing] = useState(false)
  const [enhancementError, setEnhancementError] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [saveState, setSaveState] = useState({ status: 'idle', message: '' })
  const [copyState, setCopyState] = useState('idle')
  const isSavingRef = useRef(false)
  const lastSavedSignatureRef = useRef('')

  useDocumentMeta({
    title: 'AI Prompt Enhancer',
    description: 'Transform a simple idea into a detailed AI image-generation prompt.',
    robots: 'noindex,nofollow',
  })

  const redirectToLogin = () => {
    navigate('/login', {
      state: {
        from: {
          pathname: location.pathname,
          search: location.search,
          hash: location.hash,
          state: location.state,
        },
        message: 'You must log in to use the AI Prompt Enhancer.',
      },
    })
  }

  const handleEnhance = async (event) => {
    event.preventDefault()

    const trimmedIdea = idea.trim()
    if (!trimmedIdea) {
      setEnhancementError('Enter an idea before enhancing it.')
      return
    }

    if (isAuthLoading) return
    if (!user) {
      redirectToLogin()
      return
    }
    if (isEnhancing) return

    setIsEnhancing(true)
    setEnhancementError('')
    setEnhancedPrompt('')
    setSaveState({ status: 'idle', message: '' })
    setCopyState('idle')

    try {
      const result = await enhancePromptWithAI(trimmedIdea)
      setEnhancedPrompt(result)
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('creditBalanceUpdated'))
      }
    } catch (error) {
      const message = error?.message || 'Unable to enhance this prompt right now.'
      setEnhancementError(message)
      toast.error(message)
    } finally {
      setIsEnhancing(false)
    }
  }

  const handleCopy = async () => {
    if (!enhancedPrompt.trim()) return

    try {
      await navigator.clipboard.writeText(enhancedPrompt)
      setCopyState('success')
      toast.success('Enhanced prompt copied to clipboard.')
    } catch {
      setCopyState('error')
      toast.error('Unable to copy this prompt right now.')
    }
  }

  const handleSave = async () => {
    if (!user) {
      redirectToLogin()
      return
    }

    const prompt = enhancedPrompt.trim()
    if (!prompt) {
      setSaveState({ status: 'error', message: 'Enhance a prompt before saving it.' })
      return
    }
    if (isSavingRef.current) return

    const originalIdea = idea.trim()
    const payload = {
      title: getPromptTitle(originalIdea) || 'AI Enhanced Prompt',
      prompt,
      category: 'AI Enhanced Prompt',
      style: 'AI Prompt Enhancer',
      tags: ['ai-enhanced', 'prompt-enhancer'],
      description: `AI-enhanced from original idea: ${originalIdea}`,
    }
    const signature = `${payload.title}|${payload.prompt}|${payload.category}|${payload.style}`

    if (lastSavedSignatureRef.current === signature) {
      setSaveState({ status: 'error', message: 'This prompt is already saved to My Prompts.' })
      toast.info('This prompt is already saved to My Prompts.')
      return
    }

    isSavingRef.current = true
    setIsSaving(true)
    setSaveState({ status: 'idle', message: '' })

    try {
      await createUserPrompt(payload)
      lastSavedSignatureRef.current = signature
      setSaveState({ status: 'success', message: 'Prompt saved to My Prompts.' })
      toast.success('Prompt saved to My Prompts.')
    } catch (error) {
      const message = error?.message || 'Unable to save this prompt right now.'
      setSaveState({ status: 'error', message })
      toast.error(message)
    } finally {
      isSavingRef.current = false
      setIsSaving(false)
    }
  }

  const handleIdeaChange = (event) => {
    setIdea(event.target.value)
    setEnhancedPrompt('')
    setEnhancementError('')
    setSaveState({ status: 'idle', message: '' })
    setCopyState('idle')
    lastSavedSignatureRef.current = ''
  }

  const handleEnhancedPromptChange = (event) => {
    setEnhancedPrompt(event.target.value)
    setCopyState('idle')
    setSaveState({ status: 'idle', message: '' })
  }

  return (
    <div className="mx-auto w-[min(var(--container-width),calc(100%-2rem))] py-8 pb-16 sm:py-10">
      <section className="mb-8 rounded-[30px] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[0_12px_30px_rgba(15,23,42,0.04)] sm:p-7 lg:p-9">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-2xl space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--brand-soft)] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--text-muted)]">
              <Sparkles className="size-3.5 text-[var(--brand-accent)]" aria-hidden="true" />
              PromptTouch AI Studio
            </div>
            <h1 className="m-0 text-[clamp(2.2rem,5vw,4.3rem)] leading-[0.95] tracking-[-0.07em] text-[var(--text)]">
              AI Prompt Enhancer
            </h1>
            <p className="m-0 max-w-xl text-base leading-7 text-[var(--text-muted)] md:text-lg">
              Turn a simple idea into a detailed AI image-generation prompt, with clearer visual direction and
              creative detail.
            </p>
          </div>
          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface-muted)] px-3 py-2 text-[11px] font-medium uppercase tracking-[0.12em] text-[var(--text-muted)]">
            <span className="size-2 rounded-full bg-[var(--brand-accent)]" aria-hidden="true" />
            Idea to image prompt
          </div>
        </div>
      </section>

      <section className="rounded-[30px] border border-[var(--border)] bg-[var(--surface)] p-4 shadow-[0_12px_30px_rgba(15,23,42,0.04)] sm:p-6 lg:p-8">
        <form onSubmit={handleEnhance} className="space-y-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div className="space-y-1">
              <p className="m-0 text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--text-muted)]">
                Step 01
              </p>
              <h2 className="m-0 text-2xl font-semibold tracking-[-0.05em] text-[var(--text)] sm:text-3xl">
                Start with your idea
              </h2>
            </div>
            <span className="text-xs text-[var(--text-muted)]">{idea.trim().length} characters</span>
          </div>

          <label htmlFor="ai-enhancer-idea" className="sr-only">
            Your original idea
          </label>
          <textarea
            id="ai-enhancer-idea"
            value={idea}
            onChange={handleIdeaChange}
            rows={6}
            maxLength={1500}
            disabled={isEnhancing}
            placeholder="Describe the image you want to create. For example: a cozy reading nook in a sunlit cabin..."
            className="w-full resize-y rounded-[20px] border border-[var(--border)] bg-[var(--surface-muted)] px-4 py-4 text-sm leading-7 text-[var(--text)] outline-none transition-colors placeholder:text-[var(--text-muted)] focus:border-[var(--focus)] focus-visible:ring-2 focus-visible:ring-[var(--focus)] sm:text-base"
          />

          {enhancementError ? (
            <p className="m-0 text-sm text-[var(--error)]" role="alert">
              {enhancementError}
            </p>
          ) : null}

          {!user && !isAuthLoading ? (
            <p className="m-0 text-sm text-[var(--text-muted)]" role="status">
              <Link
                to="/login"
                state={{
                  from: { pathname: location.pathname, search: location.search, hash: location.hash },
                  message: 'You must log in to use the AI Prompt Enhancer.',
                }}
                className="font-semibold text-[var(--text)] underline decoration-[var(--border)] underline-offset-4"
              >
                Sign in
              </Link>{' '}
              to enhance and save prompts.
            </p>
          ) : null}

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="m-0 max-w-lg text-xs leading-5 text-[var(--text-muted)]">
              A few clear details about the subject, mood, or setting help guide the result.
            </p>
            <Button
              type="submit"
              size="lg"
              disabled={!idea.trim() || isEnhancing || isAuthLoading}
              aria-busy={isEnhancing}
              className="w-full gap-2 sm:w-auto"
            >
              {isEnhancing ? (
                <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
              ) : (
                <Sparkles className="size-4" aria-hidden="true" />
              )}
              {isEnhancing ? 'Enhancing...' : 'Enhance with AI'}
            </Button>
          </div>
        </form>
      </section>

      {enhancedPrompt ? (
        <section
          aria-labelledby="ai-enhancer-result-title"
          className="mt-6 rounded-[30px] border border-[var(--border)] bg-[var(--surface)] p-4 shadow-[0_12px_30px_rgba(15,23,42,0.04)] sm:p-6 lg:p-8"
        >
          <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-2">
              <p className="m-0 text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--text-muted)]">
                Step 02 · Your result
              </p>
              <h2
                id="ai-enhancer-result-title"
                className="m-0 text-2xl font-semibold tracking-[-0.05em] text-[var(--text)] sm:text-3xl"
              >
                Enhanced prompt
              </h2>
              <p className="m-0 text-sm leading-6 text-[var(--text-muted)]">
                Copy your prompt or save it to My Prompts for later.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={handleCopy}
                className="gap-2"
                disabled={isSaving}
                aria-live="polite"
              >
                {copyState === 'success' ? (
                  <Check className="size-3.5" aria-hidden="true" />
                ) : (
                  <Copy className="size-3.5" aria-hidden="true" />
                )}
                {copyState === 'success' ? 'Copied!' : copyState === 'error' ? 'Copy failed' : 'Copy Prompt'}
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={handleSave}
                disabled={isSaving || isAuthLoading}
                aria-busy={isSaving}
                className="gap-2"
              >
                {isSaving ? <LoaderCircle className="size-3.5 animate-spin" aria-hidden="true" /> : null}
                {isSaving ? 'Saving...' : user ? 'Save to My Prompts' : 'Sign in to save'}
              </Button>
            </div>
          </div>

          <textarea
            aria-label="Enhanced prompt"
            value={enhancedPrompt}
            onChange={handleEnhancedPromptChange}
            rows={8}
            disabled={isSaving}
            className="w-full resize-y rounded-[20px] border border-[var(--border)] bg-[var(--brand-soft)] px-4 py-4 text-sm leading-7 text-[var(--text)] outline-none transition-colors focus:border-[var(--focus)] focus-visible:ring-2 focus-visible:ring-[var(--focus)] sm:text-base"
          />

          {saveState.message ? (
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-[18px] border border-[var(--border)] bg-[var(--surface-muted)] px-4 py-3">
              <p
                className={`m-0 text-sm ${
                  saveState.status === 'success' ? 'text-[var(--success)]' : 'text-[var(--error)]'
                }`}
                aria-live="polite"
              >
                {saveState.message}
              </p>
              {saveState.status === 'success' ? (
                <Link to="/my-prompts" className="text-sm font-semibold text-[var(--text)] underline underline-offset-4">
                  View My Prompts
                </Link>
              ) : null}
            </div>
          ) : null}
        </section>
      ) : null}
    </div>
  )
}

export default AIEnhancerPage
