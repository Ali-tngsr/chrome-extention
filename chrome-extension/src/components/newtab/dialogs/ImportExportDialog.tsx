"use client";

import { useMemo, useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Download, Upload, FileJson, CheckCircle2, AlertCircle } from "lucide-react";
import { useNewTabStore } from "@/store/newtab-store";
import type { NewTabData } from "@/types/newtab";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}

export function ImportExportDialog({ open, onOpenChange }: Props) {
  const exportData = useNewTabStore((s) => s.exportData);
  const importData = useNewTabStore((s) => s.importData);

  const json = useMemo(
    () => JSON.stringify(exportData(), null, 2),
    [exportData, open]
  );

  const [importText, setImportText] = useState("");
  const [status, setStatus] = useState<
    { ok: boolean; msg: string } | null
  >(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const download = () => {
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `newtab-backup-${new Date()
      .toISOString()
      .slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const onFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      setImportText(String(reader.result || ""));
    };
    reader.readAsText(file);
  };

  const doImport = () => {
    try {
      const parsed = JSON.parse(importText) as NewTabData;
      if (!parsed || !Array.isArray(parsed.categories) || !Array.isArray(parsed.shortcuts)) {
        throw new Error("Invalid shape");
      }
      importData(parsed);
      setStatus({ ok: true, msg: "Imported successfully." });
      setTimeout(() => {
        onOpenChange(false);
        setStatus(null);
        setImportText("");
      }, 900);
    } catch (e) {
      setStatus({
        ok: false,
        msg: `Could not parse JSON. ${(e as Error).message}`,
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Import / Export</DialogTitle>
          <DialogDescription>
            Back up your dashboard or move it to another device.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="export" className="w-full">
          <TabsList className="grid grid-cols-2 w-full">
            <TabsTrigger value="export">
              <Download className="mr-2 size-4" />
              Export
            </TabsTrigger>
            <TabsTrigger value="import">
              <Upload className="mr-2 size-4" />
              Import
            </TabsTrigger>
          </TabsList>

          <TabsContent value="export" className="mt-4 space-y-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <FileJson className="size-4" />
              {exportData().categories.length} categories ·{" "}
              {exportData().shortcuts.length} shortcuts
            </div>
            <Textarea
              readOnly
              value={json}
              className="h-48 font-mono text-xs nt-scroll"
            />
            <Button onClick={download} className="w-full">
              <Download className="mr-2 size-4" />
              Download JSON
            </Button>
          </TabsContent>

          <TabsContent value="import" className="mt-4 space-y-3">
            <input
              ref={fileRef}
              type="file"
              accept="application/json,.json"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) onFile(f);
                e.target.value = "";
              }}
            />
            <Button
              variant="outline"
              className="w-full border-dashed"
              onClick={() => fileRef.current?.click()}
            >
              <Upload className="mr-2 size-4" />
              Choose JSON file…
            </Button>
            <div className="text-center text-xs text-muted-foreground">
              or paste JSON below
            </div>
            <Textarea
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
              placeholder='{ "categories": [...], "shortcuts": [...] }'
              className="h-40 font-mono text-xs nt-scroll"
            />
            {status && (
              <div
                className={`flex items-center gap-2 text-sm ${
                  status.ok ? "text-emerald-500" : "text-destructive"
                }`}
              >
                {status.ok ? (
                  <CheckCircle2 className="size-4" />
                ) : (
                  <AlertCircle className="size-4" />
                )}
                {status.msg}
              </div>
            )}
            <Button
              onClick={doImport}
              disabled={!importText.trim()}
              className="w-full"
            >
              <Upload className="mr-2 size-4" />
              Import data
            </Button>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
