export type PlanId = "trial" | "free" | "pro";

export interface Plan {
  id: PlanId;
  name: string;
  price: number;
  priceId?: string;
  limits: {
    turnosMonth: number;
    multiBarberia: boolean;
  };
}

export const PLANS: Record<PlanId, Plan> = {
  trial: {
    id: "trial",
    name: "Trial 7 días",
    price: 0,
    limits: {
      turnosMonth: Infinity,
      multiBarberia: false,
    },
  },
  free: {
    id: "free",
    name: "Plan Free",
    price: 0,
    limits: {
      turnosMonth: 20,
      multiBarberia: false,
    },
  },
  pro: {
    id: "pro",
    name: "Plan Pro",
    price: 29,
    limits: {
      turnosMonth: Infinity,
      multiBarberia: true,
    },
  },
};
