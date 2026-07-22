import { useEffect } from "react";
import { useStore } from "@/store/useStore";
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
 *  /          → focus search
 *  Cmd/Ctrl+K → focus search (command-palette style)
 *  Esc        → blur search / handled per-dialog
 *  g then d/c/s → switch views (Dashboard / Categories / Settings)
 */
export function useKeyboardShortcuts() {
  const setView = useStore((s) => s.setView);
  const setSearchOpen = useStore((s) => s.setSearchOpen);

  useEffect(() => {
    let lastG = 0;

    const onKeyDown = (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey;

      // Cmd/Ctrl+K — always focus search
      if (mod && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen(true);
        focusSearch();
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

      // "g" then "d/c/s" to switch views (Linear-style)
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
        if (e.key.toLowerCase() === "c") {
          setView("categories");
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
  }, [setView, setSearchOpen]);
}
