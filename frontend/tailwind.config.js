/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: {
          DEFAULT: "#0b0e14",
          panel: "#12161f",
          soft: "#1a2030",
        },
        accent: {
          DEFAULT: "#7c5cff",
          hot: "#ff5c7c",
          cool: "#5cc8ff",
        },
      },
      keyframes: {
        "pop-in": {
          "0%": { transform: "scale(0)", opacity: "0" },
          "70%": { transform: "scale(1.12)", opacity: "1" },
          "100%": { transform: "scale(1)" },
        },
        "merge-pop": {
          "0%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.18)" },
          "100%": { transform: "scale(1)" },
        },
        "count-pulse": {
          "0%": { transform: "scale(0.5)", opacity: "0" },
          "40%": { transform: "scale(1.15)", opacity: "1" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        shake: {
          "0%, 100%": { transform: "translateX(0)" },
          "25%": { transform: "translateX(-4px)" },
          "75%": { transform: "translateX(4px)" },
        },
      },
      animation: {
        "pop-in": "pop-in 150ms ease-out",
        "merge-pop": "merge-pop 150ms ease-out",
        "count-pulse": "count-pulse 800ms ease-out",
        shake: "shake 300ms ease-in-out",
      },
    },
  },
  plugins: [],
};
