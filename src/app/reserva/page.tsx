"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, Calendar as CalendarIcon, Clock, Check, ArrowRight, User, Loader2, AlertCircle } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { Database } from "@/types/supabase";

type Servicio = Database['public']['Tables']['servicios']['Row'];

const HORAS_DISPONIBLES = [
  "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00", "17:30", "18:00", "18:30"
];

import { getBarberiaIdBySlug } from "@/utils/barberia/context";

export default function ReservaPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const idServicio = searchParams.get("id");
  const slug = searchParams.get("s");
  const supabase = createClient();

  const [servicio, setServicio] = useState<Servicio | null>(null);
  const [paso, setPaso] = useState(1);
  const [fechaSel, setFechaSel] = useState<string>(new Date().toLocaleDateString('en-CA'));
  const [horaSel, setHoraSel] = useState<string | null>(null);
  const [datos, setDatos] = useState({ nombre: "", whatsapp: "" });
  const [loading, setLoading] = useState(false);
  const [loadingInit, setLoadingInit] = useState(true);
  const [ocupados, setOcupados] = useState<string[]>([]);
  const [barberiaId, setBarberiaId] = useState<string | null>(null);
  const [planActivo, setPlanActivo] = useState<boolean>(true);

  // 1. Cargar info del servicio y turnos ocupados para la fecha inicial
  useEffect(() => {
    const init = async () => {
      if (!idServicio || !slug) {
        router.push('/servicios');
        return;
      }

      // Obtener la barbería real por el slug y validar plan
      const { data: bData, error: bError } = await supabase
        .from('barberias')
        .select('id, plan_activo')
        .eq('slug', slug)
        .single();

      if (bError || !bData) {
        alert("Barbería no encontrada.");
        router.push('/');
        return;
      }

      if (!bData.plan_activo) {
        setPlanActivo(false);
        setLoadingInit(false);
        return;
      }

      const bId = bData.id;
      setBarberiaId(bId);

      const { data: sData } = await supabase.from('servicios').select('*').eq('id', idServicio).eq('barberia_id', bId).single();
      if (sData) setServicio(sData);
      else {
        alert("Servicio no encontrado para esta barbería.");
        router.push(`/servicios?s=${slug}`);
        return;
      }

      await fetchOcupados(fechaSel, bId);
      setLoadingInit(false);
    };
    init();
  }, [idServicio, slug, router, supabase]);

  // 2. Cargar turnos ocupados cuando cambia la fecha
  const fetchOcupados = async (fecha: string, bId?: string) => {
    const currentBId = bId || barberiaId;
    if (!currentBId) return;

    const { data } = await supabase
      .from('turnos')
      .select('hora')
      .eq('barberia_id', currentBId)
      .eq('fecha', fecha)
      .neq('estado', 'cancelado');
    
    if (data) {
      setOcupados(data.map(t => t.hora));
    } else {
      setOcupados([]);
    }
  };

  const handleFechaChange = async (fecha: string) => {
    setFechaSel(fecha);
    setHoraSel(null);
    await fetchOcupados(fecha);
  };

  const handleSiguiente = async () => {
    if (paso === 1 && horaSel) setPaso(2);
    else if (paso === 2 && datos.nombre && datos.whatsapp && servicio && barberiaId) {
      setLoading(true);
      try {
        // 1. VALIDAR FECHA PASADA
        const now = new Date();
        const fechaTurno = new Date(`${fechaSel}T${horaSel}`);
        if (fechaTurno < now) {
          alert("No puedes reservar en el pasado");
          setLoading(false);
          return;
        }

        // 2. VALIDAR HORARIO LABORAL (9 a 20)
        const horaNum = parseInt(horaSel!.split(":")[0]);
        if (horaNum < 9 || horaNum >= 20) {
          alert("Fuera de horario laboral (9 a 20)");
          setLoading(false);
          return;
        }

        // 3. VALIDAR DUPLICADOS (YA EXISTENTE)
        const { data: existente } = await supabase
          .from("turnos")
          .select("id")
          .eq("barberia_id", barberiaId)
          .eq("fecha", fechaSel)
          .eq("hora", horaSel!)
          .neq("estado", "cancelado")
          .maybeSingle();

        if (existente) {
          alert("Ese horario ya está ocupado");
          setPaso(1);
          setHoraSel(null);
          await fetchOcupados(fechaSel);
          setLoading(false);
          return;
        }

        // 4. INSERT FINAL
        const { error } = await supabase.from("turnos").insert({
          barberia_id: barberiaId,
          servicio_id: servicio.id,
          cliente_nombre: datos.nombre,
          cliente_whatsapp: datos.whatsapp,
          fecha: fechaSel,
          hora: horaSel!,
          estado: "pendiente",
          monto_total: servicio.precio,
        });

        if (error) throw error;
        router.push("/exito");
      } catch (err) {
        console.error("Error al reservar:", err);
        alert("Hubo un error al procesar tu reserva. Por favor intenta de nuevo.");
      } finally {
        setLoading(false);
      }
    }
  };

  if (loadingInit) return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black gap-4">
      <Loader2 className="w-10 h-10 text-primary animate-spin" />
      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/50">Preparando Agenda</p>
    </div>
  );

  if (!loadingInit && !planActivo) {
    return (
      <div className="flex items-center justify-center h-[70vh] text-center px-6 bg-black">
        <div className="bg-[#111] p-12 rounded-[40px] border border-red-500/20 shadow-2xl space-y-6 max-w-md w-full">
          <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto border border-red-500/20">
            <Scissors className="text-red-500 w-10 h-10 rotate-45" />
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-black uppercase tracking-tight text-white">Sistema <span className="text-red-500">Inactivo</span></h1>
            <p className="text-gray-400 font-medium leading-relaxed">
              Lo sentimos, el sistema de reservas de esta barbería no se encuentra disponible actualmente.
            </p>
          </div>
          <div className="pt-4">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-600">Contacta con el administrador</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen gap-8 bg-black">
      {/* Header */}
      <header className="flex items-center justify-between sticky top-0 bg-black/80 backdrop-blur-md py-4 z-10 border-b border-white/5 -mx-4 px-4 lg:-mx-8 lg:px-8">
        <button onClick={() => paso === 1 ? router.back() : setPaso(1)} className="p-2 bg-surface rounded-full border border-white/5 active:scale-90 transition-transform">
          <ChevronLeft className="w-6 h-6 text-primary" />
        </button>
        <h1 className="text-sm font-black tracking-widest uppercase">
          {paso === 1 ? "Elegir Turno" : "Tus Datos"}
        </h1>
        <div className="w-10 lg:hidden"></div>
      </header>

      <div className="max-w-4xl mx-auto w-full flex flex-col gap-10">
        {paso === 1 ? (
          <div className="flex flex-col gap-10">
            {/* Info Servicio */}
            <div className="bg-[#111] border border-[#D4AF37]/20 rounded-3xl p-6 transition-all duration-300 w-full bg-[#D4AF37]/5 flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-[10px] font-black uppercase tracking-widest text-[#D4AF37]">Servicio Seleccionado</p>
                <h3 className="text-2xl font-black text-white uppercase">{servicio?.nombre}</h3>
              </div>
              <div className="text-right">
                <p className="text-[#D4AF37] font-black text-3xl leading-none">${servicio?.precio.toLocaleString()}</p>
                <p className="text-[10px] font-bold text-gray-400 uppercase mt-2 tracking-widest">{servicio?.duracion}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Fecha Selector */}
              <section className="space-y-4">
                <h2 className="text-xs font-black uppercase tracking-[0.2em] text-accent flex items-center gap-2">
                  <CalendarIcon size={16} className="text-primary" /> 1. Elige la Fecha
                </h2>
                <input 
                  type="date" 
                  min={new Date().toLocaleDateString('en-CA')}
                  value={fechaSel}
                  onChange={(e) => handleFechaChange(e.target.value)}
                  className="w-full bg-surface border border-white/10 p-6 rounded-3xl text-white focus:outline-none focus:border-primary/50 transition-all text-sm font-bold uppercase tracking-widest"
                />
              </section>

              {/* Horas Selector */}
              <section className="space-y-4">
                <h2 className="text-xs font-black uppercase tracking-[0.2em] text-accent flex items-center gap-2">
                  <Clock size={16} className="text-primary" /> 2. Horas Disponibles
                </h2>
                <div className="grid grid-cols-3 gap-3">
                  {HORAS_DISPONIBLES.map((h) => {
                    const isOcupado = ocupados.includes(h);
                    return (
                      <button
                        key={h}
                        disabled={isOcupado}
                        onClick={() => setHoraSel(h)}
                        className={`py-4 rounded-2xl text-xs font-black transition-all duration-300 border ${
                          isOcupado ? "opacity-20 bg-transparent border-white/5 line-through" :
                          horaSel === h ? "bg-primary text-black border-primary shadow-[0_10px_20px_rgba(212,175,55,0.3)]" : 
                          "bg-surface text-accent border-white/5 hover:border-primary/30"
                        }`}
                      >
                        {h}
                      </button>
                    );
                  })}
                </div>
              </section>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <section className="space-y-6">
                <h2 className="text-xs font-black uppercase tracking-[0.2em] text-accent flex items-center gap-2">
                  <User size={16} className="text-primary" /> 3. Tus Datos de Contacto
                </h2>
                
                <div className="space-y-5">
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-black text-accent tracking-[0.2em] pl-2">Nombre Completo</label>
                    <input
                      type="text"
                      placeholder="Ej: Juan Pérez"
                      value={datos.nombre}
                      onChange={(e) => setDatos({ ...datos, nombre: e.target.value })}
                      className="w-full bg-surface border border-white/10 p-6 rounded-3xl text-white focus:outline-none focus:border-primary/50 transition-all text-sm font-bold placeholder:text-white/10"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-black text-accent tracking-[0.2em] pl-2">WhatsApp de Contacto</label>
                    <input
                      type="tel"
                      placeholder="Ej: +54 9 11 1234 5678"
                      value={datos.whatsapp}
                      onChange={(e) => setDatos({ ...datos, whatsapp: e.target.value })}
                      className="w-full bg-surface border border-white/10 p-6 rounded-3xl text-white focus:outline-none focus:border-primary/50 transition-all text-sm font-bold placeholder:text-white/10"
                    />
                  </div>
                </div>
              </section>

              <div className="flex flex-col gap-6">
                <div className="bg-[#111] border border-[#D4AF37]/20 rounded-3xl transition-all duration-300 w-full bg-gradient-to-br from-[#111] to-black border-primary/20 space-y-6 p-8 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-[#D4AF37]/5 rounded-full -translate-y-12 translate-x-12 blur-3xl"></div>
                  <h3 className="text-xs font-black uppercase tracking-[0.3em] text-[#D4AF37] border-b border-[#D4AF37]/10 pb-4">Resumen de Reserva</h3>
                  <div className="flex justify-between items-center">
                    <div className="space-y-2">
                      <p className="text-2xl font-black text-white uppercase tracking-tighter leading-none">
                        {new Date(fechaSel + 'T00:00:00').toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
                      </p>
                      <div className="flex items-center gap-3 text-[#D4AF37] font-black text-lg uppercase tracking-widest">
                        <Clock size={20} /> {horaSel} HS
                      </div>
                    </div>
                    <div className="p-5 bg-[#D4AF37] text-black rounded-2xl shadow-2xl shadow-[#D4AF37]/30">
                      <Check size={28} strokeWidth={3} />
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-5 bg-white/5 rounded-3xl border border-white/5">
                  <AlertCircle size={20} className="text-primary shrink-0 mt-0.5" />
                  <p className="text-[10px] text-accent font-bold uppercase tracking-widest leading-relaxed">
                    Al confirmar, tu turno quedará registrado. Recibirás una notificación de confirmación por WhatsApp en los próximos minutos.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Action Button */}
        <div className="flex justify-center mt-8 pb-20 lg:pb-0">
          <button
            onClick={handleSiguiente}
            disabled={loading || (paso === 1 ? !horaSel : (!datos.nombre || !datos.whatsapp))}
            className="bg-[#D4AF37] text-black font-black py-4 px-8 rounded-xl transition-all duration-300 active:scale-95 flex items-center justify-center gap-2 uppercase tracking-widest text-xs w-full max-w-md shadow-[0_20px_50px_rgba(212,175,55,0.3)] disabled:opacity-30 disabled:scale-100 disabled:shadow-none group"
          >
            {loading ? <Loader2 className="animate-spin w-5 h-5" /> : (
              <>
                {paso === 1 ? "CONTINUAR" : "CONFIRMAR RESERVA"}
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
