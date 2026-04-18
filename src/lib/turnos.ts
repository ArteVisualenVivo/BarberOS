import { db } from "./firebase";
import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  serverTimestamp,
  doc,
  updateDoc,
  deleteDoc
} from "firebase/firestore";

export interface Turno {
  id?: string;
  clienteNombre: string;
  servicioNombre: string;
  fecha: string;
  hora: string;
  barberiaId: string;
  estado: 'pendiente' | 'confirmado' | 'cancelado';
  precio?: number;
  createdAt?: any;
}

const COLLECTION_NAME = "turnos";

/**
 * Crea un nuevo turno en Firebase
 */
export const crearTurno = async (turnoData: Omit<Turno, "id" | "createdAt">) => {
  try {
    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
      ...turnoData,
      createdAt: serverTimestamp(),
    });
    return { id: docRef.id, ...turnoData };
  } catch (error) {
    console.error("Error al crear turno:", error);
    throw error;
  }
};

/**
 * Obtiene los turnos de una barbería específica
 */
export const obtenerTurnos = async (barberiaId: string): Promise<Turno[]> => {
  try {
    const q = query(
      collection(db, COLLECTION_NAME),
      where("barberiaId", "==", barberiaId),
      orderBy("fecha", "asc"),
      orderBy("hora", "asc")
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Turno));
  } catch (error) {
    console.error("Error al obtener turnos:", error);
    throw error;
  }
};

/**
 * Actualiza el estado de un turno
 */
export const actualizarEstadoTurno = async (turnoId: string, estado: Turno['estado']) => {
  try {
    const docRef = doc(db, COLLECTION_NAME, turnoId);
    await updateDoc(docRef, { estado });
  } catch (error) {
    console.error("Error al actualizar estado del turno:", error);
    throw error;
  }
};

/**
 * Elimina un turno
 */
export const eliminarTurno = async (turnoId: string) => {
  try {
    const docRef = doc(db, COLLECTION_NAME, turnoId);
    await deleteDoc(docRef);
  } catch (error) {
    console.error("Error al eliminar turno:", error);
    throw error;
  }
};
