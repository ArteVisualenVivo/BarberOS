"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Home, Scissors, CalendarDays, Settings } from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const NAV_ITEMS = [
  { label: "Inicio", icon: Home, path: "/" },
  { label: "Servicios", icon: Scissors, path: "/servicios" },
  { label: "Mis Turnos", icon: CalendarDays, path: "/turnos" },
  { label: "Admin", icon: Settings, path: "/admin" },
];

export default function BottomNav() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const slug = searchParams.get("s");

  // Ocultar nav en login/register si no es necesario, o mantenerlo.
  // Pero para multi-tenant, necesitamos el slug en los links públicos.
  const getPath = (basePath: string) => {
    if (basePath === "/admin" || basePath === "/login" || basePath === "/register") return basePath;
    return slug ? `${basePath}?s=${slug}` : basePath;
  };

  return (
    <nav className="fixed bottom-0 left-0 w-full bg-surface/90 backdrop-blur-xl border-t border-white/10 px-6 py-4 flex justify-between items-center z-50 rounded-t-[32px] shadow-[0_-10px_40px_rgba(0,0,0,0.5)] lg:hidden">
      {NAV_ITEMS.map((item) => {
        const itemPath = getPath(item.path);
        const isActive = pathname === item.path;
        const Icon = item.icon;

        return (
          <Link
            key={item.path}
            href={itemPath}
            className={cn(
              "flex flex-col items-center gap-1.5 transition-all duration-300 relative px-4",
              isActive ? "text-primary" : "text-accent hover:text-white"
            )}
          >
            {isActive && (
              <span className="absolute -top-1 w-1 h-1 bg-primary rounded-full animate-pulse shadow-[0_0_10px_rgba(212,175,55,1)]" />
            )}
            <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
            <span className="text-[10px] font-medium uppercase tracking-widest">
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
