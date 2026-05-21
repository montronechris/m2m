"use client";

import Link from "next/link";
import { Lock, Server, Cloud, ArrowRight, ShieldCheck } from "lucide-react";

export function SecuritySection() {
  return (
    <section className="py-24 px-4 bg-gray-900 text-white relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-800 via-gray-900 to-black"></div>
    
      <div className="max-w-6xl mx-auto relative z-10">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <div className="space-y-8">
            <h2 className="text-4xl md:text-5xl font-black leading-tight">
              La tua sicurezza è <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-500">la nostra priorità.</span>
            </h2>
            <p className="text-xl text-gray-400 leading-relaxed">
              Utilizziamo protocolli enterprise per garantire che ogni ordine sia tracciabile, sicuro e immutabile.
            </p>
          
            <div className="space-y-6">
              <div className="flex items-start gap-4 p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                <Lock className="w-8 h-8 text-green-400 flex-shrink-0" />
                <div>
                  <h4 className="font-bold text-lg text-white">Crittografia TLS 1.3</h4>
                  <p className="text-gray-400 text-sm mt-1">Ogni dato viaggia su canali criptati, illeggibili a terzi non autorizzati.</p>
                </div>
              </div>
            
              <div className="flex items-start gap-4 p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                <Server className="w-8 h-8 text-blue-400 flex-shrink-0" />
                <div>
                  <h4 className="font-bold text-lg text-white">Integrità Comande</h4>
                  <p className="text-gray-400 text-sm mt-1">Il tavolo è bloccato dal server. Impossibile ordinare per conto altrui manipolando l'URL.</p>
                </div>
              </div>
            
              <div className="flex items-start gap-4 p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                <Cloud className="w-8 h-8 text-purple-400 flex-shrink-0" />
                <div>
                  <h4 className="font-bold text-lg text-white">Conformità GDPR</h4>
                  <p className="text-gray-400 text-sm mt-1">Gestione trasparente dei dati con conservazione minima e diritto all'oblio garantito.</p>
                </div>
              </div>
            </div>

            {/* Pulsante Approfondimento */}
            <div className="pt-8">
              <Link 
                href="/perche-sceglierci" 
                className="inline-flex items-center gap-3 px-8 py-4 bg-white border-2 border-gray-900 text-gray-900 rounded-full font-bold text-lg hover:bg-gray-900 hover:text-white transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                Scopri di più sulla nostra Sicurezza <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        
          {/* Terminal-Style Box */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-tr from-green-500 to-blue-500 rounded-3xl blur-2xl opacity-30 animate-pulse"></div>
            <div className="relative bg-gray-800 p-8 rounded-3xl border border-gray-700 shadow-2xl">
              <div className="flex items-center justify-between mb-6 border-b border-gray-700 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                </div>
                <span className="text-xs font-mono text-gray-500">SECURE_SESSION_ID: 8f9a2b...</span>
              </div>
              <div className="space-y-4 font-mono text-sm">
                <div className="flex justify-between text-green-400">
                  <span>STATUS:</span>
                  <span>ACTIVE & ENCRYPTED</span>
                </div>
                <div className="flex justify-between text-blue-400">
                  <span>TABLE_LOCK:</span>
                  <span>TRUE (ID: 1)</span>
                </div>
                <div className="flex justify-between text-purple-400">
                  <span>EXPIRES_IN:</span>
                  <span>09:59</span>
                </div>
                <div className="h-2 bg-gray-700 rounded-full overflow-hidden mt-4">
                  <div className="h-full bg-gradient-to-r from-green-500 to-blue-500 w-[85%] animate-pulse"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
