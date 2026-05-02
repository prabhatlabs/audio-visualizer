import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import { formatTime } from "@/lib/time";
import { useAppStore } from "@/store/appStore";
import { usePlaybackStore } from "@/store/playbackStore";
import { Music, Pause, Play, SkipBack, SkipForward } from "lucide-react";

const PlayerControl: React.FC = () => {
    const { playing, togglePlaying, currentTrack } = useAppStore();
    const { currentTime, seeking, setSeeking, localSeek, setLocalSeek } =
        usePlaybackStore();

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
        <div className="space-y-6">
            <div className="flex justify-center items-center">
                <div className="aspect-square bg-foreground/20 h-50 w-50 relative">
                    <Music className="size-25 text-muted-foreground absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                    <img
                        src={currentTrack?.thumbnail || ""}
                        alt={currentTrack?.title || "No track"}
                    />
                </div>
            </div>
            <div className="text-center space-y-2">
                <h3 className="font-medium truncate text-xl px-3">
                    {currentTrack?.title || "No track"}
                </h3>
                <h5 className="font-medium truncate text-sm px-3 text-muted-foreground">
                    {currentTrack?.author || "No Artist"}
                </h5>
            </div>
            <div className="flex justify-center items-center gap-4">
                <Button variant="outline" size="icon">
                    <SkipBack />
                </Button>
                <Button variant="default" size="icon" onClick={togglePlaying}>
                    {playing ? <Pause /> : <Play />}
                </Button>
                <Button variant="outline" size="icon">
                    <SkipForward />
                </Button>
            </div>
            <div className="space-y-2">
                <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{formatTime(currentTime)}</span>
                    <span>{currentTrack?.timestamp || "0:00"}</span>
                </div>
                <div className="relative h-2">
                    <Slider
                        value={[seeking ? localSeek : progress]}
                        max={100}
                        step={0.1}
                        onValueChange={handleSeekChange}
                        onValueCommit={handleSeekCommit}
                        className="absolute w-full z-10"
                    />
                    <Progress
                        value={progress}
                        bufferValue={progress + 15}
                        className="absolute h-2 w-full z-0"
                    />
                </div>
            </div>
        </div>
    );
};

export default PlayerControl;
