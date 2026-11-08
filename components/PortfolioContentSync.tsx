"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { contentUpdateEvent, contentUpdateKey } from "@/lib/content-updates";

export function PortfolioContentSync() {
  const pathname = usePathname();
  const router = useRouter();
  useEffect(() => {
    // Refresh public previews only; keep drafts and the editor's visit-only session intact.
    if (pathname.startsWith("/editor")) return;
    let pending = false;
    let timer: ReturnType<typeof setTimeout>;
    const revision = () => { try { return localStorage.getItem(contentUpdateKey); } catch { return null; } };
    let seen = revision();
    function refresh() {
      clearTimeout(timer);
      if (!pending || document.hidden) return;
      if (document.documentElement.dataset.intro || document.documentElement.dataset.transition || document.querySelector("dialog[open]")) {
        timer = setTimeout(refresh, 300); return;
      }
      pending = false; seen = revision(); router.refresh();
    }
    function changed() { pending = true; clearTimeout(timer); timer = setTimeout(refresh, 150); }
    function storage(event: StorageEvent) { if (event.key === contentUpdateKey) changed(); }
    function foreground() { if (revision() !== seen) pending = true; refresh(); }
    const channel = typeof BroadcastChannel === "undefined" ? null : new BroadcastChannel(contentUpdateKey);
    channel?.addEventListener("message", changed);
    window.addEventListener("storage", storage);
    window.addEventListener(contentUpdateEvent, changed);
    window.addEventListener("focus", foreground);
    document.addEventListener("visibilitychange", foreground);
    return () => {
      clearTimeout(timer); channel?.close();
      window.removeEventListener("storage", storage);
      window.removeEventListener(contentUpdateEvent, changed);
      window.removeEventListener("focus", foreground);
      document.removeEventListener("visibilitychange", foreground);
    };
  }, [pathname, router]);
  return null;
}
