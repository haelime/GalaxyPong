import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        void: "#07070b",
        panel: "#10131c",
        neon: "#55f7ff",
        flare: "#ff3d81",
        plasma: "#a873ff",
        amber: "#ffd166"
      },
      boxShadow: {
        neon: "0 0 22px rgba(85, 247, 255, 0.35)",
        flare: "0 0 28px rgba(255, 61, 129, 0.32)"
      }
    }
  },
  plugins: []
} satisfies Config;
