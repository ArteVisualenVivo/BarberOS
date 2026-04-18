import { db } from "./firebase";
import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  serverTimestamp,
  doc,
  updateDoc,
  deleteDoc
} from "firebase/firestore";

export interface Servicio {
  id?: string;
  nombre: string;
  precio: number;
  barberiaId: string;
  duracion?: number; // en minutos
  createdAt?: any;
}

const COLLECTION_NAME = "servicios";

/**
 * Crea un nuevo servicio
 */
export const crearServicio = async (servicioData: Omit<Servicio, "id" | "createdAt">) => {
  try {
    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
      ...servicioData,
      createdAt: serverTimestamp(),
    });
    return { id: docRef.id, ...servicioData };
  } catch (error) {
    console.error("Error al crear servicio:", error);
    throw error;
  }
};

/**
 * Obtiene los servicios de una barbería
 */
export const obtenerServicios = async (barberiaId: string): Promise<Servicio[]> => {
  try {
    const q = query(
      collection(db, COLLECTION_NAME),
      where("barberiaId", "==", barberiaId)
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Servicio));
  } catch (error) {
    console.error("Error al obtener servicios:", error);
    throw error;
  }
};

/**
 * Actualiza un servicio
 */
export const actualizarServicio = async (servicioId: string, data: Partial<Servicio>) => {
  try {
    const docRef = doc(db, COLLECTION_NAME, servicioId);
    await updateDoc(docRef, {
      ...data,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error("Error al actualizar servicio:", error);
    throw error;
  }
};

/**
 * Elimina un servicio
 */
export const eliminarServicio = async (servicioId: string) => {
  try {
    const docRef = doc(db, COLLECTION_NAME, servicioId);
    await deleteDoc(docRef);
  } catch (error) {
    console.error("Error al eliminar servicio:", error);
    throw error;
  }
};
