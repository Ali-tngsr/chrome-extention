"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Globe,
  CornerDownLeft,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useNewTabStore } from "@/store/newtab-store";
import { registerSearchFocus } from "@/lib/search-focus";
import {
  isUrlLike,
  resolveSearchAction,
  getFaviconUrl,
  SEARCH_ENGINES,
} from "@/lib/url";

// Hardcoded to Google (per user request — only Google is needed).
const engine = SEARCH_ENGINES.google;

interface Suggestion {
  id: string;
  label: string;
  hint?: string;
  url: string;
  icon?: React.ReactNode;
  favicon?: string;
  kind: "shortcut" | "search" | "url" | "recent";
}

export function SearchBar() {
  const shortcuts = useNewTabStore((s) => s.shortcuts);
  const recordOpen = useNewTabStore((s) => s.recordShortcutOpen);

  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const [focused, setFocused] = useState(false);

  const recents = useRecents();

  useEffect(() => {
    registerSearchFocus(() => {
      inputRef.current?.focus();
      inputRef.current?.select();
      setFocused(true);
    });
    return () => registerSearchFocus(null);
  }, []);

  // top shortcuts by opens (for empty-state suggestions)
  const topShortcuts = useMemo(
    () =>
      [...shortcuts]
        .sort((a, b) => (b.opens || 0) - (a.opens || 0))
        .slice(0, 5),
    [shortcuts]
  );

  const suggestions = useMemo<Suggestion[]>(() => {
    const q = query.trim();
    const list: Suggestion[] = [];

    if (q) {
      const isUrl = isUrlLike(q);
      list.push({
        id: "primary",
        label: isUrl ? `Open ${q}` : `Search ${engine.name} for “${q}”`,
        hint: isUrl ? "URL" : engine.name,
        url: resolveSearchAction(q, engine),
        icon: isUrl ? (
          <Globe className="size-4" />
        ) : (
          <Search className="size-4" />
        ),
        kind: isUrl ? "url" : "search",
      });

      const lower = q.toLowerCase();
      const matches = shortcuts
        .filter(
          (s) =>
            s.title.toLowerCase().includes(lower) ||
            s.url.toLowerCase().includes(lower)
        )
        .slice(0, 6)
        .map((s) => ({
          id: s.id,
          label: s.title,
          hint: s.url.replace(/^https?:\/\//, "").replace(/\/$/, ""),
          url: s.url,
          favicon: getFaviconUrl(s.url),
          kind: "shortcut" as const,
        }));
      list.push(...matches);
    } else {
      // recents + top shortcuts when empty
      recents.list.slice(0, 5).forEach((r, i) =>
        list.push({
          id: `recent-${i}`,
          label: r.label,
          hint: r.url,
          url: r.url,
          favicon: getFaviconUrl(r.url),
          kind: "recent",
        })
      );
      if (list.length === 0) {
        topShortcuts.forEach((s) =>
          list.push({
            id: s.id,
            label: s.title,
            hint: s.url.replace(/^https?:\/\//, "").replace(/\/$/, ""),
            url: s.url,
            favicon: getFaviconUrl(s.url),
            kind: "shortcut",
          })
        );
      }
    }
    return list;
  }, [query, shortcuts, engine, recents.list, topShortcuts]);

  useEffect(() => {
    setActive(0);
  }, [query]);

  const open = useCallback(
    (url: string, label: string, id?: string) => {
      recents.add({ url, label });
      if (id) recordOpen(id);
      if (typeof window !== "undefined") {
        window.open(url, "_blank", "noopener,noreferrer");
      }
      setQuery("");
      inputRef.current?.blur();
      setFocused(false);
    },
    [recents, recordOpen]
  );

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const sel = suggestions[active];
      if (sel) open(sel.url, sel.label, sel.kind === "shortcut" ? sel.id : undefined);
      else if (query.trim()) open(resolveSearchAction(query, engine), query.trim());
    } else if (e.key === "Escape") {
      setQuery("");
      inputRef.current?.blur();
      setFocused(false);
    }
  };

  const showDropdown = focused && suggestions.length > 0;

  return (
    <div className="w-full max-w-2xl">
      <motion.div
        layout
        className={cn(
          "nt-glass nt-card relative flex items-center gap-2 rounded-2xl px-4 py-3 transition-all duration-200",
          focused && "ring-2 ring-[var(--nt-accent)]/60"
        )}
      >
        <Search className="size-5 text-muted-foreground shrink-0" />
        <input
          ref={inputRef}
          data-nt-search="true"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 150)}
          onKeyDown={onKeyDown}
          aria-label="Search the web or open a shortcut"
          placeholder={`Search ${engine.name} or type a URL`}
          className="flex-1 bg-transparent text-base sm:text-lg outline-none placeholder:text-muted-foreground/90 min-w-0"
          autoComplete="off"
          spellCheck={false}
        />
        <kbd className="nt-kbd hidden sm:inline-flex shrink-0">/</kbd>
      </motion.div>

      <AnimatePresence>
        {showDropdown && (
          <motion.ul
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.16, ease: [0.2, 0.8, 0.2, 1] }}
            role="listbox"
            className="nt-glass nt-card mt-2 overflow-hidden rounded-2xl py-2 max-h-80 overflow-y-auto nt-scroll"
          >
            {suggestions.map((s, i) => (
              <li
                key={s.id}
                role="option"
                aria-selected={i === active}
                onMouseDown={(e) => {
                  e.preventDefault();
                  open(s.url, s.label, s.kind === "shortcut" ? s.id : undefined);
                }}
                onMouseEnter={() => setActive(i)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 mx-1.5 rounded-xl cursor-default transition-colors",
                  i === active && "bg-[var(--nt-accent)]/12"
                )}
              >
                <span className="grid place-items-center size-7 rounded-lg bg-muted/60 shrink-0 overflow-hidden">
                  {s.icon ? (
                    s.icon
                  ) : s.favicon ? (
                     
                    <img
                      src={s.favicon}
                      alt=""
                      className="size-4"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).style.visibility =
                          "hidden";
                      }}
                    />
                  ) : null}
                </span>
                <span className="flex-1 min-w-0">
                  <span className="block text-sm font-medium truncate">
                    {s.label}
                  </span>
                  {s.hint && (
                    <span className="block text-xs text-muted-foreground truncate">
                      {s.hint}
                    </span>
                  )}
                </span>
                {s.kind === "recent" && (
                  <Clock className="size-3.5 text-muted-foreground" />
                )}
                {i === active && (
                  <CornerDownLeft className="size-3.5 text-muted-foreground" />
                )}
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ---------- Recent searches (localStorage) ---------- */
interface Recent {
  url: string;
  label: string;
  ts: number;
}

function useRecents() {
  const [list, setList] = useState<Recent[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("nt-recents");
      if (raw) setList(JSON.parse(raw));
    } catch {
      /* ignore */
    }
  }, []);

  const add = useCallback(
    (r: { url: string; label: string }) => {
      setList((prev) => {
        const next = [
          { ...r, ts: Date.now() },
          ...prev.filter((p) => p.url !== r.url),
        ].slice(0, 8);
        try {
          localStorage.setItem("nt-recents", JSON.stringify(next));
        } catch {
          /* ignore */
        }
        return next;
      });
    },
    []
  );

  return { list, add };
}
