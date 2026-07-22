"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { ArrowUpRight, Flame, TrendingUp, Clock } from "lucide-react";
import { useNewTabStore } from "@/store/newtab-store";
import { SmartFavicon } from "./SmartFavicon";
import { getHostname } from "@/lib/url";

/**
 * Insights view: shows most-opened shortcuts as a ranked list,
 * plus total stats. Read-only (no editing).
 */
export function InsightsView() {
  const shortcuts = useNewTabStore((s) => s.shortcuts);
  const categories = useNewTabStore((s) => s.categories);

  const ranked = useMemo(
    () =>
      [...shortcuts]
        .filter((s) => (s.opens || 0) > 0)
        .sort((a, b) => (b.opens || 0) - (a.opens || 0))
        .slice(0, 20),
    [shortcuts]
  );

  const totalOpens = useMemo(
    () => shortcuts.reduce((sum, s) => sum + (s.opens || 0), 0),
    [shortcuts]
  );

  const recent = useMemo(
    () =>
      [...shortcuts]
        .filter((s) => s.lastOpened)
        .sort((a, b) => (b.lastOpened || 0) - (a.lastOpened || 0))
        .slice(0, 5),
    [shortcuts]
  );

  const maxOpens = ranked[0]?.opens || 1;
  const catName = (id: string) =>
    categories.find((c) => c.id === id)?.name || "—";

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="max-w-3xl mx-auto space-y-5"
    >
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Insights</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Your usage patterns at a glance.
        </p>
      </header>

      {/* Stat cards */}
      <div className="grid grid-cols-3 gap-3">
        <StatCard
          icon={<TrendingUp className="size-4" />}
          label="Total opens"
          value={totalOpens}
        />
        <StatCard
          icon={<Flame className="size-4" />}
          label="Active shortcuts"
          value={ranked.length}
        />
        <StatCard
          icon={<Clock className="size-4" />}
          label="Total shortcuts"
          value={shortcuts.length}
        />
      </div>

      {/* Most opened ranking */}
      <section className="nt-card rounded-3xl p-5 sm:p-6">
        <div className="flex items-center gap-2.5 mb-4">
          <span className="grid place-items-center size-8 rounded-lg nt-accent-soft">
            <Flame className="size-4" />
          </span>
          <div>
            <h2 className="text-sm font-semibold">Most opened</h2>
            <p className="text-xs text-muted-foreground">
              Your top shortcuts by usage
            </p>
          </div>
        </div>

        {ranked.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <span className="grid place-items-center size-12 rounded-2xl nt-accent-soft mb-3">
              <TrendingUp className="size-5" />
            </span>
            <p className="text-sm font-medium">No data yet</p>
            <p className="text-xs text-muted-foreground mt-1 max-w-xs">
              Open some shortcuts and they'll appear here ranked by frequency.
            </p>
          </div>
        ) : (
          <ul className="space-y-1.5">
            {ranked.map((s, i) => (
              <motion.li
                key={s.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
              >
                <a
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => {
                    e.preventDefault();
                    window.open(s.url, "_blank", "noopener,noreferrer");
                  }}
                  className="group flex items-center gap-3 rounded-xl px-2.5 py-2 hover:bg-muted/50 transition-colors"
                >
                  <span className="text-sm font-bold tabular-nums text-muted-foreground w-5 text-center shrink-0">
                    {i + 1}
                  </span>
                  <span className="grid place-items-center size-8 rounded-lg overflow-hidden bg-muted shrink-0">
                    <SmartFavicon
                      url={s.url}
                      title={s.title}
                      icon={s.icon}
                      className="size-4"
                    />
                  </span>
                  <span className="flex-1 min-w-0">
                    <span className="block text-sm font-medium truncate">
                      {s.title}
                    </span>
                    <span className="block text-xs text-muted-foreground truncate">
                      {catName(s.categoryId)} · {getHostname(s.url)}
                    </span>
                  </span>
                  {/* bar */}
                  <span className="hidden sm:block h-1.5 rounded-full bg-[var(--nt-accent)]/30 overflow-hidden w-24 shrink-0">
                    <span
                      className="block h-full rounded-full bg-[var(--nt-accent)]"
                      style={{
                        width: `${Math.max(
                          8,
                          ((s.opens || 0) / maxOpens) * 100
                        )}%`,
                      }}
                    />
                  </span>
                  <span className="text-sm font-semibold tabular-nums text-foreground w-8 text-right shrink-0">
                    {s.opens}
                  </span>
                  <ArrowUpRight className="size-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                </a>
              </motion.li>
            ))}
          </ul>
        )}
      </section>

      {/* Recently opened */}
      {recent.length > 0 && (
        <section className="nt-card rounded-3xl p-5 sm:p-6">
          <div className="flex items-center gap-2.5 mb-4">
            <span className="grid place-items-center size-8 rounded-lg nt-accent-soft">
              <Clock className="size-4" />
            </span>
            <div>
              <h2 className="text-sm font-semibold">Recently opened</h2>
              <p className="text-xs text-muted-foreground">
                Your last 5 opened shortcuts
              </p>
            </div>
          </div>
          <ul className="space-y-1.5">
            {recent.map((s, i) => (
              <li key={s.id}>
                <a
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => {
                    e.preventDefault();
                    window.open(s.url, "_blank", "noopener,noreferrer");
                  }}
                  className="group flex items-center gap-3 rounded-xl px-2.5 py-2 hover:bg-muted/50 transition-colors"
                >
                  <span className="grid place-items-center size-7 rounded-lg overflow-hidden bg-muted shrink-0">
                    <SmartFavicon
                      url={s.url}
                      title={s.title}
                      icon={s.icon}
                      className="size-3.5"
                    />
                  </span>
                  <span className="flex-1 min-w-0">
                    <span className="block text-sm font-medium truncate">
                      {s.title}
                    </span>
                  </span>
                  <span className="text-xs text-muted-foreground tabular-nums shrink-0">
                    {timeAgo(s.lastOpened)}
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}
    </motion.div>
  );
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
}) {
  return (
    <div className="nt-card rounded-2xl p-4 flex flex-col items-center text-center gap-1">
      <span className="grid place-items-center size-8 rounded-lg nt-accent-soft mb-0.5">
        {icon}
      </span>
      <span className="text-2xl font-bold tabular-nums leading-none">
        {value}
      </span>
      <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
        {label}
      </span>
    </div>
  );
}

function timeAgo(ts?: number): string {
  if (!ts) return "";
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}
