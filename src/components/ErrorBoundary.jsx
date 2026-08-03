import { Component } from 'react'

// ─── ERROR MONITORING ─────────────────────────────────────────────────────────
// To add Sentry, install @sentry/react and wire it in here:
//
//   import * as Sentry from '@sentry/react'
//   Sentry.init({
//     dsn: import.meta.env.VITE_SENTRY_DSN,
//     integrations: [Sentry.browserTracingIntegration()],
//     tracesSampleRate: 1.0,
//   })
//
// Then replace the console.error below with:
//   Sentry.captureException(error, { contexts: { react: { componentStack } } })
//
// Docs: https://docs.sentry.io/platforms/javascript/guides/react/

class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    // SENTRY PLACEHOLDER — replace with Sentry.captureException when ready
    console.error('[FERAL] Uncaught error:', error, errorInfo)
  }

  render() {
    if (!this.state.hasError) return this.props.children

    return (
      <div className="bg-[#0a0a0a] min-h-screen flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <p
            className="text-[#c81e1e] text-7xl mb-6 uppercase"
            style={{ fontFamily: "'Big Shoulders Stencil', sans-serif", fontWeight: 700 }}
          >
            ERROR
          </p>
          <p className="text-white/40 font-['Space_Grotesk'] text-sm mb-8 leading-relaxed">
            Something went wrong. Refresh the page and try again.<br />
            If the problem persists, contact us.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="btn-primary text-sm"
          >
            Reload Page
          </button>
        </div>
      </div>
    )
  }
}

export default ErrorBoundary
