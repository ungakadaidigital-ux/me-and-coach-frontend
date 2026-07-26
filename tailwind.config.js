/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      // Design tokens — the "Me &" family palette for Me & Coach.
      // Kept as named theme colors (not arbitrary values) so the same
      // tokens are reusable across every screen and any future vertical.
      colors: {
        ink: "#131A2B",
        inksoft: "#5B6478",
        chalk: "#FAF7F1",
        chalkdeep: "#F1EBDD",
        line: "#E7E0D2",
        marigold: "#F2A93B",
        marigolddeep: "#C97F16",
        teal: "#166B5C",
        tealsoft: "#E3F0EC",
        clay: "#BD4128",
        claysoft: "#FBEAE4",
        plum: "#6B3A5C",
        plumsoft: "#F1E6EF",
        green: "#2E7D4F",
        greensoft: "#E5F3EA",
      },
      fontFamily: {
        display: ["'Space Grotesk'", "sans-serif"],
        body: ["'Inter'", "sans-serif"],
      },
      borderRadius: {
        card: "1rem",
      },
    },
  },
  plugins: [],
};
