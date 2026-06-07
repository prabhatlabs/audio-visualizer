import { create } from "zustand";
import { persist } from "zustand/middleware";

export type VisualizerType = "InfinitySquares" | "CubeViz" | "Ripple" | "ImageBoom" | "LyricsPop";

export interface Track {
  videoId: string;
  title: string;
  thumbnail: string;
  timestamp: string;
  author: string;
}

export interface QueueItem {
  id: string;
  track: Track;
}

let queueItemIdCounter = 0;
const generateQueueItemId = () => `queue-${Date.now()}-${++queueItemIdCounter}`;

interface AudioCaptureStore {
  visualizersWithLabel: {
    label: string;
    type: VisualizerType;
  }[];
  visualizersNameObj: Record<VisualizerType, string>;
  currVisualizer: VisualizerType;
  setCurrVisualizer: (visualizer: VisualizerType) => void;

  ytMode: boolean;
  toggleYtMode: () => void;
  currentTrack: Track | null;
  setCurrentTrack: (track: Track | null) => void;
  playTrack: (track: Track) => void;
  queue: QueueItem[];
  setQueue: (queue: QueueItem[]) => void;
  addToQueue: (track: Track) => void;
  removeFromQueue: (itemId: string) => void;
  playAll: (tracks: Track[], startIndex?: number) => void;
  playNext: () => void;
  playPrev: () => void;
  currentQueueItemId: string | null;
  syncQueueWithTracks: (tracks: Track[]) => void;
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
  LyricsPop: "Lyrics Pop",
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
      toggleYtMode: () => set((state) => {
        if (state.ytMode) {
          return { ytMode: false, currentTrack: null, queue: [], searchResults: [], playing: false, currentQueueItemId: null };
        }
        return { ytMode: true };
      }),
      currentTrack: null,
      setCurrentTrack: (track: Track | null) => set({ currentTrack: track, playing: !!track }),
      playTrack: (track: Track) => set({ currentTrack: track, playing: true }),
      queue: [],
      setQueue: (queue: QueueItem[]) => set({ queue }),
      addToQueue: (track: Track) => set((state) => ({ queue: [...state.queue, { id: generateQueueItemId(), track }] })),
      removeFromQueue: (itemId: string) => set((state) => ({ queue: state.queue.filter(item => item.id !== itemId) })),
      playAll: (tracks: Track[], startIndex = 0) => {
        const queueItems = tracks.map(track => ({ id: generateQueueItemId(), track }));
        return set({ queue: queueItems, currentTrack: queueItems[startIndex].track, currentQueueItemId: queueItems[startIndex].id, playing: true });
      },
      playNext: () => set((state) => {
        if (state.queue.length === 0 || !state.currentQueueItemId) return state;
        const currentIndex = state.queue.findIndex(item => item.id === state.currentQueueItemId);
        const nextIndex = currentIndex + 1;
        if (nextIndex >= state.queue.length) return { playing: false };
        return { currentTrack: state.queue[nextIndex].track, currentQueueItemId: state.queue[nextIndex].id, playing: true };
      }),
      playPrev: () => set((state) => {
        if (state.queue.length === 0 || !state.currentQueueItemId) return state;
        const currentIndex = state.queue.findIndex(item => item.id === state.currentQueueItemId);
        const prevIndex = currentIndex - 1;
        if (prevIndex < 0) return state;
        return { currentTrack: state.queue[prevIndex].track, currentQueueItemId: state.queue[prevIndex].id, playing: true };
      }),
      currentQueueItemId: null,
      syncQueueWithTracks: (tracks: Track[]) => set((state) => {
        if (state.queue.length === 0) return state;
        const newQueue = state.queue.filter(item => tracks.some(t => t.videoId === item.track.videoId));
        const existingIds = new Set(newQueue.map(item => item.track.videoId));
        const newTracks = tracks.filter(t => !existingIds.has(t.videoId));
        newTracks.forEach(track => {
          newQueue.push({ id: generateQueueItemId(), track });
        });
        const trackOrder = new Map(tracks.map((t, i) => [t.videoId, i]));
        newQueue.sort((a, b) => (trackOrder.get(a.track.videoId) ?? 0) - (trackOrder.get(b.track.videoId) ?? 0));
        const currentStillExists = newQueue.some(item => item.id === state.currentQueueItemId);
        return {
          queue: newQueue,
          currentTrack: currentStillExists ? state.currentTrack : (newQueue.length > 0 ? newQueue[0].track : null),
          currentQueueItemId: currentStillExists ? state.currentQueueItemId : (newQueue.length > 0 ? newQueue[0].id : null),
          playing: currentStillExists ? state.playing : newQueue.length > 0,
        };
      }),
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
    },
  ),
);
