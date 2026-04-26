import * as admin from "firebase-admin";

let initialized = false;
let initError: any = null;

function initializeFirebaseAdmin() {
  if (initialized) return;
  initialized = true;

  if (typeof window !== "undefined") return;

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY;

  if (!projectId || !clientEmail || !privateKey) {
    initError = new Error(
      "Firebase Admin env vars missing (PROJECT_ID, CLIENT_EMAIL, PRIVATE_KEY)"
    );
    console.error("❌ Firebase Admin not initialized:", initError.message);
    return;
  }

  if (admin.apps.length === 0) {
    try {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId,
          clientEmail,
          privateKey: privateKey.replace(/\\n/g, "\n"),
        } as admin.ServiceAccount),
      });

      console.log("✅ Firebase Admin initialized");
    } catch (error) {
      initError = error;
      console.error("❌ Firebase init error:", error);
    }
  }
}

function ensureInit() {
  initializeFirebaseAdmin();

  if (initError) {
    throw new Error(
      "Firebase Admin initialization failed: " + initError.message
    );
  }

  if (admin.apps.length === 0) {
    throw new Error("Firebase Admin not initialized");
  }
}

export const db: admin.firestore.Firestore = new Proxy({} as any, {
  get(_, prop) {
    ensureInit();
    return admin.firestore()[prop as any];
  },
});

export const auth: admin.auth.Auth = new Proxy({} as any, {
  get(_, prop) {
    ensureInit();
    return admin.auth()[prop as any];
  },
});