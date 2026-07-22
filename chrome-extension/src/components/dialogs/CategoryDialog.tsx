import { useEffect, useState } from "react";
import { useStore, ACCENT_PRESETS } from "@/store/useStore";
import { Dialog, Field, inputClass, btnPrimary, btnGhost } from "./_Dialog";
import { ICON_OPTIONS, getIcon } from "@/components/IconMap";

export function CategoryDialog() {
  const dialog = useStore((s) => s.categoryDialog);
  const close = useStore((s) => s.closeCategoryDialog);
  const categories = useStore((s) => s.categories);
  const addCategory = useStore((s) => s.addCategory);
  const updateCategory = useStore((s) => s.updateCategory);

  const editing = dialog.editId
    ? categories.find((c) => c.id === dialog.editId)
    : null;

  const [name, setName] = useState("");
  const [icon, setIcon] = useState("Folder");
  const [color, setColor] = useState<string>("");

  useEffect(() => {
    if (dialog.open) {
      setName(editing?.name ?? "");
      setIcon(editing?.icon ?? "Folder");
      setColor(editing?.color ?? "");
    }
  }, [dialog.open, editing]);

  const valid = name.trim().length > 0;
  const PreviewIcon = getIcon(icon);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!valid) return;
    const data = {
      name: name.trim(),
      icon,
      color: color || undefined,
    };
    if (editing) {
      updateCategory(editing.id, data);
    } else {
      addCategory(data);
    }
    close();
  };

  return (
    <Dialog
      open={dialog.open}
      onClose={close}
      title={editing ? "Edit category" : "New category"}
      description="Group related shortcuts together."
      footer={
        <>
          <button type="button" onClick={close} className={btnGhost}>
            Cancel
          </button>
          <button
            type="submit"
            form="category-form"
            className={btnPrimary}
            disabled={!valid}
          >
            {editing ? "Save changes" : "Create category"}
          </button>
        </>
      }
    >
      <form id="category-form" onSubmit={onSubmit} className="space-y-4">
        <Field label="Name">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Development"
            className={inputClass}
            autoFocus
            required
          />
        </Field>

        <Field
          label="Icon"
          hint="Pick a Lucide icon for the category tile."
        >
          <div className="flex items-center gap-3">
            <div
              className="shrink-0 w-10 h-10 rounded-xl grid place-items-center"
              style={{
                background: `color-mix(in srgb, ${color || "var(--nt-accent)"} 18%, transparent)`,
                color: color || "var(--nt-accent)",
              }}
            >
              <PreviewIcon size={18} />
            </div>
            <select
              value={icon}
              onChange={(e) => setIcon(e.target.value)}
              className={inputClass}
            >
              {ICON_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
        </Field>

        <Field
          label="Accent color"
          hint="Optional. Falls back to the global accent."
        >
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => setColor("")}
              className={`nt-focus w-7 h-7 rounded-full border-2 grid place-items-center ${
                color === ""
                  ? "border-[var(--nt-accent)]"
                  : "border-border"
              }`}
              style={{
                background: "var(--muted)",
              }}
              aria-label="Use default accent"
            >
              {color === "" && (
                <span className="text-[10px] text-muted-foreground">auto</span>
              )}
            </button>
            {ACCENT_PRESETS.map((p) => (
              <button
                key={p.value}
                type="button"
                onClick={() => setColor(p.value)}
                aria-label={p.name}
                className={`nt-focus w-7 h-7 rounded-full transition-transform hover:scale-110 ${
                  color.toLowerCase() === p.value.toLowerCase()
                    ? "ring-2"
                    : ""
                }`}
                style={{
                  background: p.value,
                  boxShadow:
                    color.toLowerCase() === p.value.toLowerCase()
                      ? `0 0 0 2px ${p.value}`
                      : undefined,
                }}
              />
            ))}
            <label
              className="nt-focus w-7 h-7 rounded-full overflow-hidden border border-border grid place-items-center cursor-pointer"
              style={{
                background:
                  "conic-gradient(from 0deg, #f43f5e, #f59e0b, #10b981, #06b6d4, #6366f1, #ec4899, #f43f5e)",
              }}
              title="Custom color"
            >
              <input
                type="color"
                value={color || "#5e81f4"}
                onChange={(e) => setColor(e.target.value)}
                className="opacity-0 w-0 h-0"
                aria-label="Pick a custom category color"
              />
            </label>
          </div>
        </Field>
      </form>
    </Dialog>
  );
}
