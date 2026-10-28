import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: {
          light: "#faf9f6",
          dark: "#0f0f10",
        },
        surface: {
          light: "#ffffff",
          dark: "#161618",
        },
        muted: {
          light: "#f0efec",
          dark: "#1f1f22",
        },
        border: {
          light: "#e5e4df",
          dark: "#27272a",
        },
        foreground: {
          light: "#121212",
          dark: "#f4f4f5",
        },
        subtle: {
          light: "#6e6e73",
          dark: "#a1a1aa",
        },
        accent: {
          light: "#2563eb",
          dark: "#60a5fa",
        },
      },
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          "Inter",
          '"Segoe UI"',
          "Roboto",
          "Helvetica",
          "Arial",
          "sans-serif",
        ],
        serif: ['"Newsreader"', '"Playfair Display"', '"Georgia"', "serif"],
        mono: [
          '"JetBrains Mono"',
          '"SF Mono"',
          "Menlo",
          "Monaco",
          "Consolas",
          "monospace",
        ],
      },
      maxWidth: {
        content: "680px",
      },
    },
  },
  plugins: [],
};
export default config;
