import { useEffect } from 'react'
import { getSiteOrigin } from '../lib/siteUrl.js'

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
  structuredData,
}) {
  useEffect(() => {
    const resolvedTitle = title ? `${title} | PromptTouch AI` : 'PromptTouch AI'
    const resolvedDescription = description || 'Discover curated AI photo styles and prompt ideas for creative image generation.'
    const siteOrigin = getSiteOrigin()
    const pathname = window.location.pathname
    // Normalize trailing slash: homepage keeps '/', other routes strip trailing slash
    let normalizedPathname = pathname
    if (normalizedPathname !== '/' && normalizedPathname.endsWith('/')) {
      normalizedPathname = normalizedPathname.replace(/\/+$/, '')
    }
    const pageUrl = `${siteOrigin}${normalizedPathname}`
    const shouldEmitCanonical = !robots.includes('noindex')

    const absOgImage = resolveAbsoluteUrl(ogImage, siteOrigin)
    const absTwitterImage = resolveAbsoluteUrl(twitterImage || ogImage, siteOrigin)

    document.title = resolvedTitle

    applyMetaTag({ name: 'description', content: resolvedDescription })
    applyMetaTag({ name: 'robots', content: robots })
    applyMetaTag({ name: 'theme-color', content: document.documentElement.dataset.theme === 'dark' ? '#101114' : '#f5f2ee' })

    applyMetaTag({ property: 'og:title', content: ogTitle || title || 'PromptTouch AI' })
    applyMetaTag({ property: 'og:description', content: ogDescription || resolvedDescription })
    applyMetaTag({ property: 'og:type', content: ogType })
    if (absOgImage) applyMetaTag({ property: 'og:image', content: absOgImage })
    if (shouldEmitCanonical) {
      const canonical = document.head.querySelector('link[rel="canonical"]') || document.createElement('link')
      canonical.setAttribute('rel', 'canonical')
      canonical.setAttribute('href', pageUrl)
      if (!canonical.parentNode) {
        document.head.appendChild(canonical)
      }

      const ogUrlEl = document.head.querySelector('meta[property="og:url"]') || document.createElement('meta')
      ogUrlEl.setAttribute('property', 'og:url')
      ogUrlEl.setAttribute('content', pageUrl)
      if (!ogUrlEl.parentNode) {
        document.head.appendChild(ogUrlEl)
      }
    } else {
      const existingCanonical = document.head.querySelector('link[rel="canonical"]')
      if (existingCanonical) existingCanonical.remove()
      const existingOgUrl = document.head.querySelector('meta[property="og:url"]')
      if (existingOgUrl) existingOgUrl.remove()
    }

    applyMetaTag({ name: 'twitter:card', content: twitterCard })
    applyMetaTag({ name: 'twitter:title', content: twitterTitle || ogTitle || title || 'PromptTouch AI' })
    applyMetaTag({ name: 'twitter:description', content: twitterDescription || ogDescription || resolvedDescription })
    if (absTwitterImage) applyMetaTag({ name: 'twitter:image', content: absTwitterImage })

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
  }, [title, description, ogTitle, ogDescription, ogType, robots, ogImage, twitterCard, twitterTitle, twitterDescription, twitterImage, structuredData])
}

export default useDocumentMeta
