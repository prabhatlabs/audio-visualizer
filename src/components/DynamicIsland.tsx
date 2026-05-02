import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAppStore } from "@/store/appStore";
import { usePlaybackStore } from "@/store/playbackStore";
import { Music, Pause, Play } from "lucide-react";
import React from "react";
import PlayerControl from "./PlayerControl";
import { Button } from "./ui/button";
import YouTubeSearch from "./YouTubeSearch";
import YouTubePlayer from "./YouTubePlayer";
import { formatTime } from "@/lib/time";

const CurrentTrackInfo = () => {
    const { currentTrack, ytMode } = useAppStore();
    const { currentTime } = usePlaybackStore();

    if (!ytMode || !currentTrack) return null;
    return (
        <div className="flex items-center gap-3 max-w-60 px-4 py-1 bg-background/50 backdrop-blur-xs rounded-full border border-border">
            <Music className="w-3 h-3 text-primary animate-pulse shrink-0" />
            <div className="flex flex-col truncate">
                <span className="text-xs font-medium truncate">
                    {currentTrack.title}
                </span>
                <span className="text-[10px] text-muted-foreground">
                    {formatTime(currentTime)} / {currentTrack.timestamp}
                </span>
            </div>
        </div>
    );
};

const PlaybackToggle = () => {
    const { playing, togglePlaying, currentTrack } = useAppStore();
    if (!currentTrack) return null;

    return (
        <Button
            variant="outline"
            size="icon"
            onClick={(e) => {
                e.stopPropagation();
                togglePlaying();
            }}
            className="rounded-full w-10 h-10 bg-background/50 dark:bg-background/50 backdrop-blur-xs"
        >
            {playing ? (
                <Pause className="w-4 h-4" />
            ) : (
                <Play className="w-4 h-4 fill-current" />
            )}
        </Button>
    );
};

const IslandModal: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return (
        <Dialog>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent className="w-[calc(100%-32px)] md:w-full md:max-w-md h-[80vh] flex flex-col overflow-hidden">
                <Tabs
                    defaultValue="player"
                    className="w-full flex-1 flex flex-col min-h-0 gap-0"
                >
                    <TabsList className="grid w-full grid-cols-2 shrink-0">
                        <TabsTrigger value="player">Player</TabsTrigger>
                        <TabsTrigger value="search">Search</TabsTrigger>
                    </TabsList>
                    <TabsContent
                        value="player"
                        className="flex-1 overflow-y-auto pt-4"
                    >
                        <PlayerControl />
                    </TabsContent>
                    <TabsContent
                        value="search"
                        className="flex-1 overflow-hidden flex flex-col pt-4"
                    >
                        <YouTubeSearch />
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
};

const DynamicIsland: React.FC = () => {
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
