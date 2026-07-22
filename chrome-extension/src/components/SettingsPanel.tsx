import { motion } from "framer-motion";
import {
  Sun,
  Moon,
  Monitor,
  Check,
  RotateCcw,
} from "lucide-react";
import { useStore, ACCENT_PRESETS, DEFAULT_SETTINGS } from "@/store/useStore";
import type { ThemeMode, Density } from "@/types";

const THEME_OPTIONS: { value: ThemeMode; label: string; icon: typeof Sun }[] = [
  { value: "dark", label: "Dark", icon: Moon },
  { value: "light", label: "Light", icon: Sun },
  { value: "system", label: "System", icon: Monitor },
];

const DENSITY_OPTIONS: { value: Density; label: string }[] = [
  { value: "comfortable", label: "Comfortable" },
  { value: "compact", label: "Compact" },
];

export function SettingsPanel() {
  const settings = useStore((s) => s.settings);
  const update = useStore((s) => s.updateSettings);
  const resetAll = useStore((s) => s.resetAll);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="max-w-3xl mx-auto space-y-5"
    >
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground">
          Personalize your new tab. Changes are saved to chrome.storage.sync.
        </p>
      </header>

      <Section title="Appearance">
        <Row label="Theme" hint="Dark, light, or follow your system.">
          <div className="flex gap-2">
            {THEME_OPTIONS.map((opt) => {
              const Icon = opt.icon;
              const active = settings.theme === opt.value;
              return (
                <button
                  key={opt.value}
                  onClick={() => update({ theme: opt.value })}
                  className={`nt-focus flex items-center gap-2 px-3 h-9 rounded-lg text-sm transition-colors border ${
                    active
                      ? "nt-accent-soft border-[var(--nt-accent)]"
                      : "border-border hover:bg-[var(--muted)] text-muted-foreground hover:text-foreground"
                  }`}
                  aria-pressed={active}
                >
                  <Icon size={14} />
                  {opt.label}
                </button>
              );
            })}
          </div>
        </Row>

        <Row label="Accent color" hint="Used for highlights, focus rings and the aurora glow.">
          <div className="flex items-center gap-2 flex-wrap">
            {ACCENT_PRESETS.map((p) => (
              <button
                key={p.value}
                onClick={() => update({ accent: p.value })}
                aria-label={p.name}
                className={`nt-focus w-7 h-7 rounded-full grid place-items-center transition-transform hover:scale-110 ${
                  settings.accent.toLowerCase() === p.value.toLowerCase()
                    ? "ring-2 ring-offset-2 ring-offset-background"
                    : ""
                }`}
                style={{ background: p.value, boxShadow: settings.accent.toLowerCase() === p.value.toLowerCase() ? `0 0 0 2px ${p.value}` : undefined }}
              >
                {settings.accent.toLowerCase() === p.value.toLowerCase() && (
                  <Check size={14} className="text-white" />
                )}
              </button>
            ))}
            <label
              className="nt-focus w-7 h-7 rounded-full overflow-hidden border border-border grid place-items-center cursor-pointer"
              style={{
                background:
                  "conic-gradient(from 0deg, #f43f5e, #f59e0b, #10b981, #06b6d4, #6366f1, #ec4899, #f43f5e)",
              }}
              title="Custom color"
            >
              <input
                type="color"
                value={settings.accent}
                onChange={(e) => update({ accent: e.target.value })}
                className="opacity-0 w-0 h-0"
                aria-label="Pick a custom accent color"
              />
            </label>
          </div>
        </Row>

        <Row label="Card radius" hint={`${settings.radius.toFixed(2)} rem`}>
          <input
            type="range"
            min={0.25}
            max={1.75}
            step={0.05}
            value={settings.radius}
            onChange={(e) => update({ radius: parseFloat(e.target.value) })}
            className="w-48 accent-[var(--nt-accent)]"
            aria-label="Card radius"
          />
        </Row>

        <Row label="Grid density" hint="Tighten spacing inside categories.">
          <div className="flex gap-2">
            {DENSITY_OPTIONS.map((opt) => {
              const active = settings.density === opt.value;
              return (
                <button
                  key={opt.value}
                  onClick={() => update({ density: opt.value })}
                  className={`nt-focus px-3 h-9 rounded-lg text-sm transition-colors border ${
                    active
                      ? "nt-accent-soft border-[var(--nt-accent)]"
                      : "border-border hover:bg-[var(--muted)] text-muted-foreground hover:text-foreground"
                  }`}
                  aria-pressed={active}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </Row>

        <Row label="Grid columns" hint={`Desktop grid shows ${settings.columns} columns.`}>
          <input
            type="range"
            min={2}
            max={8}
            step={1}
            value={settings.columns}
            onChange={(e) => update({ columns: parseInt(e.target.value, 10) })}
            className="w-48 accent-[var(--nt-accent)]"
            aria-label="Grid columns"
          />
        </Row>
      </Section>

      <Section title="Behavior">
        <Row label="Animations" hint="Subtle motion + hover effects.">
          <Toggle
            checked={settings.animations}
            onChange={(v) => update({ animations: v })}
            label="Toggle animations"
          />
        </Row>
        <Row label="Clock & greeting" hint="Show a live clock and greeting above search.">
          <Toggle
            checked={settings.showClock}
            onChange={(v) => update({ showClock: v })}
            label="Toggle clock"
          />
        </Row>
      </Section>

      <Section title="Data">
        <Row
          label="Reset to defaults"
          hint="Restore the seed categories and shortcuts."
        >
          <button
            onClick={() => {
              if (
                window.confirm(
                  "Reset all categories, shortcuts and settings to defaults?"
                )
              ) {
                resetAll();
              }
            }}
            className="nt-focus inline-flex items-center gap-2 px-3 h-9 rounded-lg text-sm border border-border hover:bg-[var(--muted)] transition-colors text-muted-foreground hover:text-foreground"
          >
            <RotateCcw size={14} /> Reset
          </button>
        </Row>
      </Section>

      <div className="text-xs text-muted-foreground">
        Defaults: accent <span className="font-mono">{DEFAULT_SETTINGS.accent}</span>, radius{" "}
        <span className="font-mono">{DEFAULT_SETTINGS.radius}</span>, columns{" "}
        <span className="font-mono">{DEFAULT_SETTINGS.columns}</span>.
      </div>
    </motion.div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="nt-card rounded-2xl p-5 space-y-4">
      <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {title}
      </h2>
      {children}
    </section>
  );
}

function Row({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
      <div>
        <div className="text-sm font-medium text-foreground">{label}</div>
        {hint && <div className="text-xs text-muted-foreground">{hint}</div>}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={`nt-focus relative w-11 h-6 rounded-full transition-colors ${
        checked ? "bg-[var(--nt-accent)]" : "bg-[var(--muted)]"
      }`}
    >
      <span
        className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
          checked ? "translate-x-5" : "translate-x-0"
        }`}
      />
    </button>
  );
}
