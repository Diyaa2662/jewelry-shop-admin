/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        gold: {
          DEFAULT: "#C9A961",
          light: "#E5D4A8",
          dark: "#A88B4A",
        },
        cream: "#F5F1E8",
        ink: {
          DEFAULT: "#0F0F0F",
          soft: "#1A1A1A",
          muted: "#2A2A2A",
        },
      },
      fontFamily: {
        serif: ['"Playfair Display"', "serif"],
        sans: ['"Inter"', "sans-serif"],
      },
    },
  },
  plugins: [],
};
