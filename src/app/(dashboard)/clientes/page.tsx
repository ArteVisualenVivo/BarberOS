"use client";

import { useBarberia } from "@/hooks/useBarberia";
import { useEffect, useState } from "react";
import { getTenantCollection, addTenantDoc, deleteTenantDoc, COLLECTIONS } from "@/lib/db";
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
  const [isAddFormOpen, setIsAddFormOpen] = useState(false);
  const [newClienteNombre, setNewClienteNombre] = useState("");
  const [newClienteWhatsapp, setNewClienteWhatsapp] = useState("");
  const [turnoServicio, setTurnoServicio] = useState("");
  const [turnoFecha, setTurnoFecha] = useState<string>(new Date().toISOString().slice(0, 10));
  const [turnoHora, setTurnoHora] = useState("");
  const [turnoPrecio, setTurnoPrecio] = useState("");
  const [savingCliente, setSavingCliente] = useState(false);
  const [clientError, setClientError] = useState("");
  const [activeClientMenu, setActiveClientMenu] = useState<string | null>(null);

  const openWhatsApp = (whatsapp: string) => {
    if (!whatsapp) return;
    window.open(`https://wa.me/${whatsapp}`, "_blank");
  };

  const toggleClientMenu = (id: string) => {
    setActiveClientMenu((prev) => (prev === id ? null : id));
  };

  const toDate = (value: any): Date | null => {
    if (!value) return null;
    if (typeof value.toDate === "function") return value.toDate();
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  };

  const hoy = new Date();
  const clientesActivos = clientes.filter((c) => {
    const lastVisitDate = c.lastVisitDate ? new Date(c.lastVisitDate) : null;
    if (!lastVisitDate) return false;
    const diff = hoy.getTime() - lastVisitDate.getTime();
    return diff <= 30 * 24 * 60 * 60 * 1000;
  });
  const nuevosEsteMes = clientes.filter((c) => {
    const createdAtDate = c.createdAtDate ? new Date(c.createdAtDate) : null;
    if (!createdAtDate) return false;
    return (
      createdAtDate.getFullYear() === hoy.getFullYear() &&
      createdAtDate.getMonth() === hoy.getMonth()
    );
  });
  const retentionPercent = clientes.length > 0 ? Math.round((clientesActivos.length / clientes.length) * 100) : 0;

  useEffect(() => {
    if (barberia) {
      fetchClientes();
    }
  }, [barberia]);

  const fetchClientes = async () => {
    if (!barberia) return;

    try {
      const c = await getTenantCollection(COLLECTIONS.CLIENTES, barberia.id);
      const clientesConFechas = c.map((current: any) => {
        return {
          ...current,
          createdAtDate: toDate(current.createdAt) || toDate(current.lastVisit),
          lastVisitDate: toDate(current.lastVisit) || toDate(current.createdAt),
        };
      });
      setClientes(clientesConFechas);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCliente = async (id: string) => {
    const confirmed = window.confirm("¿Eliminar este cliente? Esta acción no se puede deshacer.");
    if (!confirmed) return;

    try {
      setLoading(true);
      await deleteTenantDoc(COLLECTIONS.CLIENTES, id);
      await fetchClientes();
    } catch (error) {
      console.error("Error eliminando cliente:", error);
      window.alert("No se pudo eliminar el cliente. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  const filteredClientes = clientes.filter(c => 
    c.nombre.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.whatsapp.includes(searchTerm)
  );

  const handleAddCliente = async () => {
    if (!barberia) return;
    if (!newClienteNombre.trim() || !newClienteWhatsapp.trim()) {
      setClientError("Completa el nombre y el teléfono del cliente.");
      return;
    }

    setClientError("");
    setSavingCliente(true);

    try {
      await addTenantDoc(COLLECTIONS.CLIENTES, {
        barberiaId: barberia.id,
        nombre: newClienteNombre.trim(),
        whatsapp: newClienteWhatsapp.trim(),
        lastVisit: new Date(),
      });

      if (turnoServicio.trim() && turnoFecha && turnoHora) {
        await addTenantDoc(COLLECTIONS.TURNOS, {
          barberiaId: barberia.id,
          clienteNombre: newClienteNombre.trim(),
          clienteWhatsapp: newClienteWhatsapp.trim(),
          servicioNombre: turnoServicio.trim(),
          fecha: turnoFecha,
          hora: turnoHora,
          precio: Number(turnoPrecio) || 0,
          estado: "pendiente",
        });
      }

      setNewClienteNombre("");
      setNewClienteWhatsapp("");
      setTurnoServicio("");
      setTurnoFecha(new Date().toISOString().slice(0, 10));
      setTurnoHora("");
      setTurnoPrecio("");
      setIsAddFormOpen(false);
      fetchClientes();
    } catch (error) {
      console.error("Error agregando cliente:", error);
      setClientError("No se pudo guardar el cliente. Intenta nuevamente.");
    } finally {
      setSavingCliente(false);
    }
  };

  if (!barberia) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="w-12 h-12 border-2 border-white/10 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Clientes</h1>
          <p className="text-sm text-zinc-500 mt-1">Gestiona las relaciones con tus clientes y sigue su fidelidad.</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsAddFormOpen((prev) => !prev)}
            className="flex items-center gap-2 bg-white text-black px-4 py-2.5 rounded-lg text-sm font-bold hover:bg-zinc-200 transition-all shadow-soft group"
          >
            <Plus size={16} />
            <span>{isAddFormOpen ? "Cerrar" : "Añadir Cliente"}</span>
          </button>
        </div>
      </div>

      {isAddFormOpen && (
        <div className="glass rounded-3xl border border-white/10 bg-white/5 p-6 shadow-soft">
          <div className="flex flex-col gap-4">
            <div>
              <h2 className="text-xl font-bold text-white">Crear nuevo cliente</h2>
              <p className="text-sm text-zinc-400 mt-1">Agrega un cliente a tu barbería y registra su contacto en Firestore.</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-[0.3em] text-zinc-500">Nombre</label>
                <input
                  type="text"
                  value={newClienteNombre}
                  onChange={(e) => setNewClienteNombre(e.target.value)}
                  placeholder="Nombre del cliente"
                  className="w-full rounded-3xl border border-white/10 bg-black/70 px-4 py-3 text-sm text-white outline-none focus:border-emerald-400"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-[0.3em] text-zinc-500">WhatsApp</label>
                <input
                  type="tel"
                  value={newClienteWhatsapp}
                  onChange={(e) => setNewClienteWhatsapp(e.target.value)}
                  placeholder="5493512417121"
                  className="w-full rounded-3xl border border-white/10 bg-black/70 px-4 py-3 text-sm text-white outline-none focus:border-emerald-400"
                />
              </div>
            </div>
            <div className="mt-6 border-t border-white/10 pt-6">
              <p className="text-xs uppercase tracking-[0.3em] text-zinc-500 mb-3">Opcional: agregar turno</p>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-[0.3em] text-zinc-500">Servicio</label>
                  <input
                    type="text"
                    value={turnoServicio}
                    onChange={(e) => setTurnoServicio(e.target.value)}
                    placeholder="Ej: Corte, Barba, etc."
                    className="w-full rounded-3xl border border-white/10 bg-black/70 px-4 py-3 text-sm text-white outline-none focus:border-emerald-400"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs uppercase tracking-[0.3em] text-zinc-500">Fecha</label>
                    <input
                      type="date"
                      value={turnoFecha}
                      onChange={(e) => setTurnoFecha(e.target.value)}
                      className="w-full rounded-3xl border border-white/10 bg-black/70 px-4 py-3 text-sm text-white outline-none focus:border-emerald-400"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs uppercase tracking-[0.3em] text-zinc-500">Hora</label>
                    <input
                      type="time"
                      value={turnoHora}
                      onChange={(e) => setTurnoHora(e.target.value)}
                      className="w-full rounded-3xl border border-white/10 bg-black/70 px-4 py-3 text-sm text-white outline-none focus:border-emerald-400"
                    />
                  </div>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-xs uppercase tracking-[0.3em] text-zinc-500">Precio (opcional)</label>
                  <input
                    type="number"
                    value={turnoPrecio}
                    onChange={(e) => setTurnoPrecio(e.target.value)}
                    placeholder="0"
                    className="w-full rounded-3xl border border-white/10 bg-black/70 px-4 py-3 text-sm text-white outline-none focus:border-emerald-400"
                  />
                </div>
              </div>
            </div>

            {clientError && (
              <div className="rounded-3xl bg-rose-500/10 border border-rose-500/20 px-4 py-3 text-sm text-rose-200">
                {clientError}
              </div>
            )}

            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <button
                onClick={handleAddCliente}
                disabled={savingCliente}
                className="w-full md:w-auto rounded-3xl bg-emerald-500 px-6 py-4 text-sm font-bold uppercase tracking-[0.2em] text-black transition hover:bg-emerald-400 disabled:opacity-50"
              >
                {savingCliente ? "Guardando..." : "Guardar cliente"}
              </button>
              <button
                onClick={() => {
                  setIsAddFormOpen(false);
                  setClientError("");
                }}
                className="w-full md:w-auto rounded-3xl border border-white/10 bg-white/5 px-6 py-4 text-sm font-bold uppercase tracking-[0.2em] text-white transition hover:border-white/20"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="glass p-6 rounded-2xl shadow-soft">
          <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] mb-2">Total Clientes</p>
          <div className="flex items-baseline gap-3">
            <h3 className="text-3xl font-bold text-white">{clientes.length}</h3>
            <span className="text-[11px] text-zinc-400 font-bold bg-white/5 px-2 py-0.5 rounded-full">Clientes únicos</span>
          </div>
        </div>
        <div className="glass p-6 rounded-2xl shadow-soft">
          <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] mb-2">Clientes Activos (30 días)</p>
          <div className="flex items-baseline gap-3">
            <h3 className="text-3xl font-bold text-white">{clientesActivos.length}</h3>
            <span className="text-[11px] text-zinc-500 font-bold bg-white/5 px-2 py-0.5 rounded-full">{retentionPercent}%</span>
          </div>
        </div>
        <div className="glass p-6 rounded-2xl shadow-soft">
          <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] mb-2">Nuevos este mes</p>
          <div className="flex items-baseline gap-3">
            <h3 className="text-3xl font-bold text-white">{nuevosEsteMes.length}</h3>
            <span className="text-[11px] text-emerald-400 font-bold bg-emerald-500/5 px-2 py-0.5 rounded-full">{nuevosEsteMes.length > 0 ? "+" + nuevosEsteMes.length : "0"}</span>
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
                        <button onClick={() => openWhatsApp(c.whatsapp)} title="Abrir WhatsApp" className="p-2 text-zinc-500 hover:text-white transition-all hover:bg-white/5 rounded-lg">
                          <ExternalLink size={16} />
                        </button>
                        <div className="relative">
                          <button onClick={() => toggleClientMenu(c.id)} title="Más acciones" className="p-2 text-zinc-500 hover:text-white transition-all hover:bg-white/5 rounded-lg">
                            <MoreVertical size={16} />
                          </button>
                          {activeClientMenu === c.id && (
                            <div className="absolute right-0 top-full mt-2 w-40 rounded-2xl border border-white/10 bg-[#0c0c0f] shadow-2xl z-10 overflow-hidden">
                              <button
                                onClick={() => openWhatsApp(c.whatsapp)}
                                className="w-full text-left px-4 py-3 text-sm text-white hover:bg-white/5"
                              >
                                Abrir WhatsApp
                              </button>
                              <button
                                onClick={() => {
                                  handleDeleteCliente(c.id);
                                  setActiveClientMenu(null);
                                }}
                                className="w-full text-left px-4 py-3 text-sm text-white hover:bg-white/5"
                              >
                                Eliminar cliente
                              </button>
                            </div>
                          )}
                        </div>
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
