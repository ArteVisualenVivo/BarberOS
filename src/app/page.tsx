"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Scissors,
  ArrowRight,
  CheckCircle2,
  BarChart3,
  Calendar,
  Users,
  Zap,
  ShieldCheck,
  TrendingUp,
  ChevronRight,
  Plus
} from "lucide-react";

export default function SaaSLandingPage() {
  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-white/10 selection:text-white antialiased overflow-x-hidden">
      
      {/* Fondos con Brillo (Glows) */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-white/[0.03] rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-white/[0.02] rounded-full blur-[120px]" />
      </div>

      {/* Navegación */}
      <nav className="fixed top-0 w-full z-50 border-b border-white/[0.05] bg-[#050505]/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5 group cursor-pointer">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(255,255,255,0.1)] group-hover:scale-105 transition-transform duration-200">
              <Scissors size={16} className="text-black fill-black" />
            </div>
            <span className="font-bold tracking-tight text-white text-lg">BarberOS</span>
          </div>

          <div className="hidden md:flex items-center gap-8">
            {[
              { label: "Funciones", href: "#features" },
              { label: "Precios", href: "#pricing" },
              { label: "Empresas", href: "#enterprise" },
              { label: "Docs", href: "#docs" }
            ].map((item) => (
              <a key={item.label} href={item.href} className="text-[13px] font-medium text-zinc-500 hover:text-white transition-colors">
                {item.label}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <Link href="/login" className="text-[13px] font-medium text-zinc-400 hover:text-white transition-colors">
              Iniciar Sesión
            </Link>
            <Link href="/register" className="bg-white text-black text-[13px] font-bold px-4 py-1.5 rounded-full hover:bg-zinc-200 transition-all shadow-glow">
              Empezar Ahora
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 px-6">
        <div className="max-w-7xl mx-auto flex flex-col items-center text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.03] border border-white/[0.08] text-[11px] font-bold text-zinc-400 uppercase tracking-widest mb-8"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            V2.0 ya está disponible
            <ChevronRight size={12} className="text-zinc-600" />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter leading-[1.1] mb-8"
          >
            El sistema operativo <br />
            <span className="text-zinc-600">para barberías modernas.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="max-w-2xl text-lg md:text-xl text-zinc-500 font-medium leading-relaxed mb-12"
          >
            Gestiona turnos, clientes y pagos en una plataforma unificada. Diseñado para escalar, pensado para la simplicidad.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center gap-4"
          >
            <Link
              href="/register"
              className="w-full sm:w-auto bg-white text-black px-8 py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-3 hover:bg-zinc-200 active:scale-95 transition-all shadow-soft group"
            >
              Empezar gratis
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="#pricing"
              className="w-full sm:w-auto bg-white/[0.03] border border-white/[0.08] text-white px-8 py-4 rounded-2xl font-bold text-sm hover:bg-white/[0.06] transition-all"
            >
              Ver Precios
            </Link>
          </motion.div>

          {/* Dashboard Preview Placeholder */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mt-20 w-full max-w-5xl aspect-video rounded-3xl border border-white/[0.08] bg-white/[0.01] shadow-2xl relative overflow-hidden group"
          >
             <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] to-transparent" />
             <div className="absolute top-0 left-0 right-0 h-10 border-b border-white/[0.05] flex items-center px-4 gap-1.5">
               <div className="w-2 h-2 rounded-full bg-zinc-800" />
               <div className="w-2 h-2 rounded-full bg-zinc-800" />
               <div className="w-2 h-2 rounded-full bg-zinc-800" />
             </div>
             <div className="absolute inset-0 flex items-center justify-center">
               <div className="w-20 h-20 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                  <Scissors size={32} className="text-zinc-600" />
               </div>
             </div>
          </motion.div>
        </div>
      </section>

      {/* Metrics Section */}
      <section className="py-20 border-y border-white/[0.05] bg-white/[0.01]">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-24">
            {[
              { label: "Aumento en Reservas", value: "+120%", icon: Calendar, color: "text-emerald-400" },
              { label: "Crecimiento de Ingresos", value: "+85%", icon: TrendingUp, color: "text-blue-400" },
              { label: "Horas Ahorradas / Semanal", value: "12h", icon: Zap, color: "text-amber-400" },
            ].map((m, i) => (
              <div key={i} className="flex flex-col items-center md:items-start text-center md:text-left space-y-4">
                <div className="w-10 h-10 rounded-xl bg-white/[0.03] border border-white/[0.05] flex items-center justify-center">
                  <m.icon className="w-5 h-5 text-zinc-500" />
                </div>
                <div>
                  <h3 className={`text-4xl font-black ${m.color} tracking-tight`}>{m.value}</h3>
                  <p className="text-sm font-bold text-zinc-600 uppercase tracking-widest mt-1">{m.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col items-center text-center mb-20 space-y-4">
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white bg-white/[0.05] px-3 py-1 rounded-full">Funciones</span>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight text-white">Todo lo que necesitas para crecer.</h2>
            <p className="text-zinc-500 max-w-xl font-medium">Herramientas optimizadas para barberías modernas, creadas para el alto rendimiento.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                title: "Agenda Inteligente",
                desc: "Calendario con IA que optimiza tu jornada y evita huecos libres.",
                icon: Calendar
              },
              {
                title: "Pagos Unificados",
                desc: "Pagos con Stripe integrados para señas y cobros totales.",
                icon: BarChart3
              },
              {
                title: "CRM de Clientes",
                desc: "Historial detallado y notas para cada cliente que atiendes.",
                icon: Users
              },
              {
                title: "Analíticas Pro",
                desc: "Gráficos profesionales e insights para seguir tu crecimiento.",
                icon: TrendingUp
              },
              {
                title: "Seguro y Rápido",
                desc: "Arquitectura moderna con 99.9% de disponibilidad y velocidad.",
                icon: ShieldCheck
              },
              {
                title: "Configuración Instantánea",
                desc: "Crea tu perfil en segundos y empieza a recibir turnos hoy mismo.",
                icon: Plus
              }
            ].map((f, i) => (
              <div key={i} className="glass p-8 rounded-3xl border-white/[0.05] hover:bg-white/[0.04] transition-all group">
                <div className="w-12 h-12 rounded-2xl bg-white/[0.03] border border-white/[0.05] flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-white group-hover:text-black transition-all duration-300">
                  <f.icon size={22} />
                </div>
                <h3 className="text-lg font-bold text-white mb-3 tracking-tight">{f.title}</h3>
                <p className="text-sm text-zinc-500 leading-relaxed font-medium">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-32 px-6 bg-white/[0.01]">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col items-center text-center mb-20 space-y-4">
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white bg-white/[0.05] px-3 py-1 rounded-full">Precios</span>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight text-white">Precios simples y transparentes.</h2>
            <p className="text-zinc-500 max-w-xl font-medium">Empieza gratis y escala a medida que tu negocio crece.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <div className="glass p-10 rounded-[32px] border-white/[0.05] flex flex-col group">
              <div className="flex-1 space-y-8">
                <div>
                  <h3 className="text-xl font-bold text-white tracking-tight">Plan Gratis</h3>
                  <div className="flex items-baseline gap-1 mt-4">
                    <span className="text-5xl font-black text-white">$0</span>
                    <span className="text-zinc-600 font-bold text-xs uppercase tracking-widest">/ mes</span>
                  </div>
                </div>
                <ul className="space-y-4">
                  {["20 turnos / mes", "1 sucursal", "Página de reservas pública", "Analíticas básicas"].map((feat, i) => (
                    <li key={i} className="flex items-center gap-3 text-sm text-zinc-500 font-medium">
                      <CheckCircle2 size={16} className="text-zinc-800" /> {feat}
                    </li>
                  ))}
                </ul>
              </div>
              <Link href="/register" className="mt-12 block w-full text-center py-4 rounded-2xl bg-white/[0.05] border border-white/[0.1] text-white font-bold text-sm hover:bg-white/[0.08] transition-all">
                Empezar Gratis
              </Link>
            </div>

            <div className="bg-white p-10 rounded-[32px] flex flex-col shadow-2xl shadow-white/10 relative overflow-hidden group">
              <div className="absolute top-0 right-0 bg-black text-white px-4 py-1.5 font-bold uppercase tracking-widest text-[9px] rounded-bl-xl">
                Más Popular
              </div>
              <div className="flex-1 space-y-8 relative z-10">
                <div>
                  <h3 className="text-xl font-bold text-black tracking-tight">Plan Pro</h3>
                  <div className="flex items-baseline gap-1 mt-4">
                    <span className="text-5xl font-black text-black">$29</span>
                    <span className="text-zinc-400 font-bold text-xs uppercase tracking-widest">/ mes</span>
                  </div>
                </div>
                <ul className="space-y-4">
                  {["Turnos ilimitados", "Gestión multi-sucursal", "Herramientas CRM avanzadas", "Dominio personalizado", "Soporte prioritario 24/7", "Marca personalizada"].map((feat, i) => (
                    <li key={i} className="flex items-center gap-3 text-sm text-black font-bold">
                      <CheckCircle2 size={16} className="text-black" /> {feat}
                    </li>
                  ))}
                </ul>
              </div>
              <Link href="/register" className="mt-12 block w-full text-center py-4 rounded-2xl bg-black text-white font-black text-sm hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl">
                Probar Plan Pro
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 border-t border-white/[0.05]">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 flex flex-col md:row items-center justify-between gap-10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
              <Scissors size={16} className="text-black fill-black" />
            </div>
            <span className="font-bold tracking-tight text-white text-lg">BarberOS</span>
          </div>
          <div className="flex gap-10">
             {[
               { label: "Privacidad", href: "#" },
               { label: "Términos", href: "#" },
               { label: "Soporte", href: "#" },
               { label: "Twitter", href: "#" }
             ].map(item => (
               <a key={item.label} href={item.href} className="text-xs font-bold text-zinc-600 hover:text-white transition-colors uppercase tracking-widest">{item.label}</a>
             ))}
          </div>
          <p className="text-xs font-bold text-zinc-700 uppercase tracking-widest">© 2026 BarberOS Inc.</p>
        </div>
      </footer>

    </div>
  );
}
