import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Globe, Search as SearchIcon, CornerDownLeft } from "lucide-react";
import { useStore } from "@/store/useStore";
import { registerSearchFocus } from "@/lib/search-focus";
import {
  isUrlLike,
  normalizeUrl,
  googleSearchUrl,
  getFaviconUrl,
} from "@/lib/url";
import type { SearchSuggestion } from "@/types";

const MAX_RESULTS = 8;

export function SearchBar() {
  const shortcuts = useStore((s) => s.shortcuts);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Register / clear the search focus function so global shortcuts can call it.
  useEffect(() => {
    registerSearchFocus(() => {
      inputRef.current?.focus();
      inputRef.current?.select();
    });
    return () => registerSearchFocus(null);
  }, []);

  const suggestions = useMemo<SearchSuggestion[]>(() => {
    const q = query.trim().toLowerCase();
    const list: SearchSuggestion[] = [];
    if (q) {
      const matched = shortcuts
        .filter(
          (s) =>
            s.title.toLowerCase().includes(q) ||
            s.url.toLowerCase().includes(q)
        )
        .slice(0, MAX_RESULTS)
        .map((s) => ({
          kind: "shortcut" as const,
          id: s.id,
          title: s.title,
          url: s.url,
        }));
      list.push(...matched);

      if (isUrlLike(query.trim())) {
        list.push({
          kind: "url",
          url: normalizeUrl(query.trim()),
          label: query.trim(),
        });
      }
      list.push({ kind: "search", query: query.trim() });
    }
    return list;
  }, [query, shortcuts]);

  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  const openUrl = (url: string) => {
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const submit = (s?: SearchSuggestion) => {
    const q = query.trim();
    if (!q) return;
    if (s?.kind === "shortcut") {
      openUrl(s.url);
    } else if (s?.kind === "url") {
      openUrl(s.url);
    } else if (s?.kind === "search") {
      openUrl(googleSearchUrl(q));
    } else {
      // fallback: same logic as resolveSearchAction
      if (isUrlLike(q)) openUrl(normalizeUrl(q));
      else openUrl(googleSearchUrl(q));
    }
    setQuery("");
    inputRef.current?.blur();
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const sel = suggestions[activeIndex];
      submit(sel);
    } else if (e.key === "Escape") {
      setQuery("");
      inputRef.current?.blur();
    }
  };

  return (
    <div className="relative w-full max-w-2xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 8, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.25 }}
        className={`nt-glass nt-card rounded-2xl flex items-center gap-3 px-4 py-3 transition-shadow ${
          focused ? "ring-2 ring-[var(--nt-accent)]" : ""
        }`}
      >
        <SearchIcon
          className="shrink-0 text-muted-foreground"
          size={20}
          aria-hidden
        />
        <input
          ref={inputRef}
          type="text"
          value={query}
          data-nt-search="true"
          aria-label="Search the web or open a shortcut"
          placeholder="Search Google or type a URL"
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => {
            // delay so click on suggestion still fires
            window.setTimeout(() => setFocused(false), 120);
          }}
          onKeyDown={onKeyDown}
          className="flex-1 bg-transparent outline-none text-base placeholder:text-muted-foreground text-foreground"
          autoComplete="off"
          spellCheck={false}
        />
        <kbd className="nt-kbd hidden sm:inline-flex">/</kbd>
      </motion.div>

      <AnimatePresence>
        {focused && suggestions.length > 0 && (
          <motion.ul
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="absolute z-30 left-0 right-0 mt-2 nt-glass nt-card rounded-xl overflow-hidden nt-scroll max-h-80 overflow-y-auto"
            role="listbox"
            aria-label="Search suggestions"
          >
            {suggestions.map((s, i) => (
              <li
                key={`${s.kind}-${i}`}
                role="option"
                aria-selected={i === activeIndex}
                onMouseDown={(e) => {
                  e.preventDefault();
                  submit(s);
                }}
                onMouseEnter={() => setActiveIndex(i)}
                className={`flex items-center gap-3 px-4 py-2.5 cursor-pointer transition-colors ${
                  i === activeIndex ? "bg-[var(--muted)]" : ""
                }`}
              >
                <span className="shrink-0 w-6 h-6 flex items-center justify-center">
                  {s.kind === "shortcut" ? (
                    <img
                      src={getFaviconUrl(s.url)}
                      alt=""
                      className="w-5 h-5 rounded"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).style.visibility =
                          "hidden";
                      }}
                    />
                  ) : s.kind === "url" ? (
                    <Globe size={16} className="text-muted-foreground" />
                  ) : (
                    <SearchIcon size={16} className="text-muted-foreground" />
                  )}
                </span>
                <span className="flex-1 min-w-0">
                  <span className="block truncate text-sm text-foreground">
                    {s.kind === "shortcut"
                      ? s.title
                      : s.kind === "url"
                      ? s.label
                      : `Search Google for “${s.query}”`}
                  </span>
                  {s.kind === "shortcut" && (
                    <span className="block truncate text-xs text-muted-foreground">
                      {s.url}
                    </span>
                  )}
                </span>
                {i === activeIndex && (
                  <CornerDownLeft
                    size={14}
                    className="text-muted-foreground shrink-0"
                  />
                )}
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}
