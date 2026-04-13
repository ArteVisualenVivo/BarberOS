'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { 
  ChevronLeft, BarChart3, Calendar, DollarSign, Loader2, 
  MoreVertical, Search, Filter, Plus, Scissors, Clock,
  CheckCircle2, XCircle, Clock4, LogOut
} from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import { Database } from '@/types/supabase'
import { useRouter } from 'next/navigation'
import { getAdminBarberiaId } from '@/utils/barberia/context'

type Turno = Database['public']['Tables']['turnos']['Row']
type Servicio = Database['public']['Tables']['servicios']['Row']

export default function AdminDashboardPage() {
  const [turnos, setTurnos] = useState<Turno[]>([])
  const [servicios, setServicios] = useState<Servicio[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'turnos' | 'servicios'>('turnos')
  const [stats, setStats] = useState({ ingresos: 0, turnosHoy: 0 })
  const [barberiaId, setBarberiaId] = useState<string | null>(null)
  const [barberia, setBarberia] = useState<any>(null)
  
  // Estados para CRUD de servicios
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<any>(null)
  
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    const fetchData = async () => {
      const bId = await getAdminBarberiaId()
      
      if (!bId) {
        router.push('/login')
        return
      }

      setBarberiaId(bId)
      
      const { data: barberiaData } = await supabase
        .from('barberias')
        .select('*')
        .eq('id', bId)
        .single()
      
      if (barberiaData) setBarberia(barberiaData)

      const { data: turnosData } = await supabase
        .from('turnos')
        .select('*')
        .eq('barberia_id', bId)
        .order('fecha', { ascending: true })
        .order('hora', { ascending: true })

      if (turnosData) {
        setTurnos(turnosData)
        const ingresos = turnosData
          .filter(t => t.estado === 'confirmado')
          .reduce((acc, t) => acc + (Number(t.monto_total) || 0), 0)
        
        const today = new Date().toLocaleDateString('en-CA');

        setStats({
          ingresos,
          turnosHoy: turnosData.filter(t => t.fecha === today).length
        })
      }

      const { data: serviciosData } = await supabase
        .from('servicios')
        .select('*')
        .eq('barberia_id', bId)
        .order('nombre', { ascending: true })

      if (serviciosData) setServicios(serviciosData)
      
      setLoading(false)
    }

    fetchData()
  }, [router, supabase])

  const handleUpdateTurnoEstado = async (id: string, nuevoEstado: Turno['estado']) => {
    const { error } = await supabase
      .from('turnos')
      .update({ estado: nuevoEstado })
      .eq('id', id)

    if (!error) {
      setTurnos(turnos.map(t => t.id === id ? { ...t, estado: nuevoEstado } : t))
    }
  }

  const saveServicio = async () => {
    if (!editing?.nombre) return;

    if (editing.id) {
      await supabase
        .from("servicios")
        .update(editing)
        .eq("id", editing.id);
    } else {
      await supabase.from("servicios").insert({
        ...editing,
        barberia_id: barberiaId,
      });
    }

    setOpen(false);
    setEditing(null);
    location.reload();
  };

  const deleteServicio = async (id: string) => {
    if (!confirm("¿Estás seguro de que deseas eliminar este servicio?")) return;
    await supabase.from("servicios").delete().eq("id", id);
    location.reload();
  };

  const clientUrl = typeof window !== 'undefined' ? `${window.location.origin}/?s=${barberia?.slug}` : '';

  return (
    <div className="flex flex-col gap-10 w-full animate-in fade-in duration-700">
      {/* Plan Status and Client Link */}
      {!loading && barberia && (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Subscription Status */}
          <div className="bg-[#111] p-8 rounded-[32px] border border-white/5 shadow-2xl relative overflow-hidden flex flex-col justify-center">
            <div className={`absolute top-0 right-0 w-32 h-32 ${barberia.plan_activo ? 'bg-green-500/5' : 'bg-red-500/5'} rounded-full -translate-y-12 translate-x-12 blur-3xl`}></div>
            <div className="space-y-4 relative z-10">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Estado del Sistema</p>
                <div className={`flex items-center gap-2 px-3 py-1 rounded-full border ${
                  barberia.plan_activo 
                    ? 'bg-green-500/10 border-green-500/20 text-green-500' 
                    : 'bg-red-500/10 border-red-500/20 text-red-500'
                }`}>
                  <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${barberia.plan_activo ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <span className="text-[9px] font-black uppercase tracking-widest">
                    {barberia.plan_activo ? 'Activo' : 'Inactivo'}
                  </span>
                </div>
              </div>
              <div>
                <h3 className="text-3xl font-black text-white uppercase tracking-tight">
                  Plan <span className={barberia.plan_activo ? 'text-green-500' : 'text-red-500'}>
                    {barberia.plan_activo ? 'Premium' : 'Vencido'}
                  </span>
                </h3>
                {barberia.fecha_expiracion && (
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">
                    Expira: {new Date(barberia.fecha_expiracion).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Client Link Card */}
          <div className="xl:col-span-2 bg-[#111] p-8 rounded-[32px] border border-[#D4AF37]/20 shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#D4AF37]/5 rounded-full -translate-y-12 translate-x-12 blur-3xl"></div>
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
              <div className="space-y-2">
                <h2 className="text-2xl font-black uppercase tracking-tight text-white">Link para <span className="text-[#D4AF37]">Clientes</span></h2>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Comparte este link para recibir reservas</p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 flex-1 max-w-xl">
                <div className="flex-1 bg-black rounded-2xl border border-white/5 p-4 flex items-center">
                  <input 
                    value={clientUrl} 
                    readOnly 
                    className="bg-transparent border-none outline-none text-gray-400 text-xs font-bold w-full"
                  />
                </div>
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(clientUrl);
                    alert("¡Link copiado al portapapeles!");
                  }}
                  className="bg-[#D4AF37] text-black px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl shadow-[#D4AF37]/10"
                >
                  Copiar Link
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="flex flex-col gap-4">
        <div className="flex items-center gap-3 text-[#D4AF37]">
          <div className="w-10 h-1 bg-[#D4AF37] rounded-full"></div>
          <span className="text-[10px] font-black uppercase tracking-[0.3em]">Dashboard Administrativo</span>
        </div>
        <h2 className="text-5xl lg:text-6xl font-black tracking-tight text-white uppercase">Control <span className="text-[#D4AF37]">Total</span></h2>
      </header>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-40 gap-6 w-full">
          <Loader2 className="w-12 h-12 text-[#D4AF37] animate-spin" />
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#D4AF37]/50">Sincronizando Datos</p>
        </div>
      ) : (
        <>
          {/* Stats Grid */}
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 w-full">
            <div className="bg-[#111] rounded-[32px] border border-[#D4AF37]/20 p-8 flex flex-col gap-4 relative overflow-hidden h-44 justify-center shadow-2xl">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#D4AF37]/5 rounded-full -translate-y-12 translate-x-12 blur-3xl"></div>
              <div className="p-4 bg-[#D4AF37]/10 w-fit rounded-2xl border border-[#D4AF37]/20 relative z-10">
                <DollarSign className="text-[#D4AF37] w-8 h-8" />
              </div>
              <div className="space-y-1 relative z-10">
                <p className="text-4xl font-black text-white leading-none">${stats.ingresos.toLocaleString()}</p>
                <p className="text-[10px] uppercase font-black text-gray-500 tracking-[0.2em]">Ingresos Mensuales</p>
              </div>
            </div>
            
            <div className="bg-[#111] rounded-[32px] border border-white/5 p-8 flex flex-col gap-4 relative overflow-hidden h-44 justify-center shadow-xl">
              <div className="p-4 bg-white/5 w-fit rounded-2xl border border-white/10 relative z-10">
                <Calendar className="text-gray-400 w-8 h-8" />
              </div>
              <div className="space-y-1 relative z-10">
                <p className="text-4xl font-black text-white leading-none">{stats.turnosHoy}</p>
                <p className="text-[10px] uppercase font-black text-gray-500 tracking-[0.2em]">Turnos para Hoy</p>
              </div>
            </div>
          </section>

          {/* Tab Selector */}
          <div className="flex bg-[#111] p-2 rounded-[28px] border border-white/5 w-full lg:max-w-xl shadow-2xl">
            <button 
              onClick={() => setActiveTab('turnos')}
              className={`flex-1 py-5 text-[10px] font-black uppercase tracking-[0.2em] rounded-[22px] transition-all duration-300 ${activeTab === 'turnos' ? 'bg-[#D4AF37] text-black shadow-lg shadow-[#D4AF37]/20' : 'text-gray-500 hover:text-white'}`}
            >
              Control de Agenda
            </button>
            <button 
              onClick={() => setActiveTab('servicios')}
              className={`flex-1 py-5 text-[10px] font-black uppercase tracking-[0.2em] rounded-[22px] transition-all duration-300 ${activeTab === 'servicios' ? 'bg-[#D4AF37] text-black shadow-lg shadow-[#D4AF37]/20' : 'text-gray-500 hover:text-white'}`}
            >
              Gestión de Servicios
            </button>
          </div>

          {/* Content Area */}
          <div className="flex flex-col gap-10">
            {activeTab === 'turnos' ? (
              <section className="space-y-8">
                <div className="flex justify-between items-center px-4">
                  <h2 className="text-3xl font-black tracking-tight uppercase text-white">Próximos <span className="text-[#D4AF37]">Turnos</span></h2>
                  <div className="flex gap-4">
                    <button className="p-5 bg-[#111] rounded-2xl border border-white/5 text-gray-400 hover:text-white transition-all shadow-xl"><Search size={24} /></button>
                    <button className="p-5 bg-[#111] rounded-2xl border border-white/5 text-gray-400 hover:text-white transition-all shadow-xl"><Filter size={24} /></button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                  {turnos.length > 0 ? (
                    turnos.map((turno) => (
                      <div key={turno.id} className="bg-[#111] rounded-[32px] border border-white/5 p-8 flex flex-col gap-8 hover:border-[#D4AF37]/20 transition-all shadow-xl relative group">
                        <div className="flex justify-between items-start relative z-10">
                          <div className="flex items-center gap-5">
                            <div className="flex flex-col items-center justify-center w-24 h-24 bg-[#D4AF37]/10 rounded-[28px] border border-[#D4AF37]/20">
                              <span className="text-2xl font-black text-[#D4AF37] leading-none">{turno.hora}</span>
                              <span className="text-[10px] font-black text-[#D4AF37]/50 uppercase mt-2 tracking-widest">HS</span>
                            </div>
                            <div className="space-y-1">
                              <h3 className="text-2xl font-black text-white uppercase tracking-tight">{turno.cliente_nombre}</h3>
                              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.2em] flex items-center gap-2">
                                <Calendar size={14} className="text-[#D4AF37]" /> {turno.fecha}
                              </p>
                            </div>
                          </div>
                          <div className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                            turno.estado === 'confirmado' ? 'bg-green-500/10 text-green-500 border-green-500/20' :
                            turno.estado === 'cancelado' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                            'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
                          }`}>
                            {turno.estado}
                          </div>
                        </div>
                        
                        <div className="flex gap-4 pt-8 border-t border-white/5 relative z-10">
                          <button 
                            onClick={() => handleUpdateTurnoEstado(turno.id, 'confirmado')}
                            className="flex-1 py-5 bg-green-500/10 hover:bg-green-500/20 text-green-500 rounded-[24px] text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                          >
                            <CheckCircle2 size={18} /> Confirmar
                          </button>
                          <button 
                            onClick={() => handleUpdateTurnoEstado(turno.id, 'cancelado')}
                            className="flex-1 py-5 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-[24px] text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                          >
                            <XCircle size={18} /> Cancelar
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-full bg-[#111] border border-dashed border-white/10 rounded-[40px] flex flex-col items-center py-40 gap-8 text-center">
                      <div className="p-8 bg-white/5 rounded-full text-gray-800"><Calendar size={80} /></div>
                      <p className="text-gray-500 text-sm font-black uppercase tracking-[0.3em]">No hay turnos registrados en la agenda</p>
                    </div>
                  )}
                </div>
              </section>
            ) : (
              <section className="space-y-8">
                <div className="flex justify-between items-center px-4">
                  <h2 className="text-3xl font-black tracking-tight uppercase text-white">Gestión de <span className="text-[#D4AF37]">Servicios</span></h2>
                  <button 
                    onClick={() => {
                      setEditing(null);
                      setOpen(true);
                    }}
                    className="flex items-center gap-4 px-10 py-5 bg-[#D4AF37] text-black rounded-[28px] font-black text-[10px] uppercase tracking-widest shadow-2xl shadow-[#D4AF37]/20 hover:scale-105 active:scale-95 transition-all"
                  >
                    <Plus size={24} strokeWidth={3} />
                    NUEVO SERVICIO
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                  {servicios.length > 0 ? (
                    servicios.map((servicio) => (
                      <div key={servicio.id} className="bg-[#111] rounded-[32px] border border-white/5 p-8 flex items-center justify-between group hover:border-[#D4AF37]/20 transition-all shadow-xl">
                        <div className="flex items-center gap-8">
                          <div className="p-6 bg-white/5 rounded-[28px] border border-white/5 group-hover:bg-[#D4AF37] group-hover:text-black transition-all">
                            <Scissors size={32} />
                          </div>
                          <div className="space-y-1">
                            <h3 className="text-2xl font-black text-white uppercase tracking-tight">{servicio.nombre}</h3>
                            <div className="flex items-center gap-6">
                              <span className="text-[#D4AF37] font-black text-xl leading-none">${servicio.precio}</span>
                              <div className="flex items-center gap-2 text-gray-500 text-[10px] font-black uppercase tracking-widest">
                                <Clock4 size={16} className="text-[#D4AF37]" /> {servicio.duracion} min
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button 
                            onClick={() => {
                              setEditing(servicio);
                              setOpen(true);
                            }}
                            className="p-4 text-gray-500 hover:text-[#D4AF37] hover:bg-white/5 rounded-2xl transition-all"
                          >
                            <MoreVertical size={28} />
                          </button>
                          <button 
                            onClick={() => deleteServicio(servicio.id)}
                            className="p-4 text-gray-500 hover:text-red-500 hover:bg-white/5 rounded-2xl transition-all"
                          >
                            <XCircle size={28} />
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-full bg-[#111] border border-dashed border-white/10 rounded-[40px] flex flex-col items-center py-40 gap-8 text-center">
                      <div className="p-8 bg-white/5 rounded-full text-gray-800"><Scissors size={80} /></div>
                      <p className="text-gray-500 text-sm font-black uppercase tracking-[0.3em]">Aún no has configurado tus servicios</p>
                    </div>
                  )}
                </div>
              </section>
            )}
          </div>
        </>
      )}

      {/* Modal de Servicio */}
      {open && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#111] p-8 rounded-[40px] w-full max-w-md space-y-8 border border-white/5 shadow-2xl">
            
            <div className="space-y-2">
              <h2 className="text-3xl font-black uppercase tracking-tight text-white">
                {editing?.id ? "Editar" : "Nuevo"} <span className="text-[#D4AF37]">Servicio</span>
              </h2>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Configuración de catálogo</p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-4">Nombre del Servicio</label>
                <input
                  placeholder="Ej: Corte Clásico"
                  className="w-full p-6 bg-black rounded-3xl border border-white/5 focus:border-[#D4AF37]/50 transition-all text-white font-bold outline-none"
                  onChange={(e) =>
                    setEditing({ ...editing, nombre: e.target.value })
                  }
                  value={editing?.nombre || ""}
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-4">Precio ($)</label>
                <input
                  placeholder="Precio"
                  type="number"
                  className="w-full p-6 bg-black rounded-3xl border border-white/5 focus:border-[#D4AF37]/50 transition-all text-white font-bold outline-none"
                  onChange={(e) =>
                    setEditing({ ...editing, precio: Number(e.target.value) })
                  }
                  value={editing?.precio || ""}
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-4">Duración (minutos)</label>
                <input
                  placeholder="Ej: 30"
                  type="number"
                  className="w-full p-6 bg-black rounded-3xl border border-white/5 focus:border-[#D4AF37]/50 transition-all text-white font-bold outline-none"
                  onChange={(e) =>
                    setEditing({ ...editing, duracion: Number(e.target.value) })
                  }
                  value={editing?.duracion || ""}
                />
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={saveServicio}
                className="flex-1 py-6 bg-[#D4AF37] text-black rounded-3xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-[#D4AF37]/10 hover:scale-[1.02] active:scale-95 transition-all"
              >
                Guardar Cambios
              </button>

              <button
                onClick={() => {
                  setOpen(false);
                  setEditing(null);
                }}
                className="flex-1 py-6 bg-white/5 text-white rounded-3xl font-black text-[10px] uppercase tracking-widest hover:bg-white/10 transition-all"
              >
                Cancelar
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  )
}
