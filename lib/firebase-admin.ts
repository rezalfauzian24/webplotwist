import admin from 'firebase-admin'
import { getApps } from 'firebase-admin/app'

let serviceAccount;

try {
  // Kode ini otomatis merapikan format teks JSON yang masuk dari Vercel
  serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT || '{}');
} catch (error) {
  console.error("Format JSON Firebase bermasalah:", error);
  serviceAccount = {};
}

// Hanya berjalan jika konfigurasi Firebase-nya valid dan lengkap
if (getApps().length === 0 && serviceAccount.project_id) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  })
}