'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Scissors, ArrowRight, Loader2, Mail, Lock } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (authError) throw authError

      router.push('/admin')
      router.refresh()
    } catch (err: any) {
      console.error('Error en login:', err)
      setError(err.message || 'Credenciales inválidas.')
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
              Inicia <span className="text-primary">Sesión</span>
            </h1>
            <p className="text-accent text-xs font-medium uppercase tracking-widest">Panel de Administración</p>
          </div>
        </div>

        <form onSubmit={handleLogin} className="flex flex-col gap-5">
          <div className="space-y-1.5">
            <label className="text-[10px] uppercase font-black text-accent tracking-[0.2em] pl-2 flex items-center gap-2">
              <Mail size={12} className="text-primary" /> Email
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
                ENTRAR AL PANEL
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>

        <p className="text-accent text-xs text-center font-medium">
          ¿No tienes una cuenta?{' '}
          <Link href="/register" className="text-primary font-bold hover:underline transition-all">
            Crea tu Barbería
          </Link>
        </p>
      </div>
    </div>
  )
}
