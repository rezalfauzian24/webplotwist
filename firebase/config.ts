import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getDatabase } from 'firebase/database'
import { getFirestore } from 'firebase/firestore'
import { getAnalytics } from 'firebase/analytics'

const firebaseConfig = {
  apiKey: "AIzaSyC2kSiTJ5wKrlIbRslIgxSTNegJjbZmXU4",
  authDomain: "plotwist-3b159.firebaseapp.com",
  databaseURL: "https://plotwist-3b159-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "plotwist-3b159",
  storageBucket: "plotwist-3b159.firebasestorage.app",
  messagingSenderId: "112967112360",
  appId: "1:112967112360:web:80e7afbd876df06363149d",
  measurementId: "G-LBGWRXWTZR"
}

const app = initializeApp(firebaseConfig)

export const database = getDatabase(app)   // Realtime DB — tetap ada, biar komponen lain tidak error
export const db       = getFirestore(app)  // ← Firestore, ini yang dipakai ProfilePage
export const auth     = getAuth(app)
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null

export default app