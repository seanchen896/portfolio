"use client";

import { useEffect, useState } from "react";

/** Live local clock, à la the Bill Chien hero footer. */
export function LiveClock({ tz = "America/Los_Angeles" }: { tz?: string }) {
  const [now, setNow] = useState<string>("—:—");

  useEffect(() => {
    const fmt = new Intl.DateTimeFormat("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
      timeZone: tz,
    });
    const tick = () => setNow(fmt.format(new Date()));
    tick();
    const id = setInterval(tick, 1000 * 15);
    return () => clearInterval(id);
  }, [tz]);

  return <span suppressHydrationWarning>{now}</span>;
}
