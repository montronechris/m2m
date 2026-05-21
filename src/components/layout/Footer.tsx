"use client";

import Link from "next/link";
import { QrCode, ArrowRight } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-white text-gray-900 py-20 px-4 relative overflow-hidden">
      {/* Linea di separazione verde-blu */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-500 via-blue-500 to-purple-500"></div>

      <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-12 relative z-10">
        
        {/* Colonna 1: Brand */}
        <div className="col-span-1 md:col-span-2 space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-700 rounded-xl flex items-center justify-center shadow-lg shadow-green-500/20">
              <QrCode className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-3xl font-black tracking-tight">TavolaRapida</h3>
          </div>
          <p className="text-gray-600 max-w-sm leading-relaxed text-lg">
            La soluzione completa per la ristorazione moderna. Semplifichiamo l'ordinazione, ottimizziamo il servizio e proteggiamo i tuoi dati.
          </p>
        
          {/* Social Icons */}
          <div className="flex flex-col gap-4 mt-6">
            {[
              {
                name: "Instagram",
                color: "green",
                path: "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.64 4.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"
              },
              {
                name: "Facebook",
                color: "blue",
                path: "M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"
              },
              {
                name: "LinkedIn",
                color: "blue-400",
                // ✅ path corretto: aggiunto .79 mancante nel segmento dell'ellissi
                path: "M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"
              }
            ].map((social) => (
              <Link key={social.name} href="#" className="group flex items-center gap-3 text-gray-600 hover:text-gray-900 transition-colors">
                <div className={`w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center group-hover:border-${social.color}-500 group-hover:bg-${social.color.replace('-400','')}-50 transition-all`}>
                  <svg className={`w-5 h-5 fill-current text-gray-600 group-hover:text-${social.color}-600`} viewBox="0 0 24 24">
                    <path d={social.path} />
                  </svg>
                </div>
                <span className="font-medium">{social.name}</span>
              </Link>
            ))}
          </div>
        </div>
      
        {/* Colonna 2: Navigazione */}
        <div>
          <h4 className="font-bold text-gray-900 mb-8 uppercase text-sm tracking-widest">Navigazione</h4>
          <ul className="space-y-4 text-gray-600">
            <li>
              <Link href="/" className="hover:text-green-600 transition flex items-center gap-2 text-lg">
                <ArrowRight className="w-4 h-4" /> Home
              </Link>
            </li>
            <li>
              <Link href="/#features" className="hover:text-green-600 transition flex items-center gap-2 text-lg">
                <ArrowRight className="w-4 h-4" /> Funzionalità
              </Link>
            </li>
            <li>
              <Link href="/#contact" className="hover:text-green-600 transition flex items-center gap-2 text-lg">
                <ArrowRight className="w-4 h-4" /> Contatti
              </Link>
            </li>
            <li>
              <Link href="/login" className="hover:text-green-600 transition flex items-center gap-2 text-lg">
                <ArrowRight className="w-4 h-4" /> Area Cucina
              </Link>
            </li>
          </ul>
        </div>

        {/* Colonna 3: Legale */}
        <div>
          <h4 className="font-bold text-gray-900 mb-8 uppercase text-sm tracking-widest">Legale</h4>
          <ul className="space-y-4 text-gray-600">
            <li><Link href="#" className="hover:text-green-600 transition text-lg">Privacy Policy</Link></li>
            <li><Link href="#" className="hover:text-green-600 transition text-lg">Termini di Servizio</Link></li>
            <li><Link href="#" className="hover:text-green-600 transition text-lg">Cookie Policy</Link></li>
            <li><Link href="#" className="hover:text-green-600 transition text-lg">GDPR</Link></li>
          </ul>
        </div>
      </div>
    
      {/* Copyright */}
      <div className="max-w-7xl mx-auto mt-20 pt-8 border-t border-gray-200 flex flex-col md:flex-row justify-between items-center text-gray-500 text-sm">
        <p>© 2026 TavolaRapida S.r.l. Tutti i diritti riservati.</p>
        <p className="mt-2 md:mt-0 flex items-center gap-2">Made with <span className="text-red-500">❤️</span> in Italy</p>
      </div>
    </footer>
  );
}