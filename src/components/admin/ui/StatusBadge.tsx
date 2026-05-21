// src/components/admin/ui/StatusBadge.tsx

"use client";

type OrderStatus = "pending" | "preparing" | "ready" | "delivered";

interface StatusBadgeProps {
  status: OrderStatus;
}

const styles: Record<OrderStatus, string> = {
  pending: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  preparing: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  ready: "bg-green-500/20 text-green-400 border-green-500/30",
  delivered: "bg-gray-500/20 text-gray-400 border-gray-500/30",
};

const labels: Record<OrderStatus, string> = {
  pending: "In attesa",
  preparing: "In preparazione",
  ready: "Pronto",
  delivered: "Consegnato",
};

export function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${styles[status]}`}>
      {labels[status]}
    </span>
  );
}