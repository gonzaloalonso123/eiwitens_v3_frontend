import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const secrets =
  process.env.NODE_ENV === "production"
    ? {
        apiKey: process.env.FIREBASE_WEBAPP_CONFIG.apiKey,
        authDomain: process.env.FIREBASE_WEBAPP_CONFIG.authDomain,
        projectId: process.env.FIREBASE_WEBAPP_CONFIG.projectId,
        storageBucket: process.env.FIREBASE_WEBAPP_CONFIG.storageBucket,
        messagingSenderId: process.env.FIREBASE_WEBAPP_CONFIG.messagingSenderId,
        appId: process.env.FIREBASE_WEBAPP_CONFIG.appId,
        measurementId: process.env.FIREBASE_WEBAPP_CONFIG.measurementId,
      }
    : {
        apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
        authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
        messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
        appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
        measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
      };
const firebaseConfig = secrets;

// Initialize Firebase
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
