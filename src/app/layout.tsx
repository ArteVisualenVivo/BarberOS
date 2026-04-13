import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import BottomNav from "@/components/shared/BottomNav";
import Sidebar from "@/components/shared/Sidebar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "BarberOS - Dashboard",
  description: "Sistema SaaS para Barberías",
};

export const viewport: Viewport = {
  themeColor: "#000000",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className={`${inter.className} bg-black text-white`}>
        <div className="flex min-h-screen"> 
          
          {/* Sidebar Wrapper (Desktop) */}
          <div className="hidden lg:block flex-shrink-0 border-r border-white/5 transition-all duration-300">
            <Sidebar /> 
          </div>
        
          {/* Content Area */}
          <main className="flex-1 w-full p-6 lg:p-10 min-w-0"> 
            {children} 
          </main> 

          {/* Bottom Nav (Mobile) */}
          <div className="lg:hidden">
            <BottomNav />
          </div>
        </div>
      </body>
    </html>
  );
}
