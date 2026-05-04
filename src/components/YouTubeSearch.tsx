import { useAppStore, type Track } from "@/store/appStore";
import { useFavoritesStore } from "@/store/favoritesStore";
import { Loader2, Search } from "lucide-react";
import React, { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import TrackItem from "./TrackItem";

const YouTubeSearch: React.FC = () => {
    const [query, setQuery] = useState("");
    const [loading, setLoading] = useState(false);
    const { playTrack, searchResults, setSearchResults } = useAppStore();
    const { toggleFavorite, isFavorite } = useFavoritesStore();

    const handleSearch = async () => {
        if (!query) return;
        setLoading(true);
        try {
            // Using local backend with yt-search
            const response = await fetch(
                `/api/search?q=${encodeURIComponent(query)}`,
            );
            const data = await response.json();

            setSearchResults(data.items);
        } catch (error) {
            console.error("Search error:", error);
        } finally {
            setLoading(false);
        }
    };

    const selectTrack = async (track: Track) => {
        playTrack(track);
    };

    return (
        <div className="flex-1 flex flex-col min-h-0 space-y-4 outline-none">
            <div className="flex gap-2 shrink-0">
                <Input
                    placeholder="Search for songs, artists..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    className="w-full"
                />
                <Button onClick={handleSearch} disabled={loading} size="icon">
                    {loading ? (
                        <Loader2 className="animate-spin" />
                    ) : (
                        <Search className="w-4 h-4" />
                    )}
                </Button>
            </div>
            <div className="flex-1 overflow-y-auto space-y-2 pb-4 pr-2">
                {searchResults.map((track) => (
                    <TrackItem
                        key={track.videoId}
                        track={track}
                        onClick={selectTrack}
                        toggleFavorite={toggleFavorite}
                        isFavorite={isFavorite}
                    />
                ))}
                {searchResults.length === 0 && !loading && (
                    <div className="text-center py-8 text-muted-foreground italic text-sm">
                        Search results will appear here...
                    </div>
                )}
            </div>
        </div>
    );
};

export default YouTubeSearch;
