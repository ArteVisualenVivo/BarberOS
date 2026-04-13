'use client'

import { useEffect, useState } from "react";
import Link from "next/link";
import { Scissors, Clock, Star, Loader2 } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

type Barberia = {
  id: string;
  nombre: string;
  slug: string;
  email_owner: string | null;
  telefono: string | null;
  plan_activo?: boolean | null;
  created_at: string;
};

export default function HomePage() {
  const searchParams = useSearchParams();
  const slug = searchParams.get("s");
  const [barberia, setBarberia] = useState<Barberia | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchBarberia = async () => {
      if (!slug) {
        setLoading(false);
        return;
      }

      const { data } = await supabase
        .from('barberias')
        .select('*')
        .eq('slug', slug)
        .single();

      if (data) setBarberia(data as Barberia);
      setLoading(false);
    };

    fetchBarberia();
  }, [slug, supabase]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4 w-full">
        <Loader2 className="w-10 h-10 text-[#D4AF37] animate-spin" />
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#D4AF37]/50">
          Cargando BarberOS
        </p>
      </div>
    );
  }

  const planActivo = barberia?.plan_activo ?? true;

  if (slug && barberia && !planActivo) {
    return (
      <div className="flex items-center justify-center h-[70vh] text-center px-6">
        <div className="bg-[#111] p-12 rounded-[40px] border border-red-500/20 shadow-2xl space-y-6 max-w-md w-full">
          <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto border border-red-500/20">
            <Scissors className="text-red-500 w-10 h-10 rotate-45" />
          </div>

          <h1 className="text-3xl font-black uppercase text-white">
            Sistema <span className="text-red-500">Inactivo</span>
          </h1>

          <p className="text-gray-400">
            Lo sentimos, este sistema no está activo.
          </p>
        </div>
      </div>
    );
  }

  if (!slug || !barberia) {
    return (
      <div className="max-w-5xl mx-auto space-y-16 py-10">
        <h1 className="text-5xl font-black text-white">
          Sistema de Turnos
        </h1>

        <p className="text-gray-400">
          Automatiza reservas para tu barbería.
        </p>

        <div className="text-center">
          <Link href="/register" className="bg-[#D4AF37] text-black px-8 py-4 rounded-xl font-black">
            Crear sistema
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-10 w-full">

      <h1 className="text-white text-5xl font-black uppercase">
        {barberia.nombre}
      </h1>

      <Link href={`/servicios?s=${slug}`}>
        <button className="bg-[#D4AF37] text-black px-8 py-4 rounded-xl font-black uppercase">
          Ver servicios
        </button>
      </Link>

    </div>
  );
}