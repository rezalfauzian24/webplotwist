import admin from 'firebase-admin'
import { getApps } from 'firebase-admin/app'

// HAPUS baris import serviceAccount JSON yang lama, ganti dengan ini:
const serviceAccount = JSON.parse(
  process.env.FIREBASE_SERVICE_ACCOUNT || '{}'
)

if (getApps().length === 0) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    // tambahkan databaseURL jika kamu memakainya, jika tidak kosongkan saja
  })
}