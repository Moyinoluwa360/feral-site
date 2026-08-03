#!/usr/bin/env node
// scripts/grantAdmin.js — Grants the admin custom claim to a Firebase Auth user
//
// firebase-admin is already a root dependency — just `npm install` if missing.
//
// Usage:
//   FIREBASE_SERVICE_ACCOUNT='{"type":"service_account",...}' node scripts/grantAdmin.js someone@example.com
//
// Or set FIREBASE_SERVICE_ACCOUNT in a .env.local file and use:
//   npx dotenv -e .env.local -- node scripts/grantAdmin.js someone@example.com
//
// The user must already have a Firebase Auth account — sign up for one via
// the storefront's /signup page first (the admin app's login screen only
// signs in, it doesn't create accounts). After running this, the admin app
// will pick up the new claim automatically on next sign-in (it force-refreshes
// the ID token on every auth state change — see AdminAuthContext.jsx).

import { initializeApp, cert } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'

// ─── Auth ─────────────────────────────────────────────────────────────────────
let serviceAccount
if (process.env.FIREBASE_SERVICE_ACCOUNT) {
  serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
} else {
  console.error(
    'ERROR: Set FIREBASE_SERVICE_ACCOUNT env var to your Firebase service account JSON string.'
  )
  process.exit(1)
}

const email = process.argv[2]
if (!email) {
  console.error('Usage: node scripts/grantAdmin.js <email>')
  process.exit(1)
}

initializeApp({ credential: cert(serviceAccount) })
const auth = getAuth()

const user = await auth.getUserByEmail(email)
await auth.setCustomUserClaims(user.uid, { role: 'admin' })

console.log(`Granted admin role to ${email} (uid: ${user.uid})`)
