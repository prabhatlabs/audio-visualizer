import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { useAppStore } from "@/store/appStore";
import { usePlaybackStore } from "@/store/playbackStore";
import { Pause, Play, SkipBack, SkipForward } from "lucide-react";

const PlayerControl: React.FC = () => {
    const { playing, togglePlaying, currentTrack } = useAppStore();
    const { currentTime } = usePlaybackStore();

    return (
        <div className="space-y-4">
            <div className="flex justify-center items-center">
                <div className="aspect-square bg-foreground/20 h-40 w-40">
                    <img
                        src={currentTrack?.thumbnail || ""}
                        alt={currentTrack?.title || "No track"}
                    />
                </div>
            </div>
            <div className="text-center">
                <h3 className="font-medium truncate">
                    {currentTrack?.title || "No track"}
                </h3>
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
                    <span>{currentTime}</span>
                    <span>{currentTrack?.timestamp}</span>
                </div>
                <Slider value={[0]} max={100} />
            </div>
        </div>
    );
};

export default PlayerControl;
