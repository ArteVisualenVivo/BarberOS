"use client";

import { useBarberia } from "@/hooks/useBarberia";
import { useEffect, useState } from "react";
import { getTenantCollection, addTenantDoc, updateTenantDoc, deleteTenantDoc, COLLECTIONS } from "@/lib/db";
import { 
  Scissors, 
  Plus, 
  Trash2, 
  Edit2, 
  Loader2, 
  X,
  Clock,
  DollarSign
} from "lucide-react";

export default function ServiciosAdmin() {
  const { barberia } = useBarberia();
  const [servicios, setServicios] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingServicio, setEditingServicio] = useState<any>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    nombre: "",
    precio: "",
    duracion: "30",
  });

  // Guard clause por seguridad
  if (!barberia) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="w-12 h-12 border-2 border-white/10 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  useEffect(() => {
    if (barberia) {
      fetchServicios();
    }
  }, [barberia]);

  const fetchServicios = async () => {
    if (!barberia) return;

    try {
      const s = await getTenantCollection(COLLECTIONS.SERVICIOS, barberia?.id);
      setServicios(s);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!barberia) return;

    try {
      const data = {
        ...formData,
        precio: Number(formData.precio),
        duracion: Number(formData.duracion),
        barberiaId: barberia?.id
      };

      if (editingServicio) {
        await updateTenantDoc(COLLECTIONS.SERVICIOS, editingServicio.id, data);
      } else {
        await addTenantDoc(COLLECTIONS.SERVICIOS, data);
      }

      setIsModalOpen(false);
      setEditingServicio(null);
      setFormData({ nombre: "", precio: "", duracion: "30" });
      fetchServicios();
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de eliminar este servicio?")) return;
    try {
      await deleteTenantDoc(COLLECTIONS.SERVICIOS, id);
      fetchServicios();
    } catch (error) {
      console.error(error);
    }
  };

  const handleEdit = (servicio: any) => {
    setEditingServicio(servicio);
    setFormData({
      nombre: servicio.nombre,
      precio: servicio.precio.toString(),
      duracion: servicio.duracion.toString(),
    });
    setIsModalOpen(true);
  };

  if (!barberia) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="w-12 h-12 border-2 border-white/10 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-12 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Gestión de Catálogo</p>
          <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tight">Tus <span className="text-primary">Servicios</span></h1>
          <p className="text-gray-500 font-medium">Define los cortes y tratamientos que ofreces.</p>
        </div>
        
        <button 
          onClick={() => {
            setEditingServicio(null);
            setFormData({ nombre: "", precio: "", duracion: "30" });
            setIsModalOpen(true);
          }}
          className="flex items-center gap-3 bg-primary text-black px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:scale-105 active:scale-95 transition-all shadow-xl shadow-primary/20"
        >
          <Plus className="w-5 h-5" /> Agregar Servicio
        </button>
      </div>

      {/* Grid de Servicios */}
      {loading ? (
        <div className="flex items-center justify-center py-32">
          <Loader2 className="w-12 h-12 text-primary animate-spin" />
        </div>
      ) : servicios.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {servicios.map((s) => (
            <div key={s.id} className="bg-[#111] p-8 rounded-[40px] border border-white/5 space-y-8 group hover:border-primary/20 transition-all">
              <div className="flex justify-between items-start">
                <div className="bg-white/5 p-4 rounded-2xl group-hover:bg-primary group-hover:text-black transition-all">
                  <Scissors className="w-6 h-6" />
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleEdit(s)} className="p-2 bg-white/5 rounded-xl hover:bg-white/10 transition-colors">
                    <Edit2 className="w-4 h-4 text-gray-400" />
                  </button>
                  <button onClick={() => handleDelete(s.id)} className="p-2 bg-white/5 rounded-xl hover:bg-red-500/10 group/del transition-colors">
                    <Trash2 className="w-4 h-4 text-gray-400 group-hover/del:text-red-500" />
                  </button>
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-2xl font-black uppercase tracking-tight group-hover:text-primary transition-colors">{s.nombre}</h3>
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-500">
                    <Clock className="w-4 h-4 text-primary" /> {s.duracion} min
                  </div>
                  <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary">
                    <DollarSign className="w-4 h-4" /> ${s.precio.toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-32 text-center border-2 border-dashed border-white/5 rounded-[50px] space-y-6">
          <div className="bg-white/5 w-20 h-20 rounded-full flex items-center justify-center mx-auto border border-white/10">
            <Scissors className="w-10 h-10 text-gray-600" />
          </div>
          <p className="text-gray-500 font-black uppercase tracking-widest text-sm">No hay servicios registrados</p>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-white/5 text-white px-8 py-4 rounded-xl border border-white/10 font-black uppercase tracking-widest text-[10px] hover:bg-white/10"
          >
            Crear mi primer servicio
          </button>
        </div>
      )}

      {/* Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="w-full max-w-lg bg-[#111] rounded-[40px] border border-white/10 shadow-2xl p-10 relative space-y-10 animate-in zoom-in-95 duration-500">
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-8 right-8 p-2 bg-white/5 rounded-xl hover:bg-white/10 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="space-y-2">
              <h2 className="text-3xl font-black uppercase tracking-tight text-white">
                {editingServicio ? "Editar" : "Nuevo"} <span className="text-primary">Servicio</span>
              </h2>
              <p className="text-gray-500 font-bold uppercase text-[10px] tracking-widest">Completa los detalles del servicio</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 px-1">Nombre del Servicio</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Corte Degradé + Barba"
                  className="w-full bg-black border border-white/10 rounded-2xl p-5 text-white focus:border-primary outline-none transition-all"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 px-1">Precio ($)</label>
                  <input
                    type="number"
                    required
                    placeholder="2500"
                    className="w-full bg-black border border-white/10 rounded-2xl p-5 text-white focus:border-primary outline-none transition-all"
                    value={formData.precio}
                    onChange={(e) => setFormData({ ...formData, precio: e.target.value })}
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 px-1">Duración (min)</label>
                  <select
                    className="w-full bg-black border border-white/10 rounded-2xl p-5 text-white focus:border-primary outline-none transition-all appearance-none"
                    value={formData.duracion}
                    onChange={(e) => setFormData({ ...formData, duracion: e.target.value })}
                  >
                    <option value="15">15 min</option>
                    <option value="30">30 min</option>
                    <option value="45">45 min</option>
                    <option value="60">60 min</option>
                    <option value="90">90 min</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-primary text-black font-black py-5 rounded-2xl uppercase tracking-widest text-xs hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-primary/20"
              >
                {editingServicio ? "Guardar Cambios" : "Crear Servicio Ahora"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
