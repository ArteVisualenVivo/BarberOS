'use client'

import { useEffect, useState } from 'react'
import {
  Calendar, DollarSign, Loader2,
  CheckCircle2, XCircle, Scissors, Clock4
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
  const [stats, setStats] = useState({ ingresos: 0, turnosHoy: 0 })
  const [barberiaId, setBarberiaId] = useState<string | null>(null)
  const [barberia, setBarberia] = useState<Barberia | null>(null)

  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    const fetchData = async () => {
      const bId = await getAdminBarberiaId()

      if (!bId) return router.push('/login')

      setBarberiaId(bId)

      const { data: barberiaData } = await supabase
        .from('barberias')
        .select('*')
        .eq('id', bId)
        .single()

      if (barberiaData) setBarberia(barberiaData)

      // ✅ FIX CRÍTICO: tipado explícito
      const { data: turnosData } = await supabase
        .from('turnos')
        .select('*')
        .eq('barberia_id', bId)
        .order('fecha', { ascending: true })
        .order('hora', { ascending: true })

      const typedTurnos: Turno[] = turnosData ?? []

      setTurnos(typedTurnos)

      const ingresos = typedTurnos
        .filter(t => t.estado === 'confirmado')
        .reduce((acc, t) => acc + (Number(t.monto_total) || 0), 0)

      const today = new Date().toLocaleDateString('en-CA')

      setStats({
        ingresos,
        turnosHoy: typedTurnos.filter(t => t.fecha === today).length
      })

      const { data: serviciosData } = await supabase
        .from('servicios')
        .select('*')
        .eq('barberia_id', bId)

      setServicios(serviciosData ?? [])

      setLoading(false)
    }

    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-40">
        <Loader2 className="animate-spin" />
      </div>
    )
  }

  return (
    <div className="p-10 text-white">
      <h1 className="text-3xl font-black">Admin OK</h1>

      <p>Ingresos: ${stats.ingresos}</p>
      <p>Turnos hoy: {stats.turnosHoy}</p>

      <div className="mt-6">
        {turnos.map(t => (
          <div key={t.id} className="p-4 bg-[#111] rounded-xl mt-2">
            <p>{t.cliente_nombre}</p>
            <p>{t.estado}</p>
          </div>
        ))}
      </div>
    </div>
  )
}