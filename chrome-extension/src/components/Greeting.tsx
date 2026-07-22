import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useStore } from "@/store/useStore";

function greeting(d: Date): string {
  const h = d.getHours();
  if (h < 5) return "Good night";
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  if (h < 21) return "Good evening";
  return "Good night";
}

function formatTime(d: Date): string {
  return d
    .toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    .replace(/^0/, "");
}

function formatDate(d: Date): string {
  return d.toLocaleDateString([], {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

export function Greeting() {
  const showClock = useStore((s) => s.settings.showClock);
  const [now, setNow] = useState<Date>(() => new Date());

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 1000 * 15);
    return () => window.clearInterval(id);
  }, []);

  if (!showClock) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="text-center mb-6"
    >
      <div className="text-4xl sm:text-5xl font-semibold tracking-tight nt-gradient-text">
        {formatTime(now)}
      </div>
      <div className="mt-2 text-sm text-muted-foreground">
        {greeting(now)} · {formatDate(now)}
      </div>
    </motion.div>
  );
}
