// src/app/staff/page.tsx

"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getUserProfile } from "@/lib/auth-service";

export default function StaffPage() {
  const router = useRouter();

  useEffect(() => {
    const check = async () => {
      try {
        const profile = await getUserProfile();
        if (profile.role !== "staff" && profile.role !== "manager" && profile.role !== "admin") {
          router.push("/login");
        }
      } catch {
        router.push("/login");
      }
    };
    check();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-900">
      <p>Caricamento staff...</p>
    </div>
  );
}