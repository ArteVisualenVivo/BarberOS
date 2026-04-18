import { db } from "@/lib/firebase";
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import { PLANS, PlanId } from "@/lib/plans";

export interface PlanLimitResult {
  allowed: boolean;
  reason?: string;
}

export async function checkPlanLimits(barberiaId: string, action?: string): Promise<PlanLimitResult> {
  const barberiaDocRef = doc(db, "barberias", barberiaId);
  const barberiaDoc = await getDoc(barberiaDocRef);
  
  if (!barberiaDoc.exists()) {
    return { allowed: false, reason: "Barbería no encontrada" };
  }

  const data = barberiaDoc.data();
  const planId: PlanId = (data as any)?.plan || "free";
  const plan = PLANS[planId];

  if (plan.limits.turnosMonth === Infinity) {
    return { allowed: true };
  }

  // Count turnos for the current month
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  
  const turnosQuery = query(
    collection(db, "turnos"),
    where("barberiaId", "==", barberiaId),
    where("createdAt", ">=", startOfMonth)
  );
  const turnosSnapshot = await getDocs(turnosQuery);

  if (turnosSnapshot.size >= plan.limits.turnosMonth) {
    return { 
      allowed: false, 
      reason: `Has alcanzado el límite de ${plan.limits.turnosMonth} turnos mensuales de tu plan ${plan.name}.` 
    };
  }

  return { allowed: true };
}
