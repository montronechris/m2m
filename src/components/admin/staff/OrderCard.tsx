// src/components/admin/staff/OrderCard.tsx

"use client";

import { Order } from "@/lib/admin-service";

interface OrderCardProps {
  order: Order;
  theme: "light" | "dark";
  statusLabel: string;
  statusColor: string;
  onStatusUpdate: (orderId: string, newStatus: Order["status"]) => void;
}

export function OrderCard({
  order,
  theme,
  statusLabel,
  statusColor,
  onStatusUpdate,
}: OrderCardProps) {
  const isLight = theme === "light";

  return (
    <div
      className={`rounded-2xl p-5 border transition-all ${
        isLight
          ? "bg-white border-gray-200 shadow-md"
          : "bg-[#111118]/60 border-white/5"
      }`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold">
            Tavolo {order.table_id.slice(0, 2)}
          </span>
          <span className={`text-xs px-2 py-0.5 rounded-full border ${statusColor}`}>
            {statusLabel}
          </span>
        </div>
        <span className={`text-xs ${isLight ? "text-gray-500" : "text-gray-500"}`}>
          {new Date(order.created_at).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
      </div>

      <div className="space-y-2 mb-4">
        {order.order_items?.map((item) => (
          <div key={item.id} className="flex justify-between text-sm">
            <span className={isLight ? "text-gray-700" : "text-gray-300"}>
              {item.quantity}x {item.menu_items?.name}
            </span>
          </div>
        ))}
      </div>

      {order.notes && (
        <div
          className={`text-xs p-2 rounded-lg mb-4 ${
            isLight ? "bg-yellow-50 text-yellow-800" : "bg-yellow-500/10 text-yellow-400"
          }`}
        >
          📝 {order.notes}
        </div>
      )}

      <div className="flex gap-2">
        {order.status === "pending" && (
          <button
            onClick={() => onStatusUpdate(order.id, "preparing")}
            className="flex-1 py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-colors"
          >
            Prepara
          </button>
        )}
        {order.status === "preparing" && (
          <button
            onClick={() => onStatusUpdate(order.id, "ready")}
            className="flex-1 py-2 px-3 rounded-xl bg-green-600 hover:bg-green-700 text-white text-sm font-medium transition-colors"
          >
            Pronto
          </button>
        )}
        {order.status === "ready" && (
          <button
            onClick={() => onStatusUpdate(order.id, "delivered")}
            className="flex-1 py-2 px-3 rounded-xl bg-gray-600 hover:bg-gray-700 text-white text-sm font-medium transition-colors"
          >
            Consegnato
          </button>
        )}
      </div>
    </div>
  );
}