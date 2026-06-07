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
import { useSettingsStore } from "@/store/settingsStore";
import { Music, Pause, Play } from "lucide-react";
import React, { useEffect, useState } from "react";
import { IoVolumeHigh, IoVolumeOff } from "react-icons/io5";
import { MdManageSearch } from "react-icons/md";
import PlayerControl from "./PlayerControl";
import { Button } from "./ui/button";
import { Slider } from "./ui/slider";
import FavoritesList from "./youtube/FavoritesList";
import YouTubePlayer from "./youtube/YouTubePlayer";
import YouTubeSearch from "./youtube/YouTubeSearch";

const CurrentTrackInfo = () => {
  const { currentTrack } = useAppStore();
  const { currentTime } = usePlaybackStore();
  const [imageError, setImageError] = useState(false);
  return (
    <div className="flex items-center gap-2 w-60">
      <div className="aspect-square bg-foreground/20 size-10 relative overflow-hidden shrink-0">
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
  return (
    <Button
      disabled={!currentTrack}
      size="icon-xl"
      onClick={(e) => {
        e.stopPropagation();
        togglePlaying();
      }}
      className="rounded-full"
    >
      {playing ? (
        <Pause className="fill-current" />
      ) : (
        <Play className="fill-current" />
      )}
    </Button>
  );
};

const VolumeSlider = () => {
  const { settings, updateSetting } = useSettingsStore();
  const handleMute = () => {
    updateSetting(
      "youtube",
      "volume",
      settings.youtube?.volume === 0 ? 0.6 : 0,
    );
  };
  return (
    <div className="flex items-center justify-between gap-1 w-30">
      <Button
        onClick={handleMute}
        className="rounded-full"
        size={"icon-lg"}
        variant={"ghost"}
      >
        {settings.youtube?.volume === 0 ? <IoVolumeOff /> : <IoVolumeHigh />}
      </Button>
      <Slider
        min={0}
        max={1}
        step={0.05}
        value={[settings.youtube?.volume ?? 0.8]}
        onValueChange={([v]) => updateSetting("youtube", "volume", v)}
      />
    </div>
  );
};

const IslandModal: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = React.useState("player");

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent
        aria-describedby="Youtube Player"
        className="w-[calc(100%-32px)] md:w-full md:max-w-md flex flex-col overflow-hidden"
      >
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
    <div className={`flex items-center gap-4`}>
      <IslandModal>
        <Button size={"icon-lg"} variant={"outline"}>
          <MdManageSearch />
        </Button>
      </IslandModal>
      <PlaybackToggle />
      <CurrentTrackInfo />
      <VolumeSlider />

      {/* hidden component playing audio */}
      <YouTubePlayer />
    </div>
  );
};

export default DynamicIsland;
