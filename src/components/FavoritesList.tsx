import React from "react";
import { useAppStore, type Track } from "@/store/appStore";
import { useFavoritesStore } from "@/store/favoritesStore";
import { Heart } from "lucide-react";
import TrackItem from "./TrackItem";

const FavoritesList: React.FC = () => {
    const { playTrack } = useAppStore();
    const { favorites, toggleFavorite, isFavorite } = useFavoritesStore();

    const selectTrack = async (track: Track) => {
        playTrack(track);
    };

    return (
        <div className="flex-1 overflow-y-auto space-y-2 pb-4 pr-2 outline-none">
            {favorites.map((track) => (
                <TrackItem
                    key={track.videoId}
                    track={track}
                    onClick={selectTrack}
                    toggleFavorite={toggleFavorite}
                    isFavorite={isFavorite}
                />
            ))}
            {favorites.length === 0 && (
                <div className="text-center py-12 flex flex-col items-center gap-3">
                    <Heart className="w-8 h-8 text-muted-foreground/20" />
                    <div className="text-muted-foreground italic text-sm">
                        Your favorite tracks will appear here
                    </div>
                </div>
            )}
        </div>
    );
};

export default FavoritesList;
