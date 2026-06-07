"use client";

import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { formatTime } from "@/lib/time";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store/appStore";
import { useFavoritesStore } from "@/store/favoritesStore";
import { usePlaybackStore } from "@/store/playbackStore";
import {
  Heart,
  ListMusic,
  Music,
  Pause,
  Play,
  Repeat,
  SkipBack,
  SkipForward,
} from "lucide-react";
import { useState } from "react";
import LyricsInlinePanel from "./LyricsInlinePanel";

interface PlayerControlProps {
  onOpenFavorites: () => void;
}

const PlayerControl: React.FC<PlayerControlProps> = ({ onOpenFavorites }) => {
  const { playing, togglePlaying, currentTrack, playNext, playPrev } = useAppStore();
  const {
    currentTime,
    seeking,
    setSeeking,
    localSeek,
    setLocalSeek,
    loaded,
    duration,
    loop,
    setLoop,
  } = usePlaybackStore();
  const { isFavorite, toggleFavorite } = useFavoritesStore();

  const [imageError, setImageError] = useState(false);

  const durationSeconds = currentTrack?.timestamp
    ? currentTrack.timestamp
        .split(":")
        .reduce((acc, time) => 60 * acc + +time, 0)
    : 0;

  const progress =
    durationSeconds > 0 ? (currentTime / durationSeconds) * 100 : 0;

  const handleSeekChange = (value: number[]) => {
    setSeeking(true);
    setLocalSeek(value[0]);
  };

  const handleSeekCommit = () => {
    setSeeking(false);
  };

  return (
    <div className="">
      <div className="flex justify-center items-center my-6">
        <div className="aspect-square bg-foreground/20 h-50 w-50 relative overflow-hidden">
          {(!currentTrack?.thumbnail || imageError) && (
            <Music className="size-25 text-muted-foreground absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
          )}
          {currentTrack?.thumbnail && !imageError && (
            <img
              src={`/api/proxy/thumbnail?url=${encodeURIComponent(currentTrack.thumbnail)}`}
              alt={currentTrack?.title || "No track"}
              className="object-cover w-full h-full scale-140"
              onError={() => setImageError(true)}
              onLoad={() => setImageError(false)}
            />
          )}
        </div>
      </div>

      <div className="text-center space-y-1">
        <h3 className="font-medium truncate text-xl px-3">
          {currentTrack?.title || "No track"}
        </h3>
        <h5 className="font-medium truncate text-sm px-3 text-muted-foreground">
          {currentTrack?.author || "No Artist"}
        </h5>
      </div>

      <div className="mt-4 relative">
        <div className="flex items-center gap-4 justify-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setLoop(!loop)}
          >
            <Repeat
              className={
                loop
                  ? "text-primary"
                  : "text-muted-foreground/50"
              }
            />
          </Button>
          <Button variant="ghost" size="icon" onClick={playPrev}>
            <SkipBack />
          </Button>
          <Button
            variant="default"
            size="icon-lg"
            className="rounded-full"
            onClick={togglePlaying}
          >
            {playing ? <Pause /> : <Play />}
          </Button>
          <Button variant="ghost" size="icon" onClick={playNext}>
            <SkipForward />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() =>
              currentTrack && toggleFavorite(currentTrack)
            }
          >
            <Heart
              className={cn(
                "w-5 h-5",
                currentTrack && isFavorite(currentTrack.videoId)
                  ? "fill-red-500 text-red-500"
                  : "text-muted-foreground",
              )}
            />
          </Button>
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="absolute right-0 top-0"
          onClick={onOpenFavorites}
        >
          <ListMusic className="text-muted-foreground" />
        </Button>
      </div>

      <div className="space-y-2 mb-6 px-2">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
        <div className="relative">
          <Slider
            value={[seeking ? localSeek : progress]}
            max={100}
            step={0.1}
            onValueChange={handleSeekChange}
            onValueCommit={handleSeekCommit}
          />
        </div>
      </div>

      <LyricsInlinePanel />
    </div>
  );
};

export default PlayerControl;
