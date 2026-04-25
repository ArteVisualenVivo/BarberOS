"use client";

import { useState, useEffect, use } from "react";
import { getBarberiaBySlug, Barberia } from "@/lib/tenants";
import { getTenantCollection, COLLECTIONS } from "@/lib/db";
import Link from "next/link";
import ChatBot from "@/components/ChatBot";
import {
  Scissors,
  Clock,
  ChevronRight,
  Loader2,
  MapPin,
  Phone,
  ShieldCheck,
  MessageCircle
} from "lucide-react";

// Helper para limpiar el teléfono y generar el link de WhatsApp
const getWhatsAppLink = (telefono: string, nombreBarberia: string) => {
  const cleanPhone = telefono.replace(/\D/g, "");
  const message = encodeURIComponent(`¡Hola! Quiero reservar un turno en ${nombreBarberia}`);
  return `https://wa.me/${cleanPhone}?text=${message}`;
};

interface Servicio {
  id: string;
  nombre: string;
  precio: number;
  duracion: number;
  barberiaId: string;
}

export default function PublicBarberiaLanding({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = use(params);
  const slug = resolvedParams.slug;

  const [barberia, setBarberia] = useState<Barberia | null>(null);
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [loading, setLoading] = useState(true);
  const barberiaNombre = barberia?.nombre || "BarberOS";

  useEffect(() => {
    fetchData();
  }, [slug]);

  const fetchData = async () => {
    try {
      const b = await getBarberiaBySlug(slug);
      if (b) {
        setBarberia(b);
        const s = await getTenantCollection(COLLECTIONS.SERVICIOS, b.id) as Servicio[];
        setServicios(s);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary/50">Cargando Experiencia</p>
      </div>
    );
  }

  if (!barberia) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center text-center p-6 space-y-6">
        <div className="w-24 h-24 bg-red-500/10 rounded-full flex items-center justify-center border border-red-500/20">
          <Scissors className="text-red-500 w-10 h-10 rotate-45" />
        </div>
        <h1 className="text-4xl font-black text-white uppercase tracking-tighter">Barbería no encontrada</h1>
        <p className="text-gray-500 max-w-xs mx-auto">El enlace que seguiste no existe o la barbería ha cambiado su dirección.</p>
        <Link href="/" className="bg-white/5 text-white px-8 py-4 rounded-xl font-bold uppercase text-[10px] tracking-widest border border-white/5">Volver a {barberiaNombre}</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white selection:bg-primary selection:text-black font-sans">
      {/* Hero Section */}
      <section className="relative h-[60vh] flex flex-col items-center justify-center text-center px-6 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-black z-0" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent opacity-50 z-0" />
        
        <div className="relative z-10 space-y-6 animate-in fade-in zoom-in-95 duration-1000">
          <div className="bg-primary/10 w-20 h-20 rounded-[30px] flex items-center justify-center mx-auto border border-primary/20 mb-4 shadow-2xl shadow-primary/10">
            {barberia.logoUrl ? (
              <img src={barberia.logoUrl} alt={barberia.nombre} className="w-full h-full object-cover rounded-[30px]" />
            ) : (
              <Scissors className="text-primary w-10 h-10" />
            )}
          </div>
          <h1 className="text-6xl md:text-8xl font-black uppercase tracking-tighter leading-none">
            {barberia.nombre}
          </h1>
          <div className="flex items-center justify-center gap-6 text-[10px] font-black uppercase tracking-[0.3em] text-primary">
            <span className="flex items-center gap-2"><MapPin className="w-3 h-3" /> {barberia.direccion || "Dirección no disponible"}</span>
            <span className="w-1.5 h-1.5 bg-primary rounded-full" />
            <span className="flex items-center gap-2"><ShieldCheck className="w-3 h-3" /> Verificada</span>
          </div>
          {barberia.descripcion && (
            <p className="max-w-xl mx-auto text-gray-400 font-medium text-sm leading-relaxed mt-4">
              {barberia.descripcion}
            </p>
          )}

          {/* Botón WhatsApp Hero */}
          <div className="pt-8">
            {barberia.telefono ? (
              <a 
                href={getWhatsAppLink(barberia.telefono, barberia.nombre)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 bg-[#25D366] text-white px-8 py-4 rounded-2xl font-black uppercase text-[12px] tracking-widest hover:bg-[#20ba5a] transition-all shadow-xl shadow-[#25D366]/20 active:scale-95"
              >
                <MessageCircle className="w-5 h-5 fill-white" />
                Reservar por WhatsApp
              </a>
            ) : (
              <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">Configura tu WhatsApp en ajustes</p>
            )}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="max-w-5xl mx-auto px-6 py-20 space-y-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/5 pb-10">
          <div className="space-y-2">
            <h2 className="text-4xl font-black uppercase tracking-tight">Nuestros <span className="text-primary">Servicios</span></h2>
            <p className="text-gray-500 font-medium">Selecciona un servicio para agendar tu turno.</p>
          </div>
          <div className="bg-white/5 px-4 py-2 rounded-full border border-white/5 flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Agendas Abiertas</span>
          </div>
          {barberia.telefono && (
            <a 
              href={getWhatsAppLink(barberia.telefono, barberia.nombre)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-[#25D366]/10 text-[#25D366] px-5 py-2.5 rounded-full border border-[#25D366]/20 hover:bg-[#25D366]/20 transition-all font-bold text-[11px] uppercase tracking-widest active:scale-95"
            >
              <MessageCircle className="w-4 h-4" />
              WhatsApp
            </a>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {servicios.map((s) => (
            <Link 
              key={s.id}
              href={`/reservar/${slug}?id=${s.id}`}
              className="bg-[#111] p-8 rounded-[35px] border border-white/5 hover:border-primary/30 transition-all group flex flex-col justify-between gap-8 active:scale-[0.98]"
            >
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div className="bg-white/5 p-4 rounded-2xl group-hover:bg-primary group-hover:text-black transition-all">
                    <Scissors className="w-6 h-6" />
                  </div>
                  <p className="text-3xl font-black text-primary tracking-tighter">${s.precio.toLocaleString()}</p>
                </div>
                <div>
                  <h3 className="text-2xl font-black uppercase tracking-tight group-hover:text-primary transition-colors">{s.nombre}</h3>
                  <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-500 mt-2">
                    <Clock className="w-3 h-3" /> {s.duracion} MINUTOS
                  </div>
                </div>
              </div>
              
              <div className="pt-6 border-t border-white/5 flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-600 group-hover:text-gray-400 transition-colors">Reservar ahora</span>
                <div className="bg-primary/10 p-2 rounded-lg group-hover:bg-primary group-hover:text-black transition-all">
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            </Link>
          ))}
        </div>

        {servicios.length === 0 && (
          <div className="py-20 text-center border-2 border-dashed border-white/5 rounded-[40px] space-y-4">
            <p className="text-gray-600 font-black uppercase tracking-[0.3em] text-xs">No hay servicios configurados</p>
          </div>
        )}
      </section>

      {/* Footer Público */}
      <footer className="max-w-5xl mx-auto px-6 py-20 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-10">
        <div className="flex items-center gap-4">
          <div className="bg-primary text-black p-2 rounded-lg font-black text-xs">B</div>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500">Potenciado por {barberia?.nombre || "BarberOS"} SaaS</p>
        </div>
        <div className="flex gap-8">
          {barberia.telefono && (
            <a href={`tel:${barberia.telefono}`} className="text-gray-600 hover:text-white transition-colors"><Phone className="w-5 h-5" /></a>
          )}
          <Link href={`/login`} className="text-gray-600 hover:text-white transition-colors text-[10px] font-black uppercase tracking-widest">Panel Dueño</Link>
        </div>
      </footer>

      <ChatBot />
    </div>
  );
}
