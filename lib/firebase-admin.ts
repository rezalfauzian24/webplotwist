import admin from 'firebase-admin'
import { getApps } from 'firebase-admin/app'

let serviceAccount;

try {
  serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT || '{}');
} catch (error) {
  console.error("Format JSON Firebase bermasalah:", error);
  serviceAccount = {};
}

if (getApps().length === 0 && serviceAccount.project_id) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  })
}

const adminDb = admin.firestore();

export { adminDb };
export default admin;