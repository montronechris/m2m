// src/components/client/order/OrderTracker.tsx
"use client";

import { useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { Clock, ChefHat, CheckCircle, AlertCircle } from "lucide-react";

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function OrderTracker({ orderId }: { orderId: string }) {
  const [status, setStatus] = useState<string>("pending");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderId) return;

    const fetchStatus = async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("status")
        .eq("id", orderId)
        .single();
      
      if (!error && data) setStatus(data.status);
      setLoading(false);
    };

    fetchStatus();

    const channel = supabase
      .channel(`order_${orderId}`)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "orders", filter: `id=eq.${orderId}` },
        (payload) => setStatus(payload.new.status)
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [orderId]);

  if (loading) return <div className="text-center py-4 text-gray-400">Caricamento stato...</div>;

  const steps = [
    { key: "pending", label: "Ricevuto", icon: Clock, color: "text-yellow-500 bg-yellow-100" },
    { key: "cooking", label: "In Preparazione", icon: ChefHat, color: "text-blue-500 bg-blue-100" },
    { key: "ready", label: "Pronto per il Tavolo", icon: CheckCircle, color: "text-green-500 bg-green-100" },
  ];

  const currentStepIndex = steps.findIndex(s => s.key === status);
  const isCompleted = status === "completed";

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
      <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
        <AlertCircle className="w-4 h-4 text-green-600" /> Stato Ordine
      </h3>
      
      <div className="flex items-center justify-between relative">
        <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-200 -translate-y-1/2 rounded" />
        <div 
          className="absolute top-1/2 left-0 h-1 bg-green-500 -translate-y-1/2 rounded transition-all duration-500"
          style={{ width: `${(currentStepIndex / (steps.length - 1)) * 100}%` }}
        />
        
        {steps.map((step, idx) => {
          const Icon = step.icon;
          const isActive = idx <= currentStepIndex || isCompleted;
          const isCurrent = idx === currentStepIndex;
          
          return (
            <div key={step.key} className="relative z-10 flex flex-col items-center gap-1">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                isActive ? step.color : "bg-gray-100 text-gray-400"
              } ${isCurrent ? "ring-2 ring-offset-2 ring-green-500 scale-110" : ""}`}>
                <Icon className="w-4 h-4" />
              </div>
              <span className={`text-xs font-medium ${isActive ? "text-gray-900" : "text-gray-400"}`}>
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}