"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, FolderTree, ArrowLeft } from "lucide-react";
import { useNewTabStore } from "@/store/newtab-store";
import { useApplyTheme } from "@/hooks/use-newtab-theme";
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts";
import { cn } from "@/lib/utils";

import { SearchBar } from "./SearchBar";
import { QuickLaunch } from "./QuickLaunch";
import { Greeting } from "./Greeting";
import { SortableCategoryList } from "./SortableCategoryList";
import { SettingsPanel } from "./SettingsPanel";
import { InsightsView } from "./InsightsView";
import { FavoritesBar } from "./FavoritesBar";
import { ExpandableFab } from "./ExpandableFab";
import { ShortcutsHelp } from "./ShortcutsHelp";
import { ShortcutDialog } from "./dialogs/ShortcutDialog";
import { CategoryDialog } from "./dialogs/CategoryDialog";
import { ImportExportDialog } from "./dialogs/ImportExportDialog";
import type { Category, Shortcut, BackgroundStyle } from "@/types/newtab";

export function NewTabApp() {
  const rootRef = useRef<HTMLDivElement>(null);
  useApplyTheme(rootRef);

  const view = useNewTabStore((s) => s.view);
  const setView = useNewTabStore((s) => s.setView);
  const categories = useNewTabStore((s) => s.categories);
  const expandedCategoryId = useNewTabStore((s) => s.expandedCategoryId);
  const setExpandedCategory = useNewTabStore((s) => s.setExpandedCategory);
  const showClock = useNewTabStore((s) => s.settings.showClock);
  const showFavoritesBar = useNewTabStore((s) => s.settings.showFavoritesBar);
  const background = useNewTabStore((s) => s.settings.background);

  // Dialog state
  const [shortcutDialog, setShortcutDialog] = useState<{
    open: boolean;
    edit?: Shortcut | null;
    categoryId?: string;
  }>({ open: false });
  const [categoryDialog, setCategoryDialog] = useState<{
    open: boolean;
    edit?: Category | null;
  }>({ open: false });
  const [ioOpen, setIoOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);

  const openShortcutDialog = useCallback(() => {
    setShortcutDialog({ open: true });
  }, []);
  const openCategoryDialog = useCallback(() => {
    setCategoryDialog({ open: true });
  }, []);
  const openHelp = useCallback(() => setHelpOpen(true), []);

  useKeyboardShortcuts(
    openShortcutDialog,
    openCategoryDialog,
    openHelp
  );

  // Expand the first category by default on the dashboard view
  useEffect(() => {
    if (
      view === "dashboard" &&
      !expandedCategoryId &&
      categories.length > 0
    ) {
      setExpandedCategory(categories[0].id);
    }
  }, [view, expandedCategoryId, categories, setExpandedCategory]);

  const sortedCategories = [...categories].sort((a, b) => a.order - b.order);

  const bgClass =
    background === "mesh"
      ? "nt-bg-mesh"
      : background === "dots"
      ? "nt-bg-dots"
      : background === "plain"
      ? "nt-bg-plain"
      : "nt-aurora";

  return (
    <div
      ref={rootRef}
      className={cn("nt-app dark min-h-screen bg-background text-foreground")}
    >
      <div className={bgClass} aria-hidden />

      <main className="relative z-10 h-screen flex flex-col">
        <div className="flex-1 min-h-0 overflow-y-auto nt-scroll">
          <AnimatePresence mode="wait">
            {view === "dashboard" && (
              <motion.div
                key="dashboard"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="min-h-full flex flex-col items-center px-4 sm:px-8 pt-12 pb-24"
              >
                {showClock && (
                  <div className="mb-8">
                    <Greeting />
                  </div>
                )}

                <SearchBar />

                <div className="mt-3">
                  <QuickLaunch />
                </div>

                {showFavoritesBar && (
                  <div className="mt-8 w-full flex justify-center">
                    <FavoritesBar />
                  </div>
                )}

                <div className="w-full max-w-5xl mt-8 space-y-3">
                  <div className="flex items-center justify-between px-1 mb-1">
                    <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
                      <span className="size-1.5 rounded-full bg-[var(--nt-accent)]" />
                      Categories
                      <span className="text-muted-foreground font-normal tabular-nums">
                        {sortedCategories.length}
                      </span>
                    </h2>
                    <button
                      onClick={() => setCategoryDialog({ open: true })}
                      className="inline-flex items-center gap-1.5 text-sm font-medium text-foreground/80 hover:text-foreground nt-accent-soft px-2.5 py-1.5 rounded-lg hover:opacity-90 transition"
                    >
                      <Plus className="size-4" />
                      New category
                    </button>
                  </div>

                  <SortableCategoryList
                    onEditCategory={(cat) =>
                      setCategoryDialog({ open: true, edit: cat })
                    }
                    onAddShortcut={(catId) =>
                      setShortcutDialog({ open: true, categoryId: catId })
                    }
                    onEditShortcut={(sc) =>
                      setShortcutDialog({ open: true, edit: sc })
                    }
                  />

                  {sortedCategories.length === 0 && (
                    <EmptyState
                      icon={<FolderTree className="size-8" />}
                      title="No categories yet"
                      desc="Create your first category to start organizing shortcuts."
                      action={
                        <button
                          onClick={() => setCategoryDialog({ open: true })}
                          className="inline-flex items-center gap-2 rounded-xl nt-accent-soft px-4 py-2 text-sm font-medium"
                        >
                          <Plus className="size-4" />
                          Create category
                        </button>
                      }
                    />
                  )}
                </div>
              </motion.div>
            )}

            {view === "settings" && (
              <motion.div
                key="settings"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="min-h-full px-4 sm:px-8 pt-8 pb-24"
              >
                <button
                  onClick={() => setView("dashboard")}
                  className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ArrowLeft className="size-4" />
                  Back to dashboard
                </button>
                <SettingsPanel onOpenImportExport={() => setIoOpen(true)} />
              </motion.div>
            )}

            {view === "insights" && (
              <motion.div
                key="insights"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="min-h-full px-4 sm:px-8 pt-8 pb-24"
              >
                <button
                  onClick={() => setView("dashboard")}
                  className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ArrowLeft className="size-4" />
                  Back to dashboard
                </button>
                <InsightsView />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <Footer onHelp={() => setHelpOpen(true)} />
      </main>

      {/* Expandable floating action button */}
      <ExpandableFab
        onAddShortcut={() => setShortcutDialog({ open: true })}
        onAddCategory={() => setCategoryDialog({ open: true })}
      />

      {/* Dialogs */}
      <ShortcutDialog
        open={shortcutDialog.open}
        onOpenChange={(v) =>
          setShortcutDialog((p) => ({ ...p, open: v }))
        }
        shortcut={shortcutDialog.edit}
        defaultCategoryId={shortcutDialog.categoryId}
      />
      <CategoryDialog
        open={categoryDialog.open}
        onOpenChange={(v) =>
          setCategoryDialog((p) => ({ ...p, open: v }))
        }
        category={categoryDialog.edit}
      />
      <ImportExportDialog open={ioOpen} onOpenChange={setIoOpen} />
      <ShortcutsHelp open={helpOpen} onOpenChange={setHelpOpen} />
    </div>
  );
}

function Footer({
  onHelp,
}: {
  onHelp: () => void;
}) {
  return (
    <footer className="shrink-0 border-t border-border bg-background/40 backdrop-blur px-6 py-3 flex items-center justify-center gap-2 text-xs text-muted-foreground/90">
      <span>New Tab Dashboard</span>
      <span className="opacity-30">·</span>
      <span className="inline-flex items-center gap-1">
        <kbd className="nt-kbd">/</kbd> search
      </span>
      <span className="opacity-30">·</span>
      <button
        onClick={onHelp}
        className="inline-flex items-center gap-1 hover:text-foreground transition-colors"
      >
        <kbd className="nt-kbd">?</kbd> help
      </button>
    </footer>
  );
}

function EmptyState({
  icon,
  title,
  desc,
  action,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="nt-card rounded-3xl p-12 flex flex-col items-center text-center">
      <span className="grid place-items-center size-16 rounded-2xl nt-accent-soft mb-4">
        {icon}
      </span>
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="text-sm text-muted-foreground mt-1 max-w-xs">{desc}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
