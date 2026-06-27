"use client";

import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

type Theme = "light" | "dark";

const STORAGE_KEY = "aml-theme";

function applyTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme;
}

export function ThemeToggle({ compact = false }: { compact?: boolean }) {
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    const nextTheme: Theme = saved === "dark" ? "dark" : "light";
    setTheme(nextTheme);
    applyTheme(nextTheme);
  }, []);

  function toggleTheme() {
    const nextTheme: Theme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    window.localStorage.setItem(STORAGE_KEY, nextTheme);
    applyTheme(nextTheme);
  }

  const isDark = theme === "dark";
  const Icon = isDark ? Sun : Moon;

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? "Ganti ke tema terang" : "Ganti ke tema gelap"}
      className={cn(
        "inline-flex min-h-10 items-center justify-center gap-2 rounded-full border border-border-subtle bg-white px-3 text-sm font-bold text-primary shadow-sm transition hover:bg-surface-gray",
        compact ? "h-11 w-11 px-0" : "px-4"
      )}
    >
      <Icon size={18} aria-hidden="true" />
      {compact ? null : <span>{isDark ? "Terang" : "Gelap"}</span>}
    </button>
  );
}
