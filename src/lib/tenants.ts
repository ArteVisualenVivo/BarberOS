import { db } from "./firebase";
import { collection, query, where, getDocs, doc, updateDoc } from "firebase/firestore";
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
  subscriptionStatus?: "trial" | "inactive" | "active";
  licenseCode?: string;
  licenseStartAt?: any;
  licenseDurationDays?: number;
  licenseExpiresAt?: any;
  horarios?: Record<string, HorarioDia>;
  logoUrl?: string;
  descripcion?: string;
  telefono?: string;
  direccion?: string;
}

const toDate = (value: any): Date | null => {
  if (!value) return null;
  if (typeof value.toDate === "function") return value.toDate();
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

export function isValidLicenseCode(value: any): boolean {
  if (!value || typeof value !== "string") return false;
  return /^[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/.test(value.toUpperCase().trim());
}

export function isTrialExpired(barberia: Barberia): boolean {
  if (barberia.plan !== "trial") return false;
  if (barberia.trialExpired) return true;
  if (!barberia.trialStartAt || !barberia.trialDays) return true;

  const startDate = toDate(barberia.trialStartAt);
  if (!startDate) return true;

  const expiresAt = new Date(startDate);
  expiresAt.setDate(expiresAt.getDate() + barberia.trialDays);

  return new Date() >= expiresAt;
}

export function hasActiveTrial(barberia: Barberia): boolean {
  if (barberia.plan !== "trial") return false;
  if (barberia.trialExpired) return false;
  if (!barberia.trialStartAt || !barberia.trialDays) return false;

  const startDate = toDate(barberia.trialStartAt);
  if (!startDate) return false;

  const expiresAt = new Date(startDate);
  expiresAt.setDate(expiresAt.getDate() + barberia.trialDays);

  return new Date() < expiresAt;
}

export function hasActiveProLicense(barberia: Barberia): boolean {
  if (barberia.plan !== "pro") return false;
  if (barberia.subscriptionStatus !== "active") return false;
  if (!barberia.licenseCode || !isValidLicenseCode(barberia.licenseCode)) return false;
  if (!barberia.licenseStartAt || !barberia.licenseExpiresAt) return false;

  const expiresAt = toDate(barberia.licenseExpiresAt);
  if (!expiresAt) return false;

  return new Date() < expiresAt;
}

export function hasDashboardAccess(barberia: Barberia): boolean {
  return hasActiveTrial(barberia) || hasActiveProLicense(barberia);
}

function normalizeSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/^-+|-+$/g, "");
}

export async function getBarberiaBySlug(slug: string) {
  if (!slug) return null;

  const normalizedSlug = normalizeSlug(slug);
  if (!normalizedSlug) return null;

  const q = query(
    collection(db, "barberias"),
    where("slug", "==", normalizedSlug)
  );

  let snapshot = await getDocs(q);

  if (!snapshot || snapshot.empty) {
    snapshot = await getDocs(collection(db, "barberias"));
  }

  if (!snapshot || snapshot.empty) return null;

  for (const docSnap of snapshot.docs) {
    const data = docSnap.data();
    const storedSlug = normalizeSlug((data.slug || "").toString());

    if (storedSlug === normalizedSlug) {
      return {
        id: docSnap.id,
        nombre: data.nombre ?? "",
        ownerId: data.ownerId ?? "",
        plan: data.plan ?? "",
        createdAt: data.createdAt ?? null,
        slug: storedSlug,
        ...data,
      };
    }
  }

  return null;
}

export async function getBarberiasByOwner(ownerId: string): Promise<Barberia[]> {
  const q = query(collection(db, "barberias"), where("ownerId", "==", ownerId));
  const querySnapshot = await getDocs(q);
  
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Barberia));
}
