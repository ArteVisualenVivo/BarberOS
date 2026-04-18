"use client";

import { useBarberia } from "@/hooks/useBarberia";
import { useEffect, useState } from "react";
import { getTenantCollection, COLLECTIONS } from "@/lib/db";
import { 
  Users, 
  Search, 
  Phone, 
  Calendar, 
  MessageSquare, 
  Loader2, 
  User,
  Scissors,
  MoreVertical,
  Mail,
  Filter,
  ArrowRight,
  ExternalLink,
  Plus
} from "lucide-react";

export default function ClientesAdmin() {
  const { barberia } = useBarberia();
  const [clientes, setClientes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (barberia) {
      fetchClientes();
    }
  }, [barberia]);

  const fetchClientes = async () => {
    try {
      const c = await getTenantCollection(COLLECTIONS.CLIENTES, barberia!.id);
      // Remove duplicates by phone number
      const uniqueClientes = c.reduce((acc: any[], current: any) => {
        const x = acc.find(item => item.whatsapp === current.whatsapp);
        if (!x) {
          return acc.concat([current]);
        } else {
          return acc;
        }
      }, []);
      setClientes(uniqueClientes);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const filteredClientes = clientes.filter(c => 
    c.nombre.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.whatsapp.includes(searchTerm)
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Clientes</h1>
          <p className="text-sm text-zinc-500 mt-1">Gestiona las relaciones con tus clientes y sigue su fidelidad.</p>
        </div>

        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 bg-white text-black px-4 py-2.5 rounded-lg text-sm font-bold hover:bg-zinc-200 transition-all shadow-soft group">
            <Plus size={16} />
            <span>Añadir Cliente</span>
          </button>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="glass p-6 rounded-2xl shadow-soft">
          <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] mb-2">Total Clientes</p>
          <div className="flex items-baseline gap-3">
            <h3 className="text-3xl font-bold text-white">{clientes.length}</h3>
            <span className="text-[11px] text-emerald-400 font-bold bg-emerald-500/5 px-2 py-0.5 rounded-full">+12%</span>
          </div>
        </div>
        <div className="glass p-6 rounded-2xl shadow-soft">
          <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] mb-2">Retención Activa</p>
          <div className="flex items-baseline gap-3">
            <h3 className="text-3xl font-bold text-white">{Math.floor(clientes.length * 0.6)}</h3>
            <span className="text-[11px] text-zinc-500 font-bold bg-white/5 px-2 py-0.5 rounded-full">60%</span>
          </div>
        </div>
        <div className="glass p-6 rounded-2xl shadow-soft">
          <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] mb-2">Nuevos este mes</p>
          <div className="flex items-baseline gap-3">
            <h3 className="text-3xl font-bold text-white">8</h3>
            <span className="text-[11px] text-emerald-400 font-bold bg-emerald-500/5 px-2 py-0.5 rounded-full">+2</span>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:row md:items-center justify-between gap-4 bg-white/[0.02] border border-white/[0.05] p-2 rounded-2xl">
        <div className="relative group flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500 group-focus-within:text-white transition-colors" />
          <input 
            type="text" 
            placeholder="Buscar por nombre, ID o teléfono..."
            className="w-full bg-white/[0.03] border border-white/[0.05] rounded-xl py-2 pl-9 pr-3 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-white/10 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-zinc-400 hover:text-white bg-white/[0.03] border border-white/[0.05] rounded-xl transition-all">
            <Filter size={14} />
            Filtros
          </button>
          <button className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-zinc-400 hover:text-white bg-white/[0.03] border border-white/[0.05] rounded-xl transition-all">
            Exportar CSV
          </button>
        </div>
      </div>

      {/* Table Content */}
      <div className="glass rounded-2xl overflow-hidden shadow-soft">
        {loading ? (
          <div className="flex items-center justify-center py-32">
            <Loader2 className="w-10 h-10 text-zinc-700 animate-spin" />
          </div>
        ) : filteredClientes.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/[0.05] bg-white/[0.01]">
                  <th className="px-6 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em]">Perfil del Cliente</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em]">Información de Contacto</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em]">Se unió</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em]">Estado</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em]">Gastos</th>
                  <th className="px-6 py-4"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.03]">
                {filteredClientes.map((c, i) => (
                  <tr key={i} className="hover:bg-white/[0.02] transition-all group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-zinc-800 to-zinc-900 border border-white/[0.05] flex items-center justify-center text-[11px] font-bold text-zinc-400 group-hover:text-white group-hover:border-white/20 transition-all">
                          {c.nombre?.[0]?.toUpperCase()}
                        </div>
                        <div>
                          <span className="text-sm font-bold text-white block">{c.nombre}</span>
                          <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mt-0.5">ID: {c.id?.substring(0, 8)}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1.5">
                        <a href={`https://wa.me/${c.whatsapp}`} target="_blank" className="text-xs text-zinc-300 hover:text-white flex items-center gap-2 transition-all font-medium">
                          <MessageSquare size={12} className="text-zinc-500" />
                          {c.whatsapp}
                        </a>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-xs text-zinc-400 font-bold uppercase tracking-tight">
                        <Calendar size={12} className="text-zinc-600" />
                        {c.createdAt?.toDate?.()?.toLocaleDateString("es-ES", { month: 'short', day: 'numeric', year: 'numeric' }) || 'Reciente'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest border border-emerald-500/20 bg-emerald-500/5 text-emerald-400">
                        Activo
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-white">
                      $0.00
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                        <button className="p-2 text-zinc-500 hover:text-white transition-all hover:bg-white/5 rounded-lg">
                          <ExternalLink size={16} />
                        </button>
                        <button className="p-2 text-zinc-500 hover:text-white transition-all hover:bg-white/5 rounded-lg">
                          <MoreVertical size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-32 text-center">
            <div className="w-20 h-20 rounded-full bg-white/[0.02] border border-dashed border-white/10 flex items-center justify-center mx-auto mb-6">
              <Users size={32} className="text-zinc-800" />
            </div>
            <h3 className="text-base font-bold text-white">No se encontraron clientes</h3>
            <p className="text-xs text-zinc-500 mt-2 max-w-[260px] mx-auto leading-relaxed">Ajusta tu búsqueda o los filtros para encontrar los clientes que buscas.</p>
            <button 
              onClick={() => setSearchTerm("")}
              className="mt-8 text-xs font-bold px-6 py-2.5 bg-white/[0.03] text-white border border-white/[0.08] rounded-xl hover:bg-white/[0.06] transition-all"
            >
              Limpiar Búsqueda
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
