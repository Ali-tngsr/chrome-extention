"use client";

import { memo } from "react";
import { motion } from "framer-motion";
import {
  ChevronDown,
  MoreHorizontal,
  Pencil,
  Trash2,
  Plus,
  CheckSquare,
  GripVertical,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useNewTabStore } from "@/store/newtab-store";
import { getIcon } from "./icon-map";
import { ShortcutGrid } from "./ShortcutGrid";
import type { Category, Shortcut } from "@/types/newtab";

interface Props {
  category: Category;
  onEdit: (c: Category) => void;
  onAddShortcut: (categoryId: string) => void;
  onEditShortcut: (s: Shortcut) => void;
  /** visual flag when being dragged */
  dragging?: boolean;
  /** dnd-kit listeners + attributes spread onto the drag handle */
  dragHandleProps?: Record<string, unknown>;
}

function CategoryCardBase({
  category,
  onEdit,
  onAddShortcut,
  onEditShortcut,
  dragging,
  dragHandleProps,
}: Props) {
  const expandedId = useNewTabStore((s) => s.expandedCategoryId);
  const setExpanded = useNewTabStore((s) => s.setExpandedCategory);
  const deleteCategory = useNewTabStore((s) => s.deleteCategory);
  const expandAll = useNewTabStore((s) => s.settings.expandAll);
  const shortcutCount = useNewTabStore(
    (s) => s.shortcuts.filter((sc) => sc.categoryId === category.id).length
  );

  // expanded = (expandAll && not manually collapsed) OR (explicitly expanded)
  const expanded = expandAll
    ? category.collapsed !== true
    : expandedId === category.id || category.collapsed === false;

  const Icon = getIcon(category.icon);
  const accent = category.color;

  const toggle = () => setExpanded(category.id);

  return (
    <motion.section
      layout
      data-category-id={category.id}
      className={cn(
        "nt-card rounded-3xl overflow-hidden relative group/card",
        dragging && "ring-2 ring-[var(--nt-accent)]/50 shadow-2xl",
        accent &&
          "before:absolute before:inset-0 before:pointer-events-none before:opacity-[0.04]"
      )}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: [0.2, 0.8, 0.2, 1] }}
    >
      {accent && (
        <span
          className="absolute left-0 top-0 bottom-0 w-1"
          style={{ background: accent }}
          aria-hidden
        />
      )}
      <header
        className={cn(
          "flex items-center gap-3 px-4 py-2.5 cursor-pointer transition-colors hover:bg-muted/30",
          expanded && "border-b border-border"
        )}
        onClick={toggle}
        role="button"
        aria-expanded={expanded}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            toggle();
          }
        }}
      >
        {/* drag handle — only the handle initiates a category drag.
            dnd-kit listeners (pointerdown) are spread via dragHandleProps;
            we only stop click propagation so tapping the grip doesn't toggle. */}
        <span
          className="grid place-items-center size-7 -ml-1 rounded-md text-muted-foreground/40 opacity-0 group-hover/card:opacity-100 hover:!opacity-100 hover:text-foreground transition-opacity cursor-grab active:cursor-grabbing shrink-0 touch-none"
          aria-label="Drag to reorder category"
          title="Drag to reorder"
          onClick={(e) => e.stopPropagation()}
          {...(dragHandleProps as Record<string, unknown>)}
        >
          <GripVertical className="size-4" />
        </span>

        <span
          className={cn(
            "grid place-items-center size-9 rounded-xl shrink-0 transition-transform group-hover/card:scale-105",
            !accent && "nt-accent-soft"
          )}
          style={
            accent
              ? { background: `${accent}1f`, color: accent }
              : undefined
          }
        >
          <Icon className="size-[18px]" />
        </span>

        <div className="flex-1 min-w-0">
          <h3 className="text-[15px] font-semibold leading-tight truncate">
            {category.name}
          </h3>
          <p className="text-[11px] text-muted-foreground tabular-nums">
            {shortcutCount} {shortcutCount === 1 ? "shortcut" : "shortcuts"}
          </p>
        </div>

        <div className="flex items-center gap-0.5">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                onClick={(e) => e.stopPropagation()}
                className="grid place-items-center size-8 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                aria-label="Category options"
              >
                <MoreHorizontal className="size-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(category);
                }}
              >
                <Pencil className="mr-2 size-4" />
                Edit category
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  onAddShortcut(category.id);
                }}
              >
                <Plus className="mr-2 size-4" />
                Add shortcut
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  setExpanded(category.id);
                }}
              >
                <CheckSquare className="mr-2 size-4" />
                {expanded ? "Collapse" : "Expand"}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  deleteCategory(category.id);
                }}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="mr-2 size-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <motion.span
            animate={{ rotate: expanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
            className="text-muted-foreground"
          >
            <ChevronDown className="size-4" />
          </motion.span>
        </div>
      </header>

      <div className={cn("nt-collapse", expanded && "open")}>
        <div className="nt-collapse-inner">
          <div className="p-5">
            {shortcutCount === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <span className="grid place-items-center size-12 rounded-2xl nt-accent-soft mb-3">
                  <Plus className="size-5" />
                </span>
                <p className="text-sm font-medium mb-1">No shortcuts yet</p>
                <p className="text-xs text-muted-foreground mb-4">
                  Add your first shortcut to this category.
                </p>
                <button
                  onClick={() => onAddShortcut(category.id)}
                  className="inline-flex items-center gap-2 rounded-xl nt-accent-soft px-4 py-2 text-sm font-medium hover:opacity-90 transition"
                >
                  <Plus className="size-4" />
                  Add shortcut
                </button>
              </div>
            ) : (
              <ShortcutGrid
                categoryId={category.id}
                onAddShortcut={() => onAddShortcut(category.id)}
                onEditShortcut={onEditShortcut}
              />
            )}
          </div>
        </div>
      </div>
    </motion.section>
  );
}

export const CategoryCard = memo(CategoryCardBase);
