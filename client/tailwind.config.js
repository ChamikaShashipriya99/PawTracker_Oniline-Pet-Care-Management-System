/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      spacing: {
        '13': '3.25rem', // For my-13 in ShowAdvertisement.jsx
        '250': '62.5rem' // For w-250 in ShowAdvertisement.jsx
      }
    },
  },
  plugins: [require("daisyui")],
  daisyui: {
    themes: ["light"], // Enables only the light theme
  },
}