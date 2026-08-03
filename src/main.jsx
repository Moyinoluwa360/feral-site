import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { initAnalytics } from './lib/analytics.js'

// Initialise GA4 — no-op if VITE_GA4_MEASUREMENT_ID is not set
initAnalytics()

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
