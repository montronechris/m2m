"use client";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { OrderStatus } from "@/types";

const STEPS: { key: OrderStatus; label: string; icon: string }[] = [
  { key: "pending", label: "In attesa", icon: "⏳" },
  { key: "preparing", label: "In preparazione", icon: "👨‍🍳" },
  { key: "ready", label: "Pronto", icon: "✅" },
  { key: "served", label: "Servito", icon: "🍽️" }
];

export default function TrackPage() {
  const [status, setStatus] = useState<OrderStatus>("pending");
  useEffect(() => {
    const t1 = setTimeout(() => setStatus("preparing"), 3000);
    const t2 = setTimeout(() => setStatus("ready"), 8000);
    const t3 = setTimeout(() => setStatus("served"), 12000);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);
  const idx = STEPS.findIndex(s => s.key === status);
  return (
    <div className="space-y-6 text-center pt-4">
      <h2 className="text-2xl font-bold">📍 Tracking Ordine</h2>
      <div className="flex justify-between items-center max-w-xs mx-auto">
        {STEPS.map((s, i) => <div key={s.key} className={`flex flex-col items-center ${i <= idx ? "text-green-600" : "text-gray-400"}`}><span className="text-2xl">{s.icon}</span><span className="text-xs mt-1">{s.label}</span></div>)}
      </div>
      <Card className="p-4 bg-gray-50"><p className="text-lg font-medium">Stato: <Badge variant={idx === 3 ? "default" : "secondary"}>{status}</Badge></p></Card>
      <button className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700">🙋 Chiama cameriere</button>
    </div>
  );
}
