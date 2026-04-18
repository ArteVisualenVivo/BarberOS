"use client";

import { useState, useEffect } from "react";
import { getBarberiasByOwner, Barberia } from "@/lib/tenants";
import { useAuth } from "@/hooks/useAuth";

export const useBarberia = () => {
  const { user } = useAuth();
  const [barberia, setBarberia] = useState<Barberia | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchBarberia = async () => {
    if (user) {
      const barberias = await getBarberiasByOwner(user.uid);
      if (barberias.length > 0) {
        setBarberia(barberias[0]); // Por ahora tomamos la primera
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchBarberia();
  }, [user]);

  return { barberia, loading, refresh: fetchBarberia };
};
