"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useNewTabStore } from "@/store/newtab-store";

function greetingFor(hour: number): string {
  if (hour < 5) return "Good night";
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export function Greeting() {
  const [now, setNow] = useState<Date | null>(null);
  const clockFormat = useNewTabStore((s) => s.settings.clockFormat);
  const showSeconds = useNewTabStore((s) => s.settings.showSeconds);
  const userName = useNewTabStore((s) => s.settings.userName);

  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const time = useMemo(() => {
    if (!now) return "--:--";
    return now.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      second: showSeconds ? "2-digit" : undefined,
      hour12: clockFormat === "12h",
    });
  }, [now, clockFormat, showSeconds]);

  const date = useMemo(() => {
    if (!now) return "";
    return now.toLocaleDateString([], {
      weekday: "long",
      month: "long",
      day: "numeric",
    });
  }, [now]);

  const greeting = now ? greetingFor(now.getHours()) : "Hello";
  const name = userName.trim();

  // Avoid hydration mismatch: render stable placeholder until mounted
  return (
    <motion.div
      initial={false}
      className="flex flex-col items-center text-center select-none"
    >
      <div className="text-5xl sm:text-6xl font-semibold tracking-tight tabular-nums nt-gradient-text">
        {time}
      </div>
      <p className="mt-2 text-base sm:text-lg text-muted-foreground">
        <span className="text-foreground font-medium">{greeting}</span>
        {name && <span className="text-foreground font-medium">, {name}</span>}
        <span className="mx-2 opacity-40">·</span>
        <span>{date}</span>
      </p>
    </motion.div>
  );
}
