"use client";

import { useEffect, useState } from "react";
import { getMonogram, colorFromString, getFaviconChain } from "@/lib/url";

interface Props {
  url: string;
  title: string;
  /** custom icon URL if the user provided one */
  icon?: string;
  size?: number;
  className?: string;
}

/**
 * Favicon with a multi-provider fallback chain.
 * Tries: user-provided icon → Google → DuckDuckGo → Clearbit → IconHorse → monogram.
 */
export function SmartFavicon({
  url,
  title,
  icon,
  size = 64,
  className = "size-7",
}: Props) {
  const chain = icon ? [icon, ...getFaviconChain(url, size)] : getFaviconChain(url, size);
  const [idx, setIdx] = useState(0);

  // reset chain when the url/icon changes
  useEffect(() => {
    setIdx(0);
  }, [url, icon]);

  const current = chain[idx];

  if (idx >= chain.length || !current) {
    return (
      <span
        className="grid place-items-center w-full h-full text-lg font-semibold text-white"
        style={{ background: colorFromString(title) }}
      >
        {getMonogram(title)}
      </span>
    );
  }

  return (
    <img
      src={current}
      alt=""
      className={className}
      loading="lazy"
      onError={() => setIdx((i) => i + 1)}
    />
  );
}
