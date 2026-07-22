"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useNewTabStore } from "@/store/newtab-store";
import { ICON_OPTIONS, getIcon } from "../icon-map";
import type { Category } from "@/types/newtab";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  category?: Category | null;
}

export function CategoryDialog({ open, onOpenChange, category }: Props) {
  const addCategory = useNewTabStore((s) => s.addCategory);
  const updateCategory = useNewTabStore((s) => s.updateCategory);

  const [name, setName] = useState("");
  const [icon, setIcon] = useState("Folder");
  const [color, setColor] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    if (category) {
      setName(category.name);
      setIcon(category.icon);
      setColor(category.color || "");
    } else {
      setName("");
      setIcon("Folder");
      setColor("");
    }
    setError(null);
  }, [open, category]);

  const submit = () => {
    if (!name.trim()) return setError("Name is required");
    if (category) {
      updateCategory(category.id, {
        name: name.trim(),
        icon,
        color: color || undefined,
      });
    } else {
      addCategory({ name: name.trim(), icon, color: color || undefined });
    }
    onOpenChange(false);
  };

  const PreviewIcon = getIcon(icon);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {category ? "Edit category" : "New category"}
          </DialogTitle>
          <DialogDescription>
            Organize your shortcuts into categories.
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center gap-3 py-1">
          <span
            className="grid place-items-center size-12 rounded-xl shrink-0 nt-accent-soft"
            style={color ? { background: `${color}22`, color } : undefined}
          >
            <PreviewIcon className="size-5" />
          </span>
          <div className="text-xs text-muted-foreground">
            Live preview of the category icon.
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="cat-name">Name</Label>
            <Input
              id="cat-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Development"
              autoFocus
            />
          </div>

          <div className="space-y-1.5">
            <Label>Icon</Label>
            <div className="grid grid-cols-8 gap-1.5 max-h-32 overflow-y-auto nt-scroll p-1 rounded-xl border border-border">
              {ICON_OPTIONS.map((name) => {
                const Icon = getIcon(name);
                const active = icon === name;
                return (
                  <button
                    key={name}
                    type="button"
                    onClick={() => setIcon(name)}
                    className={cn(
                      "grid place-items-center size-9 rounded-lg transition-colors",
                      active
                        ? "bg-[var(--nt-accent)]/15 text-[var(--nt-accent)]"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                    title={name}
                  >
                    <Icon className="size-4" />
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="cat-color">
              Color{" "}
              <span className="text-muted-foreground font-normal">(optional)</span>
            </Label>
            <div className="flex items-center gap-2">
              <Input
                id="cat-color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                placeholder="#5e81f4"
                className="flex-1"
              />
              <label
                className="size-9 rounded-lg border border-dashed border-border grid place-items-center cursor-pointer hover:border-[var(--nt-accent)] relative overflow-hidden shrink-0"
                title="Pick color"
              >
                <input
                  type="color"
                  value={color || "#5e81f4"}
                  onChange={(e) => setColor(e.target.value)}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                {color ? (
                  <span
                    className="size-5 rounded grid place-items-center"
                    style={{ background: color }}
                  >
                    <Check className="size-3 text-white" />
                  </span>
                ) : (
                  <span className="text-xs text-muted-foreground">+</span>
                )}
              </label>
            </div>
          </div>
        </div>

        {error && (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        )}

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={submit}>
            {category ? "Save changes" : "Create category"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
