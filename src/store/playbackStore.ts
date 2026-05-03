import { create } from "zustand";

interface PlaybackState {
    currentTime: number;
    setCurrentTime: (time: number) => void;
    seeking: boolean;
    setSeeking: (seeking: boolean) => void;
    localSeek: number;
    setLocalSeek: (seek: number) => void;
    loaded: number;
    setLoaded: (loaded: number) => void;
}

export const usePlaybackStore = create<PlaybackState>((set) => ({
    currentTime: 0,
    setCurrentTime: (time) => set({ currentTime: time }),
    seeking: false,
    setSeeking: (seeking) => set({ seeking }),
    localSeek: 0,
    setLocalSeek: (seek) => set({ localSeek: seek }),
    loaded: 0,
    setLoaded: (loaded) => set({ loaded }),
}));
