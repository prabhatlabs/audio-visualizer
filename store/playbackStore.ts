import { create } from "zustand";

interface PlaybackState {
  currentTime: number;
  setCurrentTime: (time: number) => void;
  duration: number;
  setDuration: (time: number) => void;
  seeking: boolean;
  setSeeking: (seeking: boolean) => void;
  localSeek: number;
  setLocalSeek: (seek: number) => void;
  loaded: number;
  setLoaded: (loaded: number) => void;
  loop: boolean;
  setLoop: (loop: boolean) => void;
}

export const usePlaybackStore = create<PlaybackState>((set) => ({
  currentTime: 0,
  setCurrentTime: (time) => set({ currentTime: time }),
  duration: 0,
  setDuration: (time) => set({ duration: time }),
  seeking: false,
  setSeeking: (seeking) => set({ seeking }),
  localSeek: 0,
  setLocalSeek: (seek) => set({ localSeek: seek }),
  loaded: 0,
  setLoaded: (loaded) => set({ loaded }),
  loop: false,
  setLoop: (loop) => set({ loop }),
}));
