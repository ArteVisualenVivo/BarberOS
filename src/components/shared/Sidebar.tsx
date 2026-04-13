"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Home, Scissors, CalendarDays, Settings, LogOut, ChevronLeft, ChevronRight } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";

const NAV_ITEMS = [
  { label: "Inicio", icon: Home, path: "/" },
  { label: "Servicios", icon: Scissors, path: "/servicios" },
  { label: "Mis Turnos", icon: CalendarDays, path: "/turnos" },
  { label: "Admin Panel", icon: Settings, path: "/admin" },
];

export default function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const slug = searchParams.get("s");
  const supabase = createClient();
  const router = useRouter();

  const getPath = (basePath: string) => {
    if (basePath === "/admin" || basePath === "/login" || basePath === "/register") return basePath;
    return slug ? `${basePath}?s=${slug}` : basePath;
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  return (
    <aside 
      className={`h-full bg-[#111] flex flex-col gap-8 transition-all duration-300 relative ${
        isCollapsed ? 'w-20 p-4' : 'w-64 p-6'
      }`}
    >
      {/* Toggle Button */}
      <button 
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-12 bg-[#D4AF37] text-black rounded-full p-1 shadow-xl z-50 hover:scale-110 transition-all border border-black/20"
      >
        {isCollapsed ? <ChevronRight size={14} strokeWidth={3} /> : <ChevronLeft size={14} strokeWidth={3} />}
      </button>

      {/* Brand */}
      <div className={`flex items-center gap-3 px-2 ${isCollapsed ? 'justify-center' : ''}`}>
        <div className="w-10 h-10 bg-[#D4AF37] rounded-xl flex items-center justify-center flex-shrink-0 shadow-[0_0_15px_rgba(212,175,55,0.2)]">
          <Scissors size={20} className="text-black" />
        </div>
        {!isCollapsed && (
          <h1 className="text-xl font-black tracking-tighter text-white whitespace-nowrap animate-in fade-in slide-in-from-left-2 duration-300">
            BARBER<span className="text-[#D4AF37]">OS</span>
          </h1>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 flex flex-col gap-2">
        {NAV_ITEMS.map((item) => {
          const itemPath = getPath(item.path);
          const isActive = pathname === item.path;
          const Icon = item.icon;

          return (
            <Link
              key={item.path}
              href={itemPath}
              title={isCollapsed ? item.label : ""}
              className={`flex items-center gap-4 px-4 py-4 rounded-xl transition-all duration-300 group ${
                isActive 
                  ? "bg-[#D4AF37] text-black font-bold shadow-lg shadow-[#D4AF37]/20" 
                  : "text-gray-400 hover:bg-white/5 hover:text-white"
              } ${isCollapsed ? 'justify-center px-0' : ''}`}
            >
              <Icon size={20} className="flex-shrink-0" />
              {!isCollapsed && (
                <span className="text-xs font-bold uppercase tracking-widest whitespace-nowrap animate-in fade-in slide-in-from-left-2 duration-300">
                  {item.label}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className={`pt-6 border-t border-white/5 ${isCollapsed ? 'flex justify-center' : ''}`}>
        <button
          onClick={handleLogout}
          title={isCollapsed ? "Cerrar Sesión" : ""}
          className={`flex items-center gap-4 px-4 py-4 w-full rounded-xl text-red-500 hover:bg-red-500/5 transition-all duration-300 font-bold uppercase text-[10px] tracking-widest ${
            isCollapsed ? 'justify-center px-0' : ''
          }`}
        >
          <LogOut size={18} className="flex-shrink-0" />
          {!isCollapsed && <span className="whitespace-nowrap">Cerrar Sesión</span>}
        </button>
      </div>
    </aside>
  );
}
