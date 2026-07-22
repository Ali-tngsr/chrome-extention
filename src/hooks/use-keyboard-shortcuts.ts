"use client";

import { useEffect } from "react";
import { useNewTabStore } from "@/store/newtab-store";
import { focusSearch } from "@/lib/search-focus";

function isTypingTarget(el: EventTarget | null): boolean {
  if (!(el instanceof HTMLElement)) return false;
  const tag = el.tagName.toLowerCase();
  return (
    tag === "input" ||
    tag === "textarea" ||
    tag === "select" ||
    el.isContentEditable
  );
}

/**
 * Global keyboard shortcuts for the New Tab dashboard.
 *  /             → focus search
 *  Cmd/Ctrl+,    → go to settings
 *  Esc           → blur search / close (handled per-dialog)
 *  g then d/s    → switch views (Dashboard / Settings)
 *  n             → new shortcut
 *  c             → new category (when not typing)
 *  ?             → keyboard shortcuts help
 */
export function useKeyboardShortcuts(
  onNewShortcut?: () => void,
  onNewCategory?: () => void,
  onHelp?: () => void
) {
  const setView = useNewTabStore((s) => s.setView);
  const setSearchOpen = useNewTabStore((s) => s.setSearchOpen);

  useEffect(() => {
    let lastG = 0;

    const onKeyDown = (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey;

      // Cmd/Ctrl+, — go to settings
      if (mod && e.key === ",") {
        e.preventDefault();
        setView("settings");
        return;
      }

      if (isTypingTarget(e.target)) return;

      // "/" focuses search
      if (e.key === "/" && !mod) {
        e.preventDefault();
        setSearchOpen(true);
        focusSearch();
        return;
      }

      // "n" creates a new shortcut
      if (e.key.toLowerCase() === "n" && !mod) {
        e.preventDefault();
        onNewShortcut?.();
        return;
      }

      // "c" creates a new category
      if (e.key.toLowerCase() === "c" && !mod) {
        e.preventDefault();
        onNewCategory?.();
        return;
      }

      // "?" opens the keyboard shortcuts help overlay
      if (e.key === "?" && !mod) {
        e.preventDefault();
        onHelp?.();
        return;
      }

      // "g" then "d/s" to switch views (Linear-style)
      if (e.key.toLowerCase() === "g" && !mod) {
        lastG = Date.now();
        return;
      }
      const withinG = Date.now() - lastG < 600;
      if (withinG) {
        if (e.key.toLowerCase() === "d") {
          setView("dashboard");
          lastG = 0;
          return;
        }
        if (e.key.toLowerCase() === "s") {
          setView("settings");
          lastG = 0;
          return;
        }
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [setView, setSearchOpen, onNewShortcut, onNewCategory, onHelp]);
}
