// src/app/(client)/scan/[token]/page.tsx

"use client";

import { useParams } from "next/navigation";
import { useScanSession } from "@/hooks/useScanSession";
import { ScanStatus } from "@/components/client/scan/ScanStatus";

export default function ScanPage() {
  const params = useParams();
  const tableCode = params.token as string;

  // L'hook useScanSession gestisce:
  // 1. Validazione del token
  // 2. Salvataggio della sessione (tramite saveTableSession/saveTableToken)
  // 3. Redirect automatico a /order/[sessionId]
  const { status, message, error } = useScanSession(tableCode);

  return <ScanStatus status={status} message={message} error={error} />;
}