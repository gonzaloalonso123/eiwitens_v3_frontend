"use client";

import { useEffect } from "react";
import { useTheme } from "next-themes";

export function ThemeScript() {
  const { setTheme, theme } = useTheme();

  useEffect(() => {
    // Force light theme to ensure consistency
    setTheme("light");
  }, [setTheme]);

  return null;
}
