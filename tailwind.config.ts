import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        paper: "#f5f7f9",
        ink: "#14202b",
        muted: "#5d6b78",
        line: "#d5dde4",
        accent: "#0f6b66",
      },
    },
  },
  plugins: [],
};
export default config;
