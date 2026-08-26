"use client";

/* eslint-disable react-hooks/set-state-in-effect */
// Reason: This component requires setState in effects for two valid patterns:
// 1. Setting 'mounted' flag after hydration to prevent mismatch (standard React pattern)
// 2. Updating theme state in system preference change listener (event-driven update)

import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";

/**
 * Theme toggle button for switching between light and dark modes.
 *
 * Persists preference to localStorage and respects system preference on first visit.
 * Uses a sun/moon icon with smooth transitions.
 */

const applyTheme = (newTheme: "light" | "dark") => {
  if (typeof document !== "undefined") {
    document.documentElement.dataset.theme = newTheme;
  }
};

const getInitialTheme = (): "light" | "dark" => {
  if (typeof window === "undefined") return "light";
  
  const stored = localStorage.getItem("theme") as "light" | "dark" | null;
  if (stored) return stored;
  
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  return prefersDark ? "dark" : "light";
};

export function ThemeToggle({ className }: { className?: string }) {
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    const initial = getInitialTheme();
    // Apply immediately during state initialization
    applyTheme(initial);
    return initial;
  });
  const [mounted, setMounted] = useState(false);

  // Just mark as mounted - theme already applied during initialization
  useEffect(() => {
    setMounted(true);
    
    // Listen for system preference changes
    const handleSystemThemeChange = (e: MediaQueryListEvent) => {
      const hasManualPreference = localStorage.getItem("theme");
      if (!hasManualPreference) {
        const newTheme = e.matches ? "dark" : "light";
        setTheme(newTheme);
        applyTheme(newTheme);
      }
    };
    
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    mediaQuery.addEventListener("change", handleSystemThemeChange);
    return () => mediaQuery.removeEventListener("change", handleSystemThemeChange);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    applyTheme(newTheme);
    localStorage.setItem("theme", newTheme);
  };

  // Don't render until mounted to avoid hydration mismatch
  if (!mounted) {
    return (
      <div
        className={cn(
          "size-10 shrink-0 rounded-full border border-line bg-surface",
          className,
        )}
        aria-hidden="true"
      />
    );
  }

  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
      className={cn(
        "group relative size-10 shrink-0 overflow-hidden rounded-full border border-line bg-surface transition-colors hover:border-muted",
        "focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none",
        className,
      )}
    >
      {/* Sun icon - visible in dark mode */}
      <span
        className={cn(
          "absolute inset-0 flex items-center justify-center text-accent transition-transform duration-300",
          isDark ? "translate-y-0" : "-translate-y-full",
        )}
        aria-hidden="true"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="size-5"
        >
          <circle cx="12" cy="12" r="4" stroke="currentColor" />
          <path
            d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"
            stroke="currentColor"
          />
        </svg>
      </span>

      {/* Moon icon - visible in light mode */}
      <span
        className={cn(
          "absolute inset-0 flex items-center justify-center text-foreground transition-transform duration-300",
          isDark ? "translate-y-full" : "translate-y-0",
        )}
        aria-hidden="true"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="size-5"
        >
          <path
            d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"
            stroke="currentColor"
          />
        </svg>
      </span>
    </button>
  );
}
