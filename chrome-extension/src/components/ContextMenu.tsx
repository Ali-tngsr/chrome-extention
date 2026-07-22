import { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Pencil,
  Trash2,
  Copy,
  FolderInput,
} from "lucide-react";
import { useStore } from "@/store/useStore";

export function ContextMenu() {
  const ctx = useStore((s) => s.contextMenu);
  const close = useStore((s) => s.closeContextMenu);
  const openShortcutDialog = useStore((s) => s.openShortcutDialog);
  const deleteShortcut = useStore((s) => s.deleteShortcut);
  const duplicateShortcut = useStore((s) => s.duplicateShortcut);
  const moveShortcut = useStore((s) => s.moveShortcut);
  const categories = useStore((s) => s.categories);
  const shortcuts = useStore((s) => s.shortcuts);

  const ref = useRef<HTMLDivElement>(null);

  // close on outside click / Esc
  useEffect(() => {
    if (!ctx.open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) close();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("mousedown", onDown);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("keydown", onKey);
    };
  }, [ctx.open, close]);

  const shortcut = ctx.shortcutId
    ? shortcuts.find((s) => s.id === ctx.shortcutId)
    : null;

  return (
    <AnimatePresence>
      {ctx.open && shortcut && (
        <motion.div
          ref={ref}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.12 }}
          style={{
            position: "fixed",
            left: Math.min(ctx.x, window.innerWidth - 220),
            top: Math.min(ctx.y, window.innerHeight - 280),
            zIndex: 50,
          }}
          role="menu"
          aria-label="Shortcut actions"
          className="nt-glass nt-card rounded-xl w-52 py-1.5 shadow-soft"
        >
          <MenuItem
            icon={<Pencil size={14} />}
            label="Edit"
            onClick={() => {
              openShortcutDialog(shortcut.id);
              close();
            }}
          />
          <MenuItem
            icon={<Copy size={14} />}
            label="Duplicate"
            onClick={() => {
              duplicateShortcut(shortcut.id);
              close();
            }}
          />
          <MenuItem
            icon={<Trash2 size={14} />}
            label="Delete"
            danger
            onClick={() => {
              deleteShortcut(shortcut.id);
              close();
            }}
          />

          {categories.length > 1 && (
            <>
              <div className="my-1 h-px bg-border" />
              <div className="px-3 py-1 text-[10px] uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <FolderInput size={12} /> Move to
              </div>
              <div className="max-h-44 overflow-y-auto nt-scroll">
                {categories
                  .filter((c) => c.id !== shortcut.categoryId)
                  .map((c) => (
                    <MenuItem
                      key={c.id}
                      label={c.name}
                      onClick={() => {
                        moveShortcut(shortcut.id, c.id);
                        close();
                      }}
                    />
                  ))}
              </div>
            </>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

interface MenuItemProps {
  icon?: React.ReactNode;
  label: string;
  onClick: () => void;
  danger?: boolean;
}

function MenuItem({ icon, label, onClick, danger }: MenuItemProps) {
  return (
    <button
      role="menuitem"
      onClick={onClick}
      className={`w-full flex items-center gap-2.5 px-3 py-1.5 text-sm text-left transition-colors hover:bg-[var(--muted)] ${
        danger ? "text-destructive hover:text-destructive" : "text-foreground"
      }`}
    >
      {icon && <span className="shrink-0 w-4 grid place-items-center">{icon}</span>}
      <span className="truncate">{label}</span>
    </button>
  );
}
