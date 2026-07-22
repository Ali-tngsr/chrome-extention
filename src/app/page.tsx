"use client";

import dynamic from "next/dynamic";

// The dashboard uses browser-only APIs (localStorage, window) so render it
// client-only to avoid hydration mismatches.
const NewTabApp = dynamic(
  () => import("@/components/newtab/NewTabApp").then((m) => m.NewTabApp),
  { ssr: false, loading: () => <NewTabShell /> }
);

function NewTabShell() {
  return (
    <div className="nt-app dark min-h-screen flex items-center justify-center bg-background text-foreground">
      <div className="nt-aurora" aria-hidden />
      <div className="relative z-10 flex flex-col items-center gap-4">
        <div className="size-10 rounded-xl bg-[var(--nt-accent)] animate-pulse" />
        <p className="text-sm text-muted-foreground">Loading dashboard…</p>
      </div>
    </div>
  );
}

export default function Home() {
  return <NewTabApp />;
}
