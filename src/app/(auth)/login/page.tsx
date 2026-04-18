"use client";

import { useState } from "react";
import { loginUser } from "@/lib/auth";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { LogIn, Loader2, Scissors } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await loginUser(email, password);
      router.push("/dashboard");
    } catch (err: any) {
      console.error("Login error:", err);
      setError("Credenciales inválidas. Por favor intente de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#050505] px-4 selection:bg-white/10 selection:text-white">
      <Link href="/" className="flex items-center gap-2.5 mb-10 group transition-all duration-300 hover:scale-105">
        <div className="bg-white p-2 rounded-xl shadow-[0_0_20px_rgba(255,255,255,0.1)]">
          <Scissors className="w-6 h-6 text-black fill-black" />
        </div>
        <span className="text-2xl font-bold tracking-tight text-white">BarberOS</span>
      </Link>

      <div className="w-full max-w-md glass p-10 rounded-[32px] shadow-soft space-y-8 animate-slide-up">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-white">Bienvenido</h1>
          <p className="text-zinc-500 font-medium text-sm">Ingresa tus credenciales para continuar</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 ml-1">Email</label>
            <input
              type="email"
              required
              className="w-full bg-white/[0.03] border border-white/[0.08] rounded-2xl px-5 py-4 text-white focus:bg-white/[0.05] transition-all outline-none"
              placeholder="tu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 ml-1">Contraseña</label>
            <input
              type="password"
              required
              className="w-full bg-white/[0.03] border border-white/[0.08] rounded-2xl px-5 py-4 text-white focus:bg-white/[0.05] transition-all outline-none"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && (
            <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-bold py-3 px-4 rounded-xl text-center">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-white text-black font-bold py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-zinc-200 active:scale-95 transition-all disabled:opacity-50 uppercase tracking-widest text-xs shadow-soft"
          >
            {loading ? <Loader2 className="animate-spin w-5 h-5" /> : "Iniciar Sesión"}
          </button>
        </form>

        <p className="text-center text-zinc-600 text-[10px] font-bold uppercase tracking-widest">
          ¿No tienes cuenta?{" "}
          <Link href="/register" className="text-white hover:underline">
            Regístrate ahora
          </Link>
        </p>
      </div>
    </div>
  );
}
