import { motion } from "framer-motion";
import {
  LayoutDashboard,
  FolderKanban,
  Settings as SettingsIcon,
  Download,
  Upload,
  PanelLeftClose,
  PanelLeft,
  Plus,
} from "lucide-react";
import { useStore } from "@/store/useStore";
import type { ViewKey } from "@/types";

interface NavItem {
  key: ViewKey;
  label: string;
  icon: typeof LayoutDashboard;
  shortcut?: string;
}

const NAV_ITEMS: NavItem[] = [
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard, shortcut: "g d" },
  { key: "categories", label: "All Categories", icon: FolderKanban, shortcut: "g c" },
  { key: "settings", label: "Settings", icon: SettingsIcon, shortcut: "g s" },
];

export function Sidebar() {
  const view = useStore((s) => s.view);
  const setView = useStore((s) => s.setView);
  const collapsed = useStore((s) => s.sidebarCollapsed);
  const toggleSidebar = useStore((s) => s.toggleSidebar);
  const openImportExport = useStore((s) => s.openImportExport);
  const openCategoryDialog = useStore((s) => s.openCategoryDialog);
  const categories = useStore((s) => s.categories);

  return (
    <motion.aside
      animate={{ width: collapsed ? 64 : 232 }}
      initial={false}
      transition={{ type: "spring", stiffness: 380, damping: 36 }}
      className="shrink-0 sticky top-0 h-screen z-20 border-r border-sidebar-border bg-sidebar text-sidebar-foreground flex flex-col"
      aria-label="Sidebar"
    >
      <div className="flex items-center justify-between px-3 py-4">
        {!collapsed && (
          <div className="text-sm font-semibold tracking-tight pl-1">
            New Tab
          </div>
        )}
        <button
          onClick={toggleSidebar}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="nt-focus w-8 h-8 grid place-items-center rounded-lg hover:bg-sidebar-accent transition-colors"
        >
          {collapsed ? <PanelLeft size={16} /> : <PanelLeftClose size={16} />}
        </button>
      </div>

      <nav className="flex-1 px-2 flex flex-col gap-1">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = view === item.key;
          return (
            <button
              key={item.key}
              onClick={() => setView(item.key)}
              aria-current={active ? "page" : undefined}
              title={collapsed ? item.label : undefined}
              className={`nt-focus group relative flex items-center gap-3 px-2.5 h-9 rounded-lg transition-colors text-sm ${
                active
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "hover:bg-sidebar-accent/70 text-sidebar-foreground/80 hover:text-sidebar-foreground"
              } ${collapsed ? "justify-center" : ""}`}
            >
              <Icon size={16} className="shrink-0" aria-hidden />
              {!collapsed && <span className="flex-1 text-left">{item.label}</span>}
              {!collapsed && item.shortcut && (
                <kbd className="nt-kbd opacity-70">{item.shortcut}</kbd>
              )}
            </button>
          );
        })}

        <div className="my-2 h-px bg-sidebar-border" />

        <button
          onClick={() => openImportExport("import")}
          title={collapsed ? "Import" : undefined}
          className={`nt-focus flex items-center gap-3 px-2.5 h-9 rounded-lg transition-colors text-sm hover:bg-sidebar-accent/70 text-sidebar-foreground/80 hover:text-sidebar-foreground ${
            collapsed ? "justify-center" : ""
          }`}
        >
          <Upload size={16} className="shrink-0" aria-hidden />
          {!collapsed && <span className="flex-1 text-left">Import</span>}
        </button>
        <button
          onClick={() => openImportExport("export")}
          title={collapsed ? "Export" : undefined}
          className={`nt-focus flex items-center gap-3 px-2.5 h-9 rounded-lg transition-colors text-sm hover:bg-sidebar-accent/70 text-sidebar-foreground/80 hover:text-sidebar-foreground ${
            collapsed ? "justify-center" : ""
          }`}
        >
          <Download size={16} className="shrink-0" aria-hidden />
          {!collapsed && <span className="flex-1 text-left">Export</span>}
        </button>
      </nav>

      <div className="p-2 border-t border-sidebar-border">
        <button
          onClick={() => openCategoryDialog(null)}
          title={collapsed ? "New category" : undefined}
          className={`nt-focus w-full flex items-center gap-3 px-2.5 h-9 rounded-lg transition-colors text-sm nt-accent-soft hover:opacity-90 ${
            collapsed ? "justify-center" : ""
          }`}
        >
          <Plus size={16} className="shrink-0" aria-hidden />
          {!collapsed && <span className="flex-1 text-left">New category</span>}
        </button>
        {!collapsed && (
          <div className="mt-3 px-2 text-[11px] text-muted-foreground">
            {categories.length} categor{categories.length === 1 ? "y" : "ies"}
          </div>
        )}
      </div>
    </motion.aside>
  );
}
