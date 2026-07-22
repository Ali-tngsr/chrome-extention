"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}

interface Shortcut {
  keys: string[];
  desc: string;
}

const GROUPS: { title: string; items: Shortcut[] }[] = [
  {
    title: "Search",
    items: [
      { keys: ["/"], desc: "Focus the search bar" },
      { keys: ["↑", "↓"], desc: "Navigate suggestions" },
      { keys: ["Enter"], desc: "Open selected result" },
      { keys: ["Esc"], desc: "Close / blur search" },
    ],
  },
  {
    title: "Navigation",
    items: [
      { keys: ["Ctrl", ","], desc: "Go to settings" },
      { keys: ["g", "d"], desc: "Go to dashboard" },
      { keys: ["g", "s"], desc: "Go to settings" },
    ],
  },
  {
    title: "Create",
    items: [
      { keys: ["n"], desc: "New shortcut" },
      { keys: ["c"], desc: "New category" },
    ],
  },
  {
    title: "Help",
    items: [{ keys: ["?"], desc: "Show this help overlay" }],
  },
];

export function ShortcutsHelp({ open, onOpenChange }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogTitle>Keyboard shortcuts</DialogTitle>
        <DialogDescription>
          Press these keys anywhere on the dashboard to navigate faster.
        </DialogDescription>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5 mt-3">
          {GROUPS.map((g) => (
            <div key={g.title}>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2.5">
                {g.title}
              </h3>
              <ul className="space-y-2">
                {g.items.map((s) => (
                  <li
                    key={s.desc}
                    className="flex items-center justify-between gap-3"
                  >
                    <span className="text-sm text-foreground/80">
                      {s.desc}
                    </span>
                    <span className="flex items-center gap-1 shrink-0">
                      {s.keys.map((k, i) => (
                        <span key={i} className="flex items-center gap-1">
                          {i > 0 && (
                            <span className="text-muted-foreground text-xs">
                              +
                            </span>
                          )}
                          <kbd className="nt-kbd">{k}</kbd>
                        </span>
                      ))}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <p className="mt-4 text-xs text-muted-foreground text-center">
          Tip: press <kbd className="nt-kbd">?</kbd> anywhere to reopen this.
        </p>
      </DialogContent>
    </Dialog>
  );
}

void motion;
void AnimatePresence;
