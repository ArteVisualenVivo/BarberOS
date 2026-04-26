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
      return NextResponse.json({ ok: false, error: "invalid_code" }, { status: 400 });
    }

    const licenseData = licenseSnap.data();
    const status = String(licenseData?.status || "").trim().toLowerCase();
    const used =
      licenseData?.used === true ||
      String(licenseData?.used || "").trim().toLowerCase() === "true";
    const rawAppId = licenseData?.appId || licenseData?.project || "";
    const appId = String(rawAppId).trim().toLowerCase().replace(/\s+/g, "");

    const expiresAtField = licenseData?.expiresAt;
    const expiresAt = expiresAtField
      ? expiresAtField.toDate
        ? expiresAtField.toDate()
        : new Date(expiresAtField)
      : null;
    const now = new Date();

    if (
      status !== "active" ||
      used ||
      appId !== "barberos" ||
      !expiresAt ||
      now >= expiresAt
    ) {
      return NextResponse.json({ ok: false, error: "invalid_code" }, { status: 400 });
    }

    await db.collection("barberias").doc(barberiaId).update({
      plan: "pro",
      subscriptionStatus: "active",
    });

    await licenseRef.update({
      used: true,
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_code" }, { status: 500 });
  }
}
