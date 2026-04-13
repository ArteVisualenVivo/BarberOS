'use client'

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, Calendar, Clock, MessageCircle, ArrowRight, Scissors, Loader2 } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

export default function ExitoPage() {
  const searchParams = useSearchParams();
  const slug = searchParams.get("s");
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      // Intentamos obtener el último turno creado para esta barbería (si tenemos el slug)
      if (slug) {
        const { data: barberia } = await supabase
          .from('barberias')
          .select('id, nombre, telefono')
          .eq('slug', slug)
          .single();

        if (barberia) {
          const { data: turno } = await supabase
            .from('turnos')
            .select('*, servicios(*)')
            .eq('barberia_id', barberia.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

          if (turno) {
            setData({
              turno,
              barberia
            });
          }
        }
      }
      setLoading(false);
    };

    fetchData();
  }, [slug, supabase]);

  const mensaje = data ? `Hola, quiero confirmar mi turno:
  
Servicio: ${data.turno.servicios?.nombre}
Fecha: ${data.turno.fecha}
Hora: ${data.turno.hora} HS

¡Gracias!` : "";

  const telefono = data?.barberia?.telefono || "5490000000000";
  const whatsappUrl = `https://wa.me/${telefono}?text=${encodeURIComponent(mensaje)}`;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-black gap-4">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/50">Cargando confirmación</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 gap-10 text-center animate-in fade-in zoom-in duration-700 w-full">
      {/* Success Icon */}
      <div className="relative group">
        <div className="absolute -inset-8 bg-primary/20 rounded-full blur-3xl opacity-50 animate-pulse"></div>
        <div className="relative w-40 h-40 bg-surface rounded-full flex items-center justify-center border-4 border-primary/50 shadow-2xl shadow-primary/40">
          <CheckCircle2 className="text-primary w-20 h-20 animate-bounce" strokeWidth={1.5} />
        </div>
      </div>

      {/* Success Message */}
      <div className="space-y-4">
        <h1 className="text-5xl lg:text-7xl font-black tracking-tight uppercase">
          ¡TURNO <span className="text-primary">CONFIRMADO</span>!
        </h1>
        <p className="text-accent text-lg max-w-xl mx-auto leading-relaxed font-medium">
          Tu reserva ha sido procesada con éxito. Por favor, confirma tu asistencia por WhatsApp.
        </p>
      </div>

      {/* Appointment Summary Card */}
      <div className="bg-[#111] border border-white/10 rounded-3xl p-8 lg:p-12 transition-all duration-300 w-full max-w-2xl bg-gradient-to-br from-[#111] to-black/80 space-y-8 shadow-2xl">
        <div className="flex justify-between items-center border-b border-white/5 pb-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-[#D4AF37]/10 rounded-2xl">
              <Scissors className="text-[#D4AF37] w-6 h-6" />
            </div>
            <div className="text-left">
              <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest mb-1">Servicio</p>
              <p className="text-xl font-bold uppercase tracking-tight text-white">{data?.turno.servicios?.nombre || "Corte de Cabello"}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[#D4AF37] font-black text-2xl tracking-tighter">Confirmado</p>
            <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest mt-1">Estado</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-2 text-left bg-white/5 p-6 rounded-2xl border border-white/5">
            <div className="flex items-center gap-2 text-gray-400 text-xs uppercase font-black tracking-[0.2em]">
              <Calendar className="w-4 h-4 text-[#D4AF37]" />
              <span>Fecha</span>
            </div>
            <p className="text-lg font-bold text-white uppercase">{data?.turno.fecha || "Pendiente"}</p>
          </div>
          <div className="space-y-2 text-left bg-white/5 p-6 rounded-2xl border border-white/5">
            <div className="flex items-center gap-2 text-gray-400 text-xs uppercase font-black tracking-[0.2em]">
              <Clock className="w-4 h-4 text-[#D4AF37]" />
              <span>Hora</span>
            </div>
            <p className="text-lg font-bold text-white uppercase">{data?.turno.hora || "--:--"} HS</p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-4 w-full max-w-2xl">
        <a 
          href={whatsappUrl} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="bg-[#25D366] text-white font-black py-5 px-8 rounded-2xl transition-all duration-300 active:scale-95 flex items-center justify-center gap-3 uppercase tracking-[0.2em] text-sm w-full border-none shadow-[0_20px_50px_rgba(37,211,102,0.4)] hover:shadow-[0_25px_60px_rgba(37,211,102,0.5)] hover:-translate-y-1"
        >
          <MessageCircle className="w-6 h-6 fill-current" />
          CONFIRMAR POR WHATSAPP
        </a>

        <Link href={slug ? `/?s=${slug}` : "/"} className="bg-white/5 text-white font-black py-5 px-8 rounded-2xl transition-all duration-300 active:scale-95 flex items-center justify-center gap-3 uppercase tracking-[0.2em] text-sm border border-white/10 w-full group hover:bg-white/10">
          VOLVER AL INICIO
          <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      <p className="text-[10px] text-accent/50 font-bold uppercase tracking-widest mt-10">
        Gracias por confiar en {data?.barberia?.nombre || "BarberOS"}
      </p>
    </div>
  );
}
