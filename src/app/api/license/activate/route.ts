import { NextResponse } from "next/server";
import { db } from "@/lib/firebase-admin";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { code, barberiaId } = body;

    console.log("[ACTIVATE] code:", code);
    console.log("[ACTIVATE] barberiaId:", barberiaId);

    if (!code || !barberiaId) {
      return NextResponse.json(
        { ok: false, error: "missing_data" },
        { status: 400 }
      );
    }

    const normalizedCode = String(code).toUpperCase().trim();

    let licenseSnap;
    try {
      const licenseRef = db.collection("licenses").doc(normalizedCode);
      licenseSnap = await licenseRef.get();
    } catch (err: any) {
      console.error("[ACTIVATE] DB ERROR:", err);

      return NextResponse.json(
        {
          ok: false,
          error: "firebase_not_ready",
          message: err?.message || "db error",
        },
        { status: 500 }
      );
    }

    console.log("[ACTIVATE] exists:", licenseSnap.exists);

    if (!licenseSnap.exists) {
      return NextResponse.json(
        { ok: false, error: "invalid_code" },
        { status: 400 }
      );
    }

    const license = licenseSnap.data();

    if (!license) {
      return NextResponse.json(
        { ok: false, error: "invalid_code" },
        { status: 400 }
      );
    }

    if (license.status && license.status !== "active") {
      return NextResponse.json(
        { ok: false, error: "invalid_code" },
        { status: 400 }
      );
    }

    if (license.expiresAt) {
      let expiresDate: Date | null = null;

      try {
        if (typeof license.expiresAt?.toDate === "function") {
          expiresDate = license.expiresAt.toDate();
        } else if (license.expiresAt instanceof Date) {
          expiresDate = license.expiresAt;
        } else if (typeof license.expiresAt === "number") {
          expiresDate = new Date(license.expiresAt);
        } else if (typeof license.expiresAt === "string") {
          expiresDate = new Date(license.expiresAt);
        }
      } catch {
        expiresDate = null;
      }

      if (expiresDate && expiresDate.getTime() < Date.now()) {
        return NextResponse.json(
          { ok: false, error: "expired_license" },
          { status: 400 }
        );
      }
    }

    await db.collection("barberias").doc(barberiaId).update({
      licenseCode: normalizedCode,
      subscriptionStatus: "active",
      activatedAt: new Date(),
    });

    return NextResponse.json({
      ok: true,
      message: "License activated successfully",
    });
  } catch (error: any) {
    console.error("[ACTIVATE ERROR FULL]:", error);

    return NextResponse.json(
      {
        ok: false,
        error: "server_error",
        message: error?.message || "Unknown error",
      },
      { status: 500 }
    );
  }
}