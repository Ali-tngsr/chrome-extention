import { useRef, useState } from "react";
import { Download, Upload, FileJson, AlertCircle, CheckCircle2 } from "lucide-react";
import { useStore, DEFAULT_SETTINGS } from "@/store/useStore";
import { Dialog, btnPrimary, btnGhost } from "./_Dialog";
import type { NewTabData } from "@/types";

function isPartialData(input: unknown): input is Partial<NewTabData> {
  if (!input || typeof input !== "object") return false;
  const obj = input as Record<string, unknown>;
  return (
    Array.isArray(obj.categories) ||
    Array.isArray(obj.shortcuts) ||
    (typeof obj.settings === "object" && obj.settings !== null)
  );
}

export function ImportExportDialog() {
  const dialog = useStore((s) => s.importExportDialog);
  const close = useStore((s) => s.closeImportExport);
  const exportData = useStore((s) => s.exportData);
  const importData = useStore((s) => s.importData);

  const [message, setMessage] = useState<{ kind: "ok" | "err"; text: string } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const onClose = () => {
    setMessage(null);
    close();
  };

  const onExport = () => {
    const data = exportData();
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const stamp = new Date().toISOString().slice(0, 10);
    a.download = `newtab-export-${stamp}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setMessage({
      kind: "ok",
      text: `Exported ${data.categories.length} categories and ${data.shortcuts.length} shortcuts.`,
    });
  };

  const onImportFile = async (file: File) => {
    try {
      const text = await file.text();
      const parsed = JSON.parse(text) as unknown;
      if (!isPartialData(parsed)) {
        setMessage({ kind: "err", text: "Invalid file: shape does not match." });
        return;
      }
      importData({
        categories: parsed.categories ?? [],
        shortcuts: parsed.shortcuts ?? [],
        settings: { ...DEFAULT_SETTINGS, ...(parsed.settings ?? {}) },
      });
      setMessage({
        kind: "ok",
        text: `Imported ${(parsed.categories ?? []).length} categories and ${(parsed.shortcuts ?? []).length} shortcuts.`,
      });
    } catch {
      setMessage({ kind: "err", text: "Failed to parse JSON file." });
    }
  };

  return (
    <Dialog
      open={dialog.open}
      onClose={onClose}
      title={dialog.mode === "export" ? "Export data" : "Import data"}
      description="Backup or restore your categories, shortcuts and settings."
      maxWidth="max-w-lg"
      footer={
        <>
          <button type="button" onClick={onClose} className={btnGhost}>
            Close
          </button>
          {dialog.mode === "export" ? (
            <button type="button" onClick={onExport} className={btnPrimary}>
              <Download size={14} className="mr-1.5" /> Download JSON
            </button>
          ) : (
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className={btnPrimary}
            >
              <Upload size={14} className="mr-1.5" /> Choose file
            </button>
          )}
        </>
      }
    >
      <input
        ref={fileRef}
        type="file"
        accept="application/json,.json"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onImportFile(f);
          e.target.value = "";
        }}
      />

      <div className="space-y-4">
        <div className="flex items-start gap-3 p-3 rounded-xl bg-[var(--muted)]">
          <div className="shrink-0 w-9 h-9 rounded-lg grid place-items-center nt-accent-soft">
            <FileJson size={18} />
          </div>
          <div className="text-sm text-foreground">
            {dialog.mode === "export" ? (
              <>
                <div className="font-medium">Download a JSON snapshot</div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  Includes all categories, shortcuts and current settings.
                  Re-import on any device signed into the same Chrome profile
                  to sync via chrome.storage.sync.
                </div>
              </>
            ) : (
              <>
                <div className="font-medium">Restore from a JSON file</div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  Replaces your current categories, shortcuts and settings.
                  Validate shape before applying.
                </div>
              </>
            )}
          </div>
        </div>

        {message && (
          <div
            className={`flex items-start gap-2 p-3 rounded-xl text-sm ${
              message.kind === "ok"
                ? "bg-emerald-500/10 text-emerald-500"
                : "bg-destructive/10 text-destructive"
            }`}
            role="status"
          >
            {message.kind === "ok" ? (
              <CheckCircle2 size={16} className="shrink-0 mt-0.5" />
            ) : (
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
            )}
            <span>{message.text}</span>
          </div>
        )}
      </div>
    </Dialog>
  );
}
