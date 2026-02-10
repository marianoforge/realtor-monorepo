/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "../../libs/shared-hooks/src/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        darkBlue: "#3f37c9",
        mediumBlue: "#0077b6",
        lightBlue: "#00b4d8",
        lightPink: "#FEEFEE",
        lightGreen: "#E6FAF5",
        redAccent: "#EE5D50",
        greenAccent: "#04B574",
        mutedBlue: "#a3aed0",
        background: "#fafcfe",
        textPrimary: "#2d3748",
      },
      fontFamily: {
        sans: ["DM Sans", "sans-serif"],
        montserrat: ["Montserrat", "sans-serif"],
      },
    },
  },
  plugins: [],
};
