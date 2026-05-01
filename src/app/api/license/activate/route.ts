import { NextResponse } from "next/server";
import { db } from "@/lib/firebase-admin";
import { Timestamp } from "firebase-admin/firestore";
import { initializeApp, getApps } from "firebase/app";
import { getFirestore, doc, setDoc } from "firebase/firestore";

const barberosApp =
  getApps().find((app) => app.name === "barberos-main") ||
  initializeApp(
    {
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
      messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
    },
    "barberos-main"
  );

const dbBarberos = getFirestore(barberosApp);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { code, barberiaId } = body;

    console.log("ACTIVATE INPUT:", { barberiaId, code });
    console.log("[ACTIVATE] code:", code);
    console.log("[ACTIVATE] barberiaId:", barberiaId);

    if (!code || !barberiaId) {
      return new Response(
        JSON.stringify({ success: false, ok: false, error: "missing_data" }),
        { status: 200 }
      );
    }

    const normalizedCode = String(code).toUpperCase().trim();

    let licenseSnap;

    try {
      const licenseRef = db.collection("licenses").doc(normalizedCode);
      licenseSnap = await licenseRef.get();
    } catch (err: any) {
      console.error("[ACTIVATE] DB ERROR:", err);

      return new Response(
        JSON.stringify({
          success: false,
          ok: false,
          error: "firebase_not_ready",
          message: err?.message || "db error",
        }),
        { status: 200 }
      );
    }

    console.log("[ACTIVATE] exists:", licenseSnap.exists);

    if (!licenseSnap.exists) {
      return new Response(
        JSON.stringify({
          success: false,
          ok: false,
          error: "invalid_code",
        }),
        { status: 200 }
      );
    }

    const license = licenseSnap.data() || {};
    const startRaw = license?.licenseStartAt;
    const endRaw = license?.expiresAt;

    if (!startRaw || !endRaw) {
      return new Response(
        JSON.stringify({
          success: false,
          ok: false,
          error: "invalid_license_dates",
        }),
        { status: 200 }
      );
    }

    const startDate =
      startRaw instanceof Timestamp ? startRaw.toDate() : new Date(startRaw);

    const endDate =
      endRaw instanceof Timestamp ? endRaw.toDate() : new Date(endRaw);

    if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
      return new Response(
        JSON.stringify({
          success: false,
          ok: false,
          error: "invalid_license_dates",
        }),
        { status: 200 }
      );
    }

    await db.collection("licenses").doc(normalizedCode).update({
      status: "active",
      active: true,
      used: true,
      activatedAt: new Date(),
      licenseStartAt: startDate,
    });

    await setDoc(doc(dbBarberos, "barberias", barberiaId), {
      licenseCode: code,
      subscriptionStatus: "active",
      status: "active",
      plan: "pro",
      licenseStartAt: startDate,
      licenseExpiresAt: endDate,
      updatedAt: new Date(),
    }, { merge: true });

    console.log("ACTIVATE SUCCESS:", {
      barberiaId,
      code,
      saasUpdated: true,
      barberiaUpdated: true
    });

    return new Response(
      JSON.stringify({
        success: true,
        ok: true,
        status: "active",
      }),
      { status: 200 }
    );
  } catch (error: any) {
    console.error("[ACTIVATE ERROR FULL]:", error);

    return new Response(
      JSON.stringify({
        success: false,
        ok: false,
        error: "server_error",
        message: error?.message || "Unknown error",
      }),
      { status: 200 }
    );
  }
}
