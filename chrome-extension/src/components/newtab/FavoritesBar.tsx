"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { Flame, ArrowUpRight } from "lucide-react";
import { useNewTabStore } from "@/store/newtab-store";
import { SmartFavicon } from "./SmartFavicon";

/**
 * Compact horizontal bar of the most-opened shortcuts.
 * Renders above the categories on the dashboard.
 */
export function FavoritesBar() {
  const shortcuts = useNewTabStore((s) => s.shortcuts);
  const recordOpen = useNewTabStore((s) => s.recordShortcutOpen);

  const favorites = useMemo(
    () =>
      [...shortcuts]
        .filter((s) => (s.opens || 0) > 0)
        .sort((a, b) => (b.opens || 0) - (a.opens || 0))
        .slice(0, 8),
    [shortcuts]
  );

  if (favorites.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="w-full max-w-5xl"
    >
      <div className="flex items-center gap-2 mb-2.5 px-1">
        <Flame className="size-3.5 text-[var(--nt-accent)]" />
        <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          Frequently visited
        </span>
      </div>
      <div className="flex items-center gap-2 overflow-x-auto nt-scroll pb-1 -mx-1 px-1">
        {favorites.map((s, i) => (
          <motion.a
            key={s.id}
            href={s.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => {
              e.preventDefault();
              recordOpen(s.id);
              window.open(s.url, "_blank", "noopener,noreferrer");
            }}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2, delay: i * 0.03 }}
            whileHover={{ y: -2 }}
            className="group nt-glass nt-card flex items-center gap-2.5 rounded-xl px-3 py-2 shrink-0 cursor-pointer hover:border-[var(--nt-accent)]/40 transition-colors"
            title={`${s.title} · ${s.opens} opens`}
          >
            <span className="grid place-items-center size-7 rounded-lg overflow-hidden bg-muted shrink-0">
              <SmartFavicon
                url={s.url}
                title={s.title}
                icon={s.icon}
                className="size-4"
              />
            </span>
            <span className="text-sm font-medium whitespace-nowrap max-w-[120px] truncate">
              {s.title}
            </span>
            <span className="text-[10px] text-muted-foreground tabular-nums bg-muted/60 rounded-md px-1.5 py-0.5">
              {s.opens}
            </span>
            <ArrowUpRight className="size-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
          </motion.a>
        ))}
      </div>
    </motion.div>
  );
}
