/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#486459",
        "primary-container": "#87a598",
        "primary-fixed": "#cae9db",
        surface: "#f9f9f9",
        "surface-container": "#eeeeee",
        "surface-container-low": "#f3f3f3",
        "surface-container-highest": "#e2e2e2",
        "on-surface": "#1a1c1c",
        "on-surface-variant": "#424845",
        "outline": "#727875",
        "outline-variant": "#c2c8c4",
        secondary: "#58605c",
        "secondary-container": "#d9e2dc",
        error: "#ba1a1a",
      },
      fontFamily: {
        headline: ["Manrope", "sans-serif"],
        body: ["Inter", "sans-serif"],
      },
      borderRadius: {
        xl: "0.75rem",
        "2xl": "1rem",
      },
    },
  },
  plugins: [],
}