"use client";

import { useState, useEffect, Suspense, use } from "react";
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

interface Servicio {
  id: string;
  nombre: string;
  precio: number;
  duracion: number;
  barberiaId: string;
}

function ReservaContent({ slug }: { slug: string }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const servicioId = searchParams.get("id");

  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState(1);
  const [servicio, setServicio] = useState<any>(null);
  const [barberia, setBarberia] = useState<Barberia | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [slugError, setSlugError] = useState(false);

  // Form states
  const [fecha, setFecha] = useState(new Date().toLocaleDateString("en-CA"));
  const [hora, setHora] = useState("");
  const [cliente, setCliente] = useState({ nombre: "", whatsapp: "" });
  const [saving, setSaving] = useState(false);
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  useEffect(() => {
    fetchInitialData();
  }, [slug, servicioId]);

  useEffect(() => {
    if (barberia && servicio && fecha) {
      fetchSlots();
    }
  }, [barberia, servicio, fecha]);

  const fetchInitialData = async () => {
    try {
      if (!slug || !slug.trim()) {
        setSlugError(true);
        setNotFound(true);
        return;
      }

      const b = await getBarberiaBySlug(slug);
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
      const slots = await getAvailableSlots(barberia?.id, fecha, servicio.duracion || 30);
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
      const limitCheck = await checkPlanLimits(barberia?.id, "create_turno");
      if (!limitCheck.allowed) {
        alert(limitCheck.reason);
        return;
      }

      // 0.5 Verificar solapamiento (Double check)
      const q = query(
        collection(db, "turnos"),
        where("barberiaId", "==", barberia?.id),
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
        barberiaId: barberia?.id,
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
        barberiaId: barberia?.id,
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
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary/50 text-center px-6">Cargando Agenda de {slug}</p>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center text-center p-6 space-y-6">
        <Scissors className="text-red-500 w-16 h-16" />
        <h1 className="text-3xl font-black text-white uppercase tracking-tighter">Barbería no encontrada</h1>
        <p className="text-gray-500 max-w-xs mx-auto">
          {slugError ? "Por favor proporciona un slug válido en la URL." : "El slug especificado no coincide con ninguna barbería registrada."}
        </p>
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
          <h1 className="text-4xl font-black uppercase tracking-tight">{barberia?.nombre ?? "Barbería"}</h1>
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
                        className="bg-red-500/20 text-red-500 px-4 py-2 rounded-lg font-bold text-xs uppercase tracking-wider hover:bg-red-500/30 transition-all"
                      >
                        Próximo día disponible
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={() => setStep(2)}
                  disabled={!hora}
                  className="flex items-center gap-2 bg-primary text-black px-8 py-3 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Continuar <ChevronRight className="w-4 h-4" />
                </button>
              </div>
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
                    required
                    className="w-full bg-black border border-white/10 rounded-2xl p-4 text-white focus:border-primary outline-none transition-all"
                    value={cliente.nombre}
                    onChange={(e) => setCliente({ ...cliente, nombre: e.target.value })}
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 flex items-center gap-2">
                    <MessageSquare className="w-3 h-3" /> WhatsApp
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="5491122334455"
                    className="w-full bg-black border border-white/10 rounded-2xl p-4 text-white focus:border-primary outline-none transition-all"
                    value={cliente.whatsapp}
                    onChange={(e) => setCliente({ ...cliente, whatsapp: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex justify-between">
                <button
                  onClick={() => setStep(1)}
                  className="flex items-center gap-2 bg-white/5 text-white px-8 py-3 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-white/10 transition-all"
                >
                  <ChevronRight className="w-4 h-4 rotate-180" /> Volver
                </button>
                <button
                  onClick={() => setStep(3)}
                  disabled={!cliente.nombre || !cliente.whatsapp}
                  className="flex items-center gap-2 bg-primary text-black px-8 py-3 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Continuar <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="space-y-2">
                <h2 className="text-3xl font-black uppercase tracking-tight">Confirmar <span className="text-primary">Reserva</span></h2>
              </div>

              <div className="space-y-6">
                <div className="bg-white/5 p-6 rounded-2xl space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 font-bold uppercase text-xs tracking-wider">Servicio</span>
                    <span className="text-white font-black text-sm">{servicio.nombre}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 font-bold uppercase text-xs tracking-wider">Fecha</span>
                    <span className="text-white font-black text-sm">{new Date(fecha).toLocaleDateString("es-ES", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 font-bold uppercase text-xs tracking-wider">Hora</span>
                    <span className="text-white font-black text-sm">{hora}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 font-bold uppercase text-xs tracking-wider">Precio</span>
                    <span className="text-primary font-black text-sm">${servicio.precio}</span>
                  </div>
                </div>

                <div className="bg-white/5 p-6 rounded-2xl space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 font-bold uppercase text-xs tracking-wider">Cliente</span>
                    <span className="text-white font-black text-sm">{cliente.nombre}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 font-bold uppercase text-xs tracking-wider">WhatsApp</span>
                    <span className="text-white font-black text-sm">{cliente.whatsapp}</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-between">
                <button
                  onClick={() => setStep(2)}
                  className="flex items-center gap-2 bg-white/5 text-white px-8 py-3 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-white/10 transition-all"
                >
                  <ChevronRight className="w-4 h-4 rotate-180" /> Volver
                </button>
                <button
                  onClick={handleConfirmar}
                  disabled={saving}
                  className="flex items-center gap-2 bg-primary text-black px-8 py-3 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                  Confirmar Reserva
                </button>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500 text-center">
              <div className="space-y-4">
                <CheckCircle2 className="w-16 h-16 text-primary mx-auto" />
                <h2 className="text-3xl font-black uppercase tracking-tight">¡Reserva <span className="text-primary">Confirmada</span>!</h2>
                <p className="text-gray-400">Te enviaremos un recordatorio por WhatsApp antes de tu turno.</p>
              </div>

              <div className="bg-white/5 p-6 rounded-2xl space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 font-bold uppercase text-xs tracking-wider">Servicio</span>
                  <span className="text-white font-black text-sm">{servicio.nombre}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 font-bold uppercase text-xs tracking-wider">Fecha</span>
                  <span className="text-white font-black text-sm">{new Date(fecha).toLocaleDateString("es-ES", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 font-bold uppercase text-xs tracking-wider">Hora</span>
                  <span className="text-white font-black text-sm">{hora}</span>
                </div>
              </div>

              <button
                onClick={() => router.push("/")}
                className="bg-primary text-black px-8 py-3 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-primary/90 transition-all"
              >
                Volver al Inicio
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Page({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = use(params);
  const slug = resolvedParams.slug;

  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center min-h-screen bg-black gap-4">
        <Loader2 className="animate-spin w-12 h-12 text-primary" />
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary/50 text-center px-6">Cargando...</p>
      </div>
    }>
      <ReservaContent slug={slug} />
    </Suspense>
  );
}
