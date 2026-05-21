// src/hooks/useScanSession.ts

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { validateScanToken } from "@/lib/api-service";
import { saveTableSession } from "@/lib/table-session";
import { supabase } from "@/lib/supabase";

type ScanStatus = "idle" | "verifying" | "success" | "error";

export function useScanSession(tableCode: string) {
  const router = useRouter();
  const [status, setStatus] = useState<ScanStatus>("idle");
  const [message, setMessage] = useState("Verifica QR Code in corso...");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Se tableCode è vuoto o sembra un UUID, non procedere
    if (!tableCode || tableCode.length > 20) {
      setError("Token QR non valido.");
      setStatus("error");
      return;
    }

    const activateSession = async () => {
      setStatus("verifying");
      setMessage("Verifica QR Code in corso...");

      try {
        const data = await validateScanToken(tableCode);

        // 🔥 NEW: attiva sessione nel DB
        await supabase.rpc("start_table_session", {
          p_table_id: data.tableId,
        });

        // salva sessione locale (solo meta)
        saveTableSession({
          tableCode: tableCode,
          sessionId: data.sessionId,
          tableNumber: data.tableNumber,
          restaurantSlug: data.restaurantSlug,
          restaurantId: data.restaurantId,
        });

        // Debug in console per verificare
        console.log("✅ Sessione salvata:", {
          tableCode,
          sessionId: data.sessionId,
        });

        setStatus("success");
        setMessage("Reindirizzamento al menu...");

        setTimeout(() => {
          router.push(
            `/order/${data.sessionId}?slug=${data.restaurantSlug}&table=${data.tableNumber}`
          );
        }, 2000);
      } catch (err: any) {
        setStatus("error");
        setError(err.message);
        setMessage(`Errore: ${err.message}`);
      }
    };

    activateSession();
  }, [tableCode, router]);

  return { status, message, error };
}