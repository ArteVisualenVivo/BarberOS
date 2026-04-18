import { NextResponse } from "next/server";
import { db } from "@/lib/firebase-admin";

const LICENSE_CODE_REGEX = /^[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { code, barberiaId } = body;

    if (!code || !barberiaId) {
      return NextResponse.json({ ok: false, error: "invalid_code" }, { status: 400 });
    }

    const normalizedCode = String(code).toUpperCase().trim();
    if (!LICENSE_CODE_REGEX.test(normalizedCode)) {
      return NextResponse.json({ ok: false, error: "invalid_code" }, { status: 400 });
    }

    const licenseRef = db.collection("licenses").doc(normalizedCode);
    const licenseSnap = await licenseRef.get();

    if (!licenseSnap.exists) {
      return NextResponse.json({ ok: false, error: "invalid_code" }, { status: 404 });
    }

    const licenseData = licenseSnap.data();
    const appId = licenseData?.appId || licenseData?.project || null;

    const expiresAtField = licenseData?.expiresAt;
    const expiresAt = expiresAtField ? new Date(expiresAtField.toDate ? expiresAtField.toDate() : expiresAtField) : null;
    const now = new Date();

    if (
      !licenseData ||
      licenseData.status !== "active" ||
      licenseData.used === true ||
      appId !== "barberos" ||
      (expiresAt && now >= expiresAt)
    ) {
      return NextResponse.json({ ok: false, error: "invalid_code" }, { status: 400 });
    }

    const licenseExpiresAt = new Date(now);
    licenseExpiresAt.setDate(licenseExpiresAt.getDate() + 30);

    await db.collection("barberias").doc(barberiaId).update({
      plan: "pro",
      subscriptionStatus: "active",
      licenseCode: normalizedCode,
      licenseStartAt: now,
      licenseDurationDays: 30,
      licenseExpiresAt,
      trialExpired: true,
    });

    await licenseRef.update({
      used: true,
      barberia_id: barberiaId,
      activatedAt: now,
      appId: "barberos",
      licenseCode: normalizedCode,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("License activation error:", error);
    return NextResponse.json({ ok: false, error: "invalid_code" }, { status: 500 });
  }
}

