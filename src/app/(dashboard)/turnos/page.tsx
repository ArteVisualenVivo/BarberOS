"use client";

import { useBarberia } from "@/hooks/useBarberia";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { 
  getTenantCollection, 
  updateTenantDoc, 
  deleteTenantDoc, 
  COLLECTIONS 
} from "@/lib/db";
import { 
  Calendar as CalendarIcon, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Trash2, 
  Loader2,
  Phone,
  ChevronLeft,
  ChevronRight,
  List as ListIcon,
  LayoutGrid,
  MoreVertical,
  Search,
  Plus,
  Filter,
  MessageSquare
} from "lucide-react";

type ViewMode = "lista" | "semana" | "dia";

export default function TurnosAdmin() {
  const { barberia } = useBarberia();
  const router = useRouter();
  const [turnos, setTurnos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>("lista");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [filtro, setFiltro] = useState("todos");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (barberia) {
      fetchTurnos();
    }
  }, [barberia]);

  const fetchTurnos = async () => {
    try {
      const t = await getTenantCollection(COLLECTIONS.TURNOS, barberia!.id);
      setTurnos(t);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const updateEstado = async (id: string, nuevoEstado: string) => {
    try {
      await updateTenantDoc(COLLECTIONS.TURNOS, id, { estado: nuevoEstado });
      fetchTurnos();
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar este turno permanentemente?")) return;
    try {
      await deleteTenantDoc(COLLECTIONS.TURNOS, id);
      fetchTurnos();
    } catch (error) {
      console.error(error);
    }
  };

  const getStatusStyles = (estado: string) => {
    switch (estado) {
      case "confirmado": return "text-emerald-400 bg-emerald-500/5 border-emerald-500/10";
      case "cancelado": return "text-rose-400 bg-rose-500/5 border-rose-500/10";
      default: return "text-zinc-500 bg-zinc-500/5 border-zinc-500/10";
    }
  };

  const formatFecha = (date: Date) => date.toLocaleDateString("en-CA");
  
  const getWeekDays = (date: Date) => {
    const start = new Date(date);
    start.setDate(date.getDate() - date.getDay());
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      return d;
    });
  };

  const turnosFiltrados = turnos.filter(t => {
    if (filtro !== "todos" && t.estado !== filtro) return false;
    if (searchTerm && !t.clienteNombre.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    if (viewMode === "dia") return t.fecha === formatFecha(selectedDate);
    if (viewMode === "semana") {
      const week = getWeekDays(selectedDate).map(formatFecha);
      return week.includes(t.fecha);
    }
    return true;
  }).sort((a, b) => {
    if (a.fecha !== b.fecha) return b.fecha.localeCompare(a.fecha);
    return a.hora.localeCompare(b.hora);
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Turnos</h1>
          <p className="text-sm text-zinc-500 mt-1">Gestiona y monitorea el flujo de trabajo de tu negocio en tiempo real.</p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col lg:row lg:items-center justify-between gap-4 bg-white/[0.02] border border-white/[0.05] p-2 rounded-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 flex-1">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500 group-focus-within:text-white transition-colors" />
            <input 
              type="text" 
              placeholder="Buscar por nombre de cliente..."
              className="w-full sm:w-64 bg-white/[0.03] border border-white/[0.05] rounded-xl py-2 pl-9 pr-3 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-white/10 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="h-6 w-px bg-white/10 hidden sm:block" />

          <div className="flex items-center gap-1 p-1 bg-black/40 rounded-xl border border-white/[0.05]">
            {["todos", "confirmado", "pendiente", "cancelado"].map((f) => (
              <button
                key={f}
                onClick={() => setFiltro(f)}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${
                  filtro === f ? "bg-white/[0.08] text-white shadow-soft" : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 p-1 bg-black/40 rounded-xl border border-white/[0.05]">
            <button onClick={() => setViewMode("lista")} className={`p-2 rounded-lg transition-all ${viewMode === "lista" ? "bg-white/[0.08] text-white" : "text-zinc-500 hover:text-zinc-300"}`}>
              <ListIcon size={16} />
            </button>
            <button onClick={() => setViewMode("semana")} className={`p-2 rounded-lg transition-all ${viewMode === "semana" ? "bg-white/[0.08] text-white" : "text-zinc-500 hover:text-zinc-300"}`}>
              <LayoutGrid size={16} />
            </button>
            <button onClick={() => setViewMode("dia")} className={`p-2 rounded-lg transition-all ${viewMode === "dia" ? "bg-white/[0.08] text-white" : "text-zinc-500 hover:text-zinc-300"}`}>
              <CalendarIcon size={16} />
            </button>
          </div>

          {(viewMode === "dia" || viewMode === "semana") && (
            <div className="flex items-center gap-2 bg-black/40 p-1 rounded-xl border border-white/[0.05]">
              <button 
                onClick={() => {
                  const d = new Date(selectedDate);
                  d.setDate(d.getDate() - (viewMode === "semana" ? 7 : 1));
                  setSelectedDate(d);
                }}
                className="p-2 text-zinc-500 hover:text-white hover:bg-white/5 rounded-lg"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="text-[10px] font-bold text-zinc-300 px-2 min-w-[90px] text-center uppercase tracking-widest">
                {viewMode === "dia" 
                  ? selectedDate.toLocaleDateString("es-ES", { day: 'numeric', month: 'short' })
                  : `Semana ${getWeekDays(selectedDate)[0].getDate()}`
                }
              </span>
              <button 
                onClick={() => {
                  const d = new Date(selectedDate);
                  d.setDate(d.getDate() + (viewMode === "semana" ? 7 : 1));
                  setSelectedDate(d);
                }}
                className="p-2 text-zinc-500 hover:text-white hover:bg-white/5 rounded-lg"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      {loading ? (
        <div className="flex items-center justify-center py-32">
          <Loader2 className="w-10 h-10 text-zinc-700 animate-spin" />
        </div>
      ) : viewMode === "lista" ? (
        <div className="glass rounded-2xl overflow-hidden shadow-soft">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/[0.05] bg-white/[0.01]">
                  <th className="px-6 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em]">Cliente</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em]">Servicio</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em]">Horario</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em]">Estado</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em]">Monto</th>
                  <th className="px-6 py-4"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.03]">
                {turnosFiltrados.length > 0 ? (
                  turnosFiltrados.map((t) => (
                    <tr key={t.id} className="hover:bg-white/[0.02] transition-all group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-zinc-800 border border-white/[0.05] flex items-center justify-center text-[11px] font-bold text-zinc-400 group-hover:border-white/20 transition-all">
                            {t.clienteNombre?.[0]?.toUpperCase()}
                          </div>
                          <span className="text-sm font-bold text-white">{t.clienteNombre}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 bg-white/[0.03] px-2.5 py-1 rounded-full border border-white/[0.05]">
                          {t.servicioNombre}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-xs text-zinc-300 font-bold">{t.fecha}</span>
                          <span className="text-[10px] text-zinc-500 font-medium mt-1 uppercase">{t.hora} HS</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getStatusStyles(t.estado)}`}>
                          {t.estado || 'pendiente'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm font-bold text-white">
                        ${t.precio || 0}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                          {t.estado !== "confirmado" && (
                            <button onClick={() => updateEstado(t.id, "confirmado")} className="p-2 text-emerald-500 hover:bg-emerald-500/10 rounded-lg transition-all" title="Confirmar">
                              <CheckCircle2 size={18} />
                            </button>
                          )}
                          <a href={`https://wa.me/${t.clienteWhatsapp}`} target="_blank" className="p-2 text-zinc-400 hover:text-white transition-all">
                            <MessageSquare size={18} />
                          </a>
                          <button onClick={() => handleDelete(t.id)} className="p-2 text-zinc-600 hover:text-rose-500 transition-all">
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-24 text-center">
                      <div className="flex flex-col items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-white/[0.02] border border-dashed border-white/10 flex items-center justify-center">
                          <CalendarIcon size={24} className="text-zinc-700" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-zinc-400">No se encontraron turnos</p>
                          <p className="text-xs text-zinc-600 mt-1">Prueba ajustando los filtros o el término de búsqueda.</p>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {turnosFiltrados.length > 0 ? (
            turnosFiltrados.map((t) => (
              <div key={t.id} className="glass p-6 rounded-2xl border-white/[0.05] hover:bg-white/[0.04] transition-all group relative">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-zinc-800 to-zinc-900 border border-white/[0.05] flex items-center justify-center text-[11px] font-bold text-zinc-400">
                      {t.clienteNombre?.[0]?.toUpperCase()}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">{t.clienteNombre}</h4>
                      <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">{t.servicioNombre}</p>
                    </div>
                  </div>
                  <div className={`px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-[0.1em] border ${getStatusStyles(t.estado)}`}>
                    {t.estado || 'pendiente'}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-white/[0.02] border border-white/[0.05] p-3 rounded-xl">
                    <div className="flex items-center gap-2 text-zinc-600 mb-1.5">
                      <CalendarIcon size={12} />
                      <span className="text-[9px] font-bold uppercase tracking-widest">Fecha</span>
                    </div>
                    <p className="text-xs font-bold text-white">{t.fecha}</p>
                  </div>
                  <div className="bg-white/[0.02] border border-white/[0.05] p-3 rounded-xl">
                    <div className="flex items-center gap-2 text-zinc-600 mb-1.5">
                      <Clock size={12} />
                      <span className="text-[9px] font-bold uppercase tracking-widest">Hora</span>
                    </div>
                    <p className="text-xs font-bold text-white">{t.hora} HS</p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-5 border-t border-white/[0.05]">
                  <div className="text-sm font-bold text-white tracking-tight">${t.precio || 0}</div>
                  <div className="flex items-center gap-2">
                    <a href={`https://wa.me/${t.clienteWhatsapp}`} target="_blank" className="p-2 text-zinc-500 hover:text-white transition-all bg-white/[0.03] rounded-lg border border-white/[0.05] hover:border-white/10">
                      <Phone size={14} />
                    </a>
                    <button onClick={() => updateEstado(t.id, "confirmado")} className="p-2 text-zinc-500 hover:text-emerald-400 transition-all bg-white/[0.03] rounded-lg border border-white/[0.05] hover:border-white/10">
                      <CheckCircle2 size={14} />
                    </button>
                    <button onClick={() => handleDelete(t.id)} className="p-2 text-zinc-500 hover:text-rose-500 transition-all bg-white/[0.03] rounded-lg border border-white/[0.05] hover:border-white/10">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full py-32 glass rounded-3xl border-dashed border-white/10 flex flex-col items-center justify-center text-center">
              <div className="w-14 h-14 rounded-full bg-white/[0.02] flex items-center justify-center border border-white/[0.05] mb-4">
                <CalendarIcon size={24} className="text-zinc-600" />
              </div>
              <h3 className="text-sm font-bold text-white">Sin actividad reciente</h3>
              <p className="text-xs text-zinc-500 mt-1 max-w-[220px]">Los nuevos turnos aparecerán aquí una vez que sean reservados.</p>
              <button 
                onClick={() => router.push("/turnos/nuevo")}
                className="mt-6 text-xs font-bold px-6 py-2.5 bg-white text-black rounded-lg hover:bg-zinc-200 transition-all shadow-soft"
              >
                Crear Primer Turno
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
