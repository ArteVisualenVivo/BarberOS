"use client";

import { useState, useEffect, Suspense, use } from "react";
import { getBarberiaBySlug, Barberia } from "@/lib/tenants";
import { db } from "@/lib/firebase";
import { addDoc, collection, serverTimestamp, query, where, getDocs } from "firebase/firestore";
import { useRouter } from "next/navigation";
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

type PublicoFiltro = "todos" | "hombre" | "mujer";

const getTodayIsoDate = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const addDaysToIsoDate = (isoDate: string, days: number) => {
  const [year, month, day] = isoDate.split("-").map(Number);
  const nextDate = new Date(year, month - 1, day + days);
  const nextYear = nextDate.getFullYear();
  const nextMonth = String(nextDate.getMonth() + 1).padStart(2, "0");
  const nextDay = String(nextDate.getDate()).padStart(2, "0");
  return `${nextYear}-${nextMonth}-${nextDay}`;
};

const formatDateUI = (dateString: string) => {
  const [year, month, day] = dateString.split("-");
  return `${day}/${month}/${year}`;
};

const buildSlotKey = (dateString: string, timeString: string) => `${dateString}_${timeString}`;

function ReservaContent({ slug }: { slug: string }) {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState(1);
  const [barberia, setBarberia] = useState<Barberia | null>(null);
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [serviciosSeleccionados, setServiciosSeleccionados] = useState<Servicio[]>([]);
  const [notFound, setNotFound] = useState(false);
  const [slugError, setSlugError] = useState(false);

  const [fecha, setFecha] = useState(getTodayIsoDate());
  const [hora, setHora] = useState("");
  const [cliente, setCliente] = useState({ nombre: "", whatsapp: "" });
  const [publicoFiltro, setPublicoFiltro] = useState<PublicoFiltro>("todos");
  const [saving, setSaving] = useState(false);
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [closeBlocked, setCloseBlocked] = useState(false);

  const serviciosSafe = servicios ?? [];
  const serviciosSeleccionadosSafe = serviciosSeleccionados ?? [];
  const totalPrecio = serviciosSeleccionadosSafe.reduce((total, servicio) => total + (Number(servicio.precio) || 0), 0);
  const totalDuracion = serviciosSeleccionadosSafe.reduce((total, servicio) => total + (Number(servicio.duracion) || 0), 0);

  const servicioEsUnisex = (nombre: string) => {
    const normalized = nombre.toLowerCase();
    return [
      "corte",
      "lavado",
      "peinado",
      "brushing",
      "tratamiento capilar",
      "masaje capilar",
    ].some((keyword) => normalized.includes(keyword));
  };

  const servicioEsParaMujer = (nombre: string) => {
    if (servicioEsUnisex(nombre)) return true;
    const normalized = nombre.toLowerCase();
    return [
      "uñas",
      "unas",
      "alisado",
      "botox",
      "mechas",
      "color",
      "tintura",
      "peinado",
      "perfilado de cejas",
      "cejas",
      "pestañas",
      "pestanas",
      "manicura",
      "pedicura",
      "facial",
    ].some((keyword) => normalized.includes(keyword));
  };

  const servicioEsParaHombre = (nombre: string) => {
    if (servicioEsUnisex(nombre)) return true;
    const normalized = nombre.toLowerCase();
    return [
      "barba",
      "afeitado",
      "degradado",
      "fade",
      "perfilado de barba",
      "bigote",
    ].some((keyword) => normalized.includes(keyword));
  };

  const serviciosFiltrados = serviciosSafe.filter((servicio) => {
    if (publicoFiltro === "todos") return true;
    if (publicoFiltro === "mujer") return servicioEsParaMujer(servicio.nombre);
    if (publicoFiltro === "hombre") return servicioEsParaHombre(servicio.nombre);
    return true;
  });

  useEffect(() => {
    fetchInitialData();
  }, [slug]);

  useEffect(() => {
    if (barberia && serviciosSeleccionadosSafe.length > 0 && fecha) {
      fetchSlots();
    }
  }, [barberia, fecha, serviciosSeleccionadosSafe]);

  const fetchInitialData = async () => {
    setLoading(true);
    setNotFound(false);
    setSlugError(false);
    setBarberia(null);
    setServicios([]);
    setServiciosSeleccionados([]);
    setAvailableSlots([]);
    setHora("");

    try {
      if (!slug || !slug.trim()) {
        setSlugError(true);
        setNotFound(true);
        return;
      }

      const barberiaData = await getBarberiaBySlug(slug);

      if (!barberiaData?.id) {
        setNotFound(true);
        return;
      }

      setBarberia(barberiaData);

      const serviciosQuery = query(
        collection(db, "servicios"),
        where("barberiaId", "==", barberiaData.id)
      );
      const serviciosSnapshot = await getDocs(serviciosQuery);
      const serviciosData = serviciosSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<Servicio, "id">),
      }));

      setServicios(serviciosData);
    } catch (error) {
      console.error("Error fetching reservation data:", error);
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  };

  const fetchSlots = async () => {
    if (!barberia || serviciosSeleccionadosSafe.length === 0) return;

    setLoadingSlots(true);

    try {
      const slots = await getAvailableSlots(
        barberia.id,
        fecha,
        totalDuracion || 30
      );

      setAvailableSlots(slots);

      if (!slots.includes(hora)) {
        setHora("");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleSeleccionarServicio = (servicio: Servicio) => {
    setServiciosSeleccionados((current) => {
      const exists = current.some((item) => item.id === servicio.id);

      if (exists) {
        return current.filter((item) => item.id !== servicio.id);
      }

      return [...current, servicio];
    });
    setHora("");
    setAvailableSlots([]);
  };

  const handleConfirmar = async () => {
    if (!barberia || serviciosSeleccionadosSafe.length === 0) return;

    setSaving(true);

    try {
      const slotKey = buildSlotKey(fecha, hora);

      const limitCheck = await checkPlanLimits(barberia.id, "create_turno");

      if (!limitCheck.allowed) {
        alert(limitCheck.reason);
        return;
      }

      const q = query(
        collection(db, "turnos"),
        where("barberiaId", "==", barberia.id),
        where("fecha", "==", fecha),
        where("hora", "==", hora)
      );

      const snapshot = await getDocs(q);

      const slotKeyQuery = query(
        collection(db, "turnos"),
        where("barberiaId", "==", barberia.id),
        where("slotKey", "==", slotKey)
      );

      const slotKeySnapshot = await getDocs(slotKeyQuery);

      if (!snapshot.empty || !slotKeySnapshot.empty) {
        alert("Horario no disponible");
        setStep(2);
        fetchSlots();
        return;
      }

      await addDoc(collection(db, "turnos"), {
        barberiaId: barberia.id,
        servicioIds: serviciosSeleccionadosSafe.map((servicio) => servicio.id),
        servicioNombre: serviciosSeleccionadosSafe.map((servicio) => servicio.nombre).join(" + "),
        servicios: serviciosSeleccionadosSafe.map((servicio) => ({
          id: servicio.id,
          nombre: servicio.nombre,
          precio: Number(servicio.precio) || 0,
          duracion: Number(servicio.duracion) || 0,
        })),
        precio: totalPrecio,
        duracion: totalDuracion || 30,
        clienteNombre: cliente.nombre,
        clienteWhatsapp: cliente.whatsapp,
        fecha,
        hora,
        slotKey,
        estado: "pendiente",
        createdAt: serverTimestamp()
      });

      await addDoc(collection(db, "clientes"), {
        barberiaId: barberia.id,
        nombre: cliente.nombre,
        whatsapp: cliente.whatsapp,
        lastVisit: serverTimestamp(),
        createdAt: serverTimestamp()
      });

      setStep(4);
    } catch (error) {
      console.error("Error saving turno:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    window.close();

    window.setTimeout(() => {
      if (!window.closed) {
        setCloseBlocked(true);
      }
    }, 150);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-black gap-4">
        <Loader2 className="animate-spin w-12 h-12 text-primary" />
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary/50 text-center px-6">
          Cargando reserva...
        </p>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center text-center p-6 space-y-6">
        <Scissors className="text-red-500 w-16 h-16" />
        <h1 className="text-3xl font-black text-white uppercase tracking-tighter">Barberia no encontrada</h1>
        <p className="text-gray-500 max-w-xs mx-auto">
          {slugError ? "Por favor proporciona un slug valido en la URL." : "El slug especificado no coincide con ninguna barberia registrada."}
        </p>
        <button
          onClick={() => router.back()}
          className="bg-primary text-black px-8 py-4 rounded-2xl font-black uppercase text-xs tracking-widest"
        >
          Volver
        </button>
      </div>
    );
  }

  if (!barberia || !barberia.id) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center text-center p-6 space-y-6">
        <Scissors className="text-red-500 w-16 h-16" />
        <h1 className="text-3xl font-black text-white uppercase tracking-tighter">Error en la reserva</h1>
        <p className="text-gray-500 max-w-xs mx-auto">No pudimos encontrar la informacion necesaria para realizar tu reserva.</p>
        <button
          onClick={() => router.back()}
          className="bg-primary text-black px-8 py-4 rounded-2xl font-black uppercase text-xs tracking-widest"
        >
          Volver
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white font-sans px-6 py-12">
      <div className="max-w-3xl mx-auto space-y-12">
        <div className="text-center space-y-4">
          <div className="bg-primary/10 w-16 h-16 rounded-3xl flex items-center justify-center mx-auto border border-primary/20 mb-2">
            <Scissors className="text-primary w-8 h-8" />
          </div>
          <h1 className="text-4xl font-black uppercase tracking-tight">{barberia.nombre ?? "Barberia"}</h1>
          <p className="text-gray-500 font-bold uppercase text-[10px] tracking-widest">
            Reserva tu turno en simples pasos
          </p>
        </div>

        {step < 4 && (
          <div className="flex items-center justify-between px-4 sm:px-10">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-2">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs ${
                    step >= i ? "bg-primary text-black" : "bg-white/5 text-gray-600"
                  }`}
                >
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
                <h2 className="text-3xl font-black uppercase tracking-tight">
                  Elegi tus <span className="text-primary">Servicios</span>
                </h2>
                <p className="text-sm text-gray-500">
                  Selecciona uno o varios servicios antes de continuar.
                </p>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">
                  Mostrar servicios para
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {(["todos", "hombre", "mujer"] as PublicoFiltro[]).map((option) => {
                    const isActive = publicoFiltro === option;
                    return (
                      <button
                        key={option}
                        type="button"
                        onClick={() => setPublicoFiltro(option)}
                        className={`rounded-2xl border px-4 py-3 text-xs font-black uppercase tracking-widest transition-all ${
                          isActive
                            ? "border-primary bg-primary text-black"
                            : "border-white/10 bg-black text-gray-400 hover:border-primary/40"
                        }`}
                      >
                        {option}
                      </button>
                    );
                  })}
                </div>
              </div>

              {serviciosFiltrados.length > 0 ? (
                <div className="grid gap-4">
                  {serviciosFiltrados.map((servicio) => {
                    const isSelected = serviciosSeleccionadosSafe.some((item) => item.id === servicio.id);

                    return (
                      <button
                        key={servicio.id}
                        type="button"
                        onClick={() => handleSeleccionarServicio(servicio)}
                        className={`w-full rounded-3xl border p-5 text-left transition-all ${
                          isSelected
                            ? "border-primary bg-primary/10 shadow-[0_0_0_1px_rgba(255,255,255,0.02)]"
                            : "border-white/10 bg-black hover:border-primary/40"
                        }`}
                      >
                        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                          <div className="flex items-start gap-4">
                            <input
                              type="checkbox"
                              readOnly
                              checked={isSelected}
                              aria-label={`Seleccionar ${servicio.nombre}`}
                              className="mt-1 h-5 w-5 rounded border-white/20 bg-black accent-primary"
                            />
                            <div className="space-y-1">
                              <p className="text-lg font-black uppercase tracking-tight text-white">{servicio.nombre}</p>
                              <div className="flex items-center gap-4 text-xs font-bold uppercase tracking-wider text-gray-500">
                                <span className="flex items-center gap-2">
                                  <Clock className="w-3 h-3" />
                                  {servicio.duracion} min
                                </span>
                                <span className="text-primary">${servicio.precio}</span>
                              </div>
                            </div>
                          </div>
                          {isSelected && (
                            <span className="inline-flex items-center justify-center rounded-full bg-primary px-3 py-1 text-[10px] font-black uppercase tracking-widest text-black">
                              Seleccionado
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="bg-white/5 border border-white/10 rounded-3xl p-8 text-center">
                  <p className="text-sm font-bold text-white">
                    {serviciosSafe.length === 0
                      ? "Esta barberia todavia no tiene servicios publicados."
                      : "No hay servicios visibles para este filtro."}
                  </p>
                  <p className="mt-2 text-xs text-gray-500">
                    {serviciosSafe.length === 0
                      ? "Prueba mas tarde o contacta al negocio directamente."
                      : "Prueba cambiando entre Todos, Hombre o Mujer."}
                  </p>
                </div>
              )}

              {serviciosSeleccionadosSafe.length > 0 && (
                <div className="rounded-3xl border border-primary/20 bg-primary/5 p-5">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-primary/70">Servicios seleccionados</p>
                      <p className="mt-2 text-sm font-bold text-white">
                        {serviciosSeleccionadosSafe.map((servicio) => servicio.nombre).join(" + ")}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Total</p>
                      <p className="mt-2 text-sm font-black text-primary">
                        {totalDuracion} min / ${totalPrecio}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-end">
                <button
                  onClick={() => setStep(2)}
                  disabled={serviciosSeleccionadosSafe.length === 0}
                  className="flex items-center gap-2 bg-primary text-black px-8 py-3 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Continuar <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {step === 2 && serviciosSeleccionadosSafe.length > 0 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="space-y-2">
                <h2 className="text-3xl font-black uppercase tracking-tight">
                  Fecha y <span className="text-primary">Hora</span>
                </h2>
              </div>

              <div className="space-y-6">
                <div className="bg-white/5 p-5 rounded-2xl border border-white/10">
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Servicios elegidos</p>
                  <div className="mt-3 space-y-3">
                    {serviciosSeleccionadosSafe.map((servicio) => (
                      <div key={servicio.id} className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                        <span className="text-white font-black text-lg">{servicio.nombre}</span>
                        <span className="text-primary font-black text-sm">
                          {servicio.duracion} min / ${servicio.precio}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 border-t border-white/10 pt-4 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Total</span>
                    <span className="text-primary font-black text-sm">
                      {totalDuracion} min / ${totalPrecio}
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 flex items-center gap-2">
                    <Calendar className="w-3 h-3" /> Dia del Turno
                  </label>
                  <input
                    type="date"
                    min={getTodayIsoDate()}
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
                      {availableSlots.map((slot) => (
                        <button
                          key={slot}
                          type="button"
                          onClick={() => setHora(slot)}
                          className={`py-3 rounded-xl font-black text-xs transition-all border ${
                            hora === slot
                              ? "bg-primary text-black border-primary"
                              : "bg-black text-gray-400 border-white/5 hover:border-primary/30"
                          }`}
                        >
                          {slot}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-red-500/10 border border-red-500/20 p-6 rounded-2xl flex flex-col items-center gap-3 text-center">
                      <AlertCircle className="w-6 h-6 text-red-500" />
                      <p className="text-[10px] font-black uppercase tracking-widest text-red-500">
                        No hay horarios disponibles para esta fecha
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          setFecha(addDaysToIsoDate(fecha, 1));
                        }}
                        className="bg-red-500/20 text-red-500 px-4 py-2 rounded-lg font-bold text-xs uppercase tracking-wider hover:bg-red-500/30 transition-all"
                      >
                        Proximo dia disponible
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-between">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex items-center gap-2 bg-white/5 text-white px-8 py-3 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-white/10 transition-all"
                >
                  <ChevronRight className="w-4 h-4 rotate-180" /> Volver
                </button>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  disabled={!hora}
                  className="flex items-center gap-2 bg-primary text-black px-8 py-3 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Continuar <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {step === 3 && serviciosSeleccionadosSafe.length > 0 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="space-y-2">
                <h2 className="text-3xl font-black uppercase tracking-tight">
                  Tus <span className="text-primary">Datos</span>
                </h2>
              </div>

              <div className="space-y-6">
                <div className="bg-white/5 p-6 rounded-2xl space-y-4">
                  <div className="flex justify-between items-start gap-4">
                    <span className="text-gray-400 font-bold uppercase text-xs tracking-wider">Servicios</span>
                    <div className="text-right">
                      {serviciosSeleccionadosSafe.map((servicio) => (
                        <span key={servicio.id} className="block text-white font-black text-sm">
                          {servicio.nombre}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 font-bold uppercase text-xs tracking-wider">Total</span>
                    <span className="text-white font-black text-sm">
                      {totalDuracion} min / ${totalPrecio}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 font-bold uppercase text-xs tracking-wider">Fecha</span>
                    <span className="text-white font-black text-sm">
                      {formatDateUI(fecha)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 font-bold uppercase text-xs tracking-wider">Hora</span>
                    <span className="text-white font-black text-sm">{hora}</span>
                  </div>
                </div>

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
                  type="button"
                  onClick={() => setStep(2)}
                  className="flex items-center gap-2 bg-white/5 text-white px-8 py-3 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-white/10 transition-all"
                >
                  <ChevronRight className="w-4 h-4 rotate-180" /> Volver
                </button>
                <button
                  type="button"
                  onClick={handleConfirmar}
                  disabled={saving || !cliente.nombre || !cliente.whatsapp}
                  className="flex items-center gap-2 bg-primary text-black px-8 py-3 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                  Confirmar Reserva
                </button>
              </div>
            </div>
          )}

          {step === 4 && serviciosSeleccionadosSafe.length > 0 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500 text-center">
              <div className="space-y-4">
                <CheckCircle2 className="w-16 h-16 text-primary mx-auto" />
                <h2 className="text-3xl font-black uppercase tracking-tight">
                  Turno <span className="text-primary">confirmado</span>
                </h2>
                <p className="text-gray-400">Ya podes cerrar esta pestana.</p>
              </div>

              <div className="bg-white/5 p-6 rounded-2xl space-y-4">
                <div className="flex justify-between items-start gap-4">
                  <span className="text-gray-400 font-bold uppercase text-xs tracking-wider">Servicios</span>
                  <div className="text-right">
                    {serviciosSeleccionadosSafe.map((servicio) => (
                      <span key={servicio.id} className="block text-white font-black text-sm">
                        {servicio.nombre}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 font-bold uppercase text-xs tracking-wider">Total</span>
                  <span className="text-white font-black text-sm">
                    {totalDuracion} min / ${totalPrecio}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 font-bold uppercase text-xs tracking-wider">Fecha</span>
                  <span className="text-white font-black text-sm">
                    {formatDateUI(fecha)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 font-bold uppercase text-xs tracking-wider">Hora</span>
                  <span className="text-white font-black text-sm">{hora}</span>
                </div>
              </div>

              {closeBlocked && (
                <p className="text-xs text-gray-500">Si esta pestana no se cierra automaticamente, puedes cerrarla manualmente.</p>
              )}

              <button
                type="button"
                onClick={handleClose}
                className="bg-primary text-black px-8 py-3 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-primary/90 transition-all"
              >
                Cerrar
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
    <Suspense
      fallback={
        <div className="flex flex-col items-center justify-center min-h-screen bg-black gap-4">
          <Loader2 className="animate-spin w-12 h-12 text-primary" />
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary/50 text-center px-6">Cargando...</p>
        </div>
      }
    >
      <ReservaContent slug={slug} />
    </Suspense>
  );
}
