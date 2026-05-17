/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        pearl: "#FDFBF7",
        ruby: "#B31B1B",
        charcoal: "#333333",
        slate: "#666666",
        champagne: "#F6EFE6",
        mist: "#F9F3ED"
      },
      fontFamily: {
        script: ["var(--font-pinyon)", "cursive"],
        display: ["var(--font-playfair)", "serif"],
        sans: ["var(--font-montserrat)", "sans-serif"]
      },
      boxShadow: {
        soft: "0 24px 80px rgba(74, 44, 33, 0.08)",
        jewel: "0 28px 90px rgba(179, 27, 27, 0.12)"
      },
      backgroundImage: {
        "diamond-grid":
          "linear-gradient(45deg, rgba(179, 27, 27, 0.04) 25%, transparent 25%), linear-gradient(-45deg, rgba(179, 27, 27, 0.04) 25%, transparent 25%)"
      }
    }
  },
  plugins: []
};
