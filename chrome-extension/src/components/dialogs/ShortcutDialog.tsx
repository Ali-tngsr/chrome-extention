import { useEffect, useState } from "react";
import { useStore } from "@/store/useStore";
import { Dialog, Field, inputClass, btnPrimary, btnGhost } from "./_Dialog";
import { getFaviconUrl } from "@/lib/url";

export function ShortcutDialog() {
  const dialog = useStore((s) => s.shortcutDialog);
  const close = useStore((s) => s.closeShortcutDialog);
  const shortcuts = useStore((s) => s.shortcuts);
  const categories = useStore((s) => s.categories);
  const addShortcut = useStore((s) => s.addShortcut);
  const updateShortcut = useStore((s) => s.updateShortcut);

  const editing = dialog.editId
    ? shortcuts.find((s) => s.id === dialog.editId)
    : null;

  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState<string>("");
  const [icon, setIcon] = useState<string>("");

  useEffect(() => {
    if (dialog.open) {
      setTitle(editing?.title ?? "");
      setUrl(editing?.url ?? "");
      setDescription(editing?.description ?? "");
      setCategoryId(
        editing?.categoryId ?? dialog.categoryId ?? categories[0]?.id ?? ""
      );
      setIcon(editing?.icon ?? "");
    }
  }, [dialog.open, dialog.categoryId, editing, categories]);

  const valid = title.trim() && url.trim() && categoryId;

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!valid) return;
    const data = {
      title: title.trim(),
      url: url.trim(),
      description: description.trim() || undefined,
      categoryId,
      icon: icon.trim() || undefined,
    };
    if (editing) {
      updateShortcut(editing.id, data);
    } else {
      addShortcut(data);
    }
    close();
  };

  return (
    <Dialog
      open={dialog.open}
      onClose={close}
      title={editing ? "Edit shortcut" : "Add shortcut"}
      description="Shortcuts open in a new tab when clicked."
      footer={
        <>
          <button type="button" onClick={close} className={btnGhost}>
            Cancel
          </button>
          <button
            type="submit"
            form="shortcut-form"
            className={btnPrimary}
            disabled={!valid}
          >
            {editing ? "Save changes" : "Add shortcut"}
          </button>
        </>
      }
    >
      <form id="shortcut-form" onSubmit={onSubmit} className="space-y-4">
        <Field label="Title">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="GitHub"
            className={inputClass}
            autoFocus
            required
          />
        </Field>

        <Field label="URL" hint="Will be opened in a new tab.">
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://github.com"
            className={inputClass}
            required
          />
        </Field>

        <Field label="Category">
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className={inputClass}
            required
          >
            {categories.length === 0 && <option value="">No categories</option>}
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Description" hint="Optional, shown under the tile.">
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Code hosting"
            className={inputClass}
          />
        </Field>

        <Field
          label="Custom icon URL"
          hint="Defaults to the site's favicon. Leave blank to auto-fetch."
        >
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={icon}
              onChange={(e) => setIcon(e.target.value)}
              placeholder="https://…"
              className={inputClass}
            />
            <div className="w-9 h-9 rounded-md overflow-hidden grid place-items-center bg-[var(--muted)] shrink-0">
              {icon ? (
                <img
                  src={icon}
                  alt=""
                  className="w-7 h-7 object-contain"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).style.visibility =
                      "hidden";
                  }}
                />
              ) : url ? (
                <img
                  src={getFaviconUrl(url)}
                  alt=""
                  className="w-6 h-6 object-contain"
                />
              ) : null}
            </div>
          </div>
        </Field>
      </form>
    </Dialog>
  );
}
