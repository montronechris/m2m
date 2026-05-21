// src/hooks/useStaff.ts

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import {
  getRestaurantByUser,
  getOrders,
  updateOrderStatus,
  signOut,
  Order,
  UserRole,
} from "@/lib/admin-service";
import { useToast } from "@/hooks/useToast";

type OrderStatus = Order["status"];

interface UseStaffReturn {
  orders: Order[];
  loading: boolean;
  refreshing: boolean;
  theme: "light" | "dark";
  userName: string;
  toggleTheme: () => void;
  refreshOrders: () => Promise<void>;
  handleStatusUpdate: (orderId: string, newStatus: OrderStatus) => Promise<void>;
  handleLogout: () => Promise<void>;
  getStatusLabel: (status: OrderStatus) => string;
  getStatusColor: (status: OrderStatus) => string;
}

export function useStaff(): UseStaffReturn {
  const router = useRouter();
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const { showToast } = useToast();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const [userName, setUserName] = useState("Staff");
  const [restaurantId, setRestaurantId] = useState<string | null>(null);

  // Auth + Role Check
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const data = await getRestaurantByUser();

        // Titolare → redirect a dashboard
        if (data.userRole === "titolare") {
          router.push("/admin/dashboard");
          return;
        }

        setUserName(data.userName);
        setRestaurantId(data.id);

        const savedTheme = localStorage.getItem("tavolarapida_theme");
        if (savedTheme === "light" || savedTheme === "dark") {
          setTheme(savedTheme);
        }
      } catch {
        router.push("/login");
      }
    };

    checkAuth();
  }, [router]);

  // Fetch Ordini
  const fetchOrders = useCallback(
    async (isRefresh = false) => {
      if (!restaurantId) return;
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      try {
        const data = await getOrders(restaurantId);
        const activeOrders = data.filter(
          (o) => o.status !== "delivered" && o.status !== "cancelled"
        );
        setOrders(activeOrders);
      } catch {
        showToast("Errore caricamento ordini", "error");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [restaurantId, showToast]
  );

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(() => fetchOrders(true), 30000);
    return () => clearInterval(interval);
  }, [fetchOrders]);

  // Toggle Tema
  const toggleTheme = useCallback(() => {
    setTheme((prev) => {
      const next = prev === "dark" ? "light" : "dark";
      localStorage.setItem("tavolarapida_theme", next);
      return next;
    });
  }, []);

  // Update Status
  const handleStatusUpdate = useCallback(
    async (orderId: string, newStatus: OrderStatus) => {
      try {
        await updateOrderStatus(orderId, newStatus);
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
        );
        showToast(`Ordine aggiornato a ${getStatusLabel(newStatus)}`, "success");
      } catch {
        showToast("Errore aggiornamento ordine", "error");
      }
    },
    [showToast]
  );

  // Logout
  const handleLogout = useCallback(async () => {
    await signOut();
    router.push("/login");
  }, [router]);

  // Helpers
  const getStatusLabel = (status: OrderStatus) => {
    const labels: Record<OrderStatus, string> = {
      pending: "In Attesa",
      preparing: "In Preparazione",
      ready: "Pronto",
      delivered: "Consegnato",
      cancelled: "Annullato",
    };
    return labels[status];
  };

  const getStatusColor = (status: OrderStatus) => {
    const colors: Record<OrderStatus, string> = {
      pending: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
      preparing: "bg-blue-500/20 text-blue-400 border-blue-500/30",
      ready: "bg-green-500/20 text-green-400 border-green-500/30",
      delivered: "bg-gray-500/20 text-gray-400 border-gray-500/30",
      cancelled: "bg-red-500/20 text-red-400 border-red-500/30",
    };
    return colors[status];
  };

  return {
    orders,
    loading,
    refreshing,
    theme,
    userName,
    toggleTheme,
    refreshOrders: () => fetchOrders(true),
    handleStatusUpdate,
    handleLogout,
    getStatusLabel,
    getStatusColor,
  };
}