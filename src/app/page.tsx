// src/app/page.tsx
"use client"; // Necessario per gestire lo stato del form

import Link from "next/link";
import { useState } from "react";
import { QrCode, Leaf, ShieldCheck, TrendingUp, Mail, Phone, MapPin, Send, CheckCircle } from "lucide-react";

export default function HomePage() {
  const [formStatus, setFormStatus] = useState<"idle" | "submitting" | "success">("idle");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormStatus("submitting");
    
    // Simulazione invio dati (qui collegherai Supabase o EmailJS in futuro)
    setTimeout(() => {
      console.log("Form inviato!");
      setFormStatus("success");
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-white font-sans text-gray-900">
      
      {/* ... [HERO SECTION E SEZIONI PRECEDENTI RIMANGONO INVARIATE] ... */}
      {/* Per brevità non le riscrivo tutte, ma lascia tutto ciò che c'era prima fino alla CTA finale */}

      {/* HERO SECTION (Riassunta per contesto) */}
      <section className="relative bg-gray-900 text-white py-24 px-4 overflow-hidden">
        <div className="absolute inset-0 opacity-30 bg-[url('https://images.unsplash.com/photo-1559339352-11d035aa65de?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80')] bg-cover bg-center"></div>
        <div className="relative max-w-5xl mx-auto text-center space-y-8 z-10">
          <span className="inline-block py-1 px-3 rounded-full bg-green-500/20 border border-green-500/50 text-green-400 text-sm font-semibold tracking-wide uppercase">Il Futuro della Ristorazione</span>
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-tight">Menu Digitale <br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-600">Intelligente & Sostenibile</span></h1>
          <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto font-light">Trasforma l'esperienza dei tuoi clienti. Elimina la carta, riduci i costi e accelera il servizio con il nostro sistema QR Code all-in-one.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
            <Link href="/menu/cucinadalaghetti/1" className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-lg font-bold text-lg transition shadow-lg shadow-green-600/20 flex items-center justify-center gap-2"><QrCode className="w-5 h-5" /> Prova la Demo</Link>
            <a href="#features" className="bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white px-8 py-4 rounded-lg font-bold text-lg transition">Scopri i Vantaggi</a>
          </div>
        </div>
      </section>

      {/* FEATURES SECTION (Riassunta) */}
      <section id="features" className="py-24 px-4 bg-white">
         <div className="max-w-6xl mx-auto text-center mb-16"><h2 className="text-3xl md:text-5xl font-bold text-gray-900">Perché scegliere il Digitale?</h2></div>
         <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8">
            <div className="p-8 rounded-2xl bg-gray-50 border border-gray-100 hover:shadow-xl transition"><TrendingUp className="w-10 h-10 text-blue-600 mb-4"/><h3 className="text-xl font-bold mb-2">Efficienza Operativa</h3><p className="text-gray-600">Riduci i tempi di attesa e gli errori di comanda.</p></div>
            <div className="p-8 rounded-2xl bg-gray-50 border border-gray-100 hover:shadow-xl transition"><Leaf className="w-10 h-10 text-green-600 mb-4"/><h3 className="text-xl font-bold mb-2">Impatto Zero</h3><p className="text-gray-600">Dì addio alla carta. Aggiorna il menu in un click.</p></div>
            <div className="p-8 rounded-2xl bg-gray-50 border border-gray-100 hover:shadow-xl transition"><ShieldCheck className="w-10 h-10 text-orange-600 mb-4"/><h3 className="text-xl font-bold mb-2">Sicurezza Garantita</h3><p className="text-gray-600">Contatti minimi e allergeni sempre visibili.</p></div>
         </div>
      </section>

      {/* 4. SEZIONE CONTATTI (NUOVA) */}
      <section id="contact" className="py-24 px-4 bg-gray-50">
        <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
          <div className="grid md:grid-cols-5">
            
            {/* Lato Sinistro: Info */}
            <div className="md:col-span-2 bg-gray-900 text-white p-10 flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
              <div className="relative z-10 space-y-8">
                <div>
                  <h3 className="text-3xl font-bold mb-4">Parliamo del tuo progetto</h3>
                  <p className="text-gray-300">Hai domande su TavolaRapida? Vuoi una demo personalizzata per il tuo ristorante? Compila il form e ti ricontatteremo entro 24 ore.</p>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <Mail className="w-5 h-5 text-green-400" />
                    <span>info@tavolarapida.it</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <Phone className="w-5 h-5 text-green-400" />
                    <span>+39 02 1234567</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <MapPin className="w-5 h-5 text-green-400" />
                    <span>Milano, Italia</span>
                  </div>
                </div>
              </div>
              
              <div className="relative z-10 mt-12">
                <div className="w-12 h-1 bg-green-500 rounded-full"></div>
              </div>
            </div>

            {/* Lato Destro: Form */}
            <div className="md:col-span-3 p-10">
              {formStatus === "success" ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4 animate-fade-in">
                  <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
                    <CheckCircle className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">Messaggio Inviato!</h3>
                  <p className="text-gray-600">Grazie per averci contattato. Ti risponderemo al più presto.</p>
                  <button onClick={() => setFormStatus("idle")} className="text-green-600 font-medium hover:underline mt-4">Invia un altro messaggio</button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-2 gap-5">
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-gray-700">Sono un*</label>
                      <select required className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition bg-white">
                        <option value="">Seleziona...</option>
                        <option value="ristoratore">Ristoratore / Titolare</option>
                        <option value="manager">Restaurant Manager</option>
                        <option value="altro">Altro</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-gray-700">Nome*</label>
                      <input type="text" required placeholder="Mario Rossi" className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-5">
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-gray-700">Email*</label>
                      <input type="email" required placeholder="mario@email.com" className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-gray-700">Telefono*</label>
                      <input type="tel" required placeholder="+39 333..." className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition" />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-5">
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-gray-700">CAP</label>
                      <input type="text" placeholder="20100" className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition" />
                    </div>
                    <div className="space-y-1 col-span-2">
                      <label className="text-sm font-medium text-gray-700">Città*</label>
                      <input type="text" required placeholder="Milano" className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition" />
                    </div>
                  </div>
                  
                   <div className="space-y-1">
                      <label className="text-sm font-medium text-gray-700">Provincia</label>
                      <input type="text" placeholder="MI" className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition" />
                    </div>

                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">Messaggio*</label>
                    <textarea required rows={4} placeholder="Descrivi le tue esigenze..." className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition resize-none"></textarea>
                  </div>

                  <div className="flex items-start gap-3 pt-2">
                    <input type="checkbox" required id="privacy" className="mt-1 w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500" />
                    <label htmlFor="privacy" className="text-xs text-gray-500 leading-tight">
                      * Acconsento al trattamento di Dati Personali ai sensi dell’Art 7 del GDPR 679/2016 <Link href="#" className="underline hover:text-gray-900">privacy policy</Link>.
                    </label>
                  </div>

                  <button 
                    type="submit" 
                    disabled={formStatus === "submitting"}
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3.5 rounded-lg transition shadow-lg shadow-green-600/20 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {formStatus === "submitting" ? (
                      <span className="animate-pulse">Invio in corso...</span>
                    ) : (
                      <>Invia Richiesta <Send className="w-4 h-4" /></>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 5. FOOTER PROFESSIONALE */}
      <footer className="bg-gray-900 text-white py-16 px-4 border-t border-gray-800">
        <div className="max-w-6xl mx-auto grid md:grid-cols-4 gap-12">
          <div className="col-span-1 md:col-span-2 space-y-4">
            <h3 className="text-2xl font-bold flex items-center gap-2">🍽️ TavolaRapida</h3>
            <p className="text-gray-400 max-w-sm">La soluzione completa per la ristorazione moderna. Menu digitali, ordinazioni QR e gestione intelligente.</p>
          </div>
          
          <div>
            <h4 className="font-bold text-gray-200 mb-6 uppercase text-sm tracking-wider">Link Utili</h4>
            <ul className="space-y-3 text-gray-400">
              <li><Link href="#" className="hover:text-green-400 transition">Chi Siamo</Link></li>
              <li><Link href="#" className="hover:text-green-400 transition">Funzionalità</Link></li>
              <li><Link href="#" className="hover:text-green-400 transition">Blog</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-gray-200 mb-6 uppercase text-sm tracking-wider">Legale</h4>
            <ul className="space-y-3 text-gray-400">
              <li><Link href="#" className="hover:text-green-400 transition">Privacy Policy</Link></li>
              <li><Link href="#" className="hover:text-green-400 transition">Termini di Servizio</Link></li>
              <li><Link href="#" className="hover:text-green-400 transition">Cookie Policy</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="max-w-6xl mx-auto mt-16 pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center text-gray-500 text-sm">
          <p>&copy; 2026 TavolaRapida. Tutti i diritti riservati.</p>
        </div>
      </footer>
    </div>
  );
}