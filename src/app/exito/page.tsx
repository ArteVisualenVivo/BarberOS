'use client'

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, Calendar, Clock, MessageCircle, ArrowRight, Scissors, Loader2 } from "lucide-react";
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
    turno: TurnoConServicio,
    barberia: Barberia
  } | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!slug) {
        setLoading(false);
        return;
      }

      const { data: barberia } = await supabase
        .from('barberias')
        .select('id, nombre, telefono')
        .eq('slug', slug)
        .single();

      if (barberia) {
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
      }

      setLoading(false);
    };

    fetchData();
  }, [slug]);

  const mensaje = data ? `Hola, quiero confirmar mi turno:
  
Servicio: ${data.turno.servicios?.nombre}
Fecha: ${data.turno.fecha}
Hora: ${data.turno.hora} HS

¡Gracias!` : "";

  const telefono = data?.barberia?.telefono || "5490000000000";
  const whatsappUrl = `https://wa.me/${telefono}?text=${encodeURIComponent(mensaje)}`;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-black gap-4">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/50">
          Cargando confirmación
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 gap-10 text-center">
      <CheckCircle2 className="text-green-500 w-20 h-20" />
      <h1 className="text-4xl font-black">¡TURNO CONFIRMADO!</h1>

      <p>{data?.turno.servicios?.nombre}</p>
      <p>{data?.turno.fecha} - {data?.turno.hora}</p>

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