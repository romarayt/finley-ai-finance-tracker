import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./features/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-geist-sans)"],
        mono: ["var(--font-geist-mono)"],
        display: ["var(--font-instrument-serif)"]
      },
      fontSize: {
        xs: ["0.75rem", { lineHeight: "1.5" }],
        sm: ["0.875rem", { lineHeight: "1.5" }],
        base: ["1rem", { lineHeight: "1.5" }],
        lg: ["1.25rem", { lineHeight: "1.2" }],
        xl: ["1.5625rem", { lineHeight: "1.2" }],
        "2xl": ["1.9375rem", { lineHeight: "1.2" }],
        "4xl": ["2.4375rem", { lineHeight: "1.2" }]
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        surface: "hsl(var(--surface))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))"
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))"
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))"
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))"
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))"
        },
        success: {
          DEFAULT: "hsl(var(--success))",
          foreground: "hsl(var(--success-foreground))"
        },
        warning: {
          DEFAULT: "hsl(var(--warning))",
          foreground: "hsl(var(--warning-foreground))"
        }
      },
      borderRadius: {
        lg: "12px",
        md: "8px",
        sm: "4px",
        "2xl": "16px"
      },
      boxShadow: {
        xs: "0 1px 2px hsl(32 18% 42% / 0.08)",
        sm: "0 2px 8px hsl(32 18% 42% / 0.10)",
        md: "0 8px 24px hsl(32 18% 42% / 0.12)",
        lg: "0 16px 40px hsl(32 18% 42% / 0.16)",
        xl: "0 24px 64px hsl(32 18% 42% / 0.18)"
      }
    }
  },
  plugins: [tailwindcssAnimate]
};

export default config;
