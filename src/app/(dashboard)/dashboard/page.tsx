"use client";

import { useBarberia } from "@/hooks/useBarberia";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getTenantCollection, COLLECTIONS } from "@/lib/db";
import { 
  TrendingUp, 
  Calendar, 
  Users, 
  DollarSign,
  ArrowUpRight,
  Clock,
  ArrowRight,
  MoreHorizontal,
  Plus,
  ArrowDownRight,
  Target
} from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  const { barberia } = useBarberia();
  const { user, userData } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState({
    turnosHoy: 0,
    clientesTotal: 0,
    ingresosEstimados: 0,
  });
  const [loading, setLoading] = useState(true);
  const [recientes, setRecientes] = useState<any[]>([]);

  useEffect(() => {
    if (barberia) {
      fetchStats();
    }
  }, [barberia]);

  const fetchStats = async () => {
    try {
      const [turnos, clientes] = await Promise.all([
        getTenantCollection(COLLECTIONS.TURNOS, barberia!.id),
        getTenantCollection(COLLECTIONS.CLIENTES, barberia!.id),
      ]);

      const hoy = new Date().toLocaleDateString("en-CA");
      const turnosHoy = turnos.filter((t: any) => t.fecha === hoy);
      const ingresos = turnos.reduce((acc: number, t: any) => acc + (Number(t.precio) || 0), 0);

      setStats({
        turnosHoy: turnosHoy.length,
        clientesTotal: clientes.length,
        ingresosEstimados: ingresos,
      });
      
      // Ordenar por fecha y hora descendente para mostrar los más recientes/próximos
      const sortedTurnos = [...turnos].sort((a, b) => {
        const dateA = `${a.fecha}T${a.hora}`;
        const dateB = `${b.fecha}T${b.hora}`;
        return dateB.localeCompare(dateA);
      });
      
      setRecientes(sortedTurnos.slice(0, 5));
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { 
      name: "Ingresos Totales", 
      value: `$${stats.ingresosEstimados.toLocaleString()}`, 
      icon: <DollarSign size={18} />, 
      trend: "+12.5%", 
      isPositive: true,
      description: "vs mes anterior"
    },
    { 
      name: "Turnos de Hoy", 
      value: stats.turnosHoy, 
      icon: <Calendar size={18} />, 
      trend: "+3", 
      isPositive: true,
      description: "programados para hoy"
    },
    { 
      name: "Clientes Totales", 
      value: stats.clientesTotal, 
      icon: <Users size={18} />, 
      trend: "+8.2%", 
      isPositive: true,
      description: "nuevos clientes esta semana"
    },
  ];

  return (
    <div className="space-y-10">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Resumen</h1>
          <p className="text-sm text-zinc-500 mt-1">Bienvenido de nuevo, {userData?.nombre || "Barber"}. Esto es lo que está pasando hoy.</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {statCards.map((card, i) => (
          <div key={i} className="glass p-6 rounded-2xl flex flex-col justify-between group transition-all duration-300 hover:bg-white/[0.05]">
            <div className="flex items-center justify-between mb-5">
              <div className="w-10 h-10 rounded-xl bg-white/[0.03] border border-white/[0.05] flex items-center justify-center text-zinc-400 group-hover:text-white group-hover:scale-110 transition-all duration-300">
                {card.icon}
              </div>
              <div className={`flex items-center gap-1 text-[11px] font-bold px-2 py-1 rounded-full border ${
                card.isPositive 
                  ? "text-emerald-400 bg-emerald-500/5 border-emerald-500/10" 
                  : "text-rose-400 bg-rose-500/5 border-rose-500/10"
              }`}>
                {card.isPositive ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                {card.trend}
              </div>
            </div>
            <div>
              <p className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest mb-1">{card.name}</p>
              <h3 className="text-3xl font-bold text-white tracking-tight">{card.value}</h3>
              <p className="text-[11px] text-zinc-600 mt-2 font-medium">{card.description}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-12 gap-6">
        {/* Recent Activity */}
        <div className="lg:col-span-8 glass rounded-2xl flex flex-col overflow-hidden">
          <div className="px-6 py-5 border-b border-white/[0.05] flex items-center justify-between bg-white/[0.01]">
            <div>
              <h2 className="text-sm font-bold text-white tracking-tight">Actividad Reciente</h2>
              <p className="text-[11px] text-zinc-500 mt-0.5">Estado en tiempo real de tu negocio</p>
            </div>
            <Link href="/turnos" className="text-[11px] font-bold text-zinc-400 hover:text-white transition-colors flex items-center gap-1.5 px-3 py-1.5 bg-white/[0.03] rounded-lg border border-white/[0.05] hover:border-white/10 group">
              Ver todo <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
          
          <div className="p-3">
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="w-6 h-6 border-2 border-white/5 border-t-white rounded-full animate-spin" />
              </div>
            ) : recientes.length > 0 ? (
              <div className="space-y-1">
                {recientes.map((turno, i) => (
                  <div key={i} className="flex items-center justify-between p-3.5 hover:bg-white/[0.03] rounded-xl transition-all group border border-transparent hover:border-white/[0.05]">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-zinc-800 to-zinc-900 border border-white/[0.05] flex items-center justify-center text-[10px] font-bold text-zinc-300">
                        {turno.clienteNombre?.[0]?.toUpperCase()}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white transition-colors">{turno.clienteNombre}</h4>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">{turno.servicioNombre}</span>
                          <span className="w-1 h-1 rounded-full bg-zinc-800" />
                          <span className="text-[10px] text-zinc-500 font-medium">{turno.hora} HS</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right hidden sm:block">
                        <p className="text-[10px] text-zinc-600 uppercase tracking-widest font-bold">{turno.fecha}</p>
                        <p className={`text-[10px] font-bold mt-1 uppercase tracking-wider ${
                          turno.estado === 'confirmado' ? 'text-emerald-400' : 'text-zinc-500'
                        }`}>
                          {turno.estado || 'pendiente'}
                        </p>
                      </div>
                      <button className="p-2 text-zinc-600 hover:text-white transition-colors rounded-lg hover:bg-white/5">
                        <MoreHorizontal size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-72 text-center">
                <div className="w-14 h-14 rounded-full bg-white/[0.02] flex items-center justify-center border border-white/[0.05] mb-4">
                  <Calendar size={24} className="text-zinc-600" />
                </div>
                <h3 className="text-sm font-bold text-white">Sin actividad reciente</h3>
                <p className="text-xs text-zinc-500 mt-1 max-w-[220px]">Los nuevos turnos aparecerán aquí una vez que sean reservados.</p>
                <Link href="/turnos?nuevo=true" className="mt-6 text-xs font-bold px-6 py-2.5 bg-white text-black rounded-lg hover:bg-zinc-200 transition-all shadow-soft">
                  Crear Primer Turno
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Analytics Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          <div className="glass p-6 rounded-2xl space-y-6 shadow-soft">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-white tracking-tight">Tendencia de Reservas</h2>
              <span className="text-[10px] font-bold text-zinc-500 bg-white/[0.03] px-2.5 py-1 rounded-full border border-white/[0.05]">Últimos 7 días</span>
            </div>
            <div className="h-44 w-full flex items-end gap-3 px-1 pt-4">
              {[35, 65, 45, 85, 55, 75, 95].map((h, i) => (
                <div 
                  key={i} 
                  className="flex-1 bg-white/[0.04] rounded-t-lg hover:bg-white/[0.12] transition-all cursor-pointer relative group"
                  style={{ height: `${h}%` }}
                >
                  <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-white text-black text-[10px] font-bold px-2 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all shadow-xl whitespace-nowrap pointer-events-none scale-90 group-hover:scale-100">
                    {h} reservas
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-between text-[10px] text-zinc-600 font-bold uppercase tracking-[0.2em] px-1">
              <span>Lun</span>
              <span>Mar</span>
              <span>Mié</span>
              <span>Jue</span>
              <span>Vie</span>
              <span>Sáb</span>
              <span>Dom</span>
            </div>
          </div>

          <div className="glass p-6 rounded-2xl bg-gradient-to-br from-white/[0.04] to-transparent border-white/[0.08] relative overflow-hidden group">
            <div className="absolute -right-4 -top-4 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <Target size={120} className="text-white" />
            </div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center text-black shadow-lg shadow-white/10">
                <TrendingUp size={18} />
              </div>
              <h3 className="text-sm font-bold text-white tracking-tight">Mejorar a Pro</h3>
            </div>
            <p className="text-xs text-zinc-500 leading-relaxed mb-6 font-medium">
              Desbloquea analíticas avanzadas, turnos ilimitados y marca personalizada para tu negocio.
            </p>
            <Link href="/activate" className="block w-full text-center py-3 bg-white/[0.03] text-white border border-white/[0.08] rounded-xl text-xs font-bold hover:bg-white hover:text-black transition-all shadow-soft group-hover:border-white/20">
              Mejorar Ahora
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
