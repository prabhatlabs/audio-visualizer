import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Track } from "./appStore";
import { useAppStore } from "./appStore";

interface FavoritesState {
    favorites: Track[];
    addFavorite: (track: Track) => void;
    removeFavorite: (videoId: string) => void;
    isFavorite: (videoId: string) => boolean;
    toggleFavorite: (track: Track) => void;
}

export const useFavoritesStore = create<FavoritesState>()(
    persist(
        (set, get) => ({
            favorites: [],
            addFavorite: (track) =>
                set((state) => {
                    const newFavorites = [track, ...state.favorites];
                    useAppStore.getState().syncQueueWithTracks(newFavorites);
                    return { favorites: newFavorites };
                }),
            removeFavorite: (videoId) =>
                set((state) => {
                    const newFavorites = state.favorites.filter((t) => t.videoId !== videoId);
                    useAppStore.getState().syncQueueWithTracks(newFavorites);
                    return { favorites: newFavorites };
                }),
            isFavorite: (videoId) =>
                get().favorites.some((t) => t.videoId === videoId),
            toggleFavorite: (track) => {
                const { isFavorite, addFavorite, removeFavorite } = get();
                if (isFavorite(track.videoId)) {
                    removeFavorite(track.videoId);
                } else {
                    addFavorite(track);
                }
            },
        }),
        {
            name: "favorites-storage",
        },
    ),
);
