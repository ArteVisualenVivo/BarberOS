'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Scissors, ArrowRight, Loader2, Mail, Lock, Store } from 'lucide-react'

export default function RegisterPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [barberiaNombre, setBarberiaNombre] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // 1. Registro en Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      })

      if (authError) throw authError
      if (!authData.user) throw new Error('No se pudo crear el usuario.')

      // 2. Crear Barbería (Tenant)
      const slug = barberiaNombre.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^\w-]+/g, '')
      
      const { data: barberiaData, error: barberiaError } = await supabase
        .from('barberias')
        .insert({
          nombre: barberiaNombre,
          email_owner: email,
          slug: `${slug}-${Math.random().toString(36).substring(2, 7)}`, // Slug único
        })
        .select()
        .single()

      if (barberiaError) throw barberiaError

      // 3. Crear Perfil de Usuario vinculado a la Barbería
      const { error: profileError } = await supabase.from('usuarios').insert({
        id: authData.user.id,
        barberia_id: barberiaData.id,
        nombre: email.split('@')[0],
        rol: 'admin',
      })

      if (profileError) throw profileError

      // Éxito: Redirigir al admin
      router.push('/admin')
      router.refresh()
    } catch (err: any) {
      console.error('Error en registro:', err)
      setError(err.message || 'Ocurrió un error inesperado.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col min-h-screen p-6 items-center justify-center bg-black">
      <div className="w-full max-w-sm flex flex-col gap-10">
        <div className="flex flex-col items-center gap-4">
          <div className="relative group">
            <div className="absolute -inset-1 bg-primary/20 rounded-full blur-xl opacity-50"></div>
            <div className="relative w-16 h-16 bg-surface rounded-full flex items-center justify-center border border-primary/30 shadow-2xl">
              <Scissors className="text-primary w-8 h-8" />
            </div>
          </div>
          <div className="text-center space-y-1">
            <h1 className="text-3xl font-black tracking-tight">
              Crea tu <span className="text-primary">Barbería</span>
            </h1>
            <p className="text-accent text-xs font-medium uppercase tracking-widest">SaaS Profesional para Barberos</p>
          </div>
        </div>

        <form onSubmit={handleRegister} className="flex flex-col gap-5">
          <div className="space-y-1.5">
            <label className="text-[10px] uppercase font-black text-accent tracking-[0.2em] pl-2 flex items-center gap-2">
              <Store size={12} className="text-primary" /> Nombre de la Barbería
            </label>
            <input
              type="text"
              required
              value={barberiaNombre}
              onChange={(e) => setBarberiaNombre(e.target.value)}
              placeholder="Ej: Barbería Deluxe"
              className="w-full bg-surface border border-white/10 p-4 rounded-2xl text-white focus:outline-none focus:border-primary/50 text-sm transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] uppercase font-black text-accent tracking-[0.2em] pl-2 flex items-center gap-2">
              <Mail size={12} className="text-primary" /> Email del Administrador
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              className="w-full bg-surface border border-white/10 p-4 rounded-2xl text-white focus:outline-none focus:border-primary/50 text-sm transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] uppercase font-black text-accent tracking-[0.2em] pl-2 flex items-center gap-2">
              <Lock size={12} className="text-primary" /> Contraseña
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-surface border border-white/10 p-4 rounded-2xl text-white focus:outline-none focus:border-primary/50 text-sm transition-all"
            />
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 p-3 rounded-xl">
              <p className="text-red-500 text-[10px] font-bold text-center uppercase tracking-wider">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="bg-primary text-black font-black py-4 px-8 rounded-xl transition-all duration-300 active:scale-95 flex items-center justify-center gap-2 uppercase tracking-widest text-xs w-full mt-2 group shadow-[0_10px_30px_rgba(212,175,55,0.2)]"
          >
            {loading ? <Loader2 className="animate-spin w-5 h-5" /> : (
              <>
                EMPEZAR AHORA
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>

        <p className="text-accent text-xs text-center font-medium">
          ¿Ya tienes una barbería?{' '}
          <Link href="/login" className="text-primary font-bold hover:underline transition-all">
            Inicia Sesión
          </Link>
        </p>
      </div>
    </div>
  )
}
