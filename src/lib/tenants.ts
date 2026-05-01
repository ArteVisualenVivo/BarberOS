import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";

export interface Barberia {
  id: string;
  nombre: string;
  slug: string;
  ownerId: string;
  plan: string;
  createdAt: any;
}

/**
 * OBTENER BARBERIAS POR OWNER
 */
export const getBarberiasByOwner = async (ownerId: string) => {
  if (!ownerId) return [];

  const q = query(collection(db, "barberias"), where("ownerId", "==", ownerId));
  const snap = await getDocs(q);

  return snap.docs.map((d) => ({
    id: d.id,
    ...d.data(),
  })) as Barberia[];
};

/**
 * OBTENER BARBERIA POR SLUG
 */
export const getBarberiaBySlug = async (slug: string) => {
  if (!slug) return null;

  const q = query(collection(db, "barberias"), where("slug", "==", slug));
  const snap = await getDocs(q);

  if (snap.empty) return null;

  const firstDoc = snap.docs[0];

  return {
    id: firstDoc.id,
    ...firstDoc.data(),
  } as Barberia;
};

/**
 * ACCESO DASHBOARD SIMPLE
 */
export const hasDashboardAccess = (barberia: any) => {
  if (!barberia) return false;

  try {
    const parseDate = (value: any) => {
      if (!value) return null;
      if (typeof value?.toDate === "function") return value.toDate();
      if (typeof value?.seconds === "number") return new Date(value.seconds * 1000);

      const parsed = new Date(value);
      return Number.isNaN(parsed.getTime()) ? null : parsed;
    };

    // Suscripcion activa solo si sigue vigente.
    if (
      barberia?.subscriptionStatus === "active" ||
      barberia?.subscriptionStatus === "pro" ||
      barberia?.plan === "pro"
    ) {
      const expiresAt = parseDate(barberia?.licenseExpiresAt);

      if (!expiresAt) return false;

      return Date.now() <= expiresAt.getTime();
    }

    // Calculo de trial.
    const trialStart =
      barberia?.trialStartAt?.toDate?.()?.getTime?.() ??
      (barberia?.trialStartAt ? new Date(barberia?.trialStartAt).getTime() : null);

    const trialDays = Number(barberia?.trialDays) || 7;

    if (trialStart && !Number.isNaN(trialStart)) {
      const trialEnds = trialStart + trialDays * 24 * 60 * 60 * 1000;
      return Date.now() < trialEnds;
    }

    return false;
  } catch (error) {
    console.error("Error in hasDashboardAccess:", error);
    return false;
  }
};
