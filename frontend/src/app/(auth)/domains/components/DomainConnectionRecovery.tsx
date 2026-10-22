"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { refreshCloudflareConnection } from "../[id]/actions";

export function DomainConnectionRecovery({ domainId }: { domainId: string }) {
  const router = useRouter();

  useEffect(() => {
    let active = true;
    let checking = false;
    const check = async () => {
      if (checking) return;
      checking = true;
      try {
        const result = await refreshCloudflareConnection(domainId);
        if (active && result.success) router.refresh();
      } catch (error) {
        console.error(`Failed to refresh Cloudflare zone for ${domainId}:`, error);
      } finally {
        checking = false;
      }
    };

    void check();
    const timer = window.setInterval(() => void check(), 60_000);
    return () => {
      active = false;
      window.clearInterval(timer);
    };
  }, [domainId, router]);

  return null;
}
