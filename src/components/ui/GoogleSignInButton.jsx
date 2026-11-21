import { useEffect, useRef } from 'react'

// Prevent multiple GSI initializations across Login and Signup navigation.
let gsiInitialized = false
// Tracks the callback pair for each mounted page instance. The last entry is
// always the currently mounted page's callbacks.
let gsiCallbackPairs = []

// Timeout in milliseconds for waiting for the Google Identity Services script.
const GSI_LOAD_TIMEOUT_MS = 10_000
// Poll interval in milliseconds.
const GSI_POLL_INTERVAL_MS = 100

function GoogleSignInButton({ onSuccess, onError }) {
  const btnContainerRef = useRef(null)
  const onSuccessRef = useRef(onSuccess)
  const onErrorRef = useRef(onError)
  const pollTimerRef = useRef(null)
  const timeoutTimerRef = useRef(null)

  // Keep the callback refs current without re-running the effect.
  onSuccessRef.current = onSuccess
  onErrorRef.current = onError

  useEffect(() => {
    let isMounted = true

    // Register this page's callbacks.
    const callbackPair = { onSuccess: onSuccessRef, onError: onErrorRef }
    gsiCallbackPairs.push(callbackPair)

    const initializeGoogleSignIn = () => {
      if (!isMounted) return

      const google = window.google

      if (!google?.accounts?.id || !btnContainerRef.current) {
        return
      }

      // Stop polling and timeout timers — the script is ready.
      if (pollTimerRef.current) {
        clearInterval(pollTimerRef.current)
        pollTimerRef.current = null
      }
      if (timeoutTimerRef.current) {
        clearTimeout(timeoutTimerRef.current)
        timeoutTimerRef.current = null
      }

      if (!gsiInitialized) {
        google.accounts.id.initialize({
          client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
          callback: handleCredentialResponse,
          auto_select: false,
          cancel_on_tap_outside: true,
        })

        gsiInitialized = true
      }

      // Ensure the container is empty so StrictMode effect re-execution
      // cannot append duplicate Google buttons.
      btnContainerRef.current.innerHTML = ''

      google.accounts.id.renderButton(btnContainerRef.current, {
        type: 'standard',
        theme: 'outline',
        size: 'large',
        text: 'continue_with',
        shape: 'pill',
        logo_alignment: 'left',
        width: 300,
      })
    }

    const handleCredentialResponse = (credentialResponse) => {
      const credential = credentialResponse?.credential
      const currentPair = gsiCallbackPairs[gsiCallbackPairs.length - 1]

      if (!credential) {
        currentPair?.onError.current?.()
        return
      }

      currentPair?.onSuccess.current?.(credential)
    }

    initializeGoogleSignIn()

    // If the script isn't ready yet, poll until it loads or the timeout elapses.
    if (!window.google?.accounts?.id) {
      pollTimerRef.current = setInterval(() => {
        initializeGoogleSignIn()
      }, GSI_POLL_INTERVAL_MS)

      timeoutTimerRef.current = setTimeout(() => {
        if (pollTimerRef.current) {
          clearInterval(pollTimerRef.current)
          pollTimerRef.current = null
        }
        if (isMounted) {
          const currentPair = gsiCallbackPairs[gsiCallbackPairs.length - 1]
          currentPair?.onError.current?.()
        }
      }, GSI_LOAD_TIMEOUT_MS)
    }

    return () => {
      isMounted = false
      gsiCallbackPairs = gsiCallbackPairs.filter(
        (pair) => pair !== callbackPair
      )
      if (pollTimerRef.current) {
        clearInterval(pollTimerRef.current)
        pollTimerRef.current = null
      }
      if (timeoutTimerRef.current) {
        clearTimeout(timeoutTimerRef.current)
        timeoutTimerRef.current = null
      }
    }
  }, [])

  return <div ref={btnContainerRef} style={{ height: 40 }} />
}

export default GoogleSignInButton