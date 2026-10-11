// Firebase — same project as the mobile app (ai-spik-boso-eng)
import { initializeApp } from 'firebase/app'
import { getAnalytics, isSupported } from 'firebase/analytics'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const env = import.meta.env

// Web app configuration (values from .env, falling back to the project's web config)
const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY || 'AIzaSyB0b0bPV8-gyKXB7PnhLiKmw0xFjENnKMQ',
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN || 'ai-spik-boso-eng.firebaseapp.com',
  projectId: env.VITE_FIREBASE_PROJECT_ID || 'ai-spik-boso-eng',
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET || 'ai-spik-boso-eng.firebasestorage.app',
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID || '775532825046',
  appId: env.VITE_FIREBASE_APP_ID || '1:775532825046:web:7008e5577c0530ebe43c77',
  measurementId: env.VITE_FIREBASE_MEASUREMENT_ID || 'G-GS5G61BDFW'
}

export const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getFirestore(app)
export const googleProvider = new GoogleAuthProvider()

// Analytics only works in supported browsers (not in some private modes / blockers)
isSupported().then((ok) => { if (ok) getAnalytics(app) }).catch(() => {})
