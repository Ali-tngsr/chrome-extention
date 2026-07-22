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
  rectSortingStrategy,
  sortableKeyboardCoordinates,
  arrayMove,
} from "@dnd-kit/sortable";
import { AnimatePresence, motion } from "framer-motion";
import { Plus } from "lucide-react";
import { useStore } from "@/store/useStore";
import { ShortcutTile } from "./ShortcutTile";
import type { Shortcut } from "@/types";

interface ShortcutGridProps {
  categoryId: string;
  shortcuts: Shortcut[];
}

export function ShortcutGrid({ categoryId, shortcuts }: ShortcutGridProps) {
  const reorderShortcuts = useStore((s) => s.reorderShortcuts);
  const openShortcutDialog = useStore((s) => s.openShortcutDialog);
  const columns = useStore((s) => s.settings.columns);
  const density = useStore((s) => s.settings.density);

  const ordered = useMemo(
    () => [...shortcuts].sort((a, b) => a.order - b.order),
    [shortcuts]
  );

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const onDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const ids = ordered.map((s) => s.id);
    const oldIndex = ids.indexOf(active.id as string);
    const newIndex = ids.indexOf(over.id as string);
    if (oldIndex === -1 || newIndex === -1) return;
    reorderShortcuts(categoryId, arrayMove(ids, oldIndex, newIndex));
  };

  const gridColsClass = useMemo(() => {
    // responsive: clamp columns on small screens
    return {
      "--cols": columns,
    } as React.CSSProperties;
  }, [columns]);

  const cols = Math.max(2, Math.min(columns, 8));

  return (
    <div className="mt-3">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={onDragEnd}
      >
        <SortableContext
          items={ordered.map((s) => s.id)}
          strategy={rectSortingStrategy}
        >
          <div
            style={gridColsClass}
            className="grid gap-[var(--nt-gap)]"
            role="list"
          >
            <div
              className="contents"
              style={{
                display: "contents",
              }}
            >
              {ordered.map((s) => (
                <div
                  key={s.id}
                  className="col-span-1"
                  style={{
                    gridColumn: "span 1 / span 1",
                  }}
                >
                  <AnimatePresence>
                    <motion.div
                      layout
                      initial={{ opacity: 0, scale: 0.96 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.96 }}
                      transition={{ duration: 0.15 }}
                    >
                      <ShortcutTile shortcut={s} compact={density === "compact"} />
                    </motion.div>
                  </AnimatePresence>
                </div>
              ))}
              <div
                className="col-span-1"
                style={{ gridColumn: "span 1 / span 1" }}
              >
                <button
                  onClick={() => openShortcutDialog(null, categoryId)}
                  className="nt-tile w-full rounded-xl p-3 flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground border border-dashed border-border"
                  style={{ minHeight: density === "compact" ? 56 : 64 }}
                  aria-label="Add shortcut"
                >
                  <Plus size={14} />
                  Add
                </button>
              </div>
            </div>
          </div>
        </SortableContext>
      </DndContext>

      {/* Responsive grid override via inline style + class */}
      <style>{`
        .grid[style*="--cols"] {
          grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
        }
        @media (min-width: 1024px) {
          .grid[style*="--cols"] {
            grid-template-columns: repeat(min(${cols}, 8), minmax(0, 1fr));
          }
        }
      `}</style>
    </div>
  );
}
