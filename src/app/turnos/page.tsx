'use client'

import Link from "next/link";
import { ChevronLeft, CalendarDays, Scissors, Clock, ArrowRight, MessageCircle, History, Loader2 } from "lucide-react";

const TURNOS_USUARIO = [
  {
    id: 1,
    servicio: "Corte de Cabello + Barba",
    fecha: "Mañana, 15 Abr",
    hora: "10:30 HS",
    estado: "Confirmado",
    precio: 3800,
    barbero: "Juan Pérez",
  },
];

export default function MisTurnosPage() {
  return (
    <div className="w-full flex flex-col gap-10 bg-black min-h-screen animate-in fade-in duration-700">
      {/* Header */}
      <header className="flex flex-col gap-4">
        <div className="flex items-center gap-3 text-[#D4AF37]">
          <div className="w-10 h-1 bg-[#D4AF37] rounded-full"></div>
          <span className="text-[10px] font-black uppercase tracking-[0.3em]">Mi Agenda</span>
        </div>
        <div className="flex items-center justify-between">
          <h2 className="text-5xl lg:text-6xl font-black tracking-tight text-white uppercase">Tu <span className="text-[#D4AF37]">Espacio</span></h2>
          <Link href="/" className="p-3 bg-[#111] rounded-xl border border-white/5 hover:border-[#D4AF37]/30 transition-all">
            <ChevronLeft className="w-6 h-6 text-[#D4AF37]" />
          </Link>
        </div>
        <p className="text-gray-400 text-lg font-medium max-w-2xl">Gestioná tus próximas visitas, consultá detalles de tu reserva o revisá tu historial de estilo.</p>
      </header>

      {/* Active Appointments */}
      <div className="flex flex-col gap-8 w-full">
        <div className="flex items-center justify-between px-2">
          <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500">Próximas Citas</h3>
          <span className="bg-[#D4AF37]/10 text-[#D4AF37] px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-[#D4AF37]/20 shadow-lg">
            {TURNOS_USUARIO.length} Activas
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {TURNOS_USUARIO.length > 0 ? (
            TURNOS_USUARIO.map((turno) => (
              <div key={turno.id} className="bg-[#111] rounded-[40px] p-10 border border-white/5 relative overflow-hidden group hover:border-[#D4AF37]/20 transition-all shadow-2xl">
                <div className="absolute top-0 right-0 w-40 h-40 bg-[#D4AF37]/5 rounded-full -translate-y-16 translate-x-16 blur-3xl"></div>
                
                <div className="flex justify-between items-start relative z-10">
                  <div className="flex items-center gap-5">
                    <div className="p-5 bg-white/5 rounded-2xl border border-white/5 group-hover:bg-[#D4AF37] group-hover:text-black transition-all">
                      <Scissors className="w-8 h-8" strokeWidth={2.5} />
                    </div>
                    <div>
                      <h4 className="text-2xl font-black text-white uppercase tracking-tight">{turno.servicio}</h4>
                      <p className="text-[10px] text-gray-500 font-black uppercase tracking-[0.2em] mt-2">Barbero: {turno.barbero}</p>
                    </div>
                  </div>
                  <div className="bg-green-500/10 px-4 py-1.5 rounded-full border border-green-500/20">
                    <span className="text-[10px] text-green-500 font-black uppercase tracking-widest">{turno.estado}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-8 border-t border-white/5 mt-10 pt-8 relative z-10">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-gray-500 text-[10px] font-black uppercase tracking-widest">
                      <CalendarDays className="w-4 h-4 text-[#D4AF37]" />
                      <span>Fecha</span>
                    </div>
                    <p className="text-xl font-bold text-white uppercase tracking-tight">{turno.fecha}</p>
                  </div>
                  <div className="space-y-3 text-right">
                    <div className="flex items-center gap-2 text-gray-500 text-[10px] font-black uppercase tracking-widest justify-end">
                      <Clock className="w-4 h-4 text-[#D4AF37]" />
                      <span>Hora</span>
                    </div>
                    <p className="text-xl font-bold text-white uppercase tracking-tight">{turno.hora}</p>
                  </div>
                </div>

                <div className="flex gap-4 mt-10 relative z-10">
                  <button className="flex-1 py-5 rounded-[22px] bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/20 active:scale-95 transition-all">
                    CANCELAR
                  </button>
                  <button className="flex-1 py-5 rounded-[22px] bg-[#D4AF37] text-black text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl shadow-[#D4AF37]/20 hover:scale-105 active:scale-95 transition-all">
                    <MessageCircle className="w-5 h-5 fill-current" />
                    AYUDA
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full bg-[#111] border border-dashed border-white/10 rounded-[40px] flex flex-col items-center py-40 gap-8 text-center">
              <CalendarDays size={80} className="text-gray-800" />
              <p className="text-gray-500 font-black uppercase text-sm tracking-[0.3em]">No tenés turnos programados aún</p>
              <Link href="/servicios" className="bg-[#D4AF37] text-black font-black py-4 px-8 rounded-xl transition-all duration-300 active:scale-95 flex items-center justify-center gap-2 uppercase tracking-widest text-xs px-12">
                RESERVAR AHORA
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
