import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        background: "#f9f9ff",
        surface: "#ffffff",
        "surface-gray": "#eef1f4",
        "surface-container": "#e6eeff",
        "surface-container-low": "#eff3ff",
        "surface-container-high": "#dee9fd",
        primary: "#003b49",
        "primary-container": "#065366",
        "teal-dark": "#025669",
        secondary: "#964900",
        "secondary-container": "#ff841c",
        tertiary: "#6e0036",
        "tertiary-container": "#98004d",
        "muted-text": "#6b7280",
        "on-surface": "#121c2a",
        "on-surface-variant": "#40484c",
        "border-subtle": "#e5e7eb",
        error: "#ba1a1a"
      },
      fontFamily: {
        sans: ["var(--font-plus-jakarta)", "Plus Jakarta Sans", "sans-serif"]
      },
      maxWidth: {
        container: "1280px"
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.5rem"
      },
      boxShadow: {
        soft: "0 16px 50px rgba(0, 59, 73, 0.10)"
      }
    }
  },
  plugins: []
};

export default config;
