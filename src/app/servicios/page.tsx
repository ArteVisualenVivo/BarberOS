'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ChevronLeft, Scissors, Clock, ArrowRight, Zap, Loader2, Info } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import { Database } from '@/types/supabase'
import { useSearchParams } from 'next/navigation'
import { getBarberiaIdBySlug } from '@/utils/barberia/context'

type Servicio = Database['public']['Tables']['servicios']['Row']

export default function ServiciosPage() {
  const [servicios, setServicios] = useState<Servicio[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [planActivo, setPlanActivo] = useState<boolean>(true)
  const searchParams = useSearchParams()
  const slug = searchParams.get('s')
  const supabase = createClient()

  useEffect(() => {
    const fetchServicios = async () => {
      if (!slug) {
        setLoading(false);
        setError('No se especificó una barbería.');
        return;
      }

      const { data: barberia, error: bError } = await supabase
        .from('barberias')
        .select('id, plan_activo')
        .eq('slug', slug)
        .single()

      if (bError || !barberia) {
        setLoading(false);
        setError('Barbería no encontrada.');
        return;
      }

      if (!barberia.plan_activo) {
        setPlanActivo(false)
        setLoading(false)
        return
      }

      const bId = barberia.id
      const { data, error: fetchError } = await supabase
        .from('servicios')
        .select('*')
        .eq('barberia_id', bId)
        .order('precio', { ascending: true })

      if (fetchError) {
        console.error('Error cargando servicios:', fetchError)
        setServicios([])
      } else if (data) {
        setServicios(data)
      }
      setLoading(false)
    }

    fetchServicios()
  }, [supabase, slug])

  if (!loading && !planActivo) {
    return (
      <div className="flex items-center justify-center h-[70vh] text-center px-6">
        <div className="bg-[#111] p-12 rounded-[40px] border border-red-500/20 shadow-2xl space-y-6 max-w-md w-full">
          <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto border border-red-500/20">
            <Scissors className="text-red-500 w-10 h-10 rotate-45" />
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-black uppercase tracking-tight text-white">Sistema <span className="text-red-500">Inactivo</span></h1>
            <p className="text-gray-400 font-medium leading-relaxed">
              Lo sentimos, el catálogo de esta barbería no se encuentra disponible actualmente.
            </p>
          </div>
          <div className="pt-4">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-600">Contacta con el administrador</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-10 w-full animate-in fade-in duration-700">
      {/* Header */}
      <header className="flex flex-col gap-4">
        <div className="flex items-center gap-3 text-[#D4AF37]">
          <div className="w-10 h-1 bg-[#D4AF37] rounded-full"></div>
          <span className="text-[10px] font-black uppercase tracking-[0.3em]">Nuestros Servicios</span>
        </div>
        <div className="flex items-center justify-between">
          <h2 className="text-5xl lg:text-6xl font-black tracking-tight text-white uppercase">Elegí tu <span className="text-[#D4AF37]">Estilo</span></h2>
          <Link href={`/?s=${slug}`} className="p-3 bg-[#111] rounded-xl border border-white/5 hover:border-[#D4AF37]/30 transition-all">
            <ChevronLeft className="w-6 h-6 text-[#D4AF37]" />
          </Link>
        </div>
        <p className="text-gray-400 text-lg font-medium max-w-2xl">Cortes de autor y barbería clásica para el hombre moderno. Calidad premium garantizada.</p>
      </header>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 w-full">
        {loading ? (
          <div className="col-span-full flex flex-col items-center justify-center py-32 gap-6">
            <Loader2 className="w-12 h-12 text-[#D4AF37] animate-spin" />
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#D4AF37]/50">Cargando Menú</p>
          </div>
        ) : error ? (
          <div className="col-span-full bg-[#111] border border-red-500/20 rounded-3xl p-20 text-center">
            <p className="text-red-500 font-black uppercase text-xs tracking-widest">{error}</p>
          </div>
        ) : servicios.length > 0 ? (
          servicios.map((servicio) => (
            <Link
              key={servicio.id}
              href={`/reserva?id=${servicio.id}&s=${slug}`}
              className="bg-[#111] rounded-[32px] p-8 border border-white/5 relative group flex flex-col gap-6 active:scale-[0.98] transition-all hover:border-[#D4AF37]/20 shadow-2xl"
            >
              {servicio.popular && (
                <div className="absolute -top-3 right-8 bg-[#D4AF37] px-4 py-1.5 rounded-full flex items-center gap-2 shadow-lg z-10">
                  <Zap className="w-3 h-3 text-black fill-black" />
                  <span className="text-[9px] text-black font-black uppercase">Más Pedido</span>
                </div>
              )}
              
              <div className="flex justify-between items-start">
                <div className="bg-white/5 p-4 rounded-2xl border border-white/5 group-hover:bg-[#D4AF37] group-hover:text-black transition-all">
                  <Scissors className="w-6 h-6" strokeWidth={2.5} />
                </div>
                <div className="text-right">
                  <p className="text-[#D4AF37] text-3xl font-black tracking-tighter leading-none">${servicio.precio.toLocaleString()}</p>
                  <div className="flex items-center gap-1.5 justify-end text-gray-500 text-[10px] uppercase font-black mt-2 tracking-widest">
                    <Clock className="w-3 h-3 text-[#D4AF37]" />
                    <span>{servicio.duracion} min</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-2xl font-black text-white group-hover:text-[#D4AF37] transition-colors uppercase tracking-tight">{servicio.nombre}</h3>
                <p className="text-gray-500 text-sm font-medium leading-relaxed">Experiencia de corte premium con acabados a navaja y asesoramiento personalizado.</p>
              </div>

              <div className="pt-6 border-t border-white/5 flex items-center justify-end">
                <div className="bg-[#D4AF37] text-black font-black py-3 px-6 rounded-xl flex items-center justify-center gap-2 uppercase tracking-widest text-[10px] transition-all duration-300 group-hover:scale-105 active:scale-95">
                  RESERVAR AHORA
                  <ArrowRight className="w-5 h-5" />
                </div>
              </div>
            </Link>
          ))
        ) : (
          <div className="col-span-full bg-[#111] border border-dashed border-white/10 rounded-[40px] p-32 flex flex-col items-center justify-center gap-6 text-center">
            <Scissors size={60} className="text-gray-800" />
            <p className="text-gray-500 font-black uppercase text-xs tracking-[0.3em]">No hay servicios disponibles aún</p>
          </div>
        )}
      </div>

      {/* Info Footer */}
      <div className="bg-[#D4AF37]/5 border border-[#D4AF37]/10 rounded-3xl p-8 flex items-center gap-6 mb-20 max-w-3xl">
        <Info className="text-[#D4AF37] w-8 h-8 shrink-0" />
        <p className="text-xs text-gray-400 font-bold uppercase tracking-widest leading-relaxed">
          Todos los servicios incluyen lavado y asesoramiento de imagen profesional por parte de nuestros barberos.
        </p>
      </div>
    </div>
  )
}
