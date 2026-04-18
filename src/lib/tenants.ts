import { db } from "./firebase";
import { collection, query, where, getDocs, limit } from "firebase/firestore";
import { PlanId } from "./plans";

export interface HorarioDia {
  abierto: boolean;
  inicio: string;
  fin: string;
}

export interface Barberia {
  id: string;
  nombre: string;
  slug: string;
  ownerId: string;
  plan: PlanId;
  createdAt: any;
  trialStartAt?: any;
  trialDays?: number;
  trialExpired?: boolean;
  subscriptionStatus?: "inactive" | "active";
  licenseCode?: string;
  horarios?: Record<string, HorarioDia>;
  logoUrl?: string;
  descripcion?: string;
  telefono?: string;
  direccion?: string;
}

export function isTrialExpired(barberia: Barberia): boolean {
  if (barberia.plan === "pro") return false;
  if (barberia.trialExpired) return true;
  if (!barberia.trialStartAt || !barberia.trialDays) return true;

  const startDate = typeof barberia.trialStartAt?.toDate === "function"
    ? barberia.trialStartAt.toDate()
    : new Date(barberia.trialStartAt);

  if (Number.isNaN(startDate.getTime())) return true;

  const expiresAt = new Date(startDate);
  expiresAt.setDate(expiresAt.getDate() + barberia.trialDays);

  return new Date() >= expiresAt;
}

export async function getBarberiaBySlug(slug: string): Promise<Barberia | null> {
  const q = query(collection(db, "barberias"), where("slug", "==", slug), limit(1));
  const querySnapshot = await getDocs(q);
  
  if (querySnapshot.empty) return null;

  const doc = querySnapshot.docs[0];
  return { id: doc.id, ...doc.data() } as Barberia;
}

export async function getBarberiasByOwner(ownerId: string): Promise<Barberia[]> {
  const q = query(collection(db, "barberias"), where("ownerId", "==", ownerId));
  const querySnapshot = await getDocs(q);
  
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Barberia));
}
