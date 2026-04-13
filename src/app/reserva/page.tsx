"use client";

import { useState, useEffect } from "react";
import {
  ChevronLeft,
  Calendar as CalendarIcon,
  Clock,
  Check,
  ArrowRight,
  User,
  Loader2,
  AlertCircle,
  Scissors
} from "lucide-react";

import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { Database } from "@/types/supabase";

type Servicio = Database["public"]["Tables"]["servicios"]["Row"];

type Barberia = {
  id: string;
  plan_activo: boolean;
};

const HORAS_DISPONIBLES = [
  "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  "14:00", "14:30", "15:00", "15:30", "16:00", "16:30",
  "17:00", "17:30", "18:00", "18:30"
];

export default function ReservaPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const idServicio = searchParams.get("id");
  const slug = searchParams.get("s");
  const supabase = createClient();

  const [servicio, setServicio] = useState<Servicio | null>(null);
  const [paso, setPaso] = useState(1);
  const [fechaSel, setFechaSel] = useState<string>(
    new Date().toLocaleDateString("en-CA")
  );
  const [horaSel, setHoraSel] = useState<string | null>(null);
  const [datos, setDatos] = useState({ nombre: "", whatsapp: "" });
  const [loading, setLoading] = useState(false);
  const [loadingInit, setLoadingInit] = useState(true);
  const [ocupados, setOcupados] = useState<string[]>([]);
  const [barberiaId, setBarberiaId] = useState<string | null>(null);
  const [planActivo, setPlanActivo] = useState(true);

  useEffect(() => {
    const init = async () => {
      if (!idServicio || !slug) {
        router.push("/servicios");
        return;
      }

      const { data: bData } = await supabase
        .from("barberias")
        .select("id, plan_activo")
        .eq("slug", slug)
        .single();

      if (!bData) {
        router.push("/");
        return;
      }

      setBarberiaId(bData.id);
      setPlanActivo(bData.plan_activo ?? true);

      const { data: sData } = await supabase
        .from("servicios")
        .select("*")
        .eq("id", idServicio)
        .eq("barberia_id", bData.id)
        .single();

      if (sData) setServicio(sData);

      await fetchOcupados(fechaSel, bData.id);
      setLoadingInit(false);
    };

    init();
  }, [idServicio, slug]);

  const fetchOcupados = async (fecha: string, bId?: string) => {
    const currentBId = bId || barberiaId;
    if (!currentBId) return;

    const { data } = await supabase
      .from("turnos")
      .select("hora")
      .eq("barberia_id", currentBId)
      .eq("fecha", fecha)
      .neq("estado", "cancelado");

    setOcupados(data ? data.map((t) => t.hora) : []);
  };

  const handleFechaChange = async (fecha: string) => {
    setFechaSel(fecha);
    setHoraSel(null);
    await fetchOcupados(fecha);
  };

  const handleSiguiente = async () => {
    if (paso === 1 && horaSel) setPaso(2);

    if (
      paso === 2 &&
      datos.nombre &&
      datos.whatsapp &&
      servicio &&
      barberiaId
    ) {
      setLoading(true);

      const { error } = await supabase.from("turnos").insert({
        barberia_id: barberiaId,
        servicio_id: servicio.id,
        cliente_nombre: datos.nombre,
        cliente_whatsapp: datos.whatsapp,
        fecha: fechaSel,
        hora: horaSel!,
        estado: "pendiente",
        monto_total: servicio.precio
      });

      if (!error) router.push("/exito");

      setLoading(false);
    }
  };

  if (loadingInit) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <Loader2 className="animate-spin w-10 h-10 text-primary" />
      </div>
    );
  }

  if (!planActivo) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black text-center p-6">
        <div className="bg-[#111] p-10 rounded-3xl border border-red-500/20">
          <div className="flex justify-center mb-4">
            <Scissors className="text-red-500 w-10 h-10 rotate-45" />
          </div>
          <h1 className="text-white text-2xl font-black">
            Sistema Inactivo
          </h1>
          <p className="text-gray-400 mt-2">
            Esta barbería no tiene el sistema activo.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-10 text-white">
      <h1 className="text-2xl font-black">Reserva funcionando OK</h1>
      <p>Servicio: {servicio?.nombre}</p>
    </div>
  );
}