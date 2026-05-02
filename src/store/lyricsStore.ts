import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface LyricsLine {
    time: number; // in seconds
    text: string;
}

interface LyricsData {
    lines: LyricsLine[];
    plainLyrics: string;
}

interface LyricsCacheEntry {
    videoId: string;
    data: LyricsData;
    timestamp: number;
}

interface LyricsState {
    lyrics: LyricsData | null;
    isLoading: boolean;
    error: string | null;
    cache: Record<string, LyricsCacheEntry>;
    fetchLyrics: (videoId: string, title: string, artist: string) => Promise<void>;
    clearLyrics: () => void;
}

// Helper to parse LRC format
const parseLRC = (lrc: string): LyricsLine[] => {
    const lines = lrc.split('\n');
    const result: LyricsLine[] = [];
    const timeRegex = /\[(\d{2}):(\d{2})\.(\d{2,3})\]/;

    lines.forEach(line => {
        const match = timeRegex.exec(line);
        if (match) {
            const minutes = parseInt(match[1]);
            const seconds = parseInt(match[2]);
            const milliseconds = parseInt(match[3]);
            const time = minutes * 60 + seconds + milliseconds / (match[3].length === 3 ? 1000 : 100);
            const text = line.replace(timeRegex, '').trim();
            if (text) {
                result.push({ time, text });
            }
        }
    });

    return result.sort((a, b) => a.time - b.time);
};

export const useLyricsStore = create<LyricsState>()(
    persist(
        (set, get) => ({
            lyrics: null,
            isLoading: false,
            error: null,
            cache: {},

            fetchLyrics: async (videoId, title, artist) => {
                const { cache } = get();

                // Check cache first
                if (cache[videoId]) {
                    set({ lyrics: cache[videoId].data, error: null, isLoading: false });
                    return;
                }

                set({ isLoading: true, error: null });

                try {
                    // Using local proxy to avoid CORS
                    const url = `/api/lyrica/lyrics/?artist=${encodeURIComponent(artist)}&song=${encodeURIComponent(title)}&timestamps=true`;
                    const response = await fetch(url);
                    const data = await response.json();

                    if (data.error) throw new Error(data.error);

                    const lyricsData: LyricsData = {
                        lines: data.synced_lyrics ? parseLRC(data.synced_lyrics) : [],
                        plainLyrics: data.plain_lyrics || ""
                    };

                    // Update cache (limit 100)
                    const newCache = { ...cache };
                    newCache[videoId] = {
                        videoId,
                        data: lyricsData,
                        timestamp: Date.now()
                    };

                    const keys = Object.keys(newCache);
                    if (keys.length > 100) {
                        const oldestKey = keys.sort((a, b) => newCache[a].timestamp - newCache[b].timestamp)[0];
                        delete newCache[oldestKey];
                    }

                    set({ lyrics: lyricsData, cache: newCache, isLoading: false });
                } catch (err) {
                    console.error("Lyrics fetch error:", err);
                    set({ error: "Lyrics not found", isLoading: false, lyrics: null });
                }
            },

            clearLyrics: () => set({ lyrics: null, error: null })
        }),
        {
            name: "lyrics-cache",
            partialize: (state) => ({ cache: state.cache }), // Only persist the cache
        }
    )
);
