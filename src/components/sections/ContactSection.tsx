"use client";

import Link from "next/link";
import { Mail, Phone, Send, CheckCircle } from "lucide-react";
import { useContactForm } from "@/hooks/useContactForm";

export function ContactSection() {
  const { formStatus, handleSubmit, resetForm } = useContactForm();

  return (
    <section id="contact" className="py-24 px-4 bg-gray-900 relative z-20">
      <div className="max-w-5xl mx-auto bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-gray-100 flex flex-col md:flex-row">
        
        {/* Lato Sinistro - Dark */}
        <div className="md:w-2/5 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-12 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-[-50%] right-[-50%] w-[400px] h-[400px] bg-green-500/20 rounded-full blur-[100px]"></div>
        
          <div className="relative z-10 space-y-8">
            <div>
              <h3 className="text-3xl font-black mb-4 leading-tight">
                Pronto a <br/> <span className="text-green-400">innovare?</span>
              </h3>
              <p className="text-gray-300 text-sm leading-relaxed">
                Compila il form per richiedere una demo gratuita o per parlare con il nostro team.
              </p>
            </div>
          
            <div className="space-y-6">
              <div className="flex items-center gap-4 group">
                <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
                  <Mail className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase font-bold">Email</p>
                  <p className="font-medium">info@tavolarapida.it</p>
                </div>
              </div>
              <div className="flex items-center gap-4 group">
                <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
                  <Phone className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase font-bold">Telefono</p>
                  <p className="font-medium">+39 02 1234567</p>
                </div>
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
              <button onClick={() => resetForm()} className="text-green-600 font-bold hover:text-green-700 hover:underline mt-4 text-lg">
                Invia un altro messaggio
              </button>
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
                <textarea required rows={4} placeholder="Descrivi le tue esigenze..." className="w-full px-4 py-3.5 rounded-xl border-2 border-gray-100 focus:border-green-500 outline-none transition bg-gray-50 resize-none"></textarea>
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
                {formStatus === "submitting" ? "Elaborazione..." : (
                  <>Invia Richiesta <Send className="w-5 h-5" /></>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
