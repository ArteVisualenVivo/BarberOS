import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { Barberia, HorarioDia } from "@/lib/tenants";

export interface Slot {
  hora: string;
  disponible: boolean;
}

export async function getBarberia(barberiaId: string): Promise<Barberia | null> {
  const { doc, getDoc } = await import("firebase/firestore");
  const docRef = doc(db, "barberias", barberiaId);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as Barberia;
  }
  return null;
}

export async function checkAvailability(
  barberiaId: string, 
  fecha: string, 
  horaSolicitada: string, 
  duracionMinutos: number
): Promise<{ disponible: boolean; motivo?: string }> {
  const barberia = await getBarberia(barberiaId);
  if (!barberia) return { disponible: false, motivo: "Barbería no encontrada" };

  // 1. Validar horario de atención
  const fechaObj = new Date(fecha + "T00:00:00");
  const diasSemana = ["domingo", "lunes", "martes", "miercoles", "jueves", "viernes", "sabado"];
  const nombreDia = diasSemana[fechaObj.getDay()];
  const horarioDia = barberia.horarios?.[nombreDia];

  if (!horarioDia || !horarioDia.abierto) {
    return { disponible: false, motivo: "La barbería está cerrada este día" };
  }

  const [hSolicitada, mSolicitada] = horaSolicitada.split(":").map(Number);
  const minutosSolicitadosInicio = hSolicitada * 60 + mSolicitada;
  const minutosSolicitadosFin = minutosSolicitadosInicio + duracionMinutos;

  const [hApertura, mApertura] = horarioDia.inicio.split(":").map(Number);
  const [hCierre, mCierre] = horarioDia.fin.split(":").map(Number);
  const minutosApertura = hApertura * 60 + mApertura;
  const minutosCierre = hCierre * 60 + mCierre;

  if (minutosSolicitadosInicio < minutosApertura || minutosSolicitadosFin > minutosCierre) {
    return { disponible: false, motivo: "Fuera del horario de atención" };
  }

  // 2. Validar solapamiento con otros turnos
  const q = query(
    collection(db, "turnos"),
    where("barberiaId", "==", barberiaId),
    where("fecha", "==", fecha),
    where("estado", "in", ["pendiente", "confirmado"])
  );

  const querySnapshot = await getDocs(q);
  const turnosExistentes = querySnapshot.docs.map(doc => doc.data());

  for (const turno of turnosExistentes) {
    const [hEx, mEx] = turno.hora.split(":").map(Number);
    const duracionEx = turno.duracion || 30; // Default 30 min
    const minutosExInicio = hEx * 60 + mEx;
    const minutosExFin = minutosExInicio + duracionEx;

    // Verificar solapamiento
    if (
      (minutosSolicitadosInicio >= minutosExInicio && minutosSolicitadosInicio < minutosExFin) ||
      (minutosSolicitadosFin > minutosExInicio && minutosSolicitadosFin <= minutosExFin) ||
      (minutosSolicitadosInicio <= minutosExInicio && minutosSolicitadosFin >= minutosExFin)
    ) {
      return { disponible: false, motivo: "El horario ya está ocupado" };
    }
  }

  return { disponible: true };
}

export async function getAvailableSlots(
  barberiaId: string,
  fecha: string,
  duracionMinutos: number
): Promise<string[]> {
  const barberia = await getBarberia(barberiaId);
  if (!barberia) return [];

  const fechaObj = new Date(fecha + "T00:00:00");
  const diasSemana = ["domingo", "lunes", "martes", "miercoles", "jueves", "viernes", "sabado"];
  const nombreDia = diasSemana[fechaObj.getDay()];
  const horarioDia = barberia.horarios?.[nombreDia];

  if (!horarioDia || !horarioDia.abierto) return [];

  const [hApertura, mApertura] = horarioDia.inicio.split(":").map(Number);
  const [hCierre, mCierre] = horarioDia.fin.split(":").map(Number);
  
  const slots: string[] = [];
  let currentMinutos = hApertura * 60 + mApertura;
  const cierreMinutos = hCierre * 60 + mCierre;

  // Generar slots cada 30 minutos
  while (currentMinutos + duracionMinutos <= cierreMinutos) {
    const h = Math.floor(currentMinutos / 60);
    const m = currentMinutos % 60;
    const horaStr = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
    
    slots.push(horaStr);
    currentMinutos += 30; // Cambiado a 30 minutos según requerimiento
  }

  // Filtrar slots ocupados
  const q = query(
    collection(db, "turnos"),
    where("barberiaId", "==", barberiaId),
    where("fecha", "==", fecha),
    where("estado", "in", ["pendiente", "confirmado"])
  );
  const querySnapshot = await getDocs(q);
  const turnosExistentes = querySnapshot.docs.map(doc => doc.data());

  const availableSlots = slots.filter(hora => {
    const [hS, mS] = hora.split(":").map(Number);
    const minSInicio = hS * 60 + mS;
    const minSFin = minSInicio + duracionMinutos;

    return !turnosExistentes.some(turno => {
      const [hE, mE] = turno.hora.split(":").map(Number);
      const durE = turno.duracion || 30;
      const minEInicio = hE * 60 + mE;
      const minEFin = minEInicio + durE;

      return (
        (minSInicio >= minEInicio && minSInicio < minEFin) ||
        (minSFin > minEInicio && minSFin <= minEFin) ||
        (minSInicio <= minEInicio && minSFin >= minEFin)
      );
    });
  });

  return availableSlots;
}
