"use client";
import { useCartStore } from "@/stores/useCartStore";
import { cartSchema } from "@/validators";
import { db } from "@/lib/services/db";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Minus, Plus, Trash2 } from "lucide-react";

export default function CartPage() {
  const { items, updateQuantity, removeItem, clearCart, getTotal, tableId } = useCartStore();
  const router = useRouter();

  const handleCheckout = async () => {
    const parsed = cartSchema.safeParse(items);
    if (!parsed.success) { alert("Carrello non valido"); return; }
    await db.createOrder({ table_id: tableId!, restaurant_id: "rest-1", status: "pending", total_cents: getTotal(), notes: "",
      items: items.map(i => ({ id: crypto.randomUUID(), order_id: "", menu_item_id: i.menuItemId, quantity: i.quantity, unit_price_cents: i.priceCents, customizations: i.customizations }))
    });
    clearCart();
    router.push("/track");
  };

  if (items.length === 0) return <div className="text-center py-20 text-gray-500">Il carrello è vuoto</div>;

  return (
    <div className="space-y-4">
      {items.map(item => (
        <Card key={item.menuItemId} className="p-4 flex justify-between items-center">
          <div><h3 className="font-medium">{item.name}</h3><p className="text-sm text-gray-500">{(item.priceCents / 100).toFixed(2)}€ cad.</p></div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="icon" onClick={() => updateQuantity(item.menuItemId, item.quantity - 1)}><Minus className="w-4 h-4"/></Button>
            <span className="w-6 text-center">{item.quantity}</span>
            <Button variant="outline" size="icon" onClick={() => updateQuantity(item.menuItemId, item.quantity + 1)}><Plus className="w-4 h-4"/></Button>
            <Button variant="destructive" size="icon" onClick={() => removeItem(item.menuItemId)}><Trash2 className="w-4 h-4"/></Button>
          </div>
        </Card>
      ))}
      <div className="border-t pt-4 flex justify-between items-center text-lg font-bold">
        <span>Totale</span><span>{(getTotal() / 100).toFixed(2)}€</span>
      </div>
      <Button className="w-full" size="lg" onClick={handleCheckout}>Invia Ordine al Tavolo</Button>
    </div>
  );
}
