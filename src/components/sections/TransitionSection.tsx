"use client";

import { ShieldCheck } from "lucide-react";

export function TransitionSection() {
  return (
    <section className="py-24 px-4 bg-white border-t border-gray-100">
      <div className="max-w-4xl mx-auto text-center space-y-8">
        
        {/* Badge */}
        <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-gray-900/90 border border-gray-700 shadow-lg backdrop-blur-sm">
          <ShieldCheck className="w-5 h-5 text-green-400" />
          <span className="text-green-400 font-bold uppercase tracking-wider text-sm md:text-base">
            Pronti a Iniziare?
          </span>
        </div>
      
        <h2 className="text-4xl md:text-6xl font-black text-gray-900 tracking-tight leading-tight">
          Pronto a trasformare <br/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-600">
            il tuo ristorante?
          </span>
        </h2>
      
        <p className="text-xl text-gray-600 max-w-2xl mx-auto font-light leading-relaxed">
          La sicurezza è solo l'inizio. Scopri come TavolaRapida può ottimizzare i tuoi flussi di lavoro, ridurre i costi e migliorare l'esperienza dei tuoi clienti con una demo personalizzata.
        </p>
      </div>
    </section>
  );
}
