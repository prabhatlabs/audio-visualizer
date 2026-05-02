import { useAppStore, type Track } from "@/store/appStore";
import {
    Clock,
    Loader2,
    Music,
    PlusCircle,
    Search,
    User,
} from "lucide-react";
import React, { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

const YouTubeSearch: React.FC = () => {
    const [query, setQuery] = useState("");
    const [loading, setLoading] = useState(false);
    const { setCurrentTrack, searchResults, setSearchResults, addToQueue } = useAppStore();

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

    const selectTrack = (track: Track) => {
        setCurrentTrack(track);
    };

    return (
        <div className="space-y-4 h-full flex flex-col">
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
            <div className="flex-1 overflow-y-auto space-y-2 min-h-0 pb-4 pr-2">
                {searchResults.map((track) => (
                    <div
                        key={track.videoId}
                        className="cursor-pointer hover:bg-accent transition-colors bg-card flex items-center gap-4 rounded-md border w-full"
                        onClick={() => selectTrack(track)}
                    >
                        <div className="flex justify-center items-center">
                            <div className="aspect-square bg-foreground/20 h-14 w-14 rounded-l-md relative">
                                <Music className="size-5 text-muted-foreground absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                                <img
                                    src={track.thumbnail}
                                    alt={track.title}
                                    className="h-14 w-14 aspect-square object-cover rounded-l-md shrink-0"
                                />
                            </div>
                        </div>
                        <div className="py-2 pr-2 flex-1 min-w-0">
                            <h3 className="font-medium text-sm truncate">
                                {track.title}
                            </h3>
                            <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                                <span className="flex items-center gap-1 truncate">
                                    <User className="w-3 h-3 shrink-0" />
                                    {track.author}
                                </span>
                                <span className="flex items-center gap-1 shrink-0">
                                    <Clock className="w-3 h-3" />
                                    {track.timestamp}
                                </span>
                            </div>
                        </div>
                        <Button 
                            variant="ghost" 
                            className="pr-3" 
                            onClick={(e) => { e.stopPropagation(); addToQueue(track); }}
                        >
                            <PlusCircle className="w-4 h-4 text-muted-foreground shrink-0" />
                        </Button>
                    </div>
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
