/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#000000",
        surface: "#121212",
        primary: {
          DEFAULT: "#D4AF37",
          dark: "#B8860B",
          light: "#FFD700",
        },
        accent: "#A0A0A0",
      },
      borderRadius: {
        '3xl': '24px',
      },
    },
  },
  plugins: [],
};
