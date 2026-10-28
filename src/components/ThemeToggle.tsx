"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="toggle-wrapper">
        <button className="toggle-button" aria-label="Toggle theme">
          ☀️
        </button>
      </div>
    );
  }

  const isDark = theme === "dark";

  return (
    <div
      className="toggle-wrapper"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      title={`Switch to ${isDark ? "light" : "dark"} mode`}
    >
      <button
        id="darkModeToggle"
        className="toggle-button"
        aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
      >
        {isDark ? "🌙" : "☀️"}
      </button>
    </div>
  );
}
