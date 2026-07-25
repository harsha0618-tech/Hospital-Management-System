/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        reception: {
          light: "#EAF3FB",
          DEFAULT: "#4A90D9",
          dark: "#2E5C8A",
        },
        doctor: {
          light: "#E9F7EF",
          DEFAULT: "#4CAF7D",
          dark: "#2E6E4E",
        },
        lab: {
          light: "#F1EAFB",
          DEFAULT: "#8B6FCE",
          dark: "#5B4494",
        },
        pharmacy: {
          light: "#FDF1E6",
          DEFAULT: "#E29A4E",
          dark: "#A9682A",
        },
        admin: {
          light: "#F1F2F4",
          DEFAULT: "#6B7280",
          dark: "#374151",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      borderRadius: {
        card: "12px",
      },
      boxShadow: {
        soft: "0 2px 8px rgba(0, 0, 0, 0.06)",
      },
    },
  },
  plugins: [],
};