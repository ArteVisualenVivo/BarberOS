"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import {
  collection,
  doc,
  getDocs,
  query,
  setDoc,
  where,
  updateDoc,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import {
  LayoutDashboard,
  Plus,
  RefreshCcw,
  ShieldAlert,
  Search,
  MessageCircle,
  Key,
  Calendar,
  XCircle,
  Clock,
} from "lucide-react";

const generateLicenseCode = () => {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  return Array.from({ length: 3 }, () =>
    Array.from({ length: 4 }, () => characters.charAt(Math.floor(Math.random() * characters.length))).join("")
  ).join("-");
};

export default function SaaSControlAdmin() {
  const [appId, setAppId] = useState("barberos");
  const [emailSearch, setEmailSearch] = useState("");
  const [licenses, setLicenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchLicenses = async () => {
    setLoading(true);
    try {
      const licensesMap = new Map<string, any>();
      const queries = [
        query(collection(db, "licenses"), where("appId", "==", appId)),
        query(collection(db, "licenses"), where("project", "==", appId)),
      ];

      for (const q of queries) {
        const snapshot = await getDocs(q);
        snapshot.docs.forEach((docSnap) => {
          const data = docSnap.data();
          const licenseCode = String(data.licenseCode || data.code || docSnap.id).toUpperCase();
          licensesMap.set(docSnap.id, {
            id: docSnap.id,
            ...data,
            licenseCode,
            appId: data.appId || data.project || appId,
          });
        });
      }

      setLicenses(Array.from(licensesMap.values()));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLicenses();
  }, [appId]);

  const generateLicense = async () => {
    const email = prompt("Email del usuario:");
    if (!email) return;

    const code = generateLicenseCode();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    await setDoc(doc(db, "licenses", code), {
      licenseCode: code,
      appId,
      status: "active",
      used: false,
      barberia_id: null,
      email,
      createdAt: serverTimestamp(),
      activatedAt: null,
      expiresAt: Timestamp.fromDate(expiresAt),
      licenseDurationDays: 30,
    });
    fetchLicenses();
  };

  const renewLicense = async (licenseId: string, currentExpiresAt: any) => {
    const date = currentExpiresAt?.toDate ? currentExpiresAt.toDate() : new Date(currentExpiresAt);
    date.setDate(date.getDate() + 30);

    await updateDoc(doc(db, "licenses", licenseId), {
      expiresAt: Timestamp.fromDate(date),
      status: "active",
    });
    fetchLicenses();
  };

  const revokeLicense = async (licenseId: string) => {
    if (!confirm("¿Revocar acceso permanentemente?")) return;
    await updateDoc(doc(db, "licenses", licenseId), {
      status: "inactive",
    });
    fetchLicenses();
  };

  const sendWhatsApp = (license: any) => {
    const text = `*¡Hola! Tu licencia de ${license.appId} está lista para activar.*%0A%0A` +
      `*Código:* ${license.licenseCode}%0A` +
      `*Email:* ${license.email}%0A%0A` +
      `Actívala ahora en: https://barberos.app/activate`;
    window.open(`https://wa.me/?text=${text}`, "_blank");
  };

  const filteredLicenses = licenses.filter((license) =>
    license.email?.toLowerCase().includes(emailSearch.toLowerCase()) ||
    license.licenseCode?.includes(emailSearch.toUpperCase())
  );

  return (
    <div className="min-h-screen bg-[#050505] text-white p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white/[0.02] border border-white/[0.05] p-8 rounded-[32px] glass shadow-2xl">
          <div className="flex items-center gap-4">
            <div className="bg-emerald-500/10 p-3 rounded-2xl border border-emerald-500/20">
              <LayoutDashboard className="text-emerald-500 w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-tight uppercase">SaaSControl <span className="text-emerald-500">Admin</span></h1>
              <p className="text-zinc-500 font-bold text-xs uppercase tracking-[0.2em] mt-1">Panel Central de Licencias</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <select
              value={appId}
              onChange={(e) => setAppId(e.target.value)}
              className="bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-2.5 text-xs font-bold uppercase tracking-widest outline-none focus:border-white/20 transition-all cursor-pointer"
            >
              <option value="barberos">BarberOS</option>
              <option value="fitness-pro">FitnessPro</option>
              <option value="dental-os">DentalOS</option>
            </select>
            <button
              onClick={generateLicense}
              className="bg-emerald-500 text-black px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-emerald-400 active:scale-95 transition-all flex items-center gap-2 shadow-lg shadow-emerald-500/20"
            >
              <Plus size={16} /> Generar Licencia
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="md:col-span-3 relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-white transition-colors" size={18} />
            <input
              type="text"
              placeholder="Buscar por Email o código..."
              value={emailSearch}
              onChange={(e) => setEmailSearch(e.target.value)}
              className="w-full bg-white/[0.02] border border-white/[0.05] rounded-2xl py-4 pl-12 pr-4 text-sm font-bold placeholder:text-zinc-600 focus:bg-white/[0.04] focus:border-white/10 outline-none transition-all shadow-xl"
            />
          </div>
          <button
            onClick={fetchLicenses}
            className="bg-white/[0.03] border border-white/[0.08] rounded-2xl flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-widest hover:bg-white/[0.06] transition-all"
          >
            <RefreshCcw size={16} className={loading ? "animate-spin" : ""} /> Actualizar
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredLicenses.map((license) => (
            <div key={license.id} className="bg-white/[0.02] border border-white/[0.05] p-6 rounded-[28px] glass hover:border-white/10 transition-all group relative overflow-hidden">
              <div className={`absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 rounded-full blur-3xl opacity-10 ${license.status === "active" ? "bg-emerald-500" : "bg-rose-500"}`} />

              <div className="flex justify-between items-start mb-6 relative">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Key size={12} className="text-zinc-500" />
                    <code className="text-[10px] font-black tracking-widest text-zinc-400 bg-white/[0.03] px-2 py-0.5 rounded border border-white/[0.05]">
                      {license.licenseCode}
                    </code>
                  </div>
                  <h3 className="text-sm font-bold truncate max-w-[180px]">{license.email}</h3>
                </div>

                <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border ${license.status === "active" ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-rose-500/10 text-rose-400 border-rose-500/20"}`}>
                  {license.status}
                </span>
              </div>

              <div className="space-y-4 mb-8 relative">
                <div className="flex items-center gap-3 text-zinc-500">
                  <Clock size={14} />
                  <div className="text-[10px] font-bold">
                    <p className="uppercase tracking-widest opacity-50 mb-0.5">Expira el</p>
                    <p className="text-white">{license.expiresAt?.toDate().toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-zinc-500">
                  <Calendar size={14} />
                  <div className="text-[10px] font-bold">
                    <p className="uppercase tracking-widest opacity-50 mb-0.5">Proyecto</p>
                    <p className="text-white font-mono truncate max-w-[200px]">{license.appId}</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 relative">
                <button
                  onClick={() => renewLicense(license.id, license.expiresAt)}
                  className="bg-white/5 border border-white/5 hover:bg-white/10 p-2.5 rounded-xl transition-all flex flex-col items-center gap-1 group/btn"
                  title="Renovar 30 días"
                >
                  <RefreshCcw size={14} className="text-zinc-400 group-hover/btn:text-white" />
                  <span className="text-[8px] font-black uppercase text-zinc-500 group-hover/btn:text-zinc-300 tracking-tighter">Renovar</span>
                </button>
                <button
                  onClick={() => sendWhatsApp(license)}
                  className="bg-emerald-500/10 border border-emerald-500/10 hover:bg-emerald-500/20 p-2.5 rounded-xl transition-all flex flex-col items-center gap-1 group/btn"
                  title="Enviar por WhatsApp"
                >
                  <MessageCircle size={14} className="text-emerald-500 group-hover/btn:scale-110" />
                  <span className="text-[8px] font-black uppercase text-emerald-500 tracking-tighter">WhatsApp</span>
                </button>
                <button
                  onClick={() => revokeLicense(license.id)}
                  className="bg-rose-500/10 border border-rose-500/10 hover:bg-rose-500/20 p-2.5 rounded-xl transition-all flex flex-col items-center gap-1 group/btn"
                  title="Revocar"
                >
                  <XCircle size={14} className="text-rose-400 group-hover/btn:text-rose-500" />
                  <span className="text-[8px] font-black uppercase text-rose-500 tracking-tighter">Revocar</span>
                </button>
              </div>
            </div>
          ))}

          {filteredLicenses.length === 0 && !loading && (
            <div className="col-span-full py-20 text-center bg-white/[0.01] border border-dashed border-white/[0.05] rounded-[32px]">
              <ShieldAlert className="w-12 h-12 text-zinc-800 mx-auto mb-4" />
              <p className="text-zinc-600 font-bold uppercase tracking-widest text-xs">No se encontraron licencias para este proyecto</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
