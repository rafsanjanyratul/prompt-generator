export function getSiteOrigin() {
  const configured = import.meta.env.VITE_SITE_URL

  if (configured) {
    try {
      return new URL(configured).origin
    } catch {
      return configured.replace(/\/+$/, '')
    }
  }

  return typeof window !== 'undefined' ? window.location.origin : ''
}
