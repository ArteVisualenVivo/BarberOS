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

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");
    const token = authHeader?.startsWith("Bearer ")
      ? authHeader.slice(7)
      : null;

    if (!token) {
      return NextResponse.json(
        { success: false, error: "unauthorized" },
        { status: 401 }
      );
    }

    const decodedToken = await auth.verifyIdToken(token);
    const uid = decodedToken.uid;
    const email = decodedToken.email || null;
    const { nombreBarberia } = await req.json();
    const nombreNormalizado = String(nombreBarberia || "").trim();

    if (!nombreNormalizado) {
      return NextResponse.json(
        { success: false, error: "missing_barberia_name" },
        { status: 400 }
      );
    }

    const usersRef = db.collection("users");
    const barberiasRef = db.collection("barberias");
    const userRef = usersRef.doc(uid);

    const existingBarberiaSnap = await barberiasRef
      .where("ownerId", "==", uid)
      .limit(1)
      .get();

    if (!existingBarberiaSnap.empty) {
      const barberia = existingBarberiaSnap.docs[0];

      await userRef.set(
        {
          barberiaId: barberia.id,
          trialConsumed: true,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        },
        { merge: true }
      );

      return NextResponse.json(
        {
          success: false,
          error: "barberia_already_exists",
          redirectTo: "/dashboard",
        },
        { status: 409 }
      );
    }

    if (email) {
      const existingTrialByEmail = await usersRef
        .where("email", "==", email)
        .where("trialConsumed", "==", true)
        .limit(1)
        .get();

      const reusedTrial = existingTrialByEmail.docs.find((doc) => doc.id !== uid);

      if (reusedTrial) {
        return NextResponse.json(
          {
            success: false,
            error: "trial_already_used",
            redirectTo: "/login",
          },
          { status: 409 }
        );
      }
    }

    const userSnap = await userRef.get();
    const userData = userSnap.exists ? userSnap.data() : null;

    if (userData?.barberiaId || userData?.trialConsumed) {
      return NextResponse.json(
        {
          success: false,
          error: "trial_already_used",
          redirectTo: userData?.barberiaId ? "/dashboard" : "/login",
        },
        { status: 409 }
      );
    }

    const slug = slugify(nombreNormalizado);
    const slugExistsSnap = await barberiasRef.where("slug", "==", slug).limit(1).get();

    if (!slug || !slugExistsSnap.empty) {
      return NextResponse.json(
        {
          success: false,
          error: "invalid_or_taken_slug",
        },
        { status: 400 }
      );
    }

    const barberiaRef = barberiasRef.doc();
    const trialStartAt = admin.firestore.Timestamp.now();

    await db.runTransaction(async (transaction) => {
      const freshUserSnap = await transaction.get(userRef);
      const freshUserData = freshUserSnap.exists ? freshUserSnap.data() : null;

      if (freshUserData?.barberiaId || freshUserData?.trialConsumed) {
        throw new Error("TRIAL_ALREADY_USED");
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

      transaction.set(
        userRef,
        {
          uid,
          email,
          role: freshUserData?.role || "owner",
          barberiaId: barberiaRef.id,
          // Marca permanente para evitar que el mismo usuario reinicie el trial.
          trialConsumed: true,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        },
        { merge: true }
      );
    });

    return NextResponse.json({
      success: true,
      barberiaId: barberiaRef.id,
      redirectTo: "/dashboard",
    });
  } catch (error: any) {
    if (error?.message === "TRIAL_ALREADY_USED") {
      return NextResponse.json(
        {
          success: false,
          error: "trial_already_used",
          redirectTo: "/dashboard",
        },
        { status: 409 }
      );
    }

    console.error("Register API error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "server_error",
      },
      { status: 500 }
    );
  }
}
