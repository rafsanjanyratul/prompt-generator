const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID

const isAnalyticsEnabled = Boolean(GA_MEASUREMENT_ID && GA_MEASUREMENT_ID.startsWith('G-'))

function safeWindow() {
  return typeof window !== 'undefined' ? window : undefined
}

function ensureGaScript() {
  if (!isAnalyticsEnabled || typeof document === 'undefined') {
    return false
  }

  const existingScript = document.querySelector('script[data-ga4="promptmuse"]')
  if (existingScript) {
    return true
  }

  const script = document.createElement('script')
  script.async = true
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`
  script.setAttribute('data-ga4', 'promptmuse')
  document.head.appendChild(script)

  window.dataLayer = window.dataLayer || []
  function gtag() {
    window.dataLayer.push(arguments)
  }
  window.gtag = gtag
  gtag('js', new Date())
  gtag('config', GA_MEASUREMENT_ID, {
    send_page_view: false,
  })

  return true
}

export function initializeAnalytics() {
  if (!isAnalyticsEnabled) {
    return false
  }

  try {
    ensureGaScript()
    return true
  } catch {
    return false
  }
}

export function trackPageView({ path, title, page_type }) {
  if (!isAnalyticsEnabled) {
    return
  }

  try {
    const targetWindow = safeWindow()
    if (!targetWindow || !targetWindow.gtag) {
      return
    }

    targetWindow.gtag('event', 'page_view', {
      page_path: path,
      page_title: title,
      page_type,
    })
  } catch {
    // Analytics should never break the app.
  }
}

export function trackEvent(eventName, params = {}) {
  if (!isAnalyticsEnabled) {
    return
  }

  try {
    const targetWindow = safeWindow()
    if (!targetWindow || !targetWindow.gtag) {
      return
    }

    targetWindow.gtag('event', eventName, params)
  } catch {
    // Analytics should never break the app.
  }
}

export function createAnalyticsTracker() {
  return {
    pageView: trackPageView,
    event: trackEvent,
  }
}

export default {
  initializeAnalytics,
  trackPageView,
  trackEvent,
  createAnalyticsTracker,
}
