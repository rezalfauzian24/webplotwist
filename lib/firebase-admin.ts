import admin from 'firebase-admin'
import { getApps } from 'firebase-admin/app'
import serviceAccount from '../service-account.json'

if (getApps().length === 0) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
  })
}

export const adminDb = admin.firestore()