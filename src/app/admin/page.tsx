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
type Barberia = Database['public']['Tables']['barberias']['Row']

export default function AdminDashboardPage() {
  const [turnos, setTurnos] = useState<Turno[]>([])
  const [servicios, setServicios] = useState<Servicio[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'turnos' | 'servicios'>('turnos')
  const [stats, setStats] = useState({ ingresos: 0, turnosHoy: 0 })
  const [barberiaId, setBarberiaId] = useState<string | null>(null)
  const [barberia, setBarberia] = useState<Barberia | null>(null)

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
        .returns<Turno[]>()   // ✅ FIX VERCEL

      if (turnosData) {
        setTurnos(turnosData)

        const ingresos = turnosData
          .filter(t => t.estado === 'confirmado')
          .reduce((acc, t) => acc + (Number(t.monto_total) || 0), 0)

        const today = new Date().toLocaleDateString('en-CA')

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
    if (!editing?.nombre) return

    if (editing.id) {
      await supabase
        .from("servicios")
        .update(editing)
        .eq("id", editing.id)
    } else {
      await supabase.from("servicios").insert({
        ...editing,
        barberia_id: barberiaId,
      })
    }

    setOpen(false)
    setEditing(null)
    location.reload()
  }

  const deleteServicio = async (id: string) => {
    if (!confirm("¿Estás seguro de que deseas eliminar este servicio?")) return
    await supabase.from("servicios").delete().eq("id", id)
    location.reload()
  }

  const clientUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/?s=${barberia?.slug}`
      : ''

  return (
    <div className="flex flex-col gap-10 w-full animate-in fade-in duration-700">

      {/* HEADER SIMPLE (sin cambios importantes) */}
      <header className="flex flex-col gap-4">
        <div className="flex items-center gap-3 text-[#D4AF37]">
          <div className="w-10 h-1 bg-[#D4AF37] rounded-full"></div>
          <span className="text-[10px] font-black uppercase tracking-[0.3em]">
            Dashboard Administrativo
          </span>
        </div>
        <h2 className="text-5xl lg:text-6xl font-black text-white uppercase">
          Control <span className="text-[#D4AF37]">Total</span>
        </h2>
      </header>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-40 gap-6 w-full">
          <Loader2 className="w-12 h-12 text-[#D4AF37] animate-spin" />
        </div>
      ) : (
        <>
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 w-full">
            <div className="bg-[#111] p-8 rounded-[32px] border border-[#D4AF37]/20">
              <p className="text-4xl font-black text-white">
                ${stats.ingresos.toLocaleString()}
              </p>
              <p className="text-[10px] uppercase text-gray-500">
                Ingresos
              </p>
            </div>

            <div className="bg-[#111] p-8 rounded-[32px] border border-white/5">
              <p className="text-4xl font-black text-white">
                {stats.turnosHoy}
              </p>
              <p className="text-[10px] uppercase text-gray-500">
                Turnos hoy
              </p>
            </div>
          </section>

          {/* TURNOS */}
          {activeTab === 'turnos' && (
            <div className="grid gap-6">
              {turnos.map((turno) => (
                <div key={turno.id} className="bg-[#111] p-6 rounded-3xl border border-white/5">
                  <p className="text-white font-bold">{turno.cliente_nombre}</p>
                  <p className="text-gray-500 text-xs">{turno.estado}</p>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}