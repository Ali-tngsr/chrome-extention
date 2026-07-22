import { useMemo, useRef } from "react";
import { motion } from "framer-motion";
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
  verticalListSortingStrategy,
  sortableKeyboardCoordinates,
  arrayMove,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useStore } from "@/store/useStore";
import { useTheme } from "@/hooks/useTheme";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { Sidebar } from "@/components/Sidebar";
import { Greeting } from "@/components/Greeting";
import { SearchBar } from "@/components/SearchBar";
import { CategoryCard } from "@/components/CategoryCard";
import { SettingsPanel } from "@/components/SettingsPanel";
import { ContextMenu } from "@/components/ContextMenu";
import { ShortcutDialog } from "@/components/dialogs/ShortcutDialog";
import { CategoryDialog } from "@/components/dialogs/CategoryDialog";
import { ImportExportDialog } from "@/components/dialogs/ImportExportDialog";
import { Plus } from "lucide-react";

function useAppRef() {
  return useRef<HTMLDivElement>(null);
}

export function NewTabApp() {
  const rootRef = useAppRef();
  useTheme(rootRef);
  useKeyboardShortcuts();

  const view = useStore((s) => s.view);
  const categories = useStore((s) => s.categories);
  const shortcuts = useStore((s) => s.shortcuts);
  const expandedCategoryId = useStore((s) => s.expandedCategoryId);
  const reorderCategories = useStore((s) => s.reorderCategories);
  const openCategoryDialog = useStore((s) => s.openCategoryDialog);

  const orderedCategories = useMemo(
    () => [...categories].sort((a, b) => a.order - b.order),
    [categories]
  );

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const onDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const ids = orderedCategories.map((c) => c.id);
    const oldIndex = ids.indexOf(active.id as string);
    const newIndex = ids.indexOf(over.id as string);
    if (oldIndex === -1 || newIndex === -1) return;
    reorderCategories(arrayMove(ids, oldIndex, newIndex));
  };

  return (
    <div
      ref={rootRef}
      className="nt-app min-h-screen bg-background text-foreground flex"
    >
      <div className="nt-aurora" aria-hidden />
      <Sidebar />

      <main className="flex-1 min-w-0 relative z-10 flex flex-col">
        <div className="flex-1 px-4 sm:px-8 lg:px-12 py-8 sm:py-12 max-w-[1400px] w-full mx-auto">
          {view === "dashboard" && (
            <DashboardView
              orderedCategories={orderedCategories}
              shortcuts={shortcuts}
              expandedCategoryId={expandedCategoryId}
              sensors={sensors}
              onDragEnd={onDragEnd}
              onNewCategory={() => openCategoryDialog(null)}
            />
          )}

          {view === "categories" && (
            <CategoriesView
              orderedCategories={orderedCategories}
              shortcuts={shortcuts}
              sensors={sensors}
              onDragEnd={onDragEnd}
              onNewCategory={() => openCategoryDialog(null)}
            />
          )}

          {view === "settings" && <SettingsPanel />}
        </div>
      </main>

      {/* Global overlays */}
      <ContextMenu />
      <ShortcutDialog />
      <CategoryDialog />
      <ImportExportDialog />
    </div>
  );
}

interface ViewProps {
  orderedCategories: ReturnType<typeof useStore.getState>["categories"];
  shortcuts: ReturnType<typeof useStore.getState>["shortcuts"];
  sensors: ReturnType<typeof useSensors>;
  onDragEnd: (e: DragEndEvent) => void;
  onNewCategory: () => void;
}

function DashboardView({
  orderedCategories,
  shortcuts,
  expandedCategoryId,
  sensors,
  onDragEnd,
  onNewCategory,
}: ViewProps & { expandedCategoryId: string | null }) {
  return (
    <div className="flex flex-col items-center">
      <div className="w-full max-w-3xl">
        <Greeting />
        <SearchBar />
      </div>

      <div className="w-full mt-10 space-y-4">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={onDragEnd}
        >
          <SortableContext
            items={orderedCategories.map((c) => c.id)}
            strategy={verticalListSortingStrategy}
          >
            {orderedCategories.map((c, i) => {
              const catShorts = shortcuts
                .filter((s) => s.categoryId === c.id)
                .sort((a, b) => a.order - b.order);
              const defaultExpanded = i === 0 && expandedCategoryId === null;
              return (
                <DraggableCategory key={c.id} id={c.id}>
                  <CategoryCard
                    category={c}
                    shortcuts={catShorts}
                    defaultExpanded={defaultExpanded}
                  />
                </DraggableCategory>
              );
            })}
          </SortableContext>
        </DndContext>

        {orderedCategories.length === 0 && (
          <EmptyState onNew={onNewCategory} />
        )}
      </div>
    </div>
  );
}

function CategoriesView({
  orderedCategories,
  shortcuts,
  sensors,
  onDragEnd,
  onNewCategory,
}: ViewProps) {
  return (
    <div>
      <header className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            All Categories
          </h1>
          <p className="text-sm text-muted-foreground">
            Drag to reorder. Click any card to expand its shortcuts.
          </p>
        </div>
        <button
          onClick={onNewCategory}
          className="nt-focus inline-flex items-center gap-1.5 h-9 px-3 rounded-lg text-sm nt-accent-soft hover:opacity-90"
        >
          <Plus size={14} /> New
        </button>
      </header>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={onDragEnd}
      >
        <SortableContext
          items={orderedCategories.map((c) => c.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-4">
            {orderedCategories.map((c) => {
              const catShorts = shortcuts
                .filter((s) => s.categoryId === c.id)
                .sort((a, b) => a.order - b.order);
              return (
                <DraggableCategory key={c.id} id={c.id}>
                  <CategoryCard category={c} shortcuts={catShorts} />
                </DraggableCategory>
              );
            })}
          </div>
        </SortableContext>
      </DndContext>

      {orderedCategories.length === 0 && <EmptyState onNew={onNewCategory} />}
    </div>
  );
}

function DraggableCategory({
  id,
  children,
}: {
  id: string;
  children: React.ReactNode;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id });
  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };
  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      {children}
    </div>
  );
}

function EmptyState({ onNew }: { onNew: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="nt-card rounded-2xl p-10 text-center"
    >
      <div className="text-base font-medium">No categories yet</div>
      <p className="text-sm text-muted-foreground mt-1 mb-4">
        Create your first category to start organizing shortcuts.
      </p>
      <button
        onClick={onNew}
        className="nt-focus inline-flex items-center gap-1.5 h-9 px-4 rounded-lg text-sm nt-accent-soft hover:opacity-90"
      >
        <Plus size={14} /> New category
      </button>
    </motion.div>
  );
}
