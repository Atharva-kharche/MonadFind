/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}", "./utils/**/*.{js,ts,jsx,tsx}"],
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  plugins: [require("daisyui")],
  darkTheme: "dark",
  darkMode: ["selector", "[data-theme='dark']"],
  daisyui: {
    themes: [
      {
        light: {
          primary: "#836EF9",
          "primary-content": "#FFFFFF",
          secondary: "#200052",
          "secondary-content": "#FFFFFF",
          accent: "#34EEB6",
          "accent-content": "#000000",
          neutral: "#F1F5F9",
          "neutral-content": "#0F172A",
          "base-100": "#FFFFFF",
          "base-200": "#F8FAFC",
          "base-300": "#E2E8F0",
          "base-content": "#0F172A",
          info: "#3ABFF8",
          success: "#36D399",
          warning: "#FBBD23",
          error: "#F87272",
          "--rounded-btn": "1rem",
        },
      },
      {
        dark: {
          primary: "#836EF9",
          "primary-content": "#FFFFFF",
          secondary: "#B2A3FF",
          "secondary-content": "#151623",
          accent: "#34EEB6",
          "accent-content": "#000000",
          neutral: "#1E1E2E",
          "neutral-content": "#FFFFFF",
          "base-100": "#0D0E15",
          "base-200": "#151623",
          "base-300": "#1E1E2E",
          "base-content": "#F9FBFF",
          info: "#3ABFF8",
          success: "#36D399",
          warning: "#FBBD23",
          error: "#F87272",
          "--rounded-btn": "1rem",
        },
      },
    ],
  },
  theme: {
    extend: {
      boxShadow: {
        center: "0 0 12px -2px rgb(0 0 0 / 0.05)",
      },
      animation: {
        "pulse-fast": "pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "fade-in": "fadeIn 0.5s ease-out forwards",
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        }
      }
    },
  },
};
