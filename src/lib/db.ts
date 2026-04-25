import { db } from "./firebase";
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  serverTimestamp,
  orderBy,
  limit as firestoreLimit
} from "firebase/firestore";

// Generic types
export interface TenantData {
  barberiaId: string;
  createdAt: any;
  updatedAt?: any;
}

// Collections
const COLLECTIONS = {
  TURNOS: "turnos",
  SERVICIOS: "servicios",
  CLIENTES: "clientes",
  BARBERIAS: "barberias",
  USERS: "users",
};

// Generic CRUD functions for tenant-based data
export async function getTenantCollection<T = any>(collectionName: string, barberiaId: string): Promise<T[]> {
  const q = query(
    collection(db, collectionName),
    where("barberiaId", "==", barberiaId)
  );
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as T[];
}

export async function addTenantDoc(collectionName: string, data: any) {
  if (!data.barberiaId) throw new Error("barberiaId is required for tenant data");
  
  return await addDoc(collection(db, collectionName), {
    ...data,
    createdAt: serverTimestamp(),
  });
}

export async function updateTenantDoc(collectionName: string, id: string, data: any) {
  const docRef = doc(db, collectionName, id);
  return await updateDoc(docRef, {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteTenantDoc(collectionName: string, id: string) {
  const docRef = doc(db, collectionName, id);
  return await deleteDoc(docRef);
}

export { COLLECTIONS };
