// src/hooks/useCartExpiry.ts
"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useCartStore } from "@/stores/useCartStore";

const EXPIRE_MS = 15 * 60 * 1000;
const TICK_MS   =      10 * 1000; // tick ogni 10 secondi

// Soglie in millisecondi rimanenti a cui mostrare il banner
const THRESHOLDS = [
  5 * 60 * 1000, // 5 minuti
  2 * 60 * 1000, // 2 minuti
  1 * 60 * 1000, // 1 minuto
];
const BANNER_VISIBLE_MS = 10 * 1000; // banner visibile 10 secondi

type UseCartExpiryResult = {
  /** true quando il banner di avviso è visibile */
  isWarning:   boolean;
  /** secondi rimanenti alla scadenza */
  secondsLeft: number;
  resetTimer:  () => void;
};

export function useCartExpiry(onExpired: () => void): UseCartExpiryResult {
  const lastActivityAt = useCartStore((s) => s.lastActivityAt);
  const expireCart     = useCartStore((s) => s.expireCart);
  const items          = useCartStore((s) => s.items);

  const [isWarning,   setIsWarning]   = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(EXPIRE_MS / 1000);

  const onExpiredRef    = useRef(onExpired);
  const intervalRef     = useRef<ReturnType<typeof setInterval> | null>(null);
  const bannerTimerRef  = useRef<ReturnType<typeof setTimeout> | null>(null);
  const firedRef        = useRef(false);
  // Tiene traccia delle soglie già mostrate per non riproporle
  const shownThresholds = useRef<Set<number>>(new Set());
  onExpiredRef.current  = onExpired;

  const resetTimer = useCallback(() => {
    useCartStore.setState({ lastActivityAt: Date.now() });
  }, []);

  const showBannerFor10s = useCallback(() => {
    // Cancella eventuale hide-timer precedente
    if (bannerTimerRef.current) clearTimeout(bannerTimerRef.current);
    setIsWarning(true);
    bannerTimerRef.current = setTimeout(() => {
      setIsWarning(false);
      bannerTimerRef.current = null;
    }, BANNER_VISIBLE_MS);
  }, []);

  useEffect(() => {
    if (!lastActivityAt || items.length === 0) {
      setIsWarning(false);
      setSecondsLeft(EXPIRE_MS / 1000);
      firedRef.current = false;
      shownThresholds.current.clear();
      return;
    }

    const tick = async () => {
      const elapsed = Date.now() - lastActivityAt;
      const remaining = EXPIRE_MS - elapsed;
      const secs = Math.max(0, Math.ceil(remaining / 1000));
      setSecondsLeft(secs);

      // Controlla se siamo appena entrati in una soglia di avviso
      for (const threshold of THRESHOLDS) {
        if (
          remaining <= threshold &&
          remaining > threshold - TICK_MS &&
          !shownThresholds.current.has(threshold)
        ) {
          shownThresholds.current.add(threshold);
          showBannerFor10s();
          break; // mostra un banner alla volta
        }
      }

      // Scadenza
      if (elapsed >= EXPIRE_MS && !firedRef.current) {
        firedRef.current = true;
        if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
        if (bannerTimerRef.current) { clearTimeout(bannerTimerRef.current); bannerTimerRef.current = null; }
        setIsWarning(false);
        await expireCart();
        onExpiredRef.current();
      }
    };

    tick();
    intervalRef.current = setInterval(tick, TICK_MS);

    return () => {
      if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
      if (bannerTimerRef.current) { clearTimeout(bannerTimerRef.current); bannerTimerRef.current = null; }
    };
  }, [lastActivityAt, items.length, expireCart, showBannerFor10s]);

  return { isWarning, secondsLeft, resetTimer };
}