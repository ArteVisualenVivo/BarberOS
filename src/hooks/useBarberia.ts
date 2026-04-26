"use client";

import { useEffect, useState } from "react";
import { getBarberiasByOwner } from "@/lib/tenants";
import { useAuth } from "./useAuth";

export const useBarberia = () => {
  const { user } = useAuth();
  const [barberia, setBarberia] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        setLoading(true);

        // Wait for user to be available
        if (!user?.uid) {
          setBarberia(null);
          setLoading(false);
          return;
        }

        const data = await getBarberiasByOwner(user.uid);

        if (!active) return;

        setBarberia(data?.[0] || null);
      } catch (error) {
        console.error("Error in useBarberia:", error);
        setBarberia(null);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    load();

    return () => {
      active = false;
    };
  }, [user?.uid]);

  return { barberia, loading };
};