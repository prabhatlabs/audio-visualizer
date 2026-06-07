"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatTime } from "@/lib/time";
import { useAppStore } from "@/store/appStore";
import { useLyricsStore } from "@/store/lyricsStore";
import { usePlaybackStore } from "@/store/playbackStore";
import { Music, Pause, Play } from "lucide-react";
import React, { useEffect, useState } from "react";
import FavoritesList from "./FavoritesList";
import PlayerControl from "./PlayerControl";
import { Button } from "./ui/button";
import YouTubePlayer from "./YouTubePlayer";
import YouTubeSearch from "./YouTubeSearch";

const CurrentTrackInfo = () => {
  const { currentTrack } = useAppStore();
  const { currentTime } = usePlaybackStore();
  const [imageError, setImageError] = useState(false);
  return (
    <div className="flex items-center gap-1.5 max-w-60 w-full px-1.5 py-1 bg-background/50 backdrop-blur-xs rounded-full border">
      <div className="aspect-square bg-foreground/20 size-10 rounded-full relative overflow-hidden shrink-0">
        {(!currentTrack?.thumbnail || imageError) && (
          <Music className="size-5 text-muted-foreground absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
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
      <div className="flex flex-col truncate w-full">
        <span className="text-sm font-medium truncate">
          {currentTrack?.title || "-"}
        </span>
        <span className="text-[10px] text-muted-foreground">
          {formatTime(currentTime)} / {currentTrack?.timestamp || "--:--"}
        </span>
      </div>
    </div>
  );
};

const PlaybackToggle = () => {
  const { playing, togglePlaying, currentTrack } = useAppStore();
  const { currentTime, duration } = usePlaybackStore();

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;
  const radius = 24;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center">
      <svg
        className="absolute size-12 -rotate-90 pointer-events-none"
        viewBox="0 0 56 56"
      >
        <circle
          cx="28"
          cy="28"
          r={radius}
          fill="none"
          stroke="var(--border)"
          strokeWidth="2"
        />
        <circle
          cx="28"
          cy="28"
          r={radius}
          fill="none"
          stroke="var(--foreground)"
          strokeWidth="2"
          strokeDasharray={circumference}
          style={{
            strokeDashoffset,
            transition: "stroke-dashoffset 0.5s linear",
          }}
        />
      </svg>

      <Button
        disabled={!currentTrack}
        variant="outline"
        size="icon"
        onClick={(e) => {
          e.stopPropagation();
          togglePlaying();
        }}
        className="rounded-full w-10 h-10 bg-background/50 dark:bg-background/50 backdrop-blur-xs relative z-10 border-none shadow-none hover:bg-background/80"
      >
        {playing ? (
          <Pause className="w-4 h-4 fill-current" />
        ) : (
          <Play className="w-4 h-4 fill-current" />
        )}
      </Button>
    </div>
  );
};

const IslandModal: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = React.useState("player");

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="w-[calc(100%-32px)] md:w-full md:max-w-md flex flex-col overflow-hidden">
        <DialogHeader>
          <DialogTitle>Youtube Player</DialogTitle>
        </DialogHeader>

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full flex-1 flex flex-col min-h-0 gap-0"
        >
          <TabsList className="grid w-full grid-cols-2 shrink-0">
            <TabsTrigger value="player">Player</TabsTrigger>
            <TabsTrigger value="search">Search</TabsTrigger>
          </TabsList>
          <TabsContent value="player" className="flex-1 overflow-y-auto pt-4">
            <PlayerControl onOpenFavorites={() => setActiveTab("favorites")} />
          </TabsContent>
          <TabsContent
            value="search"
            className="flex-1 overflow-hidden flex flex-col pt-4"
          >
            <YouTubeSearch />
          </TabsContent>
          <TabsContent
            value="favorites"
            className="flex-1 overflow-hidden flex flex-col pt-4"
          >
            <FavoritesList onBack={() => setActiveTab("player")} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

const DynamicIsland: React.FC = () => {
  const { currentTrack } = useAppStore();
  const { fetchLyrics, clearLyrics } = useLyricsStore();

  useEffect(() => {
    async function fetchLyricsOnTrackChange() {
      if (currentTrack) {
        await fetchLyrics(
          currentTrack.videoId,
          currentTrack.title,
          currentTrack.author,
        );
      } else {
        clearLyrics();
      }
    }
    fetchLyricsOnTrackChange();
  }, [currentTrack, fetchLyrics, clearLyrics]);

  return (
    <div className="fixed z-50 top-4 left-1/2 -translate-x-1/2">
      <IslandModal>
        <div className="flex items-center gap-2 cursor-pointer">
          <PlaybackToggle />
          <CurrentTrackInfo />
          <YouTubePlayer />
        </div>
      </IslandModal>
    </div>
  );
};

export default DynamicIsland;
