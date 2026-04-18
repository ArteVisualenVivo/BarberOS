import { db } from "./firebase";
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  doc, 
  getDoc, 
  updateDoc, 
  addDoc, 
  serverTimestamp,
  Timestamp 
} from "firebase/firestore";

export interface LicenseData {
  active: boolean;
  code: string;
  project: string;
  email: string;
  uid: string;
  status: "active" | "expired" | "revoked";
  expiresAt?: any;
}

const LICENSE_KEY = "saascontrol_license";

/**
 * Valida la licencia directamente con SaaSControl (Firestore)
 */
export const validateLicenseWithSaaSControl = async (
  code: string, 
  project: string, 
  email: string, 
  uid: string
): Promise<{ valid: boolean; reason?: string }> => {
  try {
    const q = query(
      collection(db, "licenses"),
      where("code", "==", code),
      where("project", "==", project)
    );
    
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      return { valid: false, reason: "NOT_FOUND" };
    }

    const licenseDoc = snapshot.docs[0];
    const data = licenseDoc.data();

    // 1. Verificar usuario
    if (data.email !== email || data.uid !== uid) {
      return { valid: false, reason: "USER_MISMATCH" };
    }

    // 2. Verificar estado
    if (data.status === "revoked") {
      return { valid: false, reason: "REVOKED" };
    }

    // 3. Verificar expiración
    if (data.expiresAt && data.expiresAt.toDate() < new Date()) {
      // Actualizar estado a expired si no lo estaba
      if (data.status !== "expired") {
        await updateDoc(doc(db, "licenses", licenseDoc.id), { status: "expired" });
      }
      return { valid: false, reason: "EXPIRED" };
    }

    if (data.status !== "active") {
      return { valid: false, reason: "INACTIVE" };
    }

    return { valid: true };
  } catch (error) {
    console.error("Error al validar licencia con SaaSControl:", error);
    return { valid: false, reason: "SERVER_ERROR" };
  }
};

/**
 * Obtiene los datos de la licencia guardados en localStorage
 */
export const getLocalLicense = (): LicenseData | null => {
  if (typeof window === "undefined") return null;
  const data = localStorage.getItem(LICENSE_KEY);
  if (!data) return null;
  try {
    return JSON.parse(data);
  } catch (e) {
    return null;
  }
};

/**
 * Guarda la licencia en localStorage
 */
export const saveLocalLicense = (data: LicenseData) => {
  if (typeof window === "undefined") return;
  localStorage.setItem(LICENSE_KEY, JSON.stringify(data));
};

/**
 * Elimina la licencia local
 */
export const clearLocalLicense = () => {
  if (typeof window === "undefined") return;
  localStorage.removeItem(LICENSE_KEY);
};
