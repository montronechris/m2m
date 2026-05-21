"use client";

import Link from "next/link";
import { QrCode, ArrowRight, Star, Zap } from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative bg-gray-900 text-white py-32 px-4 overflow-hidden">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-black z-0"></div>
      
      {/* Animated Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-green-500/30 rounded-full blur-[120px] animate-pulse z-0"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-blue-600/20 rounded-full blur-[120px] animate-pulse delay-700 z-0"></div>

      <div className="relative max-w-6xl mx-auto text-center space-y-8 z-10 pt-10">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 shadow-lg shadow-green-500/10 mb-4">
          <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
          <span className="text-sm font-bold tracking-wide uppercase text-gray-200">
            La scelta #1 per i Ristoranti Moderni
          </span>
        </div>

        {/* Title */}
        <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-none drop-shadow-2xl">
          Menu Digitale <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-emerald-400 to-teal-400">
            Intelligente & Sicuro
          </span>
        </h1>
        
        {/* Description */}
        <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto font-light leading-relaxed">
          Dimentica la carta. Accelera il servizio. Proteggi i dati. 
          Il nostro sistema QR Code trasforma ogni tavolo in un punto vendita digitale sicuro.
        </p>
        
        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-6 justify-center pt-10">
          <Link 
            href="/scan/TAV1-X9Z2" 
            className="group relative px-8 py-5 bg-green-600 rounded-2xl font-bold text-xl text-white shadow-xl shadow-green-600/40 hover:shadow-green-600/60 transition-all transform hover:-translate-y-2 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-green-600 to-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <span className="relative flex items-center gap-3">
              <QrCode className="w-6 h-6" /> 
              Avvia Demo Tavolo 1
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </span>
          </Link>
          
          <a href="#features" className="px-8 py-5 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/30 text-white rounded-2xl font-bold text-xl transition-all hover:scale-105 flex items-center justify-center gap-2">
            <Zap className="w-6 h-6 text-yellow-400" /> Scopri i Vantaggi
          </a>
        </div>
      </div>
    </section>
  );
}
