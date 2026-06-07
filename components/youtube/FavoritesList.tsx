"use client";

import { useAppStore, type Track } from "@/store/appStore";
import { useFavoritesStore } from "@/store/favoritesStore";
import { Heart, ArrowLeft, Play } from "lucide-react";
import React from "react";
import TrackItem from "./TrackItem";
import { Button } from "../ui/button";

interface FavoritesListProps {
  onBack: () => void;
}

const FavoritesList: React.FC<FavoritesListProps> = ({ onBack }) => {
  const { playTrack, playAll } = useAppStore();
  const { favorites, toggleFavorite, isFavorite } = useFavoritesStore();

  const selectTrack = async (track: Track) => {
    playTrack(track);
  };

  const handlePlayAll = () => {
    if (favorites.length > 0) {
      playAll(favorites);
    }
  };

  return (
    <div className="flex flex-col min-h-0 h-159">
      <div className="flex items-center gap-2 mb-4 shrink-0 px-1">
        <Button variant="ghost" size="icon" onClick={onBack} className="h-8 w-8">
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <h2 className="text-lg font-semibold">Favorites</h2>
        {favorites.length > 0 && (
          <Button variant="default" size="sm" onClick={handlePlayAll} className="ml-auto gap-1">
            <Play className="w-4 h-4" />
            Play All
          </Button>
        )}
      </div>

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
    </div>
  );
};

export default FavoritesList;
