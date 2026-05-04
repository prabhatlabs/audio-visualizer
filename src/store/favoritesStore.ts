import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Track } from "./appStore";

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
                set((state) => ({
                    favorites: [...state.favorites, track],
                })),
            removeFavorite: (videoId) =>
                set((state) => ({
                    favorites: state.favorites.filter((t) => t.videoId !== videoId),
                })),
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
