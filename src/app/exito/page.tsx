'use client'

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, Loader2 } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { Database } from "@/types/supabase";

type Turno = Database['public']['Tables']['turnos']['Row']
type Servicio = Database['public']['Tables']['servicios']['Row']
type Barberia = Database['public']['Tables']['barberias']['Row']

type TurnoConServicio = Turno & {
  servicios?: Servicio | null
}

export default function ExitoPage() {
  const searchParams = useSearchParams();
  const slug = searchParams.get("s");
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<{
    turno: TurnoConServicio;
    barberia: Barberia;
  } | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!slug) {
        setLoading(false);
        return;
      }

      // 🔥 FIX: tipado explícito evita "never"
      const { data: barberia } = await supabase
        .from('barberias')
        .select('id, nombre, telefono')
        .eq('slug', slug)
        .single<Pick<Barberia, 'id' | 'nombre' | 'telefono'>>();

      if (!barberia) {
        setLoading(false);
        return;
      }

      const { data: turno } = await supabase
        .from('turnos')
        .select('*, servicios(*)')
        .eq('barberia_id', barberia.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (turno) {
        setData({
          turno: turno as TurnoConServicio,
          barberia: barberia as Barberia
        });
      }

      setLoading(false);
    };

    fetchData();
  }, [slug]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-black">
        <Loader2 className="w-10 h-10 animate-spin text-green-500" />
      </div>
    );
  }

  const mensaje = data
    ? `Hola, quiero confirmar mi turno:

Servicio: ${data.turno.servicios?.nombre}
Fecha: ${data.turno.fecha}
Hora: ${data.turno.hora} HS`
    : "";

  const telefono = data?.barberia?.telefono || "5490000000000";
  const whatsappUrl = `https://wa.me/${telefono}?text=${encodeURIComponent(mensaje)}`;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center gap-6">
      <CheckCircle2 className="w-20 h-20 text-green-500" />

      <h1 className="text-4xl font-black">
        ¡Turno confirmado!
      </h1>

      <a
        href={whatsappUrl}
        target="_blank"
        className="bg-green-500 text-white px-6 py-3 rounded-xl font-bold"
      >
        Confirmar por WhatsApp
      </a>

      <Link href={slug ? `/?s=${slug}` : "/"}>
        Volver
      </Link>
    </div>
  );
}