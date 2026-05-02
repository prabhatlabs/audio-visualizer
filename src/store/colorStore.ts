import { create } from "zustand";

export const colorObj = {
    Minimalist: [
        { main: "#ffadad", glow: "#ffd6d6" }, // Coral
        { main: "#ffd6a5", glow: "#ffead0" }, // Apricot
        { main: "#fdffb6", glow: "#ffffd4" }, // Custard
        { main: "#caffbf", glow: "#e2ffde" }, // Mint
        { main: "#9bf6ff", glow: "#d6faff" }, // Sky
        { main: "#bdb2ff", glow: "#e2dbff" }, // Lavender
    ],
    "Frosted Neon": [
        { main: "#ff85a1", glow: "#ffb3c1" }, // Rose
        { main: "#fb8500", glow: "#ffb703" }, // Amber
        { main: "#ffee93", glow: "#fff9db" }, // Maize
        { main: "#72efdd", glow: "#bcfffa" }, // Teal
        { main: "#48cae4", glow: "#90e0ef" }, // Azure
        { main: "#b185ff", glow: "#d9c2ff" }, // Violet
    ],
    "Earthy Light (Muted)": [
        { main: "#e07a5f", glow: "#f2cc8f" }, // Clay
        { main: "#f4a261", glow: "#fde2ca" }, // Ochre
        { main: "#e9c46a", glow: "#fefae0" }, // Flax
        { main: "#81b29a", glow: "#d8e2dc" }, // Sage
        { main: "#a8dadc", glow: "#f1faee" }, // Powder
        { main: "#9d8189", glow: "#d5bdaf" }, // Warm Grey
    ],
    "High-Vibrance Tint": [
        { main: "#f08080", glow: "#ffe5e5" }, // Light Red
        { main: "#f4a261", glow: "#ffedd8" }, // Light Orange
        { main: "#ffd166", glow: "#fff3b0" }, // Light Gold
        { main: "#52b788", glow: "#b7e4c7" }, // Light Green
        { main: "#4ea8de", glow: "#caf0f8" }, // Light Blue
        { main: "#9b5de5", glow: "#e0c3fc" }, // Light Purple
    ],
};

export type ColorThemeType = keyof typeof colorObj;

interface ColorState {
    theme: ColorThemeType;
    setTheme: (theme: ColorThemeType) => void;
}

export const useColorStore = create<ColorState>((set) => ({
    theme: "Minimalist",
    setTheme: (theme) => set({ theme }),
}));
