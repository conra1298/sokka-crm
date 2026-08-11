import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        sokka: {
          primary: "#274283",
          secondary: "#5CB2D4",
          "accent-1": "#EDA143",
          "accent-2": "#EB7638",
          "accent-2-hover": "#d15f2a",
          surface: "#ffffff",
          background: "#F8FAFC",
          "text-primary": "#0f172a",
          "text-secondary": "#475569",
        },
      },
      fontFamily: {
        display: ["Garet", "sans-serif"],
        sans: ["Outfit", "sans-serif"],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      backdropBlur: {
        xs: '4px',
      }
    },
  },
  plugins: [],
};

export default config;
