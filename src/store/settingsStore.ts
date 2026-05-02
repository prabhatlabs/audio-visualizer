import { create } from "zustand";

interface VisualizerSettings {
    cubeViz: {
        rotationSpeed: number;
        enableRotate: boolean;
        enableShake: boolean;
        shakeIntensity: number;
    };
    ripple: {
        enableRipple: boolean;
        enableStrobe: boolean;
        enableShake: boolean;
        shakeIntensity: number;
        strobeIntensity: number;
        rippleSpeed: number;
    };
    infinitySquares: {
        squareCount: number;
        baseSize: number;
        speed: number;
    };
    imageBoom: {
        imageSrc: string;
        centerText: string;
    };
}

interface SettingsState {
    settings: VisualizerSettings;
    updateSetting: <T extends keyof VisualizerSettings, K extends keyof VisualizerSettings[T]>(
        viz: T,
        key: K,
        value: VisualizerSettings[T][K]
    ) => void;
}

export const useSettingsStore = create<SettingsState>((set) => ({
    settings: {
        cubeViz: {
            rotationSpeed: 20,
            enableRotate: true,
            enableShake: true,
            shakeIntensity: 10,
        },
        ripple: {
            enableRipple: true,
            enableStrobe: true,
            enableShake: true,
            shakeIntensity: 10,
            strobeIntensity: 0.6,
            rippleSpeed: 1.5,
        },
        infinitySquares: {
            squareCount: 30,
            baseSize: 500,
            speed: 3,
        },
        imageBoom: {
            imageSrc: "/image.png",
            centerText: "prabhatlabs",
        },
    },
    updateSetting: (viz, key, value) =>
        set((state) => ({
            settings: {
                ...state.settings,
                [viz]: {
                    ...state.settings[viz],
                    [key]: value,
                },
            },
        })),
}));
