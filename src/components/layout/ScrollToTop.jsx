import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'

function ScrollToTop() {
  const { pathname } = useLocation()
  const previousPathRef = useRef(pathname)

  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual'
    }

    if (previousPathRef.current !== pathname) {
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
      previousPathRef.current = pathname
    }
  }, [pathname])

  return null
}

export default ScrollToTop
