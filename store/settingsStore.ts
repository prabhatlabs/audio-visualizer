import { create } from "zustand";
import { persist } from "zustand/middleware";

interface VisualizerSettings {
  cubeViz: {
    rotationSpeed: number;
    enableRotate: boolean;
    enableShake: boolean;
    shakeIntensity: number;
    kickThreshold: number;
    showLyrics: boolean;
    showMeta: boolean;
  };
  ripple: {
    enableRipple: boolean;
    enableStrobe: boolean;
    enableShake: boolean;
    shakeIntensity: number;
    strobeIntensity: number;
    rippleSpeed: number;
    kickThreshold: number;
    showLyrics: boolean;
    showMeta: boolean;
  };
  imageBoom: {
    imageSrc: string;
    centerText: string;
    selectedImage: number;
  };
  lyricsPop: {
    showLyrics: boolean;
    showMeta: boolean;
  };
  youtube: {
    volume: number;
  };
}

const defaultSettings: VisualizerSettings = {
  cubeViz: {
    rotationSpeed: 20,
    enableRotate: true,
    enableShake: true,
    shakeIntensity: 10,
    kickThreshold: 0.8,
    showLyrics: true,
    showMeta: true,
  },
  ripple: {
    enableRipple: true,
    enableStrobe: true,
    enableShake: true,
    shakeIntensity: 10,
    strobeIntensity: 0.6,
    rippleSpeed: 1.5,
    kickThreshold: 0.5,
    showLyrics: true,
    showMeta: true,
  },
  imageBoom: {
    imageSrc: "/imageboom/image-4.webp",
    centerText: "music",
    selectedImage: 3,
  },
  lyricsPop: {
    showLyrics: true,
    showMeta: true,
  },
  youtube: {
    volume: 0.8,
  },
};

interface SettingsState {
  settings: VisualizerSettings;
  updateSetting: <T extends keyof VisualizerSettings, K extends keyof VisualizerSettings[T]>(
    viz: T,
    key: K,
    value: VisualizerSettings[T][K]
  ) => void;
  resetSettings: (viz: keyof VisualizerSettings) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      settings: { ...defaultSettings },
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
      resetSettings: (viz) =>
        set((state) => ({
          settings: {
            ...state.settings,
            [viz]: { ...defaultSettings[viz] },
          },
        })),
    }),
    {
      name: "visualizer-settings",
    },
  ),
);
