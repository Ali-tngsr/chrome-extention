"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  X,
  Settings,
  PlusCircle,
  FolderPlus,
  LayoutDashboard,
  BarChart3,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useNewTabStore } from "@/store/newtab-store";

interface Props {
  onAddShortcut: () => void;
  onAddCategory: () => void;
}

/**
 * Expandable floating action button.
 * Closed: a single accent "+" button.
 * Open: a menu of actions (Add shortcut, New category, Settings).
 */
export function ExpandableFab({
  onAddShortcut,
  onAddCategory,
}: Props) {
  const [open, setOpen] = useState(false);
  const view = useNewTabStore((s) => s.view);
  const setView = useNewTabStore((s) => s.setView);
  const wrapRef = useRef<HTMLDivElement>(null);

  // close on outside click / escape
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const actions = [
    {
      label: "Add shortcut",
      hint: "N",
      icon: PlusCircle,
      onClick: () => {
        setOpen(false);
        onAddShortcut();
      },
    },
    {
      label: "New category",
      hint: "C",
      icon: FolderPlus,
      onClick: () => {
        setOpen(false);
        onAddCategory();
      },
    },
    {
      label: view === "insights" ? "Back to dashboard" : "Insights",
      hint: "",
      icon: view === "insights" ? LayoutDashboard : BarChart3,
      onClick: () => {
        setOpen(false);
        setView(view === "insights" ? "dashboard" : "insights");
      },
    },
    {
      label: view === "settings" ? "Back to dashboard" : "Settings",
      hint: "g s",
      icon: view === "settings" ? LayoutDashboard : Settings,
      onClick: () => {
        setOpen(false);
        setView(view === "settings" ? "dashboard" : "settings");
      },
    },
  ];

  return (
    <div ref={wrapRef} className="fixed bottom-6 right-6 z-40">
      {/* action menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.18, ease: [0.2, 0.8, 0.2, 1] }}
            className="absolute bottom-16 right-0 w-56 nt-glass nt-card rounded-2xl p-1.5 shadow-2xl"
          >
            {actions.map((a, i) => {
              const Icon = a.icon;
              return (
                <motion.button
                  key={a.label}
                  initial={{ opacity: 0, x: 8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03 }}
                  onClick={a.onClick}
                  className="w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-foreground hover:bg-[var(--nt-accent)]/12 transition-colors group"
                >
                  <span className="grid place-items-center size-7 rounded-lg nt-accent-soft shrink-0">
                    <Icon className="size-4" />
                  </span>
                  <span className="flex-1 text-left">{a.label}</span>
                  {a.hint && (
                    <kbd className="nt-kbd opacity-60 group-hover:opacity-100 transition-opacity">
                      {a.hint}
                    </kbd>
                  )}
                </motion.button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* main toggle button */}
      <motion.button
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.94 }}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "relative grid place-items-center size-14 rounded-full shadow-xl transition-all",
          open
            ? "bg-card text-foreground border border-border rotate-0"
            : "text-white border border-white/10"
        )}
        style={
          open
            ? undefined
            : {
                background:
                  "linear-gradient(135deg, var(--nt-accent), color-mix(in srgb, var(--nt-accent) 70%, #a855f7))",
                boxShadow:
                  "0 8px 32px -8px color-mix(in srgb, var(--nt-accent) 60%, transparent), 0 0 0 1px color-mix(in srgb, var(--nt-accent) 30%, transparent)",
              }
        }
        aria-label={open ? "Close menu" : "Open actions menu"}
        aria-expanded={open}
      >
        <AnimatePresence mode="wait" initial={false}>
          {open ? (
            <motion.span
              key="x"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <X className="size-6" />
            </motion.span>
          ) : (
            <motion.span
              key="plus"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <Plus className="size-6" />
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  );
}
