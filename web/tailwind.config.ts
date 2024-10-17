import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    colors: {
      darkest: "#262725",
      dark: "#484a47",
      muted: "#5c6d70",
      mid: "#a37774",
      light: "#e88873",
      lightest: "#e0ac9d",
    },
    extend: {
      screens: {
        moduleSplit: "1000px",
      },
    },
  },
  plugins: [],
};
export default config;
