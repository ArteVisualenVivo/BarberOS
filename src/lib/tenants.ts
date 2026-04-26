import { collection, getDocs, query, where, doc, getDoc } from "firebase/firestore";
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
 * OBTENER BARBERÍAS POR OWNER
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
 * OBTENER BARBERÍA POR SLUG
 */
export const getBarberiaBySlug = async (slug: string) => {
  if (!slug) return null;

  const q = query(collection(db, "barberias"), where("slug", "==", slug));
  const snap = await getDocs(q);

  if (snap.empty) return null;

  const doc = snap.docs[0];

  return {
    id: doc.id,
    ...doc.data(),
  } as Barberia;
};

/**
 * ACCESO DASHBOARD SIMPLE
 */
export const hasDashboardAccess = (barberia: any) => {
  if (!barberia) return false;

  // acceso directo por suscripción activa
  if (
    barberia?.subscriptionStatus === "active" ||
    barberia?.subscriptionStatus === "pro" ||
    barberia?.plan === "pro"
  ) {
    return true;
  }

  // cálculo de trial
  const trialStart =
    barberia?.trialStartAt?.toDate?.()?.getTime?.() ??
    (barberia?.trialStartAt ? new Date(barberia?.trialStartAt).getTime() : null);

  const trialDays = Number(barberia?.trialDays) || 7;

  if (trialStart) {
    const trialEnds = trialStart + trialDays * 24 * 60 * 60 * 1000;
    return Date.now() < trialEnds;
  }

  return false;
};