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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useNewTabStore } from "@/store/newtab-store";
import { normalizeUrl } from "@/lib/url";
import { SmartFavicon } from "../SmartFavicon";
import type { Shortcut } from "@/types/newtab";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  /** when editing, the shortcut being edited */
  shortcut?: Shortcut | null;
  /** default category for new shortcuts */
  defaultCategoryId?: string;
}

export function ShortcutDialog({
  open,
  onOpenChange,
  shortcut,
  defaultCategoryId,
}: Props) {
  const categories = useNewTabStore((s) => s.categories);
  const addShortcut = useNewTabStore((s) => s.addShortcut);
  const updateShortcut = useNewTabStore((s) => s.updateShortcut);

  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [description, setDescription] = useState("");
  const [icon, setIcon] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    if (shortcut) {
      setTitle(shortcut.title);
      setUrl(shortcut.url);
      setCategoryId(shortcut.categoryId);
      setDescription(shortcut.description || "");
      setIcon(shortcut.icon || "");
    } else {
      setTitle("");
      setUrl("");
      setCategoryId(defaultCategoryId || categories[0]?.id || "");
      setDescription("");
      setIcon("");
    }
    setError(null);
  }, [open, shortcut, defaultCategoryId, categories]);

  const previewUrl = url.trim() ? normalizeUrl(url) : "";

  const submit = () => {
    if (!title.trim()) return setError("Title is required");
    if (!url.trim()) return setError("URL is required");
    try {
      // validate
       
      new URL(normalizeUrl(url));
    } catch {
      return setError("Enter a valid URL");
    }
    if (!categoryId) return setError("Choose a category");

    if (shortcut) {
      updateShortcut(shortcut.id, {
        title: title.trim(),
        url: normalizeUrl(url),
        categoryId,
        description: description.trim() || undefined,
        icon: icon.trim() || undefined,
      });
    } else {
      addShortcut({
        title: title.trim(),
        url: normalizeUrl(url),
        categoryId,
        description: description.trim() || undefined,
        icon: icon.trim() || undefined,
      });
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {shortcut ? "Edit shortcut" : "Add shortcut"}
          </DialogTitle>
          <DialogDescription>
            {shortcut
              ? "Update the details for this shortcut."
              : "Create a new shortcut to a website."}
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center gap-3 py-1">
          <span className="grid place-items-center size-12 rounded-xl bg-muted overflow-hidden shrink-0">
            {previewUrl ? (
              <SmartFavicon
                url={previewUrl}
                title={title || "shortcut"}
                icon={icon}
                className="size-7"
              />
            ) : (
              <span className="text-xs text-muted-foreground">URL</span>
            )}
          </span>
          <div className="text-xs text-muted-foreground">
            Favicon preview updates as you type the URL. Multiple providers are
            tried automatically.
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="sc-title">Title</Label>
            <Input
              id="sc-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="GitHub"
              autoFocus
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="sc-url">URL</Label>
            <Input
              id="sc-url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="github.com"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="sc-cat">Category</Label>
            <Select value={categoryId} onValueChange={setCategoryId}>
              <SelectTrigger id="sc-cat">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="sc-desc">
              Description{" "}
              <span className="text-muted-foreground font-normal">(optional)</span>
            </Label>
            <Input
              id="sc-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Code hosting"
            />
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
            {shortcut ? "Save changes" : "Add shortcut"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
