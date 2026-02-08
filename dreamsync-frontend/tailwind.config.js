/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      /* Fonts */
      fontFamily: {
        serif: ["'Playfair Display'", "serif"],
        sans: ["Inter", "system-ui", "sans-serif"],
      },

      /* Typography scale */
      fontSize: {
        display: ["2.75rem", { lineHeight: "1.15" }], // Hero
        heading: ["1.5rem", { lineHeight: "1.3" }],   // Section titles
        body: ["1rem", { lineHeight: "1.7" }],        // Main text
        muted: ["0.875rem", { lineHeight: "1.6" }],   // Secondary text
        tiny: ["0.75rem", { lineHeight: "1.5" }],     // Captions
      },

      letterSpacing: {
        wide: "0.02em",
      },

      /* Colors (soft, Figma-like) */
      colors: {
        background: "#0B0B0F",
        textPrimary: "#EDEDED",
        textMuted: "#9CA3AF",

        accent: "#E6C89A",
        accentSoft: "#F2DFC0",

        border: "rgba(255,255,255,0.08)",
      },

      /* Border radius */
      borderRadius: {
        xl: "1rem",
        "2xl": "1.25rem",
      },

      /* Shadows (very soft) */
      boxShadow: {
        glass: "0 0 0 1px rgba(255,255,255,0.02)",
      },
    },
  },
  plugins: [],
};
