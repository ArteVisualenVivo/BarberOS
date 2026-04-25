import { auth, db } from "./firebase";
import {
  createUserWithEmailAndPassword as firebaseCreateUser,
  signInWithEmailAndPassword as firebaseSignIn,
  signOut as firebaseSignOut,
  User,
} from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";

export interface UserData {
  uid: string;
  email: string;
  nombre?: string;
  role: "owner" | "admin";
  barberiaId?: string;
  createdAt: any;
}

/**
 * Registra un nuevo usuario en Firebase Auth y crea su documento en Firestore
 */
export const registerUser = async (email: string, password: string) => {
  try {
    const userCredential = await firebaseCreateUser(auth, email, password);
    const user = userCredential.user;

    // Crear documento básico en Firestore inmediatamente
    await setDoc(doc(db, "users", user.uid), {
      uid: user.uid,
      email: user.email,
      role: "owner",
      createdAt: serverTimestamp(),
    });

    return user;
  } catch (error: any) {
    console.error("Error en registerUser:", error.code, error.message);
    throw error;
  }
};

/**
 * Inicia sesión con un usuario existente
 */
export const loginUser = async (email: string, password: string) => {
  try {
    const userCredential = await firebaseSignIn(auth, email, password);
    return userCredential.user;
  } catch (error: any) {
    console.error("Error en loginUser:", error.code, error.message);
    throw error;
  }
};

/**
 * Cierra la sesión actual
 */
export const logoutUser = () => {
  return firebaseSignOut(auth);
};

/**
 * Crea o actualiza la información del perfil del usuario en Firestore
 */
export const createUserData = async (uid: string, data: Partial<UserData>) => {
  try {
    await setDoc(doc(db, "users", uid), {
      ...data,
      uid,
      createdAt: serverTimestamp(),
    }, { merge: true });
  } catch (error) {
    console.error("Error en createUserData:", error);
    throw error;
  }
};

/**
 * Obtiene los datos del perfil de un usuario desde Firestore
 */
export const getUserData = async (uid: string): Promise<UserData | null> => {
  try {
    const snap = await getDoc(doc(db, "users", uid));
    if (!snap.exists()) {
      console.warn(`Documento de usuario no encontrado para UID: ${uid}`);
      return null;
    }
    return snap.data() as UserData;
  } catch (error: any) {
    console.error("Error en getUserData:", error.code || error.message || error);
    // Si es permission-denied, es un error crítico
    if (error.code === "permission-denied") {
      throw new Error("Permisos insuficientes para acceder a los datos del usuario");
    }
    return null;
  }
};
