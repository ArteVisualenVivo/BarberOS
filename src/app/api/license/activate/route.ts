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
import { NextResponse } from "next/server";
import { db } from "@/lib/firebase-admin";

const LICENSE_CODE_REGEX = /^[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/;

export async function POST(req: Request) {

  // 🔥 DEBUG CRÍTICO: confirma si la API está siendo llamada
  console.log("🔥 API LICENSE HIT");

  try {
    console.log("🔥 [1] ENTER /api/license/activate");

    const body = await req.json();
    console.log("📦 [2] BODY RECEIVED:", body);

    const { code, barberiaId } = body;

    if (!code || !barberiaId) {
      console.log("❌ Missing code or barberiaId");
      return NextResponse.json({ ok: false, error: "invalid_code" }, { status: 400 });
    }

    const normalizedCode = String(code).toUpperCase().trim();
    console.log("🔑 [3] NORMALIZED CODE:", normalizedCode);

    if (!LICENSE_CODE_REGEX.test(normalizedCode)) {
      console.log("❌ Invalid format code");
      return NextResponse.json({ ok: false, error: "invalid_code" }, { status: 400 });
    }

    console.log("🧠 [4] BEFORE FIRESTORE QUERY");

    console.log("LOOKING FOR DOC ID:", normalizedCode);
    const licenseRef = db.collection("licenses").doc(normalizedCode);
    const licenseSnap = await licenseRef.get();

    console.log("DOC EXISTS:", licenseSnap.exists);
    console.log("DOC ID REAL:", licenseSnap.id);
    console.log("📄 [5] LICENSE SNAP RECEIVED");

    if (!licenseSnap.exists) {
      console.log("❌ License not found");
      const allDocsSnap = await db.collection("licenses").get();
      const allDocIds = allDocsSnap.docs.map((doc) => doc.id);
      console.log("ALL LICENSES IN COLLECTION:", allDocIds);
      return NextResponse.json({ ok: false, error: "invalid_code" }, { status: 404 });
    }

    const licenseData = licenseSnap.data();
    console.log("LICENSE DEBUG DATA:", licenseData);
    console.log("LICENSE DEBUG SNAPSHOT ID:", licenseSnap.id);
    console.log("LICENSE DEBUG EXISTS:", licenseSnap.exists);
    console.log("LICENSE DEBUG RAW:", JSON.stringify(licenseData, null, 2));
    const appId =
      licenseData?.appId || licenseData?.project
        ? String(licenseData?.appId || licenseData?.project)
            .trim()
            .toLowerCase()
            .replace(/\s+/g, "")
        : null;

    const expiresAtField = licenseData?.expiresAt;
    const expiresAt = expiresAtField
      ? new Date(expiresAtField.toDate ? expiresAtField.toDate() : expiresAtField)
      : null;

    const now = new Date();
    const used =
      licenseData?.used === true ||
      (typeof licenseData?.used === "string" && licenseData.used.trim().toLowerCase() === "true");

    if (
      !licenseData ||
      licenseData.status !== "active" ||
      used ||
      appId !== "barberos" ||
      (expiresAt && now >= expiresAt)
    ) {
      console.log("❌ License invalid or expired");
      return NextResponse.json({ ok: false, error: "invalid_code" }, { status: 400 });
    }

    console.log("✅ License valid, activating...");

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

    console.log("🎉 [6] ACTIVATION SUCCESS");

    return NextResponse.json({ ok: true });

  } catch (error) {
    console.error("🔥 License activation error:", error);

    return NextResponse.json(
      { ok: false, error: "invalid_code" },
      { status: 500 }
    );
  }
}