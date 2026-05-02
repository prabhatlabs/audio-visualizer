import { create } from "zustand";

interface PlaybackState {
    currentTime: number;
    setCurrentTime: (time: number) => void;
}

export const usePlaybackStore = create<PlaybackState>((set) => ({
    currentTime: 0,
    setCurrentTime: (time) => set({ currentTime: time }),
}));
