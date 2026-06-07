import { create } from "zustand";
import { persist } from "zustand/middleware";

export const colorObj = {
  "Cotton Candy": [
    { main: "#ffb3c6", glow: "#ff4d80" },
    { main: "#ffd6a5", glow: "#ff8c00" },
    { main: "#fdffb6", glow: "#d4c000" },
    { main: "#caffbf", glow: "#2db800" },
    { main: "#a0c4ff", glow: "#0060ff" },
    { main: "#ddb4f0", glow: "#9b00e0" },
  ],
  "Molten Core": [
    { main: "#ff2200", glow: "#7a0000" },
    { main: "#ff5500", glow: "#8a2000" },
    { main: "#ff8800", glow: "#8a4400" },
    { main: "#ffaa00", glow: "#8a5500" },
    { main: "#ffcc00", glow: "#8a6600" },
    { main: "#ffe566", glow: "#8a7000" },
  ],
  "Deep Ocean": [
    { main: "#00b4d8", glow: "#004d6e" },
    { main: "#0077b6", glow: "#002f4a" },
    { main: "#48cae4", glow: "#005f7a" },
    { main: "#00cfb5", glow: "#006e5f" },
    { main: "#90e0ef", glow: "#006580" },
    { main: "#023e8a", glow: "#010f22" },
  ],
  "Toxic Garden": [
    { main: "#ccff00", glow: "#5a7000" },
    { main: "#80ff00", glow: "#2e6000" },
    { main: "#00ff88", glow: "#006636" },
    { main: "#39ff14", glow: "#0f5500" },
    { main: "#b8ff00", glow: "#4a6200" },
    { main: "#00ffc3", glow: "#005040" },
  ],
  "Royal Dusk": [
    { main: "#c77dff", glow: "#4a0080" },
    { main: "#e040fb", glow: "#6a006e" },
    { main: "#9d4edd", glow: "#3a007a" },
    { main: "#f72585", glow: "#6e0030" },
    { main: "#7b2d8b", glow: "#2d0033" },
    { main: "#ff4d9e", glow: "#7a0040" },
  ],
  "Desert Sand": [
    { main: "#c9a87c", glow: "#5a3a10" },
    { main: "#d4856a", glow: "#6b2210" },
    { main: "#b5835a", glow: "#4a2800" },
    { main: "#a39080", glow: "#3a2418" },
    { main: "#c2a98e", glow: "#5a3e28" },
    { main: "#8b6f5e", glow: "#2e1a10" },
  ],
};

export type ColorThemeType = keyof typeof colorObj;

interface ColorState {
  theme: ColorThemeType;
  setTheme: (theme: ColorThemeType) => void;
}

export const useColorStore = create<ColorState>()(
  persist(
    (set) => ({
      theme: "Cotton Candy",
      setTheme: (theme) => set({ theme }),
    }),
    {
      name: "visualizer-theme",
    },
  ),
);
