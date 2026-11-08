export function withCloudinaryDisplayTransform(imageUrl) {
  if (!imageUrl || typeof imageUrl !== 'string') {
    return imageUrl
  }

  const trimmed = imageUrl.trim()

  if (!trimmed || trimmed.startsWith('/')) {
    return trimmed
  }

  try {
    const url = new URL(trimmed)

    if (!url.hostname.toLowerCase().includes('cloudinary.com')) {
      return trimmed
    }

    if (url.searchParams.has('f_auto') || url.searchParams.has('q_auto')) {
      return trimmed
    }

    const uploadIndex = url.pathname.indexOf('/image/upload/')

    if (uploadIndex === -1) {
      return trimmed
    }

    const pathAfterUpload = url.pathname.slice(uploadIndex + '/image/upload/'.length)
    const hasNamedTransform = /(?:^|[,/])(?:f_auto|q_auto)(?:,|$)/.test(pathAfterUpload)

    if (hasNamedTransform) {
      return trimmed
    }

    const transformedPath = `${url.pathname.slice(0, uploadIndex + '/image/upload/'.length)}f_auto,q_auto/${pathAfterUpload}`
    url.pathname = transformedPath

    return url.toString()
  } catch {
    if (!trimmed.includes('cloudinary.com')) {
      return trimmed
    }

    if (/(?:\?|\/)(?:f_auto|q_auto)|\/image\/upload\/(?:.*(?:f_auto|q_auto))/.test(trimmed)) {
      return trimmed
    }

    return trimmed.replace(/\/image\/upload\//, '/image/upload/f_auto,q_auto/')
  }
}
