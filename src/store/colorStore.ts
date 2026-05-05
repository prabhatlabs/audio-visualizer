import { create } from "zustand";
import { persist } from "zustand/middleware";

export const colorObj = {
    "Cotton Candy": [
        // all pastels, soft & dreamy
        { main: "#ffb3c6", glow: "#ff4d80" }, // Blush
        { main: "#ffd6a5", glow: "#ff8c00" }, // Peach
        { main: "#fdffb6", glow: "#d4c000" }, // Cream
        { main: "#caffbf", glow: "#2db800" }, // Mint
        { main: "#a0c4ff", glow: "#0060ff" }, // Baby Blue
        { main: "#ddb4f0", glow: "#9b00e0" }, // Lilac
    ],
    "Molten Core": [
        // fire spectrum only, no cool hues
        { main: "#ff2200", glow: "#7a0000" }, // Inferno
        { main: "#ff5500", glow: "#8a2000" }, // Lava
        { main: "#ff8800", glow: "#8a4400" }, // Magma
        { main: "#ffaa00", glow: "#8a5500" }, // Ember
        { main: "#ffcc00", glow: "#8a6600" }, // Solar
        { main: "#ffe566", glow: "#8a7000" }, // Flare
    ],
    "Deep Ocean": [
        // blues & teals only, aquatic & cool
        { main: "#00b4d8", glow: "#004d6e" }, // Lagoon
        { main: "#0077b6", glow: "#002f4a" }, // Deep Sea
        { main: "#48cae4", glow: "#005f7a" }, // Reef
        { main: "#00cfb5", glow: "#006e5f" }, // Teal
        { main: "#90e0ef", glow: "#006580" }, // Mist
        { main: "#023e8a", glow: "#010f22" }, // Abyss
    ],
    "Toxic Garden": [
        // acid greens & electric limes, hyper synthetic
        { main: "#ccff00", glow: "#5a7000" }, // Acid
        { main: "#80ff00", glow: "#2e6000" }, // Slime
        { main: "#00ff88", glow: "#006636" }, // Venom
        { main: "#39ff14", glow: "#0f5500" }, // Neon
        { main: "#b8ff00", glow: "#4a6200" }, // Toxic
        { main: "#00ffc3", glow: "#005040" }, // Ooze
    ],
    "Royal Dusk": [
        // jewel purples & magentas, dark & luxurious
        { main: "#c77dff", glow: "#4a0080" }, // Amethyst
        { main: "#e040fb", glow: "#6a006e" }, // Orchid
        { main: "#9d4edd", glow: "#3a007a" }, // Violet
        { main: "#f72585", glow: "#6e0030" }, // Fuchsia
        { main: "#7b2d8b", glow: "#2d0033" }, // Plum
        { main: "#ff4d9e", glow: "#7a0040" }, // Magenta
    ],
    "Desert Sand": [
        // muted terracottas & warm grays, earthy & analog
        { main: "#c9a87c", glow: "#5a3a10" }, // Sand
        { main: "#d4856a", glow: "#6b2210" }, // Clay
        { main: "#b5835a", glow: "#4a2800" }, // Sienna
        { main: "#a39080", glow: "#3a2418" }, // Dust
        { main: "#c2a98e", glow: "#5a3e28" }, // Linen
        { main: "#8b6f5e", glow: "#2e1a10" }, // Adobe
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
            theme: "Minimalist",
            setTheme: (theme) => set({ theme }),
        }),
        {
            name: "visualizer-theme",
        },
    ),
);
