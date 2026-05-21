"use client";

import { TrendingUp, Leaf, ShieldCheck } from "lucide-react";

interface FeatureCardProps {
  icon: React.ReactNode;
  color: string;
  title: string;
  description: string;
  shadowColor: string;
}

function FeatureCard({ icon, color, title, description, shadowColor }: FeatureCardProps) {
  return (
    <div className={`group relative p-10 rounded-3xl bg-white border border-gray-100 shadow-xl hover:shadow-2xl hover:${shadowColor}/10 transition-all duration-300 hover:-translate-y-3 overflow-hidden`}>
      <div className={`absolute top-0 right-0 w-32 h-32 ${color}/10 rounded-full blur-[60px] -mr-16 -mt-16 group-hover:${color}/20 transition-colors`}></div>
      <div className={`w-16 h-16 ${color.replace('bg-', 'bg-').replace('500', '100')} text-${color.replace('bg-', '').replace('500', '600')} rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform`}>
        {icon}
      </div>
      <h3 className="text-2xl font-bold text-gray-900 mb-4">{title}</h3>
      <p className="text-gray-600 text-lg leading-relaxed" dangerouslySetInnerHTML={{ __html: description }} />
    </div>
  );
}

export function FeaturesSection() {
  const features = [
    {
      icon: <TrendingUp className="w-8 h-8" />,
      color: "bg-blue-500",
      shadowColor: "shadow-blue-500",
      title: "Efficienza Massima",
      description: "Riduci i tempi di attesa del <strong>40%</strong>. Le comande arrivano direttamente in cucina in tempo reale."
    },
    {
      icon: <Leaf className="w-8 h-8" />,
      color: "bg-green-500",
      shadowColor: "shadow-green-500",
      title: "Impatto Zero",
      description: "Dì addio alla stampa dei menu. Aggiorna prezzi e piatti in <strong>un click</strong> da qualsiasi dispositivo."
    },
    {
      icon: <ShieldCheck className="w-8 h-8" />,
      color: "bg-orange-500",
      shadowColor: "shadow-orange-500",
      title: "Sicurezza Blindata",
      description: "Sessioni temporanee crittografate. Nessuno può modificare l'URL per ordinare da un altro tavolo."
    }
  ];

  return (
    <section id="features" className="py-24 px-4 bg-gray-50 relative">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-6xl font-black text-gray-900 mb-6">Perché Sceglierci?</h2>
          <div className="w-32 h-2 bg-gradient-to-r from-green-500 to-blue-500 mx-auto rounded-full"></div>
        </div>

        <div className="grid md:grid-cols-3 gap-10">
          {features.map((feature, index) => (
            <FeatureCard key={index} {...feature} />
          ))}
        </div>
      </div>
    </section>
  );
}
