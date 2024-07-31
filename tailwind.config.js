/** @type {import('tailwindcss').Config} */
const defaultTheme = require("tailwindcss/defaultTheme");
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        lato: ['"Lato"', ...defaultTheme.fontFamily.sans],
      },
      colors: {
        primary: "#1d5360",
        secondary: "#134B70",
      },
      backgroundImage: {
        arabic: "url('/background/arabic-letter.jpg')",
      },
    },
  },
  plugins: [],
};
