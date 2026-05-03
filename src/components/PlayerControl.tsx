import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { formatTime } from "@/lib/time";
import { useAppStore } from "@/store/appStore";
import { useLyricsStore } from "@/store/lyricsStore";
import { usePlaybackStore } from "@/store/playbackStore";
import { Music, Pause, Play, SkipBack, SkipForward } from "lucide-react";
import { useEffect } from "react";
import LyricsInlinePanel from "./LyricsInlinePanel";

const PlayerControl: React.FC = () => {
    const { playing, togglePlaying, currentTrack } = useAppStore();
    const {
        currentTime,
        seeking,
        setSeeking,
        localSeek,
        setLocalSeek,
        loaded,
        duration,
    } = usePlaybackStore();
    const { fetchLyrics } = useLyricsStore();

    useEffect(() => {
        async function fetchLyricsOnTrackChange() {
            if (currentTrack) {
                await fetchLyrics(
                    currentTrack.videoId,
                    currentTrack.title,
                    currentTrack.author,
                );
            }
        }
        fetchLyricsOnTrackChange();
    }, [currentTrack, fetchLyrics]);

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
            {/* image */}
            <div className="flex justify-center items-center my-6">
                <div className="aspect-square bg-foreground/20 h-50 w-50 relative">
                    <Music className="size-25 text-muted-foreground absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                    {currentTrack?.thumbnail && (
                        <img
                            src={currentTrack?.thumbnail || ""}
                            alt={currentTrack?.title || "No track"}
                        />
                    )}
                </div>
            </div>

            {/* title and artist */}
            <div className="text-center space-y-1">
                <h3 className="font-medium truncate text-xl px-3">
                    {currentTrack?.title || "No track"}
                </h3>
                <h5 className="font-medium truncate text-sm px-3 text-muted-foreground">
                    {currentTrack?.author || "No Artist"}
                </h5>
            </div>

            {/* buttons */}
            <div className="flex justify-center items-center gap-4 mt-4">
                <Button variant="ghost" size="icon">
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
                <Button variant="ghost" size="icon">
                    <SkipForward />
                </Button>
            </div>

            {/* seek */}
            <div className="space-y-2 mb-6">
                <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{formatTime(currentTime)}</span>
                    <span>{formatTime(duration)}</span>
                </div>
                <div className="relative">
                    <Slider
                        value={[seeking ? localSeek : progress]}
                        max={100}
                        step={0.1}
                        bufferValue={loaded}
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
