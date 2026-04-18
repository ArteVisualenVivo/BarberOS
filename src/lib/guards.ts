import { redirect } from "next/navigation";
import { getUserData } from "./auth";
import { PLANS, PlanId } from "./plans";

export async function guardBarberiaLimit(userId: string) {
  const userData = await getUserData(userId);
  if (!userData) redirect("/login");

  // Plan logic for creating multiple barberies
  const planId: PlanId = "free"; // Default or fetch from owner's primary barberia
  const plan = PLANS[planId];

  if (!plan.limits.multiBarberia && userData.barberiaId) {
    throw new Error("Tu plan actual solo permite una barbería.");
  }
}
