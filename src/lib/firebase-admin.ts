import * as admin from "firebase-admin";

if (!admin.apps.length) {
  try {
    const serviceAccount = {
      type: "service_account",
      project_id: process.env.FIREBASE_PROJECT_ID,
      client_email: process.env.FIREBASE_CLIENT_EMAIL,
      private_key: process.env.FIREBASE_PRIVATE_KEY
        ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n")
        : undefined,
    };

    if (serviceAccount.project_id && serviceAccount.client_email && serviceAccount.private_key) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
      });
    } else {
      throw new Error("Missing Firebase Admin service account env vars: FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY");
    }
  } catch (error) {
    console.error("Firebase admin initialization error", error);
  }
}

const db = admin.firestore();
const auth = admin.auth();

export { db, auth };
