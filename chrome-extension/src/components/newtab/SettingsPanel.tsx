"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Monitor,
  Moon,
  Sun,
  Palette,
  RotateCcw,
  Gauge,
  Columns3,
  Sparkles,
  Clock,
  Check,
  Image as ImageIcon,
  Flame,
  Expand,
  Droplets,
  Download,
  Upload,
  Database,
  Zap,
  Plus,
  Trash2,
  Keyboard,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  useNewTabStore,
  ACCENT_PRESETS,
  DEFAULT_SETTINGS,
} from "@/store/newtab-store";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { ThemeMode, Density, BackgroundStyle } from "@/types/newtab";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const THEMES: { key: ThemeMode; label: string; icon: typeof Sun }[] = [
  { key: "light", label: "Light", icon: Sun },
  { key: "dark", label: "Dark", icon: Moon },
  { key: "system", label: "System", icon: Monitor },
];

const SHORTCUTS: { keys: string[]; desc: string }[] = [
  { keys: ["/"], desc: "Focus the search bar" },
  { keys: ["↑", "↓"], desc: "Navigate search suggestions" },
  { keys: ["Enter"], desc: "Open selected result" },
  { keys: ["Esc"], desc: "Close dialog / blur search" },
  { keys: ["Ctrl", ","], desc: "Go to settings" },
  { keys: ["g", "d"], desc: "Go to dashboard" },
  { keys: ["g", "s"], desc: "Go to settings" },
  { keys: ["n"], desc: "New shortcut" },
  { keys: ["c"], desc: "New category" },
  { keys: ["?"], desc: "Show keyboard shortcuts help" },
];

export function SettingsPanel({
  onOpenImportExport,
}: {
  onOpenImportExport?: () => void;
}) {
  const settings = useNewTabStore((s) => s.settings);
  const update = useNewTabStore((s) => s.updateSettings);
  const resetAll = useNewTabStore((s) => s.resetAll);
  const addQuickSite = useNewTabStore((s) => s.addQuickLaunchSite);
  const removeQuickSite = useNewTabStore((s) => s.removeQuickLaunchSite);
  const categoryCount = useNewTabStore((s) => s.categories.length);
  const shortcutCount = useNewTabStore((s) => s.shortcuts.length);

  // local state for the add-quick-site form
  const [newSiteTitle, setNewSiteTitle] = useState("");
  const [newSiteUrl, setNewSiteUrl] = useState("");

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="max-w-3xl mx-auto space-y-5"
    >
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Personalize your new tab. Everything syncs automatically.
          </p>
        </div>
      </header>

      {/* Appearance */}
      <Section
        icon={<Sun className="size-4" />}
        title="Appearance"
        desc="Choose how the dashboard looks."
      >
        <Row label="Theme">
          <div className="grid grid-cols-3 gap-2 w-full max-w-sm">
            {THEMES.map((t) => {
              const Icon = t.icon;
              const active = settings.theme === t.key;
              return (
                <button
                  key={t.key}
                  onClick={() => update({ theme: t.key })}
                  className={cn(
                    "flex flex-col items-center gap-2 rounded-xl border px-3 py-3 text-xs font-medium transition-all",
                    active
                      ? "border-[var(--nt-accent)] bg-[var(--nt-accent)]/10 text-foreground"
                      : "border-border text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  )}
                >
                  <Icon className="size-4" />
                  {t.label}
                </button>
              );
            })}
          </div>
        </Row>

        <Row label="Accent color" icon={<Palette className="size-4" />}>
          <div className="flex flex-wrap items-center gap-2 w-full">
            {ACCENT_PRESETS.map((p) => (
              <button
                key={p.value}
                onClick={() => update({ accent: p.value })}
                title={p.name}
                className={cn(
                  "size-7 rounded-full grid place-items-center transition-transform hover:scale-110 ring-offset-2 ring-offset-background",
                  settings.accent === p.value && "ring-2 ring-foreground/40"
                )}
                style={{ background: p.value }}
              >
                {settings.accent === p.value && (
                  <Check className="size-3.5 text-white" />
                )}
              </button>
            ))}
            <label
              className="size-7 rounded-full border border-dashed border-border grid place-items-center cursor-pointer hover:border-[var(--nt-accent)] transition-colors relative overflow-hidden"
              title="Custom color"
            >
              <input
                type="color"
                value={settings.accent}
                onChange={(e) => update({ accent: e.target.value })}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
              <Palette className="size-3 text-muted-foreground" />
            </label>
          </div>
        </Row>
      </Section>

      {/* Layout */}
      <Section
        icon={<Gauge className="size-4" />}
        title="Layout"
        desc="Fine-tune spacing and density."
      >
        <Row label="Card radius">
          <div className="flex items-center gap-3 w-full max-w-xs">
            <Slider
              value={[settings.radius]}
              min={0.25}
              max={2}
              step={0.25}
              onValueChange={(v) => update({ radius: v[0] })}
              className="flex-1"
            />
            <span className="text-sm tabular-nums text-muted-foreground w-12 text-right">
              {settings.radius.toFixed(2)}rem
            </span>
          </div>
        </Row>

        <Row label="Grid density">
          <div className="grid grid-cols-2 gap-2 w-full max-w-xs">
            {(["comfortable", "compact"] as Density[]).map((d) => (
              <button
                key={d}
                onClick={() => update({ density: d })}
                className={cn(
                  "rounded-xl border px-3 py-2 text-xs font-medium capitalize transition-all",
                  settings.density === d
                    ? "border-[var(--nt-accent)] bg-[var(--nt-accent)]/10"
                    : "border-border text-muted-foreground hover:bg-muted/50"
                )}
              >
                {d}
              </button>
            ))}
          </div>
        </Row>

        <Row label="Columns per row" icon={<Columns3 className="size-4" />}>
          <div className="flex items-center gap-3 w-full max-w-xs">
            <Slider
              value={[settings.columns]}
              min={3}
              max={10}
              step={1}
              onValueChange={(v) => update({ columns: v[0] })}
              className="flex-1"
            />
            <span className="text-sm tabular-nums text-muted-foreground w-8 text-right">
              {settings.columns}
            </span>
          </div>
        </Row>
      </Section>

      {/* Behavior */}
      <Section
        icon={<Sparkles className="size-4" />}
        title="Behavior"
        desc="Animations and widgets."
      >
        <Row label="Animations" desc="Smooth transitions and micro-interactions.">
          <Switch
            checked={settings.animations}
            onCheckedChange={(v) => update({ animations: v })}
            aria-label="Toggle animations"
          />
        </Row>
        <Row
          label="Show clock & greeting"
          icon={<Clock className="size-4" />}
        >
          <Switch
            checked={settings.showClock}
            onCheckedChange={(v) => update({ showClock: v })}
            aria-label="Toggle clock"
          />
        </Row>
        <Row label="Clock format" desc="12-hour or 24-hour time.">
          <div className="flex items-center gap-2">
            <button
              onClick={() => update({ clockFormat: "12h" })}
              className={cn(
                "rounded-lg border px-3 py-1.5 text-xs font-medium transition-all",
                settings.clockFormat === "12h"
                  ? "border-[var(--nt-accent)] bg-[var(--nt-accent)]/10"
                  : "border-border text-muted-foreground hover:bg-muted/50"
              )}
            >
              12h
            </button>
            <button
              onClick={() => update({ clockFormat: "24h" })}
              className={cn(
                "rounded-lg border px-3 py-1.5 text-xs font-medium transition-all",
                settings.clockFormat === "24h"
                  ? "border-[var(--nt-accent)] bg-[var(--nt-accent)]/10"
                  : "border-border text-muted-foreground hover:bg-muted/50"
              )}
            >
              24h
            </button>
            <Switch
              checked={settings.showSeconds}
              onCheckedChange={(v) => update({ showSeconds: v })}
              aria-label="Toggle seconds"
            />
            <span className="text-xs text-muted-foreground">seconds</span>
          </div>
        </Row>
        <Row label="Your name" desc="Shown in the greeting.">
          <Input
            value={settings.userName}
            onChange={(e) => update({ userName: e.target.value })}
            placeholder="Ali"
            className="max-w-xs"
            maxLength={24}
          />
        </Row>
        <Row
          label="Show favorites bar"
          desc="Quick-access your most-opened shortcuts."
          icon={<Flame className="size-4" />}
        >
          <Switch
            checked={settings.showFavoritesBar}
            onCheckedChange={(v) => update({ showFavoritesBar: v })}
            aria-label="Toggle favorites bar"
          />
        </Row>
        <Row
          label="Expand all categories"
          desc="Open every category by default (overrides per-category state)."
          icon={<Expand className="size-4" />}
        >
          <Switch
            checked={settings.expandAll}
            onCheckedChange={(v) => update({ expandAll: v })}
            aria-label="Toggle expand all"
          />
        </Row>
        <Row
          label="Glass intensity"
          desc="Backdrop blur strength on glass surfaces."
          icon={<Droplets className="size-4" />}
        >
          <div className="flex items-center gap-3 w-full max-w-xs">
            <Slider
              value={[settings.glassIntensity]}
              min={0}
              max={100}
              step={10}
              onValueChange={(v) => update({ glassIntensity: v[0] })}
              className="flex-1"
            />
            <span className="text-sm tabular-nums text-muted-foreground w-10 text-right">
              {settings.glassIntensity}%
            </span>
          </div>
        </Row>
      </Section>

      {/* Search engine is fixed to Google per design decision. */}

      {/* Background */}
      <Section
        icon={<ImageIcon className="size-4" />}
        title="Background"
        desc="Pick an ambient backdrop."
      >
        <Row label="Background style">
          <div className="grid grid-cols-4 gap-2 w-full max-w-sm">
            {(
              [
                { key: "aurora", label: "Aurora" },
                { key: "mesh", label: "Mesh" },
                { key: "dots", label: "Dots" },
                { key: "plain", label: "Plain" },
              ] as { key: BackgroundStyle; label: string }[]
            ).map((b) => (
              <button
                key={b.key}
                onClick={() => update({ background: b.key })}
                className={cn(
                  "rounded-xl border px-2 py-2.5 text-xs font-medium transition-all",
                  settings.background === b.key
                    ? "border-[var(--nt-accent)] bg-[var(--nt-accent)]/10"
                    : "border-border text-muted-foreground hover:bg-muted/50"
                )}
              >
                {b.label}
              </button>
            ))}
          </div>
        </Row>
      </Section>

      {/* Quick Launch — configurable site chips */}
      <Section
        icon={<Zap className="size-4" />}
        title="Quick Launch"
        desc="Site chips shown under the search bar."
      >
        <Row label="Show quick-launch row" desc="Toggle the chip row on/off.">
          <Switch
            checked={settings.showQuickLaunch}
            onCheckedChange={(v) => update({ showQuickLaunch: v })}
            aria-label="Toggle quick launch"
          />
        </Row>

        <div className="space-y-2">
          {settings.quickLaunchSites.map((site, i) => (
            <div
              key={`${site.url}-${i}`}
              className="flex items-center gap-2 rounded-xl border border-border bg-muted/30 px-3 py-2"
            >
              <span className="flex-1 min-w-0">
                <span className="block text-sm font-medium truncate">
                  {site.title}
                </span>
                <span className="block text-xs text-muted-foreground truncate">
                  {site.url}
                </span>
              </span>
              <button
                onClick={() => removeQuickSite(i)}
                className="grid place-items-center size-7 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors shrink-0"
                aria-label={`Remove ${site.title}`}
              >
                <Trash2 className="size-3.5" />
              </button>
            </div>
          ))}

          {/* add new site form */}
          <div className="flex items-center gap-2 rounded-xl border border-dashed border-border px-3 py-2">
            <input
              value={newSiteTitle}
              onChange={(e) => setNewSiteTitle(e.target.value)}
              placeholder="Title"
              className="flex-1 min-w-0 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
            <input
              value={newSiteUrl}
              onChange={(e) => setNewSiteUrl(e.target.value)}
              placeholder="https://example.com"
              className="flex-1 min-w-0 bg-transparent text-sm outline-none placeholder:text-muted-foreground font-mono text-xs"
              onKeyDown={(e) => {
                if (e.key === "Enter" && newSiteTitle.trim() && newSiteUrl.trim()) {
                  addQuickSite({ title: newSiteTitle.trim(), url: newSiteUrl.trim() });
                  setNewSiteTitle("");
                  setNewSiteUrl("");
                }
              }}
            />
            <button
              onClick={() => {
                if (newSiteTitle.trim() && newSiteUrl.trim()) {
                  addQuickSite({
                    title: newSiteTitle.trim(),
                    url: newSiteUrl.trim(),
                  });
                  setNewSiteTitle("");
                  setNewSiteUrl("");
                }
              }}
              disabled={!newSiteTitle.trim() || !newSiteUrl.trim()}
              className="inline-flex items-center gap-1 rounded-lg nt-accent-soft px-2.5 py-1.5 text-xs font-medium hover:opacity-90 transition disabled:opacity-40 shrink-0"
            >
              <Plus className="size-3.5" />
              Add
            </button>
          </div>
        </div>
      </Section>

      {/* Keyboard Shortcuts — description only */}
      <Section
        icon={<Keyboard className="size-4" />}
        title="Keyboard Shortcuts"
        desc="Press these keys anywhere to navigate faster."
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
          {SHORTCUTS.map((s) => (
            <div
              key={s.desc}
              className="flex items-center justify-between gap-3"
            >
              <span className="text-sm text-foreground/80">{s.desc}</span>
              <span className="flex items-center gap-1 shrink-0">
                {s.keys.map((k, i) => (
                  <span key={i} className="flex items-center gap-1">
                    {i > 0 && (
                      <span className="text-muted-foreground text-xs">+</span>
                    )}
                    <kbd className="nt-kbd">{k}</kbd>
                  </span>
                ))}
              </span>
            </div>
          ))}
        </div>
      </Section>

      {/* Data — Import / Export */}
      <Section
        icon={<Database className="size-4" />}
        title="Data"
        desc="Backup or restore your categories, shortcuts and settings."
      >
        <Row
          label="Storage"
          desc={`${categoryCount} categories · ${shortcutCount} shortcuts`}
        >
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onOpenImportExport}
              className="gap-1.5"
            >
              <Upload className="size-3.5" />
              Import
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onOpenImportExport}
              className="gap-1.5"
            >
              <Download className="size-3.5" />
              Export
            </Button>
          </div>
        </Row>
      </Section>

      {/* Danger zone */}
      <Section
        icon={<RotateCcw className="size-4" />}
        title="Reset"
        desc="Restore the default categories and shortcuts."
      >
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="outline" className="text-destructive">
              <RotateCcw className="mr-2 size-4" />
              Reset to defaults
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Reset everything?</AlertDialogTitle>
              <AlertDialogDescription>
                This will replace your current categories and shortcuts with the
                defaults. Your theme settings will be kept. This cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  resetAll();
                  update({
                    theme: DEFAULT_SETTINGS.theme,
                    accent: DEFAULT_SETTINGS.accent,
                  });
                }}
                className="bg-destructive text-white hover:bg-destructive/90"
              >
                Reset
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </Section>
    </motion.div>
  );
}

function Section({
  icon,
  title,
  desc,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  desc?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="nt-card rounded-3xl p-5 sm:p-6">
      <div className="flex items-center gap-2.5 mb-4">
        <span className="grid place-items-center size-8 rounded-lg nt-accent-soft">
          {icon}
        </span>
        <div>
          <h2 className="text-sm font-semibold">{title}</h2>
          {desc && <p className="text-xs text-muted-foreground">{desc}</p>}
        </div>
      </div>
      <div className="space-y-4 divide-y divide-border [&>*]:pt-4 [&>*:first-child]:pt-0">
        {children}
      </div>
    </section>
  );
}

function Row({
  label,
  desc,
  icon,
  children,
}: {
  label: string;
  desc?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <div className="flex items-center gap-2 min-w-0">
        {icon && <span className="text-muted-foreground shrink-0">{icon}</span>}
        <div className="min-w-0">
          <p className="text-sm font-medium">{label}</p>
          {desc && <p className="text-xs text-muted-foreground">{desc}</p>}
        </div>
      </div>
      <div className="sm:flex sm:justify-end w-full sm:w-80 sm:max-w-xs shrink-0">{children}</div>
    </div>
  );
}
