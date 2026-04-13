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
      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#D4AF37]/50">Cargando BarberOS</p>
    </div>
  );

  if (slug && barberia && !barberia.plan_activo) {
    return (
      <div className="flex items-center justify-center h-[70vh] text-center px-6">
        <div className="bg-[#111] p-12 rounded-[40px] border border-red-500/20 shadow-2xl space-y-6 max-w-md w-full">
          <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto border border-red-500/20">
            <Scissors className="text-red-500 w-10 h-10 rotate-45" />
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-black uppercase tracking-tight text-white">Sistema <span className="text-red-500">Inactivo</span></h1>
            <p className="text-gray-400 font-medium leading-relaxed">
              Lo sentimos, el sistema de turnos de esta barbería no se encuentra disponible actualmente.
            </p>
          </div>
          <div className="pt-4">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-600">Contacta con el administrador</p>
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
          Automatiza tus reservas, gestiona tus servicios y deja de perder clientes con la plataforma más potente del mercado.
        </p> 
      </div> 
  
      {/* BENEFICIOS */} 
      <div className="grid md:grid-cols-3 gap-8"> 
        <div className="bg-[#111] p-10 rounded-[32px] border border-white/5 hover:border-[#D4AF37]/20 transition-all shadow-2xl space-y-4"> 
          <div className="w-12 h-12 bg-[#D4AF37]/10 rounded-2xl flex items-center justify-center border border-[#D4AF37]/20">
            <Clock className="text-[#D4AF37] w-6 h-6" />
          </div>
          <h3 className="text-xl font-black text-white uppercase tracking-tight">Reservas 24/7</h3> 
          <p className="text-gray-500 text-sm font-medium leading-relaxed"> 
            Tus clientes reservan solos en cualquier momento, sin que tengas que atender el teléfono.
          </p> 
        </div> 
  
        <div className="bg-[#111] p-10 rounded-[32px] border border-white/5 hover:border-[#D4AF37]/20 transition-all shadow-2xl space-y-4"> 
          <div className="w-12 h-12 bg-[#D4AF37]/10 rounded-2xl flex items-center justify-center border border-[#D4AF37]/20">
            <Scissors className="text-[#D4AF37] w-6 h-6" />
          </div>
          <h3 className="text-xl font-black text-white uppercase tracking-tight">Menos cancelaciones</h3> 
          <p className="text-gray-500 text-sm font-medium leading-relaxed"> 
            Confirmación por WhatsApp automática para asegurar que cada cliente asista a su cita.
          </p> 
        </div> 
  
        <div className="bg-[#111] p-10 rounded-[32px] border border-white/5 hover:border-[#D4AF37]/20 transition-all shadow-2xl space-y-4"> 
          <div className="w-12 h-12 bg-[#D4AF37]/10 rounded-2xl flex items-center justify-center border border-[#D4AF37]/20">
            <Star className="text-[#D4AF37] w-6 h-6" />
          </div>
          <h3 className="text-xl font-black text-white uppercase tracking-tight">Más ingresos</h3> 
          <p className="text-gray-500 text-sm font-medium leading-relaxed"> 
            Control total de tu negocio con estadísticas de ingresos y gestión de servicios premium.
          </p> 
        </div> 
      </div> 
  
      {/* CTA */} 
      <div className="text-center space-y-8 pt-10"> 
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
          <Link 
            href="/register" 
            className="bg-[#D4AF37] text-black px-12 py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-[0_20px_50px_rgba(212,175,55,0.3)] hover:scale-105 active:scale-95 transition-all" 
          > 
            Crear mi sistema ahora
          </Link> 
          <Link 
            href="/login" 
            className="bg-white/5 text-white px-12 py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest border border-white/10 hover:bg-white/10 transition-all" 
          > 
            Acceso Propietarios
          </Link> 
        </div>

        <p className="text-[10px] text-gray-600 font-black uppercase tracking-[0.4em]">
          Únete a la revolución de la barbería digital
        </p>
      </div> 
  
    </div> 
  );

  return (
    <div className="flex flex-col gap-10 w-full animate-in fade-in duration-700">
      {/* Hero Section */}
      <header className="flex flex-col gap-4">
        <div className="flex items-center gap-3 text-[#D4AF37]">
          <div className="w-10 h-1 bg-[#D4AF37] rounded-full"></div>
          <span className="text-[10px] font-black uppercase tracking-[0.3em]">Premium Experience</span>
        </div>
        <h1 className="text-6xl lg:text-8xl font-black tracking-tighter text-white uppercase leading-none">
          {barberia.nombre.split(' ')[0]}<br/>
          <span className="text-[#D4AF37]">{barberia.nombre.split(' ').slice(1).join(' ')}</span>
        </h1>
        <p className="text-xl text-gray-400 font-medium max-w-2xl leading-relaxed">
          Reservá tu turno en {barberia.nombre} y viví una experiencia de barbería de primer nivel.
        </p>
      </header>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 w-full">
        {/* Reservation Card */}
        <div className="lg:col-span-2 bg-[#111] rounded-3xl border border-white/5 p-10 flex flex-col justify-between gap-10 relative overflow-hidden group shadow-2xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#D4AF37]/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-[100px] group-hover:bg-[#D4AF37]/20 transition-all duration-700"></div>
          
          <div className="space-y-4 relative z-10">
            <h3 className="text-3xl font-black text-white uppercase tracking-tight">¿Listo para un cambio?</h3>
            <p className="text-gray-400 font-medium">Elegí el servicio que mejor se adapte a tu estilo y reservá en segundos.</p>
          </div>

          <Link href={`/servicios?s=${slug}`} className="relative z-10">
            <button className="bg-[#D4AF37] text-black font-black py-4 px-8 rounded-xl transition-all duration-300 active:scale-95 flex items-center justify-center gap-2 uppercase tracking-widest text-xs px-12 shadow-[0_20px_50px_rgba(212,175,55,0.2)] hover:scale-105 transition-all">
              VER SERVICIOS Y RESERVAR
              <ArrowRight className="w-5 h-5" />
            </button>
          </Link>
        </div>

        {/* Info Column */}
        <div className="flex flex-col gap-6">
          <div className="bg-[#111] rounded-3xl border border-white/5 p-8 flex flex-col gap-6 hover:border-[#D4AF37]/20 transition-all">
            <div className="w-12 h-12 bg-[#D4AF37]/10 rounded-2xl flex items-center justify-center border border-[#D4AF37]/20">
              <MapPin className="text-[#D4AF37] w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 mb-1">Ubicación</p>
              <p className="text-lg font-bold text-white uppercase tracking-tight">Consulta por WhatsApp</p>
            </div>
          </div>

          <div className="bg-[#111] rounded-3xl border border-white/5 p-8 flex flex-col gap-6 hover:border-[#D4AF37]/20 transition-all">
            <div className="w-12 h-12 bg-[#D4AF37]/10 rounded-2xl flex items-center justify-center border border-[#D4AF37]/20">
              <Clock className="text-[#D4AF37] w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 mb-1">Horarios</p>
              <p className="text-lg font-bold text-white uppercase tracking-tight">Abierto Hoy: 09:00 - 20:00</p>
            </div>
          </div>
        </div>
      </div>

      {/* Appointment Preview */}
      <section className="flex flex-col gap-6 w-full mb-20">
        <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 ml-4">Estado de tu Cita</h2>
        <div className="bg-[#111] rounded-[40px] border border-dashed border-white/10 p-20 flex flex-col items-center justify-center gap-6 text-center">
          <div className="p-6 bg-white/5 rounded-full">
            <CalendarDays className="text-gray-700 w-12 h-12" />
          </div>
          <p className="text-gray-500 font-bold uppercase tracking-widest">No tenés turnos pendientes para hoy</p>
        </div>
      </section>
    </div>
  );
}
