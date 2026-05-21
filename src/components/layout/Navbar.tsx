"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { QrCode, ArrowRight } from "lucide-react";

interface NavbarProps {
  onScrollToTop?: () => void;
}

export function Navbar({ onScrollToTop }: NavbarProps) {
  const pathname = usePathname();
  const isHome = pathname === "/";

  return (
    <header className="fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-white/80 backdrop-blur-md border-b border-gray-100/50">
      <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
        {/* LOGO & BRAND */}
        <button
          onClick={onScrollToTop}
          className="group flex items-center gap-3 p-2 -ml-2 rounded-xl hover:bg-gray-50 transition-colors"
        >
          <div className="relative w-10 h-10 flex items-center justify-center bg-gradient-to-br from-green-600 to-emerald-600 rounded-xl shadow-lg shadow-green-500/20 group-hover:shadow-green-500/40 group-hover:scale-105 transition-all duration-300">
            <QrCode className="w-6 h-6 text-white" />
          </div>
          <div className="flex flex-col items-start">
            <span className="font-bold text-xl text-gray-900 tracking-tight leading-none group-hover:text-green-700 transition-colors">
              TavolaRapida
            </span>
            <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
              Digital Menu
            </span>
          </div>
        </button>

        {/* DESKTOP NAVIGATION */}
        <nav className="hidden md:flex items-center gap-1 bg-gray-50/50 p-1 rounded-full border border-gray-100">
          {/* 🔧 FIX: Usa /#features per funzionare da qualsiasi pagina */}
          <Link 
            href="/#features" 
            className="px-5 py-2 text-sm font-medium text-gray-600 rounded-full hover:text-green-700 hover:bg-white hover:shadow-sm transition-all"
          >
            Funzionalità
          </Link>

          {/* 🔧 FIX: Usa /#contact per funzionare da qualsiasi pagina */}
          <Link 
            href="/#contact" 
            className="px-5 py-2 text-sm font-medium text-gray-600 rounded-full hover:text-green-700 hover:bg-white hover:shadow-sm transition-all"
          >
            Contatti
          </Link>

          <Link 
            href="/login" 
            className="px-5 py-2 text-sm font-medium text-gray-600 rounded-full hover:text-green-700 hover:bg-white hover:shadow-sm transition-all"
          >
            Area Cucina
          </Link>
        </nav>

        {/* CTA BUTTON */}
        <div className="flex items-center gap-4">
          <Link 
            href="/scan/TAV1-X9Z2" 
            className="hidden sm:flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white text-sm font-bold rounded-full hover:bg-green-600 hover:shadow-lg hover:shadow-green-500/25 hover:-translate-y-0.5 transition-all duration-300"
          >
            <span>Demo Live</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          
          {/* Mobile Menu Button */}
          <button className="md:hidden p-2 text-gray-500 hover:text-gray-900">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
}