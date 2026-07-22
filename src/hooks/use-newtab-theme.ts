"use client";

import { useEffect } from "react";
import { useNewTabStore } from "@/store/newtab-store";

/**
 * Applies theme (dark/light/system), accent color, card radius, density
 * and animation toggling to the New Tab root element + <html>.
 */
export function useApplyTheme(rootRef: React.RefObject<HTMLElement | null>) {
  const settings = useNewTabStore((s) => s.settings);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const apply = (isDark: boolean) => {
      root.classList.toggle("dark", isDark);
      document.documentElement.classList.toggle("dark", isDark);
    };

    if (settings.theme === "system") {
      const mq = window.matchMedia("(prefers-color-scheme: dark)");
      apply(mq.matches);
      const handler = (e: MediaQueryListEvent) => apply(e.matches);
      mq.addEventListener("change", handler);
      return () => mq.removeEventListener("change", handler);
    } else {
      apply(settings.theme === "dark");
    }
  }, [settings.theme, rootRef]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    root.style.setProperty("--nt-accent", settings.accent);
    const rgb = hexToRgb(settings.accent);
    if (rgb) root.style.setProperty("--nt-accent-rgb", rgb.join(", "));
    root.style.setProperty("--nt-radius", `${settings.radius}rem`);
    root.style.setProperty("--nt-glass", `${settings.glassIntensity}%`);
  }, [settings.accent, settings.radius, settings.glassIntensity, rootRef]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    root.classList.toggle("density-compact", settings.density === "compact");
  }, [settings.density, rootRef]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    root.classList.toggle("no-anim", !settings.animations);
  }, [settings.animations, rootRef]);
}

function hexToRgb(hex: string): [number, number, number] | null {
  const m = hex.replace("#", "").match(/^([0-9a-f]{6}|[0-9a-f]{3})$/i);
  if (!m) return null;
  let h = m[1];
  if (h.length === 3) {
    h = h
      .split("")
      .map((c) => c + c)
      .join("");
  }
  const num = parseInt(h, 16);
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
}
