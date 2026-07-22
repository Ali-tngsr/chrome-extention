"use client";

import { motion } from "framer-motion";
import { useNewTabStore } from "@/store/newtab-store";
import { SmartFavicon } from "./SmartFavicon";

/**
 * Compact row of quick-launch site chips, shown under the search bar.
 * Sites are fully user-customizable via Settings (add/remove).
 */
export function QuickLaunch() {
  const sites = useNewTabStore((s) => s.settings.quickLaunchSites);
  const showQuickLaunch = useNewTabStore((s) => s.settings.showQuickLaunch);

  if (!showQuickLaunch || sites.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: 0.05 }}
      className="flex items-center justify-center gap-2 flex-wrap max-w-2xl"
    >
      {sites.map((s, i) => (
        <motion.button
          key={`${s.url}-${i}`}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.18, delay: 0.04 * i }}
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.96 }}
          onClick={() =>
            window.open(s.url, "_blank", "noopener,noreferrer")
          }
          className="group flex items-center gap-2 rounded-full border border-border bg-card/60 backdrop-blur px-3 py-1.5 text-sm font-medium hover:border-[var(--nt-accent)]/50 hover:bg-card transition-colors"
          title={`Open ${s.title}`}
        >
          <span className="grid place-items-center size-5 rounded-full overflow-hidden bg-muted shrink-0">
            <SmartFavicon url={s.url} title={s.title} className="size-3.5" />
          </span>
          <span className="text-foreground/80 group-hover:text-foreground transition-colors">
            {s.title}
          </span>
        </motion.button>
      ))}
    </motion.div>
  );
}
