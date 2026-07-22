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
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useNewTabStore } from "@/store/newtab-store";
import { CategoryCard } from "./CategoryCard";
import type { Category, Shortcut } from "@/types/newtab";

interface Props {
  onEditCategory: (c: Category) => void;
  onAddShortcut: (categoryId: string) => void;
  onEditShortcut: (s: Shortcut) => void;
  /** optional name filter — categories not matching are hidden */
  filter?: string;
}

function SortableCategory({
  category,
  onEdit,
  onAddShortcut,
  onEditShortcut,
}: {
  category: Category;
  onEdit: (c: Category) => void;
  onAddShortcut: (categoryId: string) => void;
  onEditShortcut: (s: Shortcut) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: category.id });

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        zIndex: isDragging ? 50 : undefined,
      }}
    >
      <CategoryCard
        category={category}
        onEdit={onEdit}
        onAddShortcut={onAddShortcut}
        onEditShortcut={onEditShortcut}
        dragging={isDragging}
        dragHandleProps={{ ...attributes, ...listeners }}
      />
    </div>
  );
}

export function SortableCategoryList({
  onEditCategory,
  onAddShortcut,
  onEditShortcut,
  filter,
}: Props) {
  const categories = useNewTabStore((s) => s.categories);
  const reorderCategories = useNewTabStore((s) => s.reorderCategories);

  const ordered = useMemo(() => {
    const sorted = [...categories].sort((a, b) => a.order - b.order);
    if (!filter?.trim()) return sorted;
    const q = filter.trim().toLowerCase();
    return sorted.filter((c) => c.name.toLowerCase().includes(q));
  }, [categories, filter]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const onDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const ids = ordered.map((c) => c.id);
    const oldIndex = ids.indexOf(active.id as string);
    const newIndex = ids.indexOf(over.id as string);
    if (oldIndex === -1 || newIndex === -1) return;
    reorderCategories(arrayMove(ids, oldIndex, newIndex));
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={onDragEnd}
    >
      <SortableContext
        items={ordered.map((c) => c.id)}
        strategy={verticalListSortingStrategy}
      >
        {ordered.map((c) => (
          <SortableCategory
            key={c.id}
            category={c}
            onEdit={onEditCategory}
            onAddShortcut={onAddShortcut}
            onEditShortcut={onEditShortcut}
          />
        ))}
      </SortableContext>
    </DndContext>
  );
}
