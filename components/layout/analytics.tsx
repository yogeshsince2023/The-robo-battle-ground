"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

// Fires a single POST per client-side navigation.
// No cookies, no fingerprinting, no PII stored.
export function Analytics() {
  const pathname = usePathname();
  const prev = useRef("");

  useEffect(() => {
    if (pathname === prev.current) return;
    prev.current = pathname;

    // ponytail: navigator.sendBeacon is lighter than fetch for fire-and-forget
    const payload = JSON.stringify({
      page: pathname,
      referrer: document.referrer || null,
    });

    if (navigator.sendBeacon) {
      navigator.sendBeacon(
        "/api/analytics/pageview",
        new Blob([payload], { type: "application/json" })
      );
    } else {
      fetch("/api/analytics/pageview", {
        method: "POST",
        body: payload,
        keepalive: true,
      }).catch(() => {});
    }
  }, [pathname]);

  return null;
}
