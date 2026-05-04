import React from "react";
import { Clock, Heart, Music, User, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import type { Track } from "@/store/appStore";

interface TrackItemProps {
    track: Track;
    onClick: (track: Track) => void;
    toggleFavorite: (track: Track) => void;
    isFavorite: (videoId: string) => boolean;
}

const TrackItem: React.FC<TrackItemProps> = ({
    track,
    onClick,
    toggleFavorite,
    isFavorite,
}) => (
    <div
        className="cursor-pointer hover:bg-accent transition-colors bg-card flex items-center gap-4 rounded-md border w-full group relative"
        onClick={() => onClick(track)}
    >
        <div className="flex justify-center items-center">
            <div className="aspect-square bg-foreground/20 h-14 w-14 rounded-l-md relative">
                <Music className="size-5 text-muted-foreground absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                <img
                    src={`/api/proxy/thumbnail?url=${encodeURIComponent(track.thumbnail)}`}
                    alt={track.title}
                    className="h-14 w-14 aspect-square object-cover rounded-l-md shrink-0"
                />
            </div>
        </div>
        <div className="py-2 pr-2 flex-1 min-w-0">
            <h3 className="font-medium text-sm truncate">{track.title}</h3>
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
        <div className="flex items-center gap-1 pr-2">
            <Button
                variant="ghost"
                size="icon"
                className="hover:bg-transparent h-8 w-8"
                onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorite(track);
                }}
            >
                <Heart
                    className={cn(
                        "w-4 h-4 shrink-0 transition-colors",
                        isFavorite(track.videoId)
                            ? "fill-red-500 text-red-500"
                            : "text-muted-foreground",
                    )}
                />
            </Button>
        </div>
    </div>
);

export default TrackItem;
