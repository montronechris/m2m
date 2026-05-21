// src/app/admin/staff/page.tsx

"use client";

import { useStaff } from "@/hooks/useStaff";
import { StaffHeader } from "@/components/admin/staff/StaffHeader";
import { OrderCard } from "@/components/admin/staff/OrderCard";
import { CheckCircle } from "lucide-react";

export default function StaffPage() {
  const {
    orders,
    loading,
    refreshing,
    theme,
    userName,
    toggleTheme,
    refreshOrders,
    handleStatusUpdate,
    handleLogout,
    getStatusLabel,
    getStatusColor,
  } = useStaff();

  const isLight = theme === "light";

  if (loading) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center ${
          isLight ? "bg-white" : "bg-[#0a0a0f]"
        }`}
      >
        <div className="text-center space-y-4">
          <div
            className={`w-12 h-12 border-3 rounded-full animate-spin mx-auto ${
              isLight
                ? "border-green-200 border-t-green-600"
                : "border-green-500/30 border-t-green-500"
            }`}
          />
          <p className={isLight ? "text-gray-700" : "text-gray-400"}>
            Caricamento...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        isLight ? "bg-white text-gray-900" : "bg-[#0a0a0f] text-white"
      }`}
    >
      <StaffHeader
        userName={userName}
        theme={theme}
        refreshing={refreshing}
        onToggleTheme={toggleTheme}
        onRefresh={refreshOrders}
        onLogout={handleLogout}
      />

      <main className="max-w-6xl mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Ordini Attivi</h2>
          <span
            className={`text-sm px-3 py-1 rounded-full ${
              isLight ? "bg-gray-100 text-gray-700" : "bg-white/5 text-gray-400"
            }`}
          >
            {orders.length} ordini
          </span>
        </div>

        {orders.length === 0 ? (
          <div
            className={`text-center py-20 rounded-2xl border ${
              isLight ? "bg-gray-50 border-gray-200" : "bg-white/5 border-white/5"
            }`}
          >
            <CheckCircle
              className={`w-12 h-12 mx-auto mb-4 ${
                isLight ? "text-gray-400" : "text-gray-500"
              }`}
            />
            <p className={isLight ? "text-gray-600" : "text-gray-400"}>
              Nessun ordine attivo al momento
            </p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {orders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                theme={theme}
                statusLabel={getStatusLabel(order.status)}
                statusColor={getStatusColor(order.status)}
                onStatusUpdate={handleStatusUpdate}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}