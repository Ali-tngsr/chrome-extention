import { memo, useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { MoreVertical } from "lucide-react";
import { useStore } from "@/store/useStore";
import { getFaviconUrl, getMonogram, colorFromString } from "@/lib/url";
import type { Shortcut } from "@/types";

interface ShortcutTileProps {
  shortcut: Shortcut;
  compact?: boolean;
}

function ShortcutTileBase({ shortcut, compact }: ShortcutTileProps) {
  const openContextMenu = useStore((s) => s.openContextMenu);

  const [imgError, setImgError] = useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: shortcut.id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  const onOpen = () => {
    window.open(shortcut.url, "_blank", "noopener,noreferrer");
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="nt-tile nt-card group relative rounded-xl p-3 cursor-pointer"
      onClick={onOpen}
      onContextMenu={(e) => {
        e.preventDefault();
        openContextMenu(e.clientX, e.clientY, shortcut.id);
      }}
      role="button"
      tabIndex={0}
      aria-label={`Open ${shortcut.title}`}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpen();
        }
      }}
    >
      <div className={`flex items-center gap-3 ${compact ? "" : "py-0.5"}`}>
        <div
          className="shrink-0 w-8 h-8 rounded-lg grid place-items-center overflow-hidden"
          style={{ background: "var(--muted)" }}
        >
          {!imgError && shortcut.icon ? (
            <img
              src={shortcut.icon}
              alt=""
              className="w-7 h-7 object-contain"
              onError={() => setImgError(true)}
            />
          ) : !imgError ? (
            <img
              src={getFaviconUrl(shortcut.url)}
              alt=""
              className="w-6 h-6 object-contain"
              onError={() => setImgError(true)}
            />
          ) : (
            <span
              className="text-sm font-semibold"
              style={{ color: colorFromString(shortcut.title) }}
            >
              {getMonogram(shortcut.title)}
            </span>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-sm font-medium text-foreground truncate">
            {shortcut.title}
          </div>
          {shortcut.description && !compact && (
            <div className="text-[11px] text-muted-foreground truncate">
              {shortcut.description}
            </div>
          )}
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            openContextMenu(e.clientX, e.clientY, shortcut.id);
          }}
          aria-label="More options"
          className="opacity-0 group-hover:opacity-100 transition-opacity nt-focus w-7 h-7 grid place-items-center rounded-md hover:bg-[var(--muted)]"
        >
          <MoreVertical size={14} />
        </button>
      </div>
    </div>
  );
}

export const ShortcutTile = memo(ShortcutTileBase);
