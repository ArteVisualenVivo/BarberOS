"use client";

import { useAuth } from "@/hooks/useAuth";
import { useBarberia } from "@/hooks/useBarberia";
import { hasDashboardAccess } from "@/lib/tenants";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { 
  Scissors, 
  LayoutDashboard, 
  Calendar, 
  Users, 
  Settings, 
  LogOut, 
  Menu, 
  X,
  ChevronRight,
  Bell,
  Search,
  Command,
  HelpCircle,
  Plus
} from "lucide-react";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, userData, loading, logout } = useAuth();
  const { barberia, loading: barberiaLoading } = useBarberia();
  const router = useRouter();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const redirectRef = useRef(false);

  // Handle redirects with useEffect to prevent infinite loops
  useEffect(() => {
    if (redirectRef.current) return;

    // Don't redirect while loading
    if (loading || barberiaLoading) return;

    // Redirect if no user
    if (!user) {
      redirectRef.current = true;
      router.push("/login");
      return;
    }

    // Redirect if no barberia (should create one during register)
    if (!barberia) {
      redirectRef.current = true;
      router.push("/login");
      return;
    }

    // Redirect if no dashboard access
    if (!hasDashboardAccess(barberia)) {
      redirectRef.current = true;
      router.push("/activate");
      return;
    }
  }, [loading, barberiaLoading, user, barberia, router]);

  // Show loading state while data is loading
  if (loading || barberiaLoading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="w-12 h-12 border-2 border-white/10 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  // If we need to redirect, show nothing while redirect happens
  if (!user || !barberia || !hasDashboardAccess(barberia)) {
    return null;
  }

  const navItems = [
    { name: "Turnos", href: "/turnos", icon: <Calendar size={18} /> },
    { name: "Clientes", href: "/clientes", icon: <Users size={18} /> },
    { name: "Servicios", href: "/servicios", icon: <Plus size={18} /> },
    { name: "Resumen", href: "/dashboard", icon: <LayoutDashboard size={18} /> },
    { name: "Configuración del negocio", href: "/settings", icon: <Settings size={18} /> },
  ];

  const getPageTitle = () => {
    const item = navItems.find(item => item.href === pathname);
    return item ? item.name : "Dashboard";
  };

  const isPro = barberia?.plan === "pro" || barberia?.plan === "PRO";

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-400 font-sans antialiased selection:bg-white/10 selection:text-white">
      
      {/* Sidebar Desktop (Fixed) */}
      <aside className="hidden lg:flex w-64 flex-col border-r border-white/10 bg-[#050505] fixed inset-y-0 left-0 z-50">
        <div className="p-6">
          <Link href="/dashboard" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(255,255,255,0.1)] group-hover:scale-105 transition-transform duration-200">
              <Scissors size={16} className="text-black fill-black" />
            </div>
            <span className="font-bold tracking-tight text-white text-lg">{barberia?.nombre || "BarberOS"}</span>
          </Link>
        </div>

        <div className="px-4 mb-6">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500 group-focus-within:text-white transition-colors" />
            <input 
              type="text" 
              placeholder="Buscar clientes o turnos…" 
              className="w-full bg-white/[0.03] border border-white/[0.05] rounded-lg py-2 pl-9 pr-3 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-white/10 focus:bg-white/[0.05] transition-all"
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-0.5 px-1.5 py-0.5 rounded border border-white/10 bg-white/5 text-[10px] text-zinc-500 font-medium">
              <Command size={10} /> K
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
          <div className="px-3 mb-2 text-[10px] font-bold text-zinc-600 uppercase tracking-[0.2em]">
            Plataforma
          </div>
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group ${
                  isActive 
                    ? "bg-white/[0.06] text-white shadow-soft" 
                    : "text-zinc-500 hover:text-zinc-200 hover:bg-white/[0.03]"
                }`}
              >
                <span className={`${isActive ? "text-white" : "text-zinc-500 group-hover:text-zinc-300"} transition-colors`}>{item.icon}</span>
                {item.name}
              </Link>
            );
          })}

          <div className="pt-8 px-3 mb-2 text-[10px] font-bold text-zinc-600 uppercase tracking-[0.2em]">
            Recursos
          </div>
          <Link href="#" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-zinc-500 hover:text-zinc-200 hover:bg-white/[0.03] transition-all group">
            <HelpCircle size={18} className="group-hover:text-zinc-300" />
            Documentación
          </Link>
        </nav>

        <div className="p-4 border-t border-white/10 mt-auto">
          <div className={`flex items-center justify-between px-3 py-2.5 mb-4 rounded-lg border text-[10px] font-bold transition-all ${
            isPro
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
              : "bg-zinc-500/5 border-white/[0.05] text-zinc-400"
          }`}>
            <span>Licencia:</span>
            <span className={isPro ? "text-emerald-400" : "text-zinc-500"}>
              {isPro ? "PRO ACTIVADO ✔" : "FREE"}
            </span>
          </div>
          
          {isPro ? (
            <div className="px-3 py-4 mb-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-200">
              <p className="text-xs font-bold text-emerald-300 mb-1">Plan PRO Activado ✔</p>
              <p className="text-[10px] text-emerald-200/80">Todas las funciones premium habilitadas</p>
            </div>
          ) : (
            <div className="px-3 py-3 mb-4 rounded-xl bg-white/[0.02] border border-white/[0.05]">
              <p className="text-[9px] text-zinc-500">
                Activá PRO para reservas ilimitadas
              </p>
            </div>
          )}

          <div className="flex items-center gap-3 px-3 py-3 mb-4 rounded-xl bg-white/[0.02] border border-white/[0.05]">
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-zinc-800 to-zinc-700 border border-white/10 flex items-center justify-center text-xs font-bold text-white shadow-soft text-center uppercase">
              {userData?.nombre?.[0] || user.email?.[0] || "B"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-white truncate">{barberia?.nombre || barberia?.name || "Mi Negocio"}</p>
              <p className="text-[10px] text-zinc-500 truncate">{user.email}</p>
            </div>
          </div>
          <button 
            onClick={() => logout()}
            className="flex items-center gap-3 w-full px-3 py-2.5 text-zinc-500 hover:text-white hover:bg-red-500/10 hover:text-red-400 rounded-lg text-sm font-medium transition-all group"
          >
            <LogOut size={18} className="group-hover:translate-x-0.5 transition-transform" />
            Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* Main Wrapper (Pushed by sidebar width on desktop) */}
      <div className="lg:pl-64 flex flex-col min-h-screen">
        
        {/* Top Header (Fixed or Sticky) */}
        <header className="h-14 border-b border-white/10 bg-[#050505]/80 backdrop-blur-xl sticky top-0 z-40 flex items-center justify-between px-6 lg:px-10">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-2 -ml-2 text-zinc-400 hover:text-white transition-colors"
            >
              <Menu size={18} />
            </button>
            <div className="flex items-center gap-2 text-[11px] font-medium tracking-tight">
              <span className="text-zinc-500 hover:text-zinc-300 cursor-pointer transition-colors">{barberia?.nombre || "BarberOS"}</span>
              <ChevronRight size={12} className="text-zinc-800" />
              <span className="text-zinc-200 capitalize font-semibold">
                {getPageTitle()}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="h-4 w-px bg-white/10" />
            <button className="p-2 text-zinc-500 hover:text-white transition-colors relative group">
              <Bell size={18} />
              <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-white rounded-full border-2 border-black" />
            </button>
          </div>
        </header>

        {/* Main Content (Centered with max-width) */}
        <main className="flex-1 flex flex-col items-center px-6 lg:px-10 py-8 lg:py-12 overflow-x-hidden">
          <div className="w-full max-w-[1200px] animate-slide-up">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[100] lg:hidden">
          <div className="absolute inset-0 bg-black/90 backdrop-blur-md transition-opacity" onClick={() => setIsMobileMenuOpen(false)} />
          <div className="absolute top-0 left-0 w-80 h-full bg-[#050505] border-r border-white/10 p-6 shadow-2xl animate-in slide-in-from-left duration-300 ease-out">
            <div className="flex items-center justify-between mb-10">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                  <Scissors size={16} className="text-black" />
                </div>
                <span className="font-bold tracking-tight text-white text-lg">{barberia?.nombre || "BarberOS"}</span>
              </div>
              <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 text-zinc-500 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>
            <nav className="space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-4 px-4 py-3.5 rounded-xl text-sm font-medium transition-all ${
                    pathname === item.href 
                      ? "bg-white/[0.08] text-white" 
                      : "text-zinc-400 hover:bg-white/[0.03] hover:text-zinc-200"
                  }`}
                >
                  <span className={pathname === item.href ? "text-white" : "text-zinc-500"}>{item.icon}</span>
                  {item.name}
                </Link>
              ))}
            </nav>
            
            <div className="absolute bottom-8 left-6 right-6">
              <button 
                onClick={() => logout()}
                className="flex items-center gap-3 w-full px-4 py-3.5 text-red-400 bg-red-500/5 border border-red-500/10 rounded-xl text-sm font-bold transition-all"
              >
                <LogOut size={18} />
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
