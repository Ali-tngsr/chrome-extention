"use client";

import { memo } from "react";
import { motion } from "framer-motion";
import {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuSub,
  ContextMenuSubTrigger,
  ContextMenuSubContent,
} from "@/components/ui/context-menu";
import {
  Pencil,
  Trash2,
  Copy,
  FolderInput,
  GripVertical,
  ExternalLink,
  Pin,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useNewTabStore } from "@/store/newtab-store";
import { SmartFavicon } from "./SmartFavicon";
import type { Shortcut, Category } from "@/types/newtab";

interface Props {
  shortcut: Shortcut;
  onEdit: (s: Shortcut) => void;
  isDragging?: boolean;
}

function ShortcutTileBase({
  shortcut,
  onEdit,
  isDragging,
}: Props) {
  const deleteShortcut = useNewTabStore((s) => s.deleteShortcut);
  const duplicateShortcut = useNewTabStore((s) => s.duplicateShortcut);
  const moveShortcut = useNewTabStore((s) => s.moveShortcut);
  const recordOpen = useNewTabStore((s) => s.recordShortcutOpen);
  const categories = useNewTabStore((s) => s.categories);

  const open = () => {
    recordOpen(shortcut.id);
    window.open(shortcut.url, "_blank", "noopener,noreferrer");
  };

  const targetCats = categories.filter((c) => c.id !== shortcut.categoryId);
  const hot = (shortcut.opens || 0) >= 5;

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <motion.button
          layout
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.92 }}
          transition={{ duration: 0.18, ease: [0.2, 0.8, 0.2, 1] }}
          whileHover={{ y: -3 }}
          whileTap={{ scale: 0.97 }}
          onClick={open}
          data-shortcut-id={shortcut.id}
          className={cn(
            "nt-tile group relative flex flex-col items-center justify-center gap-2 rounded-2xl border bg-card px-3 pt-4 pb-3 text-center cursor-pointer select-none min-h-[120px]",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--nt-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-background",
            "border-border",
            isDragging && "opacity-40"
          )}
          aria-label={`Open ${shortcut.title}`}
          title={shortcut.description || shortcut.title}
        >
          {/* drag handle */}
          <span
            className="absolute left-2 top-2 text-muted-foreground/40 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing"
            aria-hidden
          >
            <GripVertical className="size-3.5" />
          </span>

          {/* frequently-used badge */}
          {hot && (
            <span
              className="absolute right-2 top-2 grid place-items-center size-5 rounded-full nt-accent-soft"
              title={`Opened ${shortcut.opens} times`}
            >
              <Pin className="size-3" />
            </span>
          )}

          <span className="grid place-items-center size-12 rounded-xl overflow-hidden shrink-0 shadow-sm bg-muted">
            <SmartFavicon
              url={shortcut.url}
              title={shortcut.title}
              icon={shortcut.icon}
            />
          </span>

          <span className="w-full flex flex-col items-center min-w-0">
            <span className="block text-sm font-medium leading-tight truncate w-full">
              {shortcut.title}
            </span>
            {shortcut.description ? (
              <span className="block text-[11px] text-muted-foreground truncate w-full mt-0.5">
                {shortcut.description}
              </span>
            ) : (
              <span className="block text-[10px] text-muted-foreground/60 truncate w-full mt-0.5 tabular-nums">
                {shortcut.opens ? `${shortcut.opens} opens` : "—"}
              </span>
            )}
          </span>
        </motion.button>
      </ContextMenuTrigger>

      <ContextMenuContent className="w-52">
        <ContextMenuItem onClick={open}>
          <ExternalLink className="mr-2 size-4" />
          Open
        </ContextMenuItem>
        <ContextMenuItem onClick={() => onEdit(shortcut)}>
          <Pencil className="mr-2 size-4" />
          Edit
        </ContextMenuItem>
        <ContextMenuItem onClick={() => duplicateShortcut(shortcut.id)}>
          <Copy className="mr-2 size-4" />
          Duplicate
        </ContextMenuItem>

        {targetCats.length > 0 && (
          <ContextMenuSub>
            <ContextMenuSubTrigger>
              <FolderInput className="mr-2 size-4" />
              Move to…
            </ContextMenuSubTrigger>
            <ContextMenuSubContent className="w-48 max-h-64 overflow-y-auto nt-scroll">
              {targetCats.map((c: Category) => (
                <ContextMenuItem
                  key={c.id}
                  onClick={() => moveShortcut(shortcut.id, c.id)}
                >
                  {c.name}
                </ContextMenuItem>
              ))}
            </ContextMenuSubContent>
          </ContextMenuSub>
        )}

        <ContextMenuSeparator />
        <ContextMenuItem
          onClick={() => deleteShortcut(shortcut.id)}
          className="text-destructive focus:text-destructive"
        >
          <Trash2 className="mr-2 size-4" />
          Delete
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}

export const ShortcutTile = memo(ShortcutTileBase);
