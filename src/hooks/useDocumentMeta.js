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

function applyJsonLd(data) {
  const existing = document.head.querySelector('script[type="application/ld+json"][data-promptmuse-seo]')
  if (existing) {
    existing.remove()
  }

  if (!data) return

  const script = document.createElement('script')
  script.type = 'application/ld+json'
  script.setAttribute('data-promptmuse-seo', 'true')
  script.textContent = JSON.stringify(data)
  document.head.appendChild(script)

  return script
}

function resolveAbsoluteUrl(url, origin) {
  if (!url) return undefined
  if (url.startsWith('http://') || url.startsWith('https://')) return url
  if (url.startsWith('/')) return `${origin}${url}`
  return `${origin}/${url}`
}

export function useDocumentMeta({
  title,
  description,
  ogTitle,
  ogDescription,
  ogType = 'website',
  robots = 'index,follow',
  ogImage,
  twitterCard = 'summary_large_image',
  twitterTitle,
  twitterDescription,
  twitterImage,
  ogUrl,
  structuredData,
}) {
  useEffect(() => {
    const resolvedTitle = title ? `${title} | PromptTouch AI` : 'PromptTouch AI'
    const resolvedDescription = description || 'Discover curated AI photo styles and prompt ideas for creative image generation.'
    const origin = window.location.origin

    const absOgImage = resolveAbsoluteUrl(ogImage, origin)
    const absTwitterImage = resolveAbsoluteUrl(twitterImage || ogImage, origin)

    document.title = resolvedTitle

    applyMetaTag({ name: 'description', content: resolvedDescription })
    applyMetaTag({ name: 'robots', content: robots })
    applyMetaTag({ name: 'theme-color', content: document.documentElement.dataset.theme === 'dark' ? '#101114' : '#f5f2ee' })

    applyMetaTag({ property: 'og:title', content: ogTitle || title || 'PromptTouch AI' })
    applyMetaTag({ property: 'og:description', content: ogDescription || resolvedDescription })
    applyMetaTag({ property: 'og:type', content: ogType })
    if (absOgImage) applyMetaTag({ property: 'og:image', content: absOgImage })
    if (ogUrl) applyMetaTag({ property: 'og:url', content: ogUrl })

    applyMetaTag({ name: 'twitter:card', content: twitterCard })
    applyMetaTag({ name: 'twitter:title', content: twitterTitle || ogTitle || title || 'PromptTouch AI' })
    applyMetaTag({ name: 'twitter:description', content: twitterDescription || ogDescription || resolvedDescription })
    if (absTwitterImage) applyMetaTag({ name: 'twitter:image', content: absTwitterImage })

    const canonical = document.head.querySelector('link[rel="canonical"]') || document.createElement('link')
    canonical.setAttribute('rel', 'canonical')
    canonical.setAttribute('href', window.location.href)
    if (!canonical.parentNode) {
      document.head.appendChild(canonical)
    }

    applyJsonLd(structuredData)

    const fallbackOgImage = '/images/styles/boys/old-money-luxury-elegance.webp'

    return () => {
      document.title = 'PromptTouch AI'
      applyMetaTag({ name: 'description', content: 'Discover curated AI photo styles and prompt ideas for creative image generation.' })
      applyMetaTag({ name: 'robots', content: 'index,follow' })
      applyMetaTag({ property: 'og:title', content: 'PromptTouch AI' })
      applyMetaTag({ property: 'og:description', content: 'Discover curated AI photo styles and prompt ideas for creative image generation.' })
      applyMetaTag({ property: 'og:type', content: 'website' })
      applyMetaTag({ property: 'og:image', content: fallbackOgImage })
      applyMetaTag({ name: 'twitter:card', content: 'summary_large_image' })
      applyMetaTag({ name: 'twitter:title', content: 'PromptTouch AI' })
      applyMetaTag({ name: 'twitter:description', content: 'Discover curated AI photo styles and prompt ideas for creative image generation.' })
      applyMetaTag({ name: 'twitter:image', content: fallbackOgImage })
      applyJsonLd(null)
    }
  }, [title, description, ogTitle, ogDescription, ogType, robots, ogImage, twitterCard, twitterTitle, twitterDescription, twitterImage, ogUrl, structuredData])
}

export default useDocumentMeta
