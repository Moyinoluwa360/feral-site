// ─── GOOGLE ANALYTICS 4 ──────────────────────────────────────────────────────
// Analytics is initialized from VITE_GA4_MEASUREMENT_ID.
// If that variable is not set, all calls are silently no-ops — safe for local dev.

export function initAnalytics() {
  const measurementId = import.meta.env.VITE_GA4_MEASUREMENT_ID
  if (!measurementId) return

  const script = document.createElement('script')
  script.async = true
  script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`
  document.head.appendChild(script)

  window.dataLayer = window.dataLayer || []
  function gtag(...args) { window.dataLayer.push(args) }
  window.gtag = gtag
  gtag('js', new Date())
  // send_page_view: false — we fire page views manually via trackPageView
  gtag('config', measurementId, { send_page_view: false })
}

export function trackPageView(path) {
  if (typeof window.gtag !== 'function') return
  window.gtag('event', 'page_view', { page_path: path })
}

export function trackEvent(name, params = {}) {
  if (typeof window.gtag !== 'function') return
  window.gtag('event', name, params)
}
