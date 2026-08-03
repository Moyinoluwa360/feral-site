import { initializeApp, getApps } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getAuth } from 'firebase/auth'
import { getStorage } from 'firebase/storage'
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

// Prevent re-initialization in React strict mode / HMR
const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig)

export const db = getFirestore(app)
export const auth = getAuth(app)
export const storage = getStorage(app)
export const functions = getFunctions(app)

// In dev, talk to the local Functions emulator (run `firebase emulators:start`)
// instead of deployed Cloud Functions. Set VITE_USE_FIREBASE_EMULATOR=false to opt out.
if (import.meta.env.DEV && import.meta.env.VITE_USE_FIREBASE_EMULATOR !== 'false') {
  connectFunctionsEmulator(functions, 'localhost', 5001)
}
