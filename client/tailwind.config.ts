import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class", // 👈 REQUIRED for toggle-based dark mode
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./pages/**/*.{ts,tsx}", // optional if using pages
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};

export default config;
