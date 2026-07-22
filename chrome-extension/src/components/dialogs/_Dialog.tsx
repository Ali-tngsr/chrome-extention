import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";

interface DialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidth?: string;
}

export function Dialog({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  maxWidth = "max-w-md",
}: DialogProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-40 grid place-items-center p-4"
          role="dialog"
          aria-modal="true"
          aria-label={title}
        >
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden
          />
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ duration: 0.18 }}
            className={`relative nt-glass nt-card rounded-2xl w-full ${maxWidth} max-h-[90vh] flex flex-col`}
          >
            <header className="flex items-start justify-between gap-4 p-5 pb-3">
              <div>
                <h2 className="text-base font-semibold tracking-tight">{title}</h2>
                {description && (
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {description}
                  </p>
                )}
              </div>
              <button
                onClick={onClose}
                aria-label="Close dialog"
                className="nt-focus w-8 h-8 grid place-items-center rounded-md hover:bg-[var(--muted)] text-muted-foreground hover:text-foreground"
              >
                <X size={16} />
              </button>
            </header>

            <div className="px-5 py-3 overflow-y-auto nt-scroll">{children}</div>

            {footer && (
              <footer className="flex items-center justify-end gap-2 p-5 pt-3 border-t border-border">
                {footer}
              </footer>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

interface FieldProps {
  label: string;
  hint?: string;
  children: React.ReactNode;
}

export function Field({ label, hint, children }: FieldProps) {
  return (
    <label className="block space-y-1.5">
      <div className="text-xs font-medium text-foreground">{label}</div>
      {children}
      {hint && <div className="text-[11px] text-muted-foreground">{hint}</div>}
    </label>
  );
}

export const inputClass =
  "w-full h-9 px-3 rounded-lg bg-[var(--muted)] border border-border text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-[var(--nt-accent)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--nt-accent)_30%,transparent)] transition-colors";

export const btnPrimary =
  "nt-focus inline-flex items-center justify-center h-9 px-4 rounded-lg text-sm font-medium nt-accent-soft hover:opacity-90 transition-opacity disabled:opacity-50";

export const btnGhost =
  "nt-focus inline-flex items-center justify-center h-9 px-4 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-[var(--muted)] transition-colors";
