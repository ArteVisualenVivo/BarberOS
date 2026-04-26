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
      console.log("DEBUG useBarberia: Fetching for user:", user.uid);
      const barberias = await getBarberiasByOwner(user.uid);
      console.log("DEBUG useBarberia: Found barberias:", barberias);
      if (barberias.length > 0) {
        console.log("DEBUG useBarberia: Setting barberia:", barberias[0]);
        setBarberia(barberias[0]);
      } else {
        console.log("DEBUG useBarberia: No barberias found");
      }
    } else {
      console.log("DEBUG useBarberia: No user");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchBarberia();
  }, [user]);

  return { barberia, loading, refresh: fetchBarberia };
};
