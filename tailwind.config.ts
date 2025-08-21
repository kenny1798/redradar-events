// ROOT: tailwind.config.ts
import type { Config } from "tailwindcss";

export default {
  darkMode: "class",
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  theme: { extend: {} },
  plugins: [require("@tailwindcss/typography")], // kalau nak forms/typography nanti, guna import ESM, bukan require()
} satisfies Config;
