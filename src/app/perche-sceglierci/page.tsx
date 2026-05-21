// src/app/perche-sceglierci/page.tsx
"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ShieldCheck, Lock, Server, Clock, QrCode,
  Mail, Phone, MapPin, Send, CheckCircle, ArrowRight,
  Fingerprint, Database, RefreshCw, ChefHat, Star, Zap
} from "lucide-react";

export default function WhyChooseUsPage() {
  const [formStatus, setFormStatus] = useState<"idle" | "submitting" | "success">("idle");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormStatus("submitting");
    setTimeout(() => {
      console.log("Form inviato!");
      setFormStatus("success");
    }, 1500);
  };

  const scrollToTop = () => {
    document.documentElement.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <div className="min-h-screen bg-white font-sans text-gray-900 flex flex-col">
      
{/* ✅ HEADER MODERNO & GLASSMORPHISM */}
<header className="fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-white/80 backdrop-blur-md border-b border-gray-100/50">
  <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
    
    {/* LOGO & BRAND - Ora è un Link che porta alla Home */}
    <Link 
      href="/" 
      onClick={scrollToTop} // Opzionale: forza lo scroll su se sei già in home
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
    </Link>

    {/* DESKTOP NAVIGATION */}
    <nav className="hidden md:flex items-center gap-1 bg-gray-50/50 p-1 rounded-full border border-gray-100">
      <a href="#features" className="px-5 py-2 text-sm font-medium text-gray-600 rounded-full hover:text-green-700 hover:bg-white hover:shadow-sm transition-all">
        Funzionalità
      </a>
      <a href="#contact" className="px-5 py-2 text-sm font-medium text-gray-600 rounded-full hover:text-green-700 hover:bg-white hover:shadow-sm transition-all">
        Contatti
      </a>
      <a href="/login" className="px-5 py-2 text-sm font-medium text-gray-600 rounded-full hover:text-green-700 hover:bg-white hover:shadow-sm transition-all">
        Area Cucina
      </a>
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
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
      </button>
    </div>

  </div>
</header>

      {/* Spacer per header fisso */}
      <div className="h-20"></div>

      {/* Hero Sicurezza */}
      <section className="relative bg-gray-900 text-white py-24 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-800 via-gray-900 to-black"></div>
        
        <div className="max-w-4xl mx-auto text-center relative z-10 space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/20 border border-green-500/50 text-green-400 text-sm font-bold uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4" /> Architettura Sicura
          </div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-tight">
            Perché la tua Sicurezza <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-500">
              è la nostra Priorità
            </span>
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Non usiamo semplici URL. Utilizziamo un sistema di <strong>Sessioni Temporanee Crittografate</strong> per garantire che ogni ordine provenga esclusivamente dal tavolo fisico associato.
          </p>
        </div>
      </section>

      {/* Dettaglio Tecnico */}
      <section className="py-24 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto space-y-24">
          
          {/* Step 1 */}
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="order-2 md:order-1 space-y-6">
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-4">
                <QrCode className="w-6 h-6" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900">1. Il QR Code è solo la Chiave</h2>
              <p className="text-lg text-gray-600 leading-relaxed">
                Il QR Code sul tavolo contiene un <strong>Token Statico</strong> (es. TAV1-X9Z2). Questo token non è un link diretto al menu, ma una richiesta di accesso al nostro server sicuro.
              </p>
            </div>
            <div className="order-1 md:order-2 bg-white p-8 rounded-3xl shadow-xl border border-gray-100">
              <div className="font-mono text-sm bg-gray-900 text-green-400 p-6 rounded-xl overflow-x-auto">
                <p><span className="text-purple-400">POST</span> /api/scan/TAV1-X9Z2</p>
                <p className="mt-2 text-gray-500">// Server verifica il token...</p>
                <p className="text-blue-400">if (token valid) &#123;</p>
                <p className="pl-4 text-yellow-300">generateSecureSession();</p>
                <p className="text-blue-400">&#125;</p>
              </div>
            </div>
          </div>

          {/* Step 2 */}
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100">
               <div className="font-mono text-sm bg-gray-900 text-green-400 p-6 rounded-xl overflow-x-auto">
                <p><span className="text-purple-400">RESPONSE</span> 200 OK</p>
                <p className="mt-2">&#123;</p>
                <p className="pl-4">"sessionId": "a1b2-c3d4-uuid...",</p>
                <p className="pl-4">"expiresIn": "10 minutes",</p>
                <p className="pl-4">"tableId": 1</p>
                <p className="mt-2">&#125;</p>
              </div>
            </div>
            <div className="space-y-6">
              <div className="w-12 h-12 bg-green-100 text-green-600 rounded-xl flex items-center justify-center mb-4">
                <RefreshCw className="w-6 h-6" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900">2. Generazione Sessione Effimera</h2>
              <p className="text-lg text-gray-600 leading-relaxed">
                Alla scansione, il server genera un <strong>Link Temporaneo Unico</strong> (UUID) valido solo per 10 minuti. L'utente viene reindirizzato a questo link sicuro.
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="order-2 md:order-1 space-y-6">
              <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-xl flex items-center justify-center mb-4">
                <Lock className="w-6 h-6" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900">3. Blocco Server-Side del Tavolo</h2>
              <p className="text-lg text-gray-600 leading-relaxed">
                Quando l'ordine viene inviato, il server ignora qualsiasi parametro nell'URL. Recupera il numero del tavolo <strong>direttamente dal database</strong> usando l'ID della sessione.
              </p>
              <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg">
                <p className="text-red-800 font-medium text-sm">
                  ⚠️ Anche se l'utente modifica l'URL in <code>&table=99</code>, l'ordine arriverà comunque al Tavolo 1 registrato nel DB.
                </p>
              </div>
            </div>
            <div className="order-1 md:order-2 flex justify-center">
              <div className="relative w-64 h-64 bg-gray-100 rounded-full flex items-center justify-center border-4 border-dashed border-gray-300">
                <div className="text-center">
                  <Database className="w-16 h-16 text-gray-400 mx-auto mb-2" />
                  <p className="font-bold text-gray-500">DB Source of Truth</p>
                  <p className="text-xs text-gray-400">Table ID: 1 (Locked)</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* SEZIONE DI TRANSIZIONE CON SFONDO STRUTTURATO */}
      <section className="relative py-24 px-4 bg-gray-900 text-white overflow-hidden border-t border-gray-800">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-gray-800 via-gray-900 to-black"></div>
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-green-500/10 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none"></div>

        <div className="max-w-4xl mx-auto text-center relative z-10 space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-green-400 text-sm font-bold uppercase tracking-wider shadow-lg">
             <ShieldCheck className="w-4 h-4" /> Pronti a Iniziare?
          </div>
          
          <h2 className="text-4xl md:text-6xl font-black tracking-tight leading-tight drop-shadow-lg">
            Pronto a trasformare  <br/>
             <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-300">
              il tuo ristorante?
             </span>
          </h2>
          
          <p className="text-xl text-gray-300 max-w-2xl mx-auto font-light leading-relaxed">
            La sicurezza è solo l'inizio. Scopri come TavolaRapida può ottimizzare i tuoi flussi di lavoro, ridurre i costi e migliorare l'esperienza dei tuoi clienti con una demo personalizzata.
          </p>
        </div>
      </section>

      {/* SEZIONE CONTATTI */}
      <section id="contact" className="py-24 px-4 bg-white relative z-20 -mt-10 rounded-t-[3rem] shadow-[0_-10px_40px_rgba(0,0,0,0.1)]">
        <div className="max-w-5xl mx-auto bg-white rounded-[2.5rem] shadow-xl overflow-hidden border border-gray-100 flex flex-col md:flex-row mt-10">
          
          {/* Lato Sinistro */}
          <div className="md:w-2/5 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-12 flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-[-50%] right-[-50%] w-[400px] h-[400px] bg-green-500/20 rounded-full blur-[100px]"></div>
            
            <div className="relative z-10 space-y-8">
              <div>
                <h3 className="text-3xl font-black mb-4 leading-tight">Hai dubbi sulla  <br/> <span className="text-green-400">sicurezza?</span></h3>
                <p className="text-gray-300 text-sm leading-relaxed mt-4">
                  O sei semplicemente interessato a scoprire come funziona? Il nostro team tecnico è disponibile per spiegarti nel dettaglio l'architettura del sistema e rispondere alle tue domande.
                </p>
              </div>
              
              <div className="space-y-6">
                <div className="flex items-center gap-4 group">
                  <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center"> <Mail className="w-5 h-5 text-white" /> </div>
                  <div> <p className="text-xs text-gray-400 uppercase font-bold">Email</p> <p className="font-medium">security@tavolarapida.it</p> </div>
                </div>
                <div className="flex items-center gap-4 group">
                  <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center"> <Phone className="w-5 h-5 text-white" /> </div>
                  <div> <p className="text-xs text-gray-400 uppercase font-bold">Telefono</p> <p className="font-medium">+39 02 1234567</p> </div>
                </div>
              </div>
            </div>
          </div>

          {/* Lato Destro: Form */}
          <div className="md:w-3/5 p-12 bg-white">
            {formStatus === "success" ? (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-6 animate-fade-in py-12">
                <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4 shadow-inner shadow-green-200">
                  <CheckCircle className="w-12 h-12" />
                </div>
                <h3 className="text-3xl font-black text-gray-900">Messaggio Inviato!</h3>
                <p className="text-gray-600 max-w-xs text-lg">Grazie per averci contattato.</p>
                <button onClick={() => setFormStatus("idle")} className="text-green-600 font-bold hover:text-green-700 hover:underline mt-4 text-lg">Invia un altro messaggio</button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Ruolo*</label>
                    <select required className="w-full px-4 py-3.5 rounded-xl border-2 border-gray-100 focus:border-green-500 outline-none transition bg-gray-50">
                      <option value="">Seleziona...</option>
                      <option value="ristoratore">Titolare Ristorante</option>
                      <option value="manager">Manager</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Nome Completo*</label>
                    <input type="text" required placeholder="Mario Rossi" className="w-full px-4 py-3.5 rounded-xl border-2 border-gray-100 focus:border-green-500 outline-none transition bg-gray-50" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Email*</label>
                    <input type="email" required placeholder="mario@ristorante.it" className="w-full px-4 py-3.5 rounded-xl border-2 border-gray-100 focus:border-green-500 outline-none transition bg-gray-50" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Telefono*</label>
                    <input type="tel" required placeholder="+39 333..." className="w-full px-4 py-3.5 rounded-xl border-2 border-gray-100 focus:border-green-500 outline-none transition bg-gray-50" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Messaggio*</label>
                  <textarea required rows={4} placeholder="Descrivi le tue esigenze o dubbi tecnici..." className="w-full px-4 py-3.5 rounded-xl border-2 border-gray-100 focus:border-green-500 outline-none transition bg-gray-50 resize-none"></textarea>
                </div>

                <div className="flex items-start gap-3 pt-2">
                  <input type="checkbox" required id="privacy" className="mt-1.5 w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-green-500 cursor-pointer" />
                  <label htmlFor="privacy" className="text-xs text-gray-500 leading-tight cursor-pointer">
                    Acconsento al trattamento dei Dati Personali. <Link href="#" className="underline hover:text-gray-900 font-medium">Leggi Privacy Policy</Link>.
                  </label>
                </div>

                <button 
                  type="submit" 
                  disabled={formStatus === "submitting"}
                  className="w-full bg-gray-900 hover:bg-green-600 text-white font-bold py-4 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-70"
                >
                {formStatus === "submitting" ? "Elaborazione..." : <>Invia Richiesta <Send className="w-5 h-5" /></>}                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* FOOTER CON SFONDO SCURO */}
      <footer className="bg-gray-900 text-white py-20 px-4 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-500 via-blue-500 to-purple-500"></div>

        <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-12 relative z-10">
          <div className="col-span-1 md:col-span-2 space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-700 rounded-xl flex items-center justify-center shadow-lg shadow-green-500/20">
                <QrCode className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-3xl font-black tracking-tight">TavolaRapida</h3>
            </div>
            <p className="text-gray-400 max-w-sm leading-relaxed text-lg">
              La soluzione completa per la ristorazione moderna. Semplifichiamo l'ordinazione, ottimizziamo il servizio e proteggiamo i tuoi dati.
            </p>
            
            <div className="flex flex-col gap-4 mt-6">
              <Link href="#" className="group flex items-center gap-3 text-gray-400 hover:text-white transition-colors">
                <div className="w-10 h-10 rounded-full border border-gray-700 flex items-center justify-center group-hover:border-green-500 group-hover:bg-green-500/10 transition-all">
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.64 4.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                </div>
                <span className="font-medium">TavolaRapida</span>
              </Link>

              <Link href="#" className="group flex items-center gap-3 text-gray-400 hover:text-white transition-colors">
                <div className="w-10 h-10 rounded-full border border-gray-700 flex items-center justify-center group-hover:border-blue-500 group-hover:bg-blue-500/10 transition-all">
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"/></svg>
                </div>
                <span className="font-medium">TavolaRapida</span>
              </Link>

              <Link href="#" className="group flex items-center gap-3 text-gray-400 hover:text-white transition-colors">
                <div className="w-10 h-10 rounded-full border border-gray-700 flex items-center justify-center group-hover:border-blue-400 group-hover:bg-blue-400/10 transition-all">
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
                </div>
                <span className="font-medium">TavolaRapida</span>
              </Link>
            </div>
          </div>
          
          <div>
            <h4 className="font-bold text-white mb-8 uppercase text-sm tracking-widest">Navigazione</h4>
            <ul className="space-y-4 text-gray-400">
              <li><Link href="/" className="hover:text-green-400 transition flex items-center gap-2 text-lg">Home</Link></li>
              <li><Link href="/#features" className="hover:text-green-400 transition flex items-center gap-2 text-lg">Funzionalità</Link></li>
              <li><Link href="/#contact" className="hover:text-green-400 transition flex items-center gap-2 text-lg">Contatti</Link></li>
              <li><Link href="/login" className="hover:text-green-400 transition flex items-center gap-2 text-lg">Area Cucina</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white mb-8 uppercase text-sm tracking-widest">Legale</h4>
            <ul className="space-y-4 text-gray-400">
              <li><Link href="#" className="hover:text-green-400 transition text-lg">Privacy Policy</Link></li>
              <li><Link href="#" className="hover:text-green-400 transition text-lg">Termini di Servizio</Link></li>
              <li><Link href="#" className="hover:text-green-400 transition text-lg">Cookie Policy</Link></li>
              <li><Link href="#" className="hover:text-green-400 transition text-lg">GDPR</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto mt-20 pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center text-gray-500 text-sm">
          <p>&copy; 2026 TavolaRapida S.r.l. Tutti i diritti riservati.</p>
          <p className="mt-2 md:mt-0 flex items-center gap-2">Made with <span className="text-red-500">❤️</span> in Italy</p>
        </div>
      </footer>
    </div>
  );
}