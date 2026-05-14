"use client";

import { useEffect } from "react";

/**
 * Mounts once in the root layout and silently registers /sw.js.
 * No UI — purely a side-effect component.
 */
export function ServiceWorkerRegistrar() {
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;

    navigator.serviceWorker
      .register("/sw.js", { scope: "/", updateViaCache: "none" })
      .then((registration) => {
        console.log("[SW] Registered, scope:", registration.scope);
      })
      .catch((err) => {
        console.warn("[SW] Registration failed:", err);
      });
  }, []);

  return null;
}
