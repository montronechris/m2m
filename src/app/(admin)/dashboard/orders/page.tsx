// src/app/(admin)/dashboard/orders/page.tsx
"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RefreshCw, Clock } from "lucide-react";

const SUPABASE_URL = "https://ylzuyhmtzfqnoyqkwiqx.supabase.co";
const API_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlsenV5aG10emZxbm95cWt3aXF4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg2MDMxNzEsImV4cCI6MjA5NDE3OTE3MX0.eNksInG0OeM_CHnWnCNfrHOy1oYHL6_QMHI0M-2VAkw";

type OrderStatus = 'pending' | 'preparing' | 'ready' | 'served' | 'cancelled';

interface OrderItem {
  menu_item_id: string;
  quantity: number;
  unit_price_cents: number;
}

interface Order {
  id: string;
  table_id: string;
  restaurant_id: string;
  total_cents: number;
  status: OrderStatus;
  notes: string | null;
  created_at: string;
  items: OrderItem[];
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = async () => {
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/orders?select=*,items:order_items(menu_item_id, quantity, unit_price_cents)&order=created_at.desc`, {
        headers: {
          'apikey': API_KEY,
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        }
      });
      if (!res.ok) throw new Error("Errore nel caricamento degli ordini");
      const data = await res.json();
      setOrders(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/orders?id=eq.${orderId}`, {
        method: 'PATCH',
        headers: {
          'apikey': API_KEY,
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (!res.ok) throw new Error("Errore aggiornamento stato");
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    } catch (err: any) {
      console.error(err);
      alert("Errore nell'aggiornamento: " + err.message);
      fetchOrders();
    }
  };

  if (loading && orders.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
          <p className="text-gray-500 font-medium">Caricamento ordini...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-white p-6 rounded-xl shadow-lg text-center space-y-4">
          <p className="text-red-600 font-medium">{error}</p>
          <Button onClick={fetchOrders} className="bg-gray-900 hover:bg-green-600">Riprova</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 bg-gray-50 min-h-screen">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <span className="w-2 h-8 bg-green-600 rounded-full"></span>
          Ordini in Tempo Reale
        </h2>
        <div className="flex items-center gap-3">
          <Badge className="bg-green-100 text-green-800 border-green-200 px-3 py-1.5 text-sm font-medium">
            ● Live
          </Badge>
          <Button variant="outline" size="sm" onClick={fetchOrders} className="gap-2 hover:bg-green-50 hover:text-green-700 hover:border-green-200">
            <RefreshCw className="w-4 h-4" /> Aggiorna
          </Button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {orders.map((order) => (
          <Card key={order.id} className="border-0 shadow-sm hover:shadow-md transition-all duration-300 bg-white rounded-xl overflow-hidden">
            <div className={`h-1.5 w-full ${
              order.status === 'pending' ? 'bg-yellow-400' :
              order.status === 'preparing' ? 'bg-blue-500' :
              order.status === 'ready' ? 'bg-green-500' :
              order.status === 'served' ? 'bg-gray-400' :
              'bg-red-400'
            }`} />
            
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg text-gray-900">Tavolo {order.table_id?.slice(-4) || '?'}</CardTitle>
                  <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(order.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </p>
                </div>
                <Badge className={
                  order.status === 'pending' ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100' :
                  order.status === 'preparing' ? 'bg-blue-100 text-blue-800 hover:bg-blue-100' :
                  order.status === 'ready' ? 'bg-green-100 text-green-800 hover:bg-green-100' :
                  order.status === 'served' ? 'bg-gray-100 text-gray-800' :
                  'bg-red-100 text-red-800'
                }>
                  {order.status.toUpperCase()}
                </Badge>
              </div>
            </CardHeader>
           
            <CardContent className="space-y-4">
              <div className="space-y-2 text-sm bg-gray-50 p-3 rounded-lg">
                {order.items?.map((item, idx) => (
                  <div key={idx} className="flex justify-between border-b border-gray-200 last:border-0 pb-1 last:pb-0">
                    <span className="font-medium text-gray-700 truncate pr-2">{item.quantity}x {item.menu_item_id?.slice(0,8)}...</span>
                    <span className="text-gray-900 font-semibold whitespace-nowrap">{(item.unit_price_cents * item.quantity / 100).toFixed(2)}€</span>
                  </div>
                ))}
              </div>

              {order.notes && (
                <div className="bg-orange-50 text-orange-800 text-xs p-2.5 rounded-lg border border-orange-100 flex gap-2">
                  <span>📝</span> <span className="break-words">{order.notes}</span>
                </div>
              )}

              <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <div className="font-bold text-xl text-gray-900">
                  {(order.total_cents / 100).toFixed(2)}€
                </div>
                <select 
                  value={order.status} 
                  onChange={(e) => handleStatusChange(order.id, e.target.value as OrderStatus)}
                  className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-green-500 focus:border-green-500 w-full p-2.5 outline-none cursor-pointer hover:border-gray-400 transition-colors"
                >
                  <option value="pending">⏳ In attesa</option>
                  <option value="preparing">👨‍ Preparazione</option>
                  <option value="ready">✅ Pronto</option>
                  <option value="served">🍽️ Servito</option>
                  <option value="cancelled">❌ Annullato</option>
                </select>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {orders.length === 0 && !loading && (
        <div className="text-center py-16 text-gray-400">
          <p className="text-lg">Nessun ordine ricevuto al momento.</p>
          <p className="text-sm mt-1">Gli ordini appariranno qui non appena i clienti li invieranno.</p>
        </div>
      )}
    </div>
  );
}
