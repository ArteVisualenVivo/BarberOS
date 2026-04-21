"use client";

import { useEffect, useState } from "react";
import { getBarberiasByOwner } from "@/lib/tenants";
import { getCurrentUser, authReadyPromise } from "@/lib/auth";

export const useBarberia = () => {
  const [barberia, setBarberia] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const load = async () => {
      setLoading(true);

      // 🔑 Espera REAL a Firebase Auth
      await authReadyPromise;

      const user = getCurrentUser();

      if (!user?.uid) {
        setLoading(false);
        return;
      }

      const data = await getBarberiasByOwner(user.uid);

      if (!active) return;

      setBarberia(data?.[0] || null);
      setLoading(false);
    };

    load();

    return () => {
      active = false;
    };
  }, []);

  return { barberia, loading };
};