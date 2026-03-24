import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "resync-nav-layout";

type NavigationLayout = "sidebar" | "header";

export function useNavigationLayout() {
  const [layout, setLayoutState] = useState<NavigationLayout>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === "header" || stored === "sidebar") return stored;
    }
    return "sidebar";
  });

  const setLayout = useCallback((value: NavigationLayout) => {
    setLayoutState(value);
    localStorage.setItem(STORAGE_KEY, value);
    window.dispatchEvent(new CustomEvent("nav-layout-change", { detail: value }));
  }, []);

  useEffect(() => {
    const handler = (e: Event) => {
      const value = (e as CustomEvent).detail;
      if (value === "header" || value === "sidebar") {
        setLayoutState(value);
      }
    };
    const storageHandler = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && (e.newValue === "header" || e.newValue === "sidebar")) {
        setLayoutState(e.newValue);
      }
    };
    window.addEventListener("nav-layout-change", handler);
    window.addEventListener("storage", storageHandler);
    return () => {
      window.removeEventListener("nav-layout-change", handler);
      window.removeEventListener("storage", storageHandler);
    };
  }, []);

  return { layout, setLayout };
}
