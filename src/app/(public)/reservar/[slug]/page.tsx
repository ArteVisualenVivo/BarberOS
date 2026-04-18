"use client";

import { useState, useEffect, Suspense } from "react";
import { getBarberiaBySlug, Barberia } from "@/lib/tenants";
import { db } from "@/lib/firebase";
import { doc, getDoc, addDoc, collection, serverTimestamp, query, where, getDocs } from "firebase/firestore";
import { useSearchParams, useRouter } from "next/navigation";
import { getAvailableSlots } from "@/services/agenda.service";
import { checkPlanLimits } from "@/services/plans.service";
import { 
  Calendar, 
  Clock, 
  User, 
  MessageSquare, 
  ChevronRight, 
  Loader2,
  Scissors,
  CheckCircle2,
  AlertCircle
} from "lucide-react";

function ReservaContent({ params }: { params: { slug: string } }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const servicioId = searchParams.get("id");

  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState(1);
  const [servicio, setServicio] = useState<any>(null);
  const [barberia, setBarberia] = useState<Barberia | null>(null);
  const [notFound, setNotFound] = useState(false);
  
  // Form states
  const [fecha, setFecha] = useState(new Date().toLocaleDateString("en-CA"));
  const [hora, setHora] = useState("");
  const [cliente, setCliente] = useState({ nombre: "", whatsapp: "" });
  const [saving, setSaving] = useState(false);
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  useEffect(() => {
    fetchInitialData();
  }, [params.slug, servicioId]);

  useEffect(() => {
    if (barberia && servicio && fecha) {
      fetchSlots();
    }
  }, [barberia, servicio, fecha]);

  const fetchInitialData = async () => {
    try {
      const b = await getBarberiaBySlug(params.slug);
      if (b && b.id) {
        setBarberia(b);
        if (servicioId) {
          const sSnap = await getDoc(doc(db, "servicios", servicioId));
          if (sSnap.exists()) {
            setServicio({ id: sSnap.id, ...sSnap.data() });
          }
        }
      } else {
        setNotFound(true);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  };

  const fetchSlots = async () => {
    if (!barberia || !servicio) return;
    setLoadingSlots(true);
    try {
      const slots = await getAvailableSlots(barberia.id, fecha, servicio.duracion || 30);
      setAvailableSlots(slots);
      if (!slots.includes(hora)) setHora("");
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleConfirmar = async () => {
    if (!barberia || !servicio) return;
    setSaving(true);
    try {
      // 0. Verificar límites de plan
      const limitCheck = await checkPlanLimits(barberia.id, "create_turno");
      if (!limitCheck.allowed) {
        alert(limitCheck.reason);
        return;
      }

      // 0.5 Verificar solapamiento (Double check)
      const q = query(
        collection(db, "turnos"),
        where("barberiaId", "==", barberia.id),
        where("fecha", "==", fecha),
        where("hora", "==", hora),
        where("estado", "in", ["pendiente", "confirmado"])
      );
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        alert("Ese horario ya está ocupado. Por favor elige otro.");
        setStep(1); // Volver a selección de hora
        fetchSlots(); // Actualizar slots
        return;
      }

      // 1. Guardar Turno
      await addDoc(collection(db, "turnos"), {
        barberiaId: barberia.id,
        servicioId: servicio.id,
        servicioNombre: servicio.nombre,
        precio: Number(servicio.precio),
        duracion: Number(servicio.duracion) || 30,
        clienteNombre: cliente.nombre,
        clienteWhatsapp: cliente.whatsapp,
        fecha,
        hora,
        estado: "pendiente",
        createdAt: serverTimestamp()
      });

      // 2. Registrar/Actualizar Cliente
      await addDoc(collection(db, "clientes"), {
        barberiaId: barberia.id,
        nombre: cliente.nombre,
        whatsapp: cliente.whatsapp,
        lastVisit: serverTimestamp(),
        createdAt: serverTimestamp()
      });
      
      setStep(4); // Success step
    } catch (error) {
      console.error("Error saving turno:", error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-black gap-4">
        <Loader2 className="animate-spin w-12 h-12 text-primary" />
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary/50 text-center px-6">Cargando Agenda de {params.slug}</p>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center text-center p-6 space-y-6">
        <Scissors className="text-red-500 w-16 h-16" />
        <h1 className="text-3xl font-black text-white uppercase tracking-tighter">Barbería no encontrada</h1>
        <p className="text-gray-500 max-w-xs mx-auto">El slug especificado no coincide con ninguna barbería registrada.</p>
        <button onClick={() => router.back()} className="bg-primary text-black px-8 py-4 rounded-2xl font-black uppercase text-xs tracking-widest">Volver</button>
      </div>
    );
  }

  if (!barberia || !barberia.id) {
    return <div>Error: barbería no cargada</div>;
  }

  if (!servicio) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center text-center p-6 space-y-6">
        <Scissors className="text-red-500 w-16 h-16" />
        <h1 className="text-3xl font-black text-white uppercase tracking-tighter">Error en la reserva</h1>
        <p className="text-gray-500 max-w-xs mx-auto">No pudimos encontrar la información necesaria para realizar tu reserva.</p>
        <button onClick={() => router.back()} className="bg-primary text-black px-8 py-4 rounded-2xl font-black uppercase text-xs tracking-widest">Volver</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white font-sans px-6 py-12">
      <div className="max-w-2xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="bg-primary/10 w-16 h-16 rounded-3xl flex items-center justify-center mx-auto border border-primary/20 mb-2">
            <Scissors className="text-primary w-8 h-8" />
          </div>
          <h1 className="text-4xl font-black uppercase tracking-tight">{barberia.nombre}</h1>
          <p className="text-gray-500 font-bold uppercase text-[10px] tracking-widest">Reservando: <span className="text-primary">{servicio.nombre}</span></p>
        </div>

        {/* Progress */}
        {step < 4 && (
          <div className="flex items-center justify-between px-10">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs ${
                  step >= i ? "bg-primary text-black" : "bg-white/5 text-gray-600"
                }`}>
                  {i}
                </div>
                {i < 3 && <div className={`w-12 h-0.5 ${step > i ? "bg-primary" : "bg-white/5"}`} />}
              </div>
            ))}
          </div>
        )}

        <div className="bg-[#111] p-8 md:p-12 rounded-[40px] border border-white/5 shadow-2xl relative overflow-hidden">
          {step === 1 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="space-y-2">
                <h2 className="text-3xl font-black uppercase tracking-tight">Fecha y <span className="text-primary">Hora</span></h2>
              </div>

              <div className="space-y-6">
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 flex items-center gap-2">
                    <Calendar className="w-3 h-3" /> Día del Turno
                  </label>
                  <input 
                    type="date" 
                    min={new Date().toLocaleDateString("en-CA")}
                    className="w-full bg-black border border-white/10 rounded-2xl p-4 text-white focus:border-primary outline-none transition-all"
                    value={fecha}
                    onChange={(e) => setFecha(e.target.value)}
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 flex items-center gap-2">
                    <Clock className="w-3 h-3" /> Horarios Disponibles
                  </label>
                  {loadingSlots ? (
                    <div className="flex items-center justify-center py-10">
                      <Loader2 className="w-8 h-8 text-primary animate-spin" />
                    </div>
                  ) : availableSlots.length > 0 ? (
                    <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                      {availableSlots.map((h) => (
                        <button
                          key={h}
                          onClick={() => setHora(h)}
                          className={`py-3 rounded-xl font-black text-xs transition-all border ${
                            hora === h 
                              ? "bg-primary text-black border-primary" 
                              : "bg-black text-gray-400 border-white/5 hover:border-primary/30"
                          }`}
                        >
                          {h}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-red-500/10 border border-red-500/20 p-6 rounded-2xl flex flex-col items-center gap-3 text-center">
                      <AlertCircle className="w-6 h-6 text-red-500" />
                      <p className="text-[10px] font-black uppercase tracking-widest text-red-500">No hay horarios disponibles para esta fecha</p>
                      <button 
                        onClick={() => {
                          const d = new Date(fecha);
                          d.setDate(d.getDate() + 1);
                          setFecha(d.toLocaleDateString("en-CA"));
                        }}
                        className="text-primary text-[10px] font-black uppercase tracking-widest hover:underline mt-2"
                      >
                        Ver disponibilidad para mañana →
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <button 
                disabled={!hora}
                onClick={() => setStep(2)}
                className="w-full bg-primary text-black font-black py-5 rounded-2xl flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-20 uppercase tracking-widest text-xs"
              >
                Siguiente Paso <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="space-y-2">
                <h2 className="text-3xl font-black uppercase tracking-tight">Tus <span className="text-primary">Datos</span></h2>
              </div>

              <div className="space-y-6">
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 flex items-center gap-2">
                    <User className="w-3 h-3" /> Nombre Completo
                  </label>
                  <input 
                    type="text" 
                    placeholder="Ej: Juan Pérez"
                    className="w-full bg-black border border-white/10 rounded-2xl p-4 text-white focus:border-primary outline-none transition-all"
                    value={cliente.nombre}
                    onChange={(e) => setCliente({...cliente, nombre: e.target.value})}
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 flex items-center gap-2">
                    <MessageSquare className="w-3 h-3" /> WhatsApp
                  </label>
                  <input 
                    type="tel" 
                    placeholder="Ej: 5491122334455"
                    className="w-full bg-black border border-white/10 rounded-2xl p-4 text-white focus:border-primary outline-none transition-all"
                    value={cliente.whatsapp}
                    onChange={(e) => setCliente({...cliente, whatsapp: e.target.value})}
                  />
                </div>
              </div>

              <div className="flex gap-4">
                <button 
                  onClick={() => setStep(1)}
                  className="flex-1 bg-white/5 text-white font-black py-5 rounded-2xl uppercase tracking-widest text-[10px] border border-white/5"
                >
                  Atrás
                </button>
                <button 
                  disabled={!cliente.nombre || !cliente.whatsapp}
                  onClick={() => setStep(3)}
                  className="flex-[2] bg-primary text-black font-black py-5 rounded-2xl flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-20 uppercase tracking-widest text-[10px]"
                >
                  Revisar Turno <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="space-y-2">
                <h2 className="text-3xl font-black uppercase tracking-tight text-white">Confirmar <span className="text-primary">Turno</span></h2>
              </div>

              <div className="bg-black/40 rounded-[32px] border border-white/5 overflow-hidden">
                <div className="p-6 border-b border-white/5 flex items-center gap-4">
                  <div className="bg-primary/10 p-3 rounded-xl">
                    <Scissors className="text-primary w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Servicio</p>
                    <h4 className="font-black uppercase text-white">{servicio.nombre}</h4>
                  </div>
                </div>
                <div className="p-6 grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-[10px] font-black uppercase text-gray-500 tracking-widest mb-1">Fecha</p>
                    <p className="font-bold text-sm text-white">{fecha}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase text-gray-500 tracking-widest mb-1">Hora</p>
                    <p className="font-bold text-sm text-white">{hora} HS</p>
                  </div>
                </div>
                <div className="p-6 bg-primary/5 border-t border-white/5 flex justify-between items-center">
                  <p className="text-[10px] font-black uppercase text-primary tracking-widest">Total a pagar</p>
                  <p className="text-2xl font-black text-primary">${servicio.precio.toLocaleString()}</p>
                </div>
              </div>

              <div className="flex gap-4">
                <button 
                  onClick={() => setStep(2)}
                  className="flex-1 bg-white/5 text-white font-black py-5 rounded-2xl uppercase tracking-widest text-[10px] border border-white/5"
                >
                  Atrás
                </button>
                <button 
                  disabled={saving}
                  onClick={handleConfirmar}
                  className="flex-[2] bg-primary text-black font-black py-5 rounded-2xl flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 uppercase tracking-widest text-[10px]"
                >
                  {saving ? <Loader2 className="animate-spin w-4 h-4" /> : "Confirmar Turno Ahora"}
                </button>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-8 py-10 text-center animate-in zoom-in-95 duration-500">
              <div className="bg-primary/10 w-24 h-24 rounded-full flex items-center justify-center mx-auto border border-primary/20 mb-6">
                <CheckCircle2 className="text-primary w-12 h-12" />
              </div>
              <div className="space-y-4">
                <h2 className="text-4xl font-black uppercase tracking-tight text-white">¡Reserva <span className="text-primary">Exitosa</span>!</h2>
                <p className="text-gray-500 font-medium">Tu turno ha sido agendado correctamente en {barberia.nombre}.</p>
              </div>
              
              <div className="bg-black/40 p-6 rounded-[30px] border border-white/5 text-left max-w-sm mx-auto">
                <p className="text-[10px] font-black uppercase text-gray-500 tracking-[0.2em] mb-4">Resumen</p>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Servicio:</span>
                    <span className="font-bold text-white uppercase">{servicio.nombre}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Fecha:</span>
                    <span className="font-bold text-white">{fecha}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Hora:</span>
                    <span className="font-bold text-white">{hora} HS</span>
                  </div>
                </div>
              </div>

              <button 
                onClick={() => router.push(`/${params.slug}`)}
                className="bg-white/5 text-white px-10 py-5 rounded-2xl font-black uppercase tracking-widest text-[10px] border border-white/5 hover:bg-white/10 transition-all"
              >
                Volver a la Barbería
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ReservaPage({ params }: { params: { slug: string } }) {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center min-h-screen bg-black gap-4">
        <Loader2 className="animate-spin w-12 h-12 text-primary" />
      </div>
    }>
      <ReservaContent params={params} />
    </Suspense>
  );
}
