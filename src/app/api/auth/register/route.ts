import { NextResponse } from "next/server";
import { auth, db } from "@/lib/firebase-admin";
import * as admin from "firebase-admin";

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");

function normalizePhoneNumber(value: unknown) {
  const raw = String(value || "").trim();
  const digits = raw.replace(/[^\d]/g, "");
  if (!digits) return null;
  // Store a stable representation for uniqueness checks (digits only).
  return digits;
}

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");
    const idToken = authHeader?.startsWith("Bearer ")
      ? authHeader.slice(7)
      : null;

    if (!idToken) {
      return NextResponse.json({ exists: false }, { status: 401 });
    }

    const decoded = await auth.verifyIdToken(idToken);
    const uid = decoded.uid;
    const email = decoded.email || null;

    const body = await req.json().catch(() => ({}));
    const nombreNormalizado = String(body?.nombreBarberia || "").trim();
    const phoneNormalized = normalizePhoneNumber(body?.phoneNumber);

    if (!nombreNormalizado || !phoneNormalized) {
      return NextResponse.json({ exists: false }, { status: 400 });
    }

    const usersRef = db.collection("users");
    const barberiasRef = db.collection("barberias");

    // 1) Unicidad por phoneNumber (negocio): si existe, no crear usuario ni barbería.
    // 2) Si el user ya existe (mismo uid), devolver exists.
    const userSnap = await usersRef.doc(uid).get();
    if (userSnap.exists) {
      return NextResponse.json({ exists: true }, { status: 200 });
    }

    // 3) Si el phone ya existe en cualquier user, devolver exists.
    const existingPhoneSnap = await usersRef
      .where("phoneNumber", "==", phoneNormalized)
      .limit(1)
      .get();

    if (!existingPhoneSnap.empty) {
      return NextResponse.json({ exists: true }, { status: 200 });
    }

    const slug = slugify(nombreNormalizado);
    const slugExistsSnap = await barberiasRef.where("slug", "==", slug).limit(1).get();

    if (!slug || !slugExistsSnap.empty) {
      return NextResponse.json({ exists: false }, { status: 400 });
    }

    // 4) Crear SOLO documentos en Firestore (no tocar Firebase Auth)
    const userRef = usersRef.doc(uid);
    const barberiaRef = barberiasRef.doc();
    const trialStartAt = admin.firestore.Timestamp.now();

    await db.runTransaction(async (transaction) => {
      // Re-check dentro de transacción para evitar carreras.
      const freshUser = await transaction.get(userRef);
      if (freshUser.exists) throw new Error("USER_EXISTS");

      const phoneStillFree = await transaction.get(usersRef.where("phoneNumber", "==", phoneNormalized).limit(1));
      if (!phoneStillFree.empty) throw new Error("PHONE_EXISTS");

      transaction.set(barberiaRef, {
        nombre: nombreNormalizado,
        slug,
        ownerId: uid,
        plan: "trial",
        phoneNumber: phoneNormalized,
        trialStartAt,
        trialDays: 7,
        subscriptionStatus: "trial",
        trialExpired: false,
        licenseCode: null,
        licenseStartAt: null,
        licenseDurationDays: 0,
        licenseExpiresAt: null,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      transaction.set(userRef, {
        uid,
        email,
        phoneNumber: phoneNormalized,
        role: "owner",
        barberiaId: null,
        trialConsumed: true,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    if (error?.message === "PHONE_EXISTS" || error?.message === "USER_EXISTS") {
      return NextResponse.json({ exists: true }, { status: 200 });
    }

    console.error("Register API error:", error);

    return NextResponse.json({ exists: false }, { status: 500 });
  }
}
