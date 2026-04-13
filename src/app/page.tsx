'use client'

import { useEffect, useState } from "react";
import Link from "next/link";
import { Scissors, MapPin, Clock, Star, ArrowRight, CalendarDays, Loader2 } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { Database } from "@/types/supabase";

type Barberia = Database['public']['Tables']['barberias']['Row'];

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

      if (data) setBarberia(data);
      setLoading(false);
    };

    fetchBarberia();
  }, [slug, supabase]);

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-20 gap-4 w-full">
      <Loader2 className="w-10 h-10 text-[#D4AF37] animate-spin" />
      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#D4AF37]/50">
        Cargando BarberOS
      </p>
    </div>
  );

  // ✅ FIX IMPORTANTE AQUÍ
  if (slug && barberia && !(barberia as any)?.plan_activo) {
    return (
      <div className="flex items-center justify-center h-[70vh] text-center px-6">
        <div className="bg-[#111] p-12 rounded-[40px] border border-red-500/20 shadow-2xl space-y-6 max-w-md w-full">
          <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto border border-red-500/20">
            <Scissors className="text-red-500 w-10 h-10 rotate-45" />
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl font-black uppercase tracking-tight text-white">
              Sistema <span className="text-red-500">Inactivo</span>
            </h1>

            <p className="text-gray-400 font-medium leading-relaxed">
              Lo sentimos, el sistema de turnos de esta barbería no se encuentra disponible actualmente.
            </p>
          </div>

          <div className="pt-4">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-600">
              Contacta con el administrador
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!slug || !barberia) return (
    <div className="max-w-5xl mx-auto space-y-16 py-10 animate-in fade-in duration-700">

      {/* HERO */}
      <div className="text-center space-y-6">
        <div className="flex items-center justify-center gap-3 text-[#D4AF37]">
          <div className="w-10 h-1 bg-[#D4AF37] rounded-full"></div>
          <span className="text-[10px] font-black uppercase tracking-[0.3em]">BarberOS SaaS</span>
          <div className="w-10 h-1 bg-[#D4AF37] rounded-full"></div>
        </div>

        <h1 className="text-5xl lg:text-7xl font-black text-white uppercase tracking-tight leading-none">
          Sistema de Turnos para <span className="text-[#D4AF37]">Barberías</span>
        </h1>

        <p className="text-gray-400 text-xl max-w-2xl mx-auto font-medium">
          Automatiza tus reservas, gestiona tus servicios y deja de perder clientes.
        </p>
      </div>

      {/* BENEFICIOS */}
      <div className="grid md:grid-cols-3 gap-8">

        <div className="bg-[#111] p-10 rounded-[32px] border border-white/5">
          <Clock className="text-[#D4AF37] w-6 h-6 mb-4" />
          <h3 className="text-white font-black uppercase">Reservas 24/7</h3>
          <p className="text-gray-500 text-sm">Automático sin llamadas.</p>
        </div>

        <div className="bg-[#111] p-10 rounded-[32px] border border-white/5">
          <Scissors className="text-[#D4AF37] w-6 h-6 mb-4" />
          <h3 className="text-white font-black uppercase">Menos cancelaciones</h3>
          <p className="text-gray-500 text-sm">Confirmación por WhatsApp.</p>
        </div>

        <div className="bg-[#111] p-10 rounded-[32px] border border-white/5">
          <Star className="text-[#D4AF37] w-6 h-6 mb-4" />
          <h3 className="text-white font-black uppercase">Más ingresos</h3>
          <p className="text-gray-500 text-sm">Control total del negocio.</p>
        </div>
      </div>

      {/* CTA */}
      <div className="text-center space-y-6">
        <Link href="/register" className="bg-[#D4AF37] text-black px-10 py-4 rounded-xl font-black uppercase">
          Crear mi sistema
        </Link>
      </div>

    </div>
  );

  return (
    <div className="flex flex-col gap-10 w-full animate-in fade-in duration-700">

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