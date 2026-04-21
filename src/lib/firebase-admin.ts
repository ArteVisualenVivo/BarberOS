import * as admin from "firebase-admin";

let initialized = false;

/**
 * Lazy initialization of Firebase Admin
 * Only runs on server-side and at runtime (not during Next.js build)
 * No errors thrown if variables missing (normal during build phase)
 */
function initializeFirebaseAdmin() {
  if (initialized) return;

  initialized = true;

  // Don't initialize in browser context
  if (typeof window !== "undefined") {
    return;
  }

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY;

  // Skip initialization if credentials not available (normal during Vercel build)
  if (!projectId || !clientEmail || !privateKey) {
    console.warn(
      "⚠️  Firebase credentials not found in environment variables. " +
        "This is expected during the build phase. At runtime, ensure FIREBASE_PROJECT_ID, " +
        "FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY are configured."
    );
    return;
  }

  // Initialize Firebase Admin only once
  if (admin.apps.length === 0) {
    console.log("🔥 Firebase Admin - Initializing with project:", projectId);

    try {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId,
          clientEmail,
          privateKey: privateKey.replace(/\\n/g, "\n"),
        } as admin.ServiceAccount),
      });
      console.log("✅ Firebase Admin initialized successfully");
    } catch (error) {
      console.error("❌ Firebase initialization error:", error);
      throw error;
    }
  }
}

/**
 * Lazy-loaded Firestore instance
 * Initialize on first access, not at module load time
 * This prevents initialization during Next.js build phase
 */
export const db: admin.firestore.Firestore = new Proxy({} as any, {
  get(target, prop) {
    initializeFirebaseAdmin();

    if (admin.apps.length === 0) {
      throw new Error(
        "❌ Firebase Firestore not initialized. " +
          "Ensure FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY are set in environment variables."
      );
    }

    return admin.firestore()[prop as any];
  },
});

/**
 * Lazy-loaded Firebase Auth instance
 * Initialize on first access, not at module load time
 */
export const auth: admin.auth.Auth = new Proxy({} as any, {
  get(target, prop) {
    initializeFirebaseAdmin();

    if (admin.apps.length === 0) {
      throw new Error(
        "❌ Firebase Auth not initialized. " +
          "Ensure FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY are set in environment variables."
      );
    }

    return admin.auth()[prop as any];
  },
});