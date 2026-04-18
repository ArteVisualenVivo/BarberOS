"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useBarberia } from "@/hooks/useBarberia";
import { CheckCircle2, Loader2, ShieldCheck } from "lucide-react";

const formatLicenseCode = (value: string) => {
  const sanitized = value.toUpperCase().replace(/[^A-Z0-9]/g, "");
  return sanitized.match(/.{1,4}/g)?.join("-")?.slice(0, 14) || "";
};

export default function ActivatePage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { barberia, loading: barberiaLoading } = useBarberia();
  const [code, setCode] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [error, setError] = useState("");

  const handleWhatsAppActivation = () => {
    const message = encodeURIComponent(
      `Hola, quiero activar BarberOS\n\n` +
      `Nombre de barbería: ${barberia?.nombre}\n` +
      `Email: ${user?.email}\n` +
      `Teléfono: ${barberia?.telefono || "no definido"}`
    );

    const phone = "5493512417121";

    window.open(`https://wa.me/${phone}?text=${message}`, "_blank");
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setStatus("loading");

    if (!code || code.length !== 14) {
      setError("El código debe tener el formato XXXX-XXXX-XXXX");
      setStatus("error");
      return;
    }

    if (!barberia?.id) {
      setError("No se encontró la barbería. Recarga la página e intenta de nuevo.");
      setStatus("error");
      return;
    }

    try {
      const response = await fetch("/api/license/activate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, barberiaId: barberia.id }),
      });

      const data = await response.json();

      if (data.ok) {
        setStatus("success");
        router.push("/dashboard");
      } else {
        setError(data.error === "invalid_code" ? "Código inválido o ya fue usado." : "Error al activar la licencia.");
        setStatus("error");
      }
    } catch (err) {
      console.error(err);
      setError("Error al conectar con el servidor. Intenta nuevamente.");
      setStatus("error");
    }
  };

  if (authLoading || barberiaLoading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <Loader2 className="animate-spin text-primary w-12 h-12" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white px-4 py-12">
      <div className="mx-auto max-w-2xl rounded-[32px] border border-white/10 bg-black/70 p-10 shadow-2xl">
        <div className="mb-10 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400">
            <ShieldCheck className="w-8 h-8" />
          </div>
            <h1 className="text-4xl font-black uppercase tracking-tight">TU PRUEBA HA FINALIZADO</h1>
            <p className="mt-3 text-sm text-zinc-400">
              Para continuar usando BarberOS, solicita activación por WhatsApp y valida el código que te envíe el admin.
          <div className="space-y-6 rounded-[28px] border border-white/10 bg-white/5 p-8">
            <div className="space-y-3">
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-zinc-400">¿Qué hacer?</p>
              <p className="text-sm text-zinc-300 leading-7">
                Presiona el botón de WhatsApp para solicitar activación directamente al admin. Luego ingresa el código único que te envíen.
              </p>
            </div>

            <div className="space-y-2 rounded-3xl border border-emerald-500/20 bg-emerald-500/5 p-6">
              <p className="text-xs uppercase tracking-[0.3em] text-emerald-300">Datos que se enviarán</p>
              <p className="text-sm text-white"><span className="font-bold">Barbería:</span> {barberia?.nombre || "No definido"}</p>
              <p className="text-sm text-white"><span className="font-bold">Email:</span> {user?.email || "No definido"}</p>
              <p className="text-sm text-white"><span className="font-bold">Teléfono:</span> {barberia?.telefono || "No definido"}</p>
            </div>

            <button
              type="button"
              onClick={handleWhatsAppActivation}
              className="w-full rounded-3xl bg-emerald-500 px-6 py-4 text-sm font-bold uppercase tracking-[0.2em] text-black transition hover:bg-emerald-400"
            >
              Solicitar activación por WhatsApp
            </button>
          </div>

          <div className="rounded-[28px] border border-white/10 bg-white/5 p-8">
            <div className="mb-6 flex items-center gap-3">
              <div className="rounded-3xl bg-white/5 p-3 text-primary">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-zinc-400">Código de activación</p>
                <h2 className="text-2xl font-bold">Ingresar código</h2>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-[0.25em] text-zinc-500">Código</label>
                <input
                  type="text"
                  maxLength={14}
                  placeholder="XXXX-XXXX-XXXX"
                  className="w-full rounded-3xl border border-white/10 bg-black/70 px-5 py-4 text-sm text-white outline-none transition focus:border-emerald-400"
                  value={code}
                  onChange={(e) => setCode(formatLicenseCode(e.target.value))}
                />
              </div>

              {error && (
                <div className="rounded-3xl bg-rose-500/10 border border-rose-500/20 px-4 py-3 text-sm text-rose-200">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={status === "loading"}
                className="w-full rounded-3xl bg-white px-6 py-4 text-sm font-bold uppercase tracking-[0.2em] text-black transition hover:bg-zinc-200 disabled:opacity-50"
              >
                {status === "loading" ? <Loader2 className="mx-auto h-5 w-5 animate-spin text-black" /> : "Activar cuenta"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
