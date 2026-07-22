/** Module-level registry so global keyboard shortcuts can focus the search. */
type FocusFn = () => void;

let focusFn: FocusFn | null = null;

export function registerSearchFocus(fn: FocusFn | null) {
  focusFn = fn;
}

export function focusSearch() {
  focusFn?.();
}

export function isSearchFocused(): boolean {
  return (
    typeof document !== "undefined" &&
    document.activeElement?.getAttribute("data-nt-search") === "true"
  );
}
