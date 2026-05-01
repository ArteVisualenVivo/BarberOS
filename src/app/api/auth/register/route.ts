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

function toE164ForAuth(value: unknown) {
  const raw = String(value || "").trim();
  if (!raw) return null;
  if (raw.startsWith("+")) return raw;
  const digits = raw.replace(/[^\d]/g, "");
  if (!digits) return null;
  return `+${digits}`;
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const nombreNormalizado = String(body?.nombreBarberia || "").trim();
    const email = body?.email ? String(body.email).trim() : null;
    const password = body?.password ? String(body.password) : null;
    const phoneNormalized = normalizePhoneNumber(body?.phoneNumber);
    const phoneE164 = toE164ForAuth(body?.phoneNumber);

    if (!phoneNormalized) {
      return NextResponse.json({ exists: false }, { status: 400 });
    }

    const usersRef = db.collection("users");
    const barberiasRef = db.collection("barberias");

    // 1) Unicidad por phoneNumber (negocio): si existe, no crear usuario ni barbería.
    const existingPhoneSnap = await usersRef
      .where("phoneNumber", "==", phoneNormalized)
      .limit(1)
      .get();

    if (!existingPhoneSnap.empty) {
      return NextResponse.json({ exists: true }, { status: 200 });
    }

    // 2) Si no existe, crear usuario en Firebase Auth (backend) y luego users + barberia.
    if (!email || !password) {
      // Requiere backend-driven registration para garantizar que no se creen cuentas
      // con emails diferentes usando el mismo phoneNumber.
      return NextResponse.json({ exists: false }, { status: 400 });
    }

    const slug = slugify(nombreNormalizado);
    const slugExistsSnap = await barberiasRef.where("slug", "==", slug).limit(1).get();

    if (!slug || !slugExistsSnap.empty) {
      return NextResponse.json({ exists: false }, { status: 400 });
    }

    const createdUser = await auth.createUser({
      email,
      password,
      ...(phoneE164 ? { phoneNumber: phoneE164 } : {}),
    });

    const uid = createdUser.uid;
    const userRef = usersRef.doc(uid);
    const barberiaRef = barberiasRef.doc();
    const trialStartAt = admin.firestore.Timestamp.now();

    await db.runTransaction(async (transaction) => {
      const phoneStillFree = await transaction.get(
        usersRef.where("phoneNumber", "==", phoneNormalized).limit(1)
      );
      if (!phoneStillFree.empty) {
        throw new Error("PHONE_EXISTS");
      }

      transaction.set(barberiaRef, {
        nombre: nombreNormalizado,
        slug,
        ownerId: uid,
        plan: "trial",
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
        barberiaId: barberiaRef.id,
        trialConsumed: true,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    if (error?.message === "PHONE_EXISTS") {
      return NextResponse.json({ exists: true }, { status: 200 });
    }

    console.error("Register API error:", error);

    return NextResponse.json({ exists: false }, { status: 500 });
  }
}
