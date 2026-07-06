import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // AgriLink design tokens
        forest: {
          DEFAULT: "#16342A", // primary — growth / trust
          light: "#20493C",
          dark: "#0E241C",
        },
        harvest: {
          DEFAULT: "#E4A335", // accent — grain / cash-crop
          light: "#F0BE63",
          dark: "#B87F1F",
        },
        clay: {
          DEFAULT: "#7A4B2E", // secondary accent — soil / transport
          light: "#96613D",
        },
        parchment: {
          DEFAULT: "#F6F1E7", // background
          dim: "#EFE8D8",
        },
        sky: {
          DEFAULT: "#2E6E8E", // trust / escrow / transport
          light: "#3F8AB0",
        },
        ink: "#1B1B16",
      },
      fontFamily: {
        display: ["var(--font-fraunces)", "serif"],
        body: ["var(--font-inter)", "sans-serif"],
        mono: ["var(--font-plex-mono)", "monospace"],
      },
      borderRadius: {
        xl: "1rem",
        "2xl": "1.5rem",
      },
      boxShadow: {
        soft: "0 8px 30px rgba(22, 52, 42, 0.08)",
      },
    },
  },
  plugins: [],
};
export default config;
