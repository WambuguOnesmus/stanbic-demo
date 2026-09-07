/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{ts,tsx}", "./public/**/*.html"],
  theme: {
    extend: {
      colors: {
        // Stanbic corporate palette — the only permitted brand colours.
        "stanbic-navy": "#0a2240",
        "stanbic-royal": "#0033a1",
        "stanbic-accent": "#009fda",
      },
    },
  },
  plugins: [],
};
