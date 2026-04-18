"use client";

import { useBarberia } from "@/hooks/useBarberia";
import { useAuth } from "@/hooks/useAuth";
import { useState, useEffect } from "react";
import { updateDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { 
  Settings, 
  Store, 
  CreditCard, 
  Save, 
  Loader2, 
  Globe, 
  Phone, 
  MapPin, 
  CheckCircle2,
  Clock,
  Zap,
  ShieldCheck,
  History,
  Layout,
  Bell,
  Lock,
  ChevronRight,
  ExternalLink
} from "lucide-react";

const DIAS = [
  { id: "lunes", label: "Lunes" },
  { id: "martes", label: "Martes" },
  { id: "miercoles", label: "Miércoles" },
  { id: "jueves", label: "Jueves" },
  { id: "viernes", label: "Viernes" },
  { id: "sabado", label: "Sábado" },
  { id: "domingo", label: "Domingo" },
];

const DEFAULT_HORARIOS = DIAS.reduce((acc, dia) => ({
  ...acc,
  [dia.id]: { abierto: dia.id !== "domingo", inicio: "09:00", fin: dia.id === "sabado" ? "14:00" : "18:00" }
}), {});

export default function SettingsPage() {
  const { barberia, refresh } = useBarberia();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [stripeLoading, setStripeLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState("general"); // general, horarios, plan

  const [formData, setFormData] = useState({
    nombre: "",
    slug: "",
    descripcion: "",
    telefono: "",
    direccion: "",
    logoUrl: ""
  });

  const [horarios, setHorarios] = useState<any>(DEFAULT_HORARIOS);

  useEffect(() => {
    if (barberia) {
      setFormData({
        nombre: barberia.nombre || "",
        slug: barberia.slug || "",
        descripcion: barberia.descripcion || "",
        telefono: barberia.telefono || "",
        direccion: barberia.direccion || "",
        logoUrl: barberia.logoUrl || ""
      });
      if (barberia.horarios) {
        setHorarios(barberia.horarios);
      }
    }
  }, [barberia]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!barberia) return;
    setLoading(true);

    try {
      await updateDoc(doc(db, "barberias", barberia.id), {
        ...formData,
        horarios
      });
      setSuccess(true);
      refresh();
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = async () => {
    if (!barberia || !user) return;
    setStripeLoading(true);
    try {
      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          barberiaId: barberia.id,
          userId: user.uid,
          email: user.email,
          planId: "pro",
        }),
      });

      const { url, error } = await response.json();
      if (error) throw new Error(error);
      if (url) window.location.href = url;
    } catch (error) {
      console.error("Stripe Error:", error);
      alert("Error al iniciar el pago. Por favor, inténtalo de nuevo.");
    } finally {
      setStripeLoading(false);
    }
  };

  const updateHorario = (diaId: string, field: string, value: any) => {
    setHorarios({
      ...horarios,
      [diaId]: { ...horarios[diaId], [field]: value }
    });
  };

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Configuración</h1>
          <p className="text-sm text-zinc-500 mt-1">Gestiona las preferencias de tu negocio y tu plan de suscripción.</p>
        </div>
        
        <div className="flex p-1 bg-white/[0.02] border border-white/[0.05] rounded-xl">
          <button
            onClick={() => setActiveTab("general")}
            className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 ${
              activeTab === "general" ? "bg-white/[0.08] text-white shadow-soft" : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            <Layout size={14} /> Perfil
          </button>
          <button
            onClick={() => setActiveTab("horarios")}
            className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 ${
              activeTab === "horarios" ? "bg-white/[0.08] text-white shadow-soft" : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            <Clock size={14} /> Horario
          </button>
          <button
            onClick={() => setActiveTab("plan")}
            className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 ${
              activeTab === "plan" ? "bg-white/[0.08] text-white shadow-soft" : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            <CreditCard size={14} /> Facturación
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-10">
        {/* Left Sidebar Links */}
        <div className="hidden lg:block lg:col-span-3 space-y-1">
          <button className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'general' ? 'bg-white/[0.05] text-white' : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.02]'}`} onClick={() => setActiveTab('general')}>General</button>
          <button className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'horarios' ? 'bg-white/[0.05] text-white' : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.02]'}`} onClick={() => setActiveTab('horarios')}>Horarios de atención</button>
          <button className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'plan' ? 'bg-white/[0.05] text-white' : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.02]'}`} onClick={() => setActiveTab('plan')}>Suscripción y facturación</button>
          <div className="pt-4 mt-4 border-t border-white/[0.05]">
            <button className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.02] flex items-center justify-between group">
              Notificaciones
              <Lock size={12} className="text-zinc-700 group-hover:text-zinc-500" />
            </button>
            <button className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.02] flex items-center justify-between group">
              Seguridad
              <Lock size={12} className="text-zinc-700 group-hover:text-zinc-500" />
            </button>
          </div>
        </div>

        {/* Main Settings Content */}
        <div className="lg:col-span-9">
          {activeTab === "general" && (
            <div className="glass rounded-2xl overflow-hidden shadow-soft">
              <div className="p-6 border-b border-white/[0.05] bg-white/[0.01]">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Perfil Público</h3>
                <p className="text-[11px] text-zinc-500 mt-1">Esta información se mostrará en tu página pública de reservas.</p>
              </div>
              <form onSubmit={handleSubmit} className="p-8 space-y-8">
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-zinc-500 ml-1">Nombre del Negocio</label>
                      <input
                        type="text"
                        required
                        className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white focus:bg-white/[0.05] transition-all"
                        value={formData.nombre}
                        onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-zinc-500 ml-1 flex items-center gap-2">
                        <Globe size={12} /> URL Pública
                      </label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 font-bold text-xs">barber.os/</span>
                        <input
                          type="text"
                          required
                          className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-3 pl-20 text-sm text-white focus:bg-white/[0.05] transition-all"
                          value={formData.slug}
                          onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/\s/g, '-') })}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-zinc-500 ml-1 flex items-center gap-2">
                        <Phone size={12} /> Teléfono de WhatsApp
                      </label>
                      <input
                        type="tel"
                        placeholder="ej. 5491122334455"
                        className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white focus:bg-white/[0.05] transition-all"
                        value={formData.telefono}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, ""); // Solo números
                          setFormData({ ...formData, telefono: value });
                        }}
                      />
                      <p className="text-[9px] text-zinc-600 ml-1">Ingresa solo números (ej. 5493512417121)</p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-zinc-500 ml-1 flex items-center gap-2">
                        <MapPin size={12} /> Dirección Física
                      </label>
                      <input
                        type="text"
                        placeholder="ej. Calle Principal 123, Ciudad"
                        className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white focus:bg-white/[0.05] transition-all"
                        value={formData.direccion}
                        onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-zinc-500 ml-1">Descripción Corta</label>
                      <textarea
                        rows={4}
                        className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white focus:bg-white/[0.05] transition-all resize-none"
                        value={formData.descripcion}
                        onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-8 border-t border-white/[0.05]">
                  <div className="flex items-center gap-3">
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex items-center gap-2 bg-white text-black px-8 py-2.5 rounded-lg font-bold text-xs uppercase tracking-wider hover:bg-zinc-200 transition-all shadow-soft disabled:opacity-50"
                    >
                      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save size={14} />}
                      Guardar Cambios
                    </button>
                    {success && (
                      <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest animate-in fade-in duration-300">
                        Cambios guardados con éxito
                      </span>
                    )}
                  </div>
                </div>
              </form>
            </div>
          )}

          {activeTab === "horarios" && (
            <div className="glass rounded-2xl overflow-hidden shadow-soft">
              <div className="p-6 border-b border-white/[0.05] bg-white/[0.01]">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Horarios de Atención</h3>
                <p className="text-[11px] text-zinc-500 mt-1">Configura tu disponibilidad semanal para las reservas de clientes.</p>
              </div>
              <form onSubmit={handleSubmit} className="divide-y divide-white/[0.03]">
                {DIAS.map((dia) => (
                  <div key={dia.id} className="p-6 flex items-center justify-between group hover:bg-white/[0.01] transition-all">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-[10px] uppercase transition-all border ${
                        horarios[dia.id]?.abierto 
                          ? "bg-white text-black border-white shadow-soft" 
                          : "bg-white/[0.02] text-zinc-600 border-white/[0.05]"
                      }`}>
                        {dia.label.substring(0, 2)}
                      </div>
                      <span className={`text-sm font-bold uppercase tracking-widest ${horarios[dia.id]?.abierto ? "text-white" : "text-zinc-600"}`}>
                        {dia.label}
                      </span>
                    </div>

                    <div className="flex items-center gap-6">
                      {horarios[dia.id]?.abierto ? (
                        <div className="flex items-center gap-3">
                          <input 
                            type="time" 
                            className="bg-white/[0.03] border border-white/[0.08] rounded-lg px-3 py-1.5 text-xs font-bold text-white focus:border-white/20 transition-all"
                            value={horarios[dia.id].inicio}
                            onChange={(e) => updateHorario(dia.id, "inicio", e.target.value)}
                          />
                          <span className="text-zinc-700 font-bold">-</span>
                          <input 
                            type="time" 
                            className="bg-white/[0.03] border border-white/[0.08] rounded-lg px-3 py-1.5 text-xs font-bold text-white focus:border-white/20 transition-all"
                            value={horarios[dia.id].fin}
                            onChange={(e) => updateHorario(dia.id, "fin", e.target.value)}
                          />
                        </div>
                      ) : (
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-700 italic">Cerrado</span>
                      )}

                      <button
                        type="button"
                        onClick={() => updateHorario(dia.id, "abierto", !horarios[dia.id].abierto)}
                        className={`px-3 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-widest transition-all border ${
                          horarios[dia.id]?.abierto 
                            ? "border-rose-500/20 text-rose-500 hover:bg-rose-500/5" 
                            : "border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/5"
                        }`}
                      >
                        {horarios[dia.id]?.abierto ? "Cerrar" : "Abrir"}
                      </button>
                    </div>
                  </div>
                ))}
                <div className="p-6 bg-white/[0.01]">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center gap-2 bg-white text-black px-8 py-2.5 rounded-lg font-bold text-xs uppercase tracking-wider hover:bg-zinc-200 transition-all shadow-soft"
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save size={14} />}
                    Guardar Horario
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeTab === "plan" && (
            <div className="space-y-8 animate-in fade-in duration-500">
              {/* Current Plan Card */}
              <div className="glass p-8 rounded-2xl border-white/[0.08] flex flex-col md:row items-center justify-between gap-8 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-10 opacity-[0.03] group-hover:opacity-[0.05] transition-opacity pointer-events-none">
                  <CreditCard size={180} />
                </div>
                <div className="flex items-center gap-6 relative z-10">
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center border ${
                    barberia?.plan === 'pro' 
                      ? 'bg-white text-black border-white shadow-[0_0_20px_rgba(255,255,255,0.2)]' 
                      : 'bg-white/[0.03] text-zinc-500 border-white/[0.08]'
                  }`}>
                    {barberia?.plan === 'pro' ? <Zap size={28} className="fill-black" /> : <ShieldCheck size={28} />}
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] mb-1">Suscripción Actual</p>
                    <h3 className="text-3xl font-bold text-white tracking-tight">
                      {barberia?.plan === 'pro' ? 'Plan Pro' : 'Plan Gratis'}
                    </h3>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Estado Activo</p>
                    </div>
                  </div>
                </div>
                
                {barberia?.plan === 'free' && (
                  <button 
                    onClick={handleUpgrade}
                    disabled={stripeLoading}
                    className="relative z-10 bg-white text-black px-10 py-3 rounded-xl font-bold uppercase tracking-widest text-[11px] hover:scale-105 active:scale-95 transition-all shadow-soft flex items-center gap-2"
                  >
                    {stripeLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap size={16} className="fill-black" />}
                    Mejorar a Pro
                  </button>
                )}
              </div>

              {/* Pricing Grid */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className={`glass p-8 rounded-2xl border-white/[0.08] space-y-8 relative flex flex-col ${
                  barberia?.plan === 'free' ? 'border-white/20' : 'opacity-60'
                }`}>
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold text-white uppercase tracking-tight">Gratis</h3>
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-bold text-white">$0</span>
                      <span className="text-zinc-500 font-bold uppercase text-[10px] tracking-widest">/ mes</span>
                    </div>
                  </div>

                  <ul className="space-y-4 flex-1">
                    {[
                      "Hasta 5 días de prueba", 
                      "Página de reservas pública", 
                      "Gestión de servicios", 
                      "Analíticas básicas"
                    ].map((item, i) => (
                      <li key={i} className="flex items-center gap-3 text-[11px] font-medium text-zinc-400">
                        <CheckCircle2 size={14} className="text-zinc-600" /> {item}
                      </li>
                    ))}
                  </ul>
                  
                  {barberia?.plan === 'free' && (
                    <div className="pt-4 border-t border-white/[0.05] text-center text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                      Plan Actual
                    </div>
                  )}
                </div>

                <div className={`glass p-8 rounded-2xl border-white/[0.08] bg-white/[0.01] space-y-8 relative flex flex-col ${
                  barberia?.plan === 'pro' ? 'border-white/40 shadow-glow' : 'hover:border-white/20'
                }`}>
                  <div className="absolute top-0 right-0 bg-white text-black px-4 py-1.5 font-bold uppercase tracking-widest text-[9px] rounded-bl-xl">
                    Más Popular
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold text-white uppercase tracking-tight">Pro</h3>
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-bold text-white">$29</span>
                      <span className="text-zinc-500 font-bold uppercase text-[10px] tracking-widest">/ mes</span>
                    </div>
                  </div>

                  <ul className="space-y-4 flex-1">
                    {[
                      "Turnos ilimitados", 
                      "Dashboard de analíticas", 
                      "Marca personalizada",
                      "Herramientas CRM para clientes"
                    ].map((item, i) => (
                      <li key={i} className="flex items-center gap-3 text-[11px] font-bold text-white">
                        <CheckCircle2 size={14} className="text-white" /> {item}
                      </li>
                    ))}
                  </ul>

                  {barberia?.plan !== 'pro' ? (
                    <button 
                      onClick={handleUpgrade}
                      disabled={stripeLoading}
                      className="block w-full text-center bg-white text-black py-3 rounded-xl font-bold uppercase tracking-widest text-[11px] hover:scale-105 transition-all shadow-soft"
                    >
                      {stripeLoading ? "Cargando..." : "Empezar Ahora"}
                    </button>
                  ) : (
                    <div className="pt-4 border-t border-white/[0.05] text-center text-[10px] font-bold text-emerald-400 uppercase tracking-widest">
                      Suscripción Activa
                    </div>
                  )}
                </div>
              </div>

              {/* Billing Portal Link */}
              <div className="glass p-6 rounded-2xl border-white/[0.05] flex items-center gap-6 group hover:bg-white/[0.02] transition-all">
                <div className="w-12 h-12 rounded-xl bg-white/[0.03] border border-white/[0.08] flex items-center justify-center text-zinc-500 group-hover:text-white transition-colors">
                  <History size={20} />
                </div>
                <div className="flex-1 flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-sm text-white tracking-tight">Gestión de Facturación</h4>
                    <p className="text-zinc-500 text-[11px] font-medium mt-0.5">Gestiona tus facturas, métodos de pago y detalles de facturación.</p>
                  </div>
                  <button 
                    disabled={barberia?.plan !== 'pro'}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest text-zinc-400 border border-white/[0.05] bg-white/[0.02] hover:bg-white/[0.05] hover:text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    Abrir Portal
                    <ExternalLink size={12} />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
