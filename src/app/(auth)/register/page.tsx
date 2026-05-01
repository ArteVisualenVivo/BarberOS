"use client";

import { useState } from "react";
import { registerUser } from "@/lib/auth";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, Scissors, ArrowRight } from "lucide-react";

export default function RegisterPage() {
  const [nombreBarberia, setNombreBarberia] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const user = await registerUser(email, password);
      const idToken = await user.getIdToken();

      // La barbería y el trial se crean en backend para impedir "trial infinito"
      // aunque alguien intente repetir el flujo por fuera del frontend.
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({ nombreBarberia }),
      });

      const data = await response.json();

      if (response.ok && data?.success) {
        router.push(data?.redirectTo || "/dashboard");
        return;
      }

      if (response.status === 409) {
        router.push(data?.redirectTo || "/login");
        return;
      }

      throw new Error(data?.error || "register_backend_failed");
    } catch (err: any) {
      console.error("Error completo de registro:", err);

      if (err.code === "auth/configuration-not-found") {
        setError("Error de configuración: verifica que Email/Password esté habilitado en Firebase Console.");
      } else if (err.code === "auth/email-already-in-use") {
        setError("Este correo electrónico ya está registrado.");
      } else if (err.code === "auth/invalid-email") {
        setError("El correo electrónico no es válido.");
      } else if (err.code === "auth/weak-password") {
        setError("La contraseña es muy débil (mínimo 6 caracteres).");
      } else if (err.message === "invalid_or_taken_slug") {
        setError("El nombre de la barbería genera una URL inválida o ya está en uso.");
      } else {
        setError("Ocurrió un error inesperado. Inténtalo de nuevo más tarde.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#050505] px-4 py-10 selection:bg-white/10 selection:text-white">
      <Link href="/" className="flex items-center gap-2.5 mb-10 group transition-all duration-300 hover:scale-105">
        <div className="bg-white p-2 rounded-xl shadow-[0_0_20px_rgba(255,255,255,0.1)]">
          <Scissors className="w-6 h-6 text-black fill-black" />
        </div>
        <span className="text-2xl font-bold tracking-tight text-white">BarberOS</span>
      </Link>

      <div className="w-full max-w-md glass p-10 rounded-[32px] shadow-soft space-y-8 animate-slide-up">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-white">Comienza ahora</h1>
          <p className="text-zinc-500 font-medium text-sm">Crea tu cuenta y gestiona tu barbería profesionalmente</p>
        </div>

        <form onSubmit={handleRegister} className="space-y-5">
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 ml-1">Nombre de tu Barbería</label>
            <input
              type="text"
              required
              placeholder="Ej: Golden Scissors"
              className="w-full bg-white/[0.03] border border-white/[0.08] rounded-2xl px-5 py-4 text-white focus:bg-white/[0.05] transition-all outline-none"
              value={nombreBarberia}
              onChange={(e) => setNombreBarberia(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 ml-1">Email Corporativo</label>
            <input
              type="email"
              required
              placeholder="tu@email.com"
              className="w-full bg-white/[0.03] border border-white/[0.08] rounded-2xl px-5 py-4 text-white focus:bg-white/[0.05] transition-all outline-none"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 ml-1">Contraseña Segura</label>
            <input
              type="password"
              required
              placeholder="••••••••"
              className="w-full bg-white/[0.03] border border-white/[0.08] rounded-2xl px-5 py-4 text-white focus:bg-white/[0.05] transition-all outline-none"
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
            {loading ? <Loader2 className="animate-spin w-5 h-5" /> : (
              <span className="flex items-center gap-2">
                Crear mi Barbería <ArrowRight size={16} />
              </span>
            )}
          </button>
        </form>

        <p className="text-center text-zinc-600 text-[10px] font-bold uppercase tracking-widest">
          ¿Ya tienes cuenta?{" "}
          <Link href="/login" className="text-white hover:underline">
            Inicia sesión aquí
          </Link>
        </p>
      </div>
    </div>
  );
}
