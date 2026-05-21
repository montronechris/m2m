// src/components/admin/ui/TableStatus.tsx

"use client";

type TableStatusType = "free" | "occupied" | "reserved" | "bill-requested";

interface TableStatusProps {
  status: TableStatusType;
}

const styles: Record<TableStatusType, string> = {
  free: "bg-green-500/20 border-green-500/40",
  occupied: "bg-red-500/20 border-red-500/40",
  reserved: "bg-blue-500/20 border-blue-500/40",
  "bill-requested": "bg-yellow-500/20 border-yellow-500/40",
};

const labels: Record<TableStatusType, string> = {
  free: "Libero",
  occupied: "Occupato",
  reserved: "Prenotato",
  "bill-requested": "Conto",
};

export function TableStatus({ status }: TableStatusProps) {
  return (
    <span className={`px-2 py-0.5 rounded text-xs font-medium border ${styles[status]}`}>
      {labels[status]}
    </span>
  );
}