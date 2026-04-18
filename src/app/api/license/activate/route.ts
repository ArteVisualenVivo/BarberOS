import { NextResponse } from "next/server";
import { db } from "@/lib/firebase-admin";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { code, barberiaId } = body;

    if (!code || !barberiaId) {
      return NextResponse.json({ ok: false, error: "invalid_code" }, { status: 400 });
    }

    const normalizedCode = String(code).toUpperCase().trim();
    const licenseRef = db.collection("licenses").doc(normalizedCode);
    const licenseSnap = await licenseRef.get();

    if (!licenseSnap.exists) {
      return NextResponse.json({ ok: false, error: "invalid_code" }, { status: 404 });
    }

    const licenseData = licenseSnap.data();

    if (
      !licenseData ||
      licenseData.status !== "active" ||
      licenseData.used === true
    ) {
      return NextResponse.json({ ok: false, error: "invalid_code" }, { status: 400 });
    }

    const now = new Date();
    const expiresAt = new Date(now);
    expiresAt.setDate(expiresAt.getDate() + 30);

    await db.collection("barberias").doc(barberiaId).update({
      plan: "pro",
      subscriptionStatus: "active",
      licenseCode: code,
      licenseStartAt: now,
      licenseDurationDays: 30,
      licenseExpiresAt: expiresAt,
      trialExpired: true,
    });

    await licenseRef.update({
      used: true,
      barberia_id: barberiaId,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("License activation error:", error);
    return NextResponse.json({ ok: false, error: "invalid_code" }, { status: 500 });
  }
}
