"use client";

import { useEffect, useState } from "react";
import { getBarberiasByOwner } from "@/lib/tenants";
import { useAuth } from "./useAuth";

export const useBarberia = () => {
  const { user, loading: authLoading } = useAuth();
  const [barberia, setBarberia] = useState<any>(null);
  const [barberiaLoading, setBarberiaLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let active = true;

    if (authLoading) {
      setBarberiaLoading(true);
      return () => {
        active = false;
      };
    }

    const load = async () => {
      try {
        setBarberiaLoading(true);

        if (!user?.uid) {
          setBarberia(null);
          setBarberiaLoading(false);
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
          setBarberiaLoading(false);
        }
      }
    };

    load();

    return () => {
      active = false;
    };
  }, [authLoading, user?.uid, refreshKey]);

  return {
    barberia,
    loading: authLoading || barberiaLoading,
    refresh: () => setRefreshKey((current) => current + 1),
  };
};
