/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        navy: {
          900: "#0a1f3d",
          850: "#0d2545",
          800: "#10294e",
        },
        lavender: {
          50: "#eef0fa",
          100: "#e8ebf6",
        },
        mint: {
          300: "#7eebc0",
          400: "#5ee0b0",
          500: "#3ed29b",
        },
        pill: {
          mediationBg: "#efe0ff",
          mediationFg: "#7c3aed",
          openBg: "#dbeafe",
          openFg: "#1d4ed8",
          arbBg: "#ffe1d6",
          arbFg: "#c2410c",
          resolvedBg: "#d1fae5",
          resolvedFg: "#047857",
          reviewBg: "#fef3c7",
          reviewFg: "#a16207",
          onholdBg: "#fef3c7",
          onholdFg: "#a16207",
          activeBg: "#efe0ff",
          activeFg: "#7c3aed",
        },
        ink: {
          900: "#0f1e3d",
          700: "#243049",
          500: "#5b6478",
          400: "#7d8597",
          300: "#aab1c0",
        },
        // Nexus Pro (from Default/light.html)
        primary: "#001736",
        surface: "#f9f9ff",
        "on-surface": "#111c2d",
        "surface-container": "#e7eeff",
        "surface-container-low": "#f0f3ff",
        "surface-container-high": "#dee8ff",
        "surface-container-lowest": "#ffffff",
        "primary-container": "#002b5b",
        "on-primary": "#ffffff",
        "tertiary-fixed-dim": "#6bd8cb",
        "tertiary-fixed": "#89f5e7",
        "outline-variant": "#c4c6d0",
      },
      fontFamily: {
        sans: [
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Roboto",
          "Helvetica",
          "Arial",
          "sans-serif",
        ],
        headline: [
          "Manrope",
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "sans-serif",
        ],
      },
      boxShadow: {
        card: "0 1px 2px rgba(15, 30, 61, 0.04), 0 4px 12px rgba(15, 30, 61, 0.04)",
      },
    },
  },
  plugins: [],
};
