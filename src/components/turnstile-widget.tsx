'use client'

import { useEffect, useRef, useState } from 'react'

const TURNSTILE_SCRIPT_ID = 'blueskills-turnstile-script'
const TURNSTILE_SCRIPT_SRC =
  'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'

interface TurnstileApi {
  render: (
    container: HTMLElement,
    options: {
      sitekey: string
      theme: 'auto' | 'light' | 'dark'
      size: 'flexible' | 'normal' | 'compact'
      appearance: 'always' | 'execute' | 'interaction-only'
      retry: 'auto' | 'never'
      'refresh-expired': 'auto' | 'manual' | 'never'
      callback: (token: string) => void
      'error-callback': (code: string) => void
      'expired-callback': () => void
      'timeout-callback': () => void
    }
  ) => string
  reset: (widgetId: string) => void
  remove: (widgetId: string) => void
}

declare global {
  interface Window {
    turnstile?: TurnstileApi
  }
}

interface TurnstileWidgetProps {
  siteKey: string
  resetKey: number
  onTokenChange: (token: string | null) => void
  onErrorChange: (message: string | null) => void
}

export function TurnstileWidget({
  siteKey,
  resetKey,
  onTokenChange,
  onErrorChange,
}: TurnstileWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const widgetIdRef = useRef<string | null>(null)
  const tokenCallbackRef = useRef(onTokenChange)
  const errorCallbackRef = useRef(onErrorChange)
  const previousResetKey = useRef(resetKey)
  const [scriptReady, setScriptReady] = useState(
    () => typeof window !== 'undefined' && Boolean(window.turnstile)
  )

  useEffect(() => {
    tokenCallbackRef.current = onTokenChange
    errorCallbackRef.current = onErrorChange
  }, [onErrorChange, onTokenChange])

  useEffect(() => {
    if (scriptReady) return

    if (window.turnstile) {
      const readyTimer = window.setTimeout(() => setScriptReady(true), 0)
      return () => window.clearTimeout(readyTimer)
    }

    let script = document.getElementById(
      TURNSTILE_SCRIPT_ID
    ) as HTMLScriptElement | null
    const handleLoad = () => setScriptReady(Boolean(window.turnstile))
    const handleError = () => {
      errorCallbackRef.current(
        'Human verification could not load. Check the connection and reload.'
      )
    }

    if (!script) {
      script = document.createElement('script')
      script.id = TURNSTILE_SCRIPT_ID
      script.src = TURNSTILE_SCRIPT_SRC
      script.async = true
      script.defer = true
      document.head.appendChild(script)
    }

    script.addEventListener('load', handleLoad)
    script.addEventListener('error', handleError)
    return () => {
      script?.removeEventListener('load', handleLoad)
      script?.removeEventListener('error', handleError)
    }
  }, [scriptReady])

  useEffect(() => {
    if (!scriptReady || !window.turnstile || !containerRef.current) return
    if (widgetIdRef.current) return

    widgetIdRef.current = window.turnstile.render(containerRef.current, {
      sitekey: siteKey,
      theme: 'auto',
      size: 'flexible',
      appearance: 'interaction-only',
      retry: 'auto',
      'refresh-expired': 'auto',
      callback: (token) => {
        errorCallbackRef.current(null)
        tokenCallbackRef.current(token)
      },
      'error-callback': (code) => {
        tokenCallbackRef.current(null)
        errorCallbackRef.current(
          `Human check failed (${code}). Reload if it does not retry automatically.`
        )
      },
      'expired-callback': () => {
        tokenCallbackRef.current(null)
        errorCallbackRef.current(
          'The human check expired. Complete it again before scanning.'
        )
      },
      'timeout-callback': () => {
        tokenCallbackRef.current(null)
        errorCallbackRef.current(
          'The human check timed out. Complete it again before scanning.'
        )
      },
    })

    return () => {
      if (widgetIdRef.current && window.turnstile) {
        window.turnstile.remove(widgetIdRef.current)
      }
      widgetIdRef.current = null
    }
  }, [scriptReady, siteKey])

  useEffect(() => {
    if (resetKey === previousResetKey.current) return
    previousResetKey.current = resetKey
    tokenCallbackRef.current(null)
    errorCallbackRef.current(null)
    if (widgetIdRef.current && window.turnstile) {
      window.turnstile.reset(widgetIdRef.current)
    }
  }, [resetKey])

  return (
    <div
      ref={containerRef}
      className="min-h-16 w-full"
      aria-label="Human verification"
    />
  )
}
