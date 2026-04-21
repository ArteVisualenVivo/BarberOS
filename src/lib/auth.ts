"use client";

import { auth, db } from "./firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

export interface UserData {
  uid: string;
  email: string;
  nombre?: string;
  role: "owner" | "admin";
  barberiaId?: string;
  createdAt: any;
}

/**
 * REGISTRO
 */
export const registerUser = async (email: string, password: string) => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;

  await setDoc(doc(db, "users", user.uid), {
    uid: user.uid,
    email: user.email,
    role: "owner",
    createdAt: serverTimestamp(),
  });

  return user;
};

/**
 * LOGIN
 */
export const loginUser = async (email: string, password: string) => {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  return userCredential.user;
};

/**
 * LOGOUT
 */
export const logoutUser = () => signOut(auth);

/**
 * CREAR/ACTUALIZAR USUARIO
 */
export const createUserData = async (uid: string, data: Partial<UserData>) => {
  if (!uid) return;

  await setDoc(
    doc(db, "users", uid),
    {
      ...data,
      uid,
      createdAt: serverTimestamp(),
    },
    { merge: true }
  );
};

/**
 * GET USER
 */
export const getUserData = async (uid: string) => {
  if (!uid) return null;

  const snap = await getDoc(doc(db, "users", uid));

  if (!snap.exists()) return null;

  return snap.data() as UserData;
};

// Simple auth-ready signaling and helpers (compat shims)
let _authReady = false;
const _listeners: Function[] = [];

onAuthStateChanged(auth, (user) => {
  _authReady = true;
  _listeners.forEach((fn) => fn());
});

export const authReadyPromise: Promise<void> = new Promise((resolve) => {
  if (_authReady) return resolve();
  const fn = () => resolve();
  _listeners.push(fn);
});

export const getCurrentUser = () => {
  return auth.currentUser || null;
};