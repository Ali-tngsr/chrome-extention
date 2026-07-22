"use client";

import { useMemo } from "react";
import {
  DndContext,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  closestCenter,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  arrayMove,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNewTabStore } from "@/store/newtab-store";
import { ShortcutTile } from "./ShortcutTile";
import type { Shortcut } from "@/types/newtab";
import { motion } from "framer-motion";

interface Props {
  categoryId: string;
  onAddShortcut: () => void;
  onEditShortcut: (s: Shortcut) => void;
}

function SortableTile({
  shortcut,
  onEdit,
}: {
  shortcut: Shortcut;
  onEdit: (s: Shortcut) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: shortcut.id });

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
      {...attributes}
      {...listeners}
      className="touch-none"
    >
      <ShortcutTile
        shortcut={shortcut}
        onEdit={onEdit}
        isDragging={isDragging}
      />
    </div>
  );
}

export function ShortcutGrid({
  categoryId,
  onAddShortcut,
  onEditShortcut,
}: Props) {
  const shortcuts = useNewTabStore((s) => s.shortcuts);
  const reorderShortcuts = useNewTabStore((s) => s.reorderShortcuts);
  const columns = useNewTabStore((s) => s.settings.columns);

  const items = useMemo(
    () =>
      shortcuts
        .filter((s) => s.categoryId === categoryId)
        .sort((a, b) => a.order - b.order),
    [shortcuts, categoryId]
  );

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const onDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const oldIndex = items.findIndex((i) => i.id === active.id);
    const newIndex = items.findIndex((i) => i.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;
    const ordered = arrayMove(items, oldIndex, newIndex).map((i) => i.id);
    reorderShortcuts(categoryId, ordered);
  };

  const gridCols = Math.max(2, Math.min(columns, 10));

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={onDragEnd}
    >
      <SortableContext
        items={items.map((i) => i.id)}
        strategy={rectSortingStrategy}
      >
        <div
          className="nt-shortcut-grid grid gap-[var(--nt-gap)]"
          style={{ ["--nt-cols" as string]: gridCols }}
        >
          {items.map((s) => (
            <SortableTile
              key={s.id}
              shortcut={s}
              onEdit={onEditShortcut}
            />
          ))}

          <motion.button
            layout
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ y: -3 }}
            whileTap={{ scale: 0.97 }}
            onClick={onAddShortcut}
            className={cn(
              "nt-tile group flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-border bg-transparent text-muted-foreground hover:text-foreground hover:border-[var(--nt-accent)]/50 min-h-[120px]"
            )}
            aria-label="Add shortcut"
          >
            <span className="grid place-items-center size-12 rounded-xl nt-accent-soft transition-transform group-hover:scale-110">
              <Plus className="size-5" />
            </span>
            <span className="text-sm font-medium">Add</span>
          </motion.button>
        </div>
      </SortableContext>
    </DndContext>
  );
}
