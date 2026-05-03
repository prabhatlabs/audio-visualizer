import { create } from "zustand";
import { persist } from "zustand/middleware";

export type VisualizerType = "InfinitySquares" | "CubeViz" | "Ripple" | "ImageBoom";

export interface Track {
    videoId: string;
    title: string;
    thumbnail: string;
    timestamp: string;
    author: string;
}

interface AudioCaptureStore {
    visualizersWithLabel: {
        label: string;
        type: VisualizerType;
    }[];
    visualizersNameObj: Record<VisualizerType, string>;
    currVisualizer: VisualizerType;
    setCurrVisualizer: (visualizer: VisualizerType) => void;
    
    // YT Mode
    ytMode: boolean;
    toggleYtMode: () => void;
    currentTrack: Track | null;
    setCurrentTrack: (track: Track | null) => void;
    playTrack: (track: Track) => void;
    queue: Track[];
    addToQueue: (track: Track) => void;
    removeFromQueue: (videoId: string) => void;
    searchResults: Track[];
    setSearchResults: (tracks: Track[]) => void;
    playing: boolean;
    togglePlaying: () => void;
    setPlaying: (playing: boolean) => void;
}

const visualizers = {
    ImageBoom: "Image Boom",
    CubeViz: "3D Cube",
    Ripple: "Beat Ripple",
    InfinitySquares: "Infinity Squares",
};

export const useAppStore = create<AudioCaptureStore>()(
    persist(
        (set) => ({
            visualizersNameObj: visualizers,
            visualizersWithLabel: Object.entries(visualizers).map(([type, label]) => ({
                label: label,
                type: type as VisualizerType,
            })),
            currVisualizer: "CubeViz",
            setCurrVisualizer: (visualizer: VisualizerType) =>
                set({ currVisualizer: visualizer }),
            
            ytMode: false,
            toggleYtMode: () => set((state) => ({ ytMode: !state.ytMode })),
            currentTrack: null,
            setCurrentTrack: (track: Track | null) => set({ currentTrack: track, playing: !!track }),
            playTrack: (track: Track) => set({ currentTrack: track, playing: true }),
            queue: [],
            addToQueue: (track: Track) => set((state) => ({ queue: [...state.queue, track] })),
            removeFromQueue: (videoId: string) => set((state) => ({ queue: state.queue.filter(t => t.videoId !== videoId) })),
            searchResults: [],
            setSearchResults: (tracks: Track[]) => set({ searchResults: tracks }),
            playing: false,
            togglePlaying: () => set((state) => ({ playing: !state.playing })),
            setPlaying: (playing: boolean) => set({ playing }),
        }),
        {
            name: "visualizer-choice",
            partialize: (state) => ({
                currVisualizer: state.currVisualizer,
                ytMode: state.ytMode,
                currentTrack: state.currentTrack,
            }),
        }
    )
);
