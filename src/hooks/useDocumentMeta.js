import { useEffect } from 'react'

function ensureMetaTag(selector, attributeName, attributeValue, tagName = 'meta') {
  let element = document.head.querySelector(`${tagName}[${attributeName}="${attributeValue}"]`)

  if (!element) {
    element = document.createElement(tagName)
    element.setAttribute(attributeName, attributeValue)
    document.head.appendChild(element)
  }

  return element
}

function ensureMetaBySelector(selector) {
  return document.head.querySelector(selector) || document.createElement('meta')
}

function applyMetaTag({ name, property, content, id }) {
  if (!content) return

  const selector = property ? `meta[property="${property}"]` : `meta[name="${name}"]`
  let element = document.head.querySelector(selector)

  if (!element) {
    element = document.createElement('meta')
    if (property) {
      element.setAttribute('property', property)
    } else {
      element.setAttribute('name', name)
    }
    document.head.appendChild(element)
  }

  element.setAttribute('content', content)

  if (id) {
    element.id = id
  }
}

export function useDocumentMeta({
  title,
  description,
  ogTitle,
  ogDescription,
  ogType = 'website',
  robots = 'index,follow',
}) {
  useEffect(() => {
    const resolvedTitle = title ? `${title} | PromptMuse` : 'PromptMuse'
    const resolvedDescription = description || 'Discover curated AI photo styles and prompt ideas for creative image generation.'

    document.title = resolvedTitle

    applyMetaTag({ name: 'description', content: resolvedDescription })
    applyMetaTag({ name: 'robots', content: robots })
    applyMetaTag({ name: 'theme-color', content: document.documentElement.dataset.theme === 'dark' ? '#101114' : '#f5f2ee' })

    applyMetaTag({ property: 'og:title', content: ogTitle || title || 'PromptMuse' })
    applyMetaTag({ property: 'og:description', content: ogDescription || resolvedDescription })
    applyMetaTag({ property: 'og:type', content: ogType })

    const canonical = document.head.querySelector('link[rel="canonical"]') || document.createElement('link')
    canonical.setAttribute('rel', 'canonical')
    canonical.setAttribute('href', window.location.href)
    if (!canonical.parentNode) {
      document.head.appendChild(canonical)
    }

    return () => {
      document.title = 'PromptMuse'
      applyMetaTag({ name: 'description', content: 'Discover curated AI photo styles and prompt ideas for creative image generation.' })
      applyMetaTag({ name: 'robots', content: 'index,follow' })
      applyMetaTag({ property: 'og:title', content: 'PromptMuse' })
      applyMetaTag({ property: 'og:description', content: 'Discover curated AI photo styles and prompt ideas for creative image generation.' })
      applyMetaTag({ property: 'og:type', content: 'website' })
    }
  }, [title, description, ogTitle, ogDescription, ogType, robots])
}

export default useDocumentMeta
