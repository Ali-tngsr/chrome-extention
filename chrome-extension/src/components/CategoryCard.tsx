import { memo, useMemo } from "react";
import { motion } from "framer-motion";
import {
  ChevronDown,
  Pencil,
  Trash2,
  MoreHorizontal,
} from "lucide-react";
import { useStore } from "@/store/useStore";
import { getIcon } from "./IconMap";
import { ShortcutGrid } from "./ShortcutGrid";
import type { Category, Shortcut } from "@/types";

interface CategoryCardProps {
  category: Category;
  shortcuts: Shortcut[];
  defaultExpanded?: boolean;
}

function CategoryCardBase({
  category,
  shortcuts,
  defaultExpanded = false,
}: CategoryCardProps) {
  const expandedId = useStore((s) => s.expandedCategoryId);
  const setExpanded = useStore((s) => s.setExpandedCategory);
  const openCategoryDialog = useStore((s) => s.openCategoryDialog);
  const deleteCategory = useStore((s) => s.deleteCategory);

  const Icon = getIcon(category.icon);
  const expanded = expandedId === category.id || (defaultExpanded && expandedId === null);

  const accent = category.color || "var(--nt-accent)";

  const count = shortcuts.length;

  const actionButtons = useMemo(
    () => (
      <div className="flex items-center gap-1">
        <button
          onClick={(e) => {
            e.stopPropagation();
            openCategoryDialog(category.id);
          }}
          aria-label={`Edit ${category.name}`}
          className="nt-focus w-7 h-7 grid place-items-center rounded-md hover:bg-[var(--muted)] text-muted-foreground hover:text-foreground transition-colors"
        >
          <Pencil size={13} />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (
              window.confirm(
                `Delete category “${category.name}”? Its ${count} shortcut${
                  count === 1 ? "" : "s"
                } will be removed.`
              )
            ) {
              deleteCategory(category.id);
            }
          }}
          aria-label={`Delete ${category.name}`}
          className="nt-focus w-7 h-7 grid place-items-center rounded-md hover:bg-[var(--muted)] text-muted-foreground hover:text-destructive transition-colors"
        >
          <Trash2 size={13} />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            setExpanded(category.id);
          }}
          aria-label={expanded ? "Collapse" : "Expand"}
          className="nt-focus w-7 h-7 grid place-items-center rounded-md hover:bg-[var(--muted)] text-muted-foreground hover:text-foreground transition-colors"
        >
          {expanded ? <MoreHorizontal size={14} /> : <ChevronDown size={14} />}
        </button>
      </div>
    ),
    [category.id, category.name, count, deleteCategory, expanded, openCategoryDialog, setExpanded]
  );

  return (
    <motion.section
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="nt-card rounded-2xl overflow-hidden"
      aria-label={category.name}
    >
      <header
        onClick={() => setExpanded(category.id)}
        className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-[var(--muted)]/40 transition-colors"
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setExpanded(category.id);
          }
        }}
      >
        <div
          className="shrink-0 w-9 h-9 rounded-xl grid place-items-center"
          style={{
            background: `color-mix(in srgb, ${accent} 18%, transparent)`,
            color: accent,
          }}
        >
          <Icon size={18} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold text-foreground truncate">
            {category.name}
          </div>
          <div className="text-[11px] text-muted-foreground">
            {count} shortcut{count === 1 ? "" : "s"}
          </div>
        </div>
        {actionButtons}
      </header>

      {expanded && shortcuts.length > 0 && (
        <div className="px-4 pb-4">
          <ShortcutGrid categoryId={category.id} shortcuts={shortcuts} />
        </div>
      )}
      {expanded && shortcuts.length === 0 && (
        <div className="px-4 pb-4">
          <EmptyCategory categoryId={category.id} />
        </div>
      )}
    </motion.section>
  );
}

function EmptyCategory({ categoryId }: { categoryId: string }) {
  const openShortcutDialog = useStore((s) => s.openShortcutDialog);
  return (
    <div className="mt-2 border border-dashed border-border rounded-xl py-6 text-center text-sm text-muted-foreground">
      No shortcuts yet.
      <button
        onClick={() => openShortcutDialog(null, categoryId)}
        className="ml-2 nt-accent-soft px-2 py-0.5 rounded-md text-xs"
      >
        Add one
      </button>
    </div>
  );
}

export const CategoryCard = memo(CategoryCardBase);
