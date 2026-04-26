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
  ShieldCheck,
  Layout,
  Bell,
  Lock
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
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState("general"); // general, horarios, plan

  // Guard clause por seguridad
  if (!barberia) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="w-12 h-12 border-2 border-white/10 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  const [formData, setFormData] = useState({
    nombre: "",
    slug: "",
    descripcion: "",
    telefono: "",
    direccion: "",
    logoUrl: ""
  });

  const [horarios, setHorarios] = useState<any>(DEFAULT_HORARIOS);

  const generateSlug = (value: string) => {
    return value
      .toLowerCase()
      .trim()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[\s_]+/g, "-")
      .replace(/[^a-z0-9-]/g, "")
      .replace(/^-+|-+$/g, "");
  };

  useEffect(() => {
    if (barberia) {
      setFormData({
        nombre: barberia?.nombre || "",
        slug: barberia?.slug || "",
        descripcion: barberia?.descripcion || "",
        telefono: barberia?.telefono || "",
        direccion: barberia?.direccion || "",
        logoUrl: barberia?.logoUrl || ""
      });
      if (barberia?.horarios) {
        setHorarios(barberia?.horarios);
      }
    }
  }, [barberia]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!barberia) return;
    setLoading(true);

    try {
      const slugFinal = generateSlug(formData.slug || formData.nombre);

      await updateDoc(doc(db, "barberias", barberia?.id), {
        nombre: formData.nombre,
        descripcion: formData.descripcion,
        telefono: formData.telefono,
        direccion: formData.direccion,
        logoUrl: formData.logoUrl,
        slug: slugFinal,
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


  const updateHorario = (diaId: string, field: string, value: any) => {
    setHorarios({
      ...horarios,
      [diaId]: { ...horarios[diaId], [field]: value }
    });
  };

  if (!barberia) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="w-12 h-12 border-2 border-white/10 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  const isExpired =
    barberia?.licenseExpiresAt &&
    new Date(barberia?.licenseExpiresAt.seconds * 1000) < new Date();

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Configuración del negocio</h1>
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
            <CreditCard size={14} /> Suscripción
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-10">
        {/* Left Sidebar Links */}
        <div className="hidden lg:block lg:col-span-3 space-y-1">
          <button className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'general' ? 'bg-white/[0.05] text-white' : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.02]'}`} onClick={() => setActiveTab('general')}>General</button>
          <button className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'horarios' ? 'bg-white/[0.05] text-white' : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.02]'}`} onClick={() => setActiveTab('horarios')}>Horarios de atención</button>
          <button className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'plan' ? 'bg-white/[0.05] text-white' : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.02]'}`} onClick={() => setActiveTab('plan')}>Suscripción</button>
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
                          onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().trim().replace(/\s+/g, '-') })}
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
              <div className="glass p-8 rounded-2xl border-white/[0.08] relative overflow-hidden">
                <div className="absolute top-0 right-0 p-10 opacity-[0.03] transition-opacity pointer-events-none">
                  <CreditCard size={180} />
                </div>
                <div className="relative z-10 space-y-6">
                  <div className="flex items-center gap-4">
                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center border ${
                      barberia?.plan === 'pro' 
                        ? 'bg-white text-black border-white shadow-[0_0_20px_rgba(255,255,255,0.2)]' 
                        : 'bg-white/[0.03] text-zinc-500 border-white/[0.08]'
                    }`}>
                      <ShieldCheck size={28} />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] mb-1">Estado de suscripción</p>
                      <h3 className="text-3xl font-bold text-white tracking-tight">
                        {barberia?.plan === 'pro' ? 'Plan Pro' : barberia?.plan === 'trial' ? 'Trial gratuito' : 'Plan Gratis'}
                      </h3>
                      <p className="text-sm text-zinc-400 mt-2">
                        {barberia?.plan === 'pro'
                          ? 'Tu cuenta está activa con acceso completo.'
                          : barberia?.plan === 'trial'
                          ? 'Estás en el período de prueba de 7 días. Al expirar, solo podrás activar la cuenta en /activate.'
                          : 'Tu suscripción actual no es PRO. Activa tu cuenta en /activate.'
                        }
                      </p>
                    </div>
                  </div>
                  <div className="rounded-3xl border border-white/[0.05] bg-white/[0.03] p-6">
                    <p className="text-sm font-bold uppercase tracking-[0.2em] text-zinc-500 mb-3">Acceso</p>
                    <p className="text-sm text-zinc-300 leading-7">
                      Este sistema no usa Stripe ni pagos automáticos. La activación se hace manualmente con un código enviado por el admin.
                    </p>
                  </div>
                  <div className="rounded-3xl border border-white/[0.05] bg-white/[0.03] p-6">
                    <p className="text-sm font-bold uppercase tracking-[0.2em] text-zinc-500 mb-3">Si tu trial expira</p>
                    <p className="text-sm text-zinc-300 leading-7">
                      El dashboard se bloqueará y solo podrás ingresar a <span className="font-semibold text-white">/activate</span> para validar tu código.
                    </p>
                  </div>
                    {/* --- MEJORAR AHORA / PLAN ACTIVADO --- */}
                    {(() => {
                      // Considera activa si subscriptionStatus === 'active' o plan === 'pro' o licenseExpiresAt futura
                      const expiresAt = barberia?.licenseExpiresAt ? new Date(barberia?.licenseExpiresAt).getTime() : 0;
                      const isLicenseActive = barberia?.subscriptionStatus === 'active' || barberia?.plan === 'pro' || (expiresAt && Date.now() < expiresAt);
                      if (isLicenseActive) {
                        return (
                          <div className="mt-8 flex flex-col items-center justify-center">
                            <span className="inline-block px-6 py-3 rounded-xl bg-emerald-600/80 text-white font-bold text-lg tracking-wider shadow-soft cursor-default select-none opacity-80">
                              🟢 Plan activado
                            </span>
                            {expiresAt ? (
                              <span className="mt-2 text-xs text-zinc-400">Válido hasta: {new Date(expiresAt).toLocaleDateString()}</span>
                            ) : null}
                          </div>
                        );
                      }
                      // Si no está activo, mostrar CTA para mejorar
                      return (
                        <div className="mt-8 flex flex-col items-center justify-center">
                          <a
                            href="/activate"
                            className="inline-block px-6 py-3 rounded-xl bg-gradient-to-r from-amber-400 to-amber-600 text-black font-bold text-lg tracking-wider shadow-soft hover:scale-105 transition-transform"
                          >
                            ⭐ Mejorar a Pro
                          </a>
                        </div>
                      );
                    })()}
                  {process.env.NODE_ENV === "development" && (
                    <button
                      onClick={() => {
                        localStorage.setItem("force_trial_expired", "true");
                        window.location.href = "/activate";
                      }}
                      style={{
                        background: "red",
                        color: "white",
                        padding: "10px 14px",
                        borderRadius: "8px",
                        marginTop: "20px",
                        cursor: "pointer"
                      }}
                    >
                      🔥 FORZAR EXPIRACIÓN TRIAL (DEV ONLY)
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
