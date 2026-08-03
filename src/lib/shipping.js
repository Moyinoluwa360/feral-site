// ─── SHIPPING CONFIG ──────────────────────────────────────────────────────────
// All shipping rates and business rules are defined here.
// Edit this file to change rates — no other code changes needed.
//
// CURRENCY: Set VITE_CURRENCY in your .env (e.g. NGN, USD, GHS, ZAR).
// Set VITE_CURRENCY_SYMBOL to the matching symbol (₦, $, ₵, R, etc.).
//
// Paystack requires amounts in the SMALLEST currency unit:
//   NGN → kobo  (₦1 = 100 kobo)
//   USD → cents ($1 = 100 cents)
//   GHS → pesewas
// The PAYSTACK_AMOUNT_MULTIPLIER below handles this conversion.
// Leave at 100 for all standard currencies.

export const CURRENCY = import.meta.env.VITE_CURRENCY || 'NGN'
export const CURRENCY_SYMBOL = import.meta.env.VITE_CURRENCY_SYMBOL || '₦'
export const PAYSTACK_AMOUNT_MULTIPLIER = 100

// ─── SHIPPING REGIONS & RATES ────────────────────────────────────────────────
// Key   : label shown to the customer in the checkout region dropdown
// Value : shipping cost in your display currency (e.g. 1500 = ₦1,500)
//
// Add, remove, or rename regions freely. The key is what gets saved to orders.
export const SHIPPING_RATES = {
  'Lagos': 2000,
  'Abuja': 2500,
  'Other Nigeria': 2500,
  'International': 8000,
}

export const SHIPPING_REGIONS = Object.keys(SHIPPING_RATES)

// ─── FREE SHIPPING THRESHOLD ─────────────────────────────────────────────────
// Cart subtotal (in display currency) above which shipping is free.
// Set to Infinity to disable free shipping entirely.
export const FREE_SHIPPING_THRESHOLD = Infinity

// ─── HELPER ──────────────────────────────────────────────────────────────────
export function calculateShipping(region, subtotal) {
  if (subtotal >= FREE_SHIPPING_THRESHOLD) return 0
  const rate = SHIPPING_RATES[region]
  return rate !== undefined ? rate : (SHIPPING_RATES['Other Nigeria'] ?? 0)
}
