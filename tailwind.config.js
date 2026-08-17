/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Brand accent — electric violet → cyan gradient system
        accent: {
          50: "#eef2ff",
          100: "#e0e7ff",
          200: "#c7d2fe",
          300: "#a5b4fc",
          400: "#818cf8",
          500: "#6366f1",
          600: "#4f46e5",
          700: "#4338ca",
          800: "#3730a3",
          900: "#312e81",
        },
        cyan: {
          400: "#22d3ee",
          500: "#06b6d4",
        },
        ink: {
          50: "#f8fafc",
          100: "#f1f5f9",
          200: "#e2e8f0",
          300: "#cbd5e1",
          400: "#94a3b8",
          500: "#64748b",
          600: "#475569",
          700: "#334155",
          800: "#1e293b",
          900: "#0f172a",
          950: "#020617",
        },
      },
      fontFamily: {
        // The "Web" faces are the self-hosted files (src/styles/fonts.css); the
        // bare names sit behind them only as a fallback.
        sans: ["Inter Web", "Inter", "system-ui", "sans-serif"],
        display: ["Sora Web", "Sora", "system-ui", "sans-serif"],
        mono: [
          "JetBrains Mono Web",
          "JetBrains Mono",
          "ui-monospace",
          "monospace",
        ],
      },
      /**
       * Roughly a step up from Tailwind's defaults across the small end, where
       * nearly all of this site's text lives: 85-odd places sat at 12px or
       * below against 14 at 16px. Sizes above 2xl are headings and keep the
       * stock values. `2xs` replaces the hand-written 10px and 0.65rem labels
       * so nothing sits off the scale.
       */
      fontSize: {
        "2xs": ["0.6875rem", { lineHeight: "1rem" }],
        xs: ["0.8125rem", { lineHeight: "1.15rem" }],
        sm: ["0.9375rem", { lineHeight: "1.45rem" }],
        base: ["1.0625rem", { lineHeight: "1.7rem" }],
        lg: ["1.1875rem", { lineHeight: "1.85rem" }],
        xl: ["1.3125rem", { lineHeight: "1.9rem" }],
        "2xl": ["1.5625rem", { lineHeight: "2.05rem" }],
      },
      keyframes: {
        "gradient-x": {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-12px)" },
        },
        shimmer: {
          "100%": { transform: "translateX(100%)" },
        },
      },
      animation: {
        "gradient-x": "gradient-x 8s ease infinite",
        float: "float 6s ease-in-out infinite",
        shimmer: "shimmer 2s infinite",
      },
    },
  },
  plugins: [],
};
