"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { useAppStore } from "@/store/appStore";
import { useAudioCaptureStore } from "@/store/audioCapture";
import {
  colorObj,
  useColorStore,
  type ColorThemeType,
} from "@/store/colorStore";
import { usePlaybackStore } from "@/store/playbackStore";
import { Laptop, MonitorPlay, Palette, Video } from "lucide-react";
import CaptureAudioBtn from "./CaptureAudioBtn";
import DynamicIsland from "./DynamicIsland";
import { Button } from "./ui/button";
import { Slider } from "./ui/slider";
import VisualizerSettings from "./VisualizerSettings";

const VisualizerSwitcher = () => {
  const {
    setCurrVisualizer,
    currVisualizer,
    visualizersWithLabel,
    visualizersNameObj,
  } = useAppStore();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="gap-2">
          <MonitorPlay className="w-4 h-4" />
          <span className="hidden lg:inline">
            {visualizersNameObj[currVisualizer]}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        {visualizersWithLabel.map((viz) => (
          <DropdownMenuItem
            key={viz.type}
            onClick={() => setCurrVisualizer(viz.type)}
            className={currVisualizer === viz.type ? "bg-accent" : ""}
          >
            {viz.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

const ColorThemeSwitcher = () => {
  const { theme, setTheme } = useColorStore();
  const themes = Object.keys(colorObj) as ColorThemeType[];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Palette className="w-4 h-4" />
          <span className="hidden lg:inline">{theme}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        {themes.map((t) => (
          <DropdownMenuItem
            key={t}
            onClick={() => setTheme(t)}
            className={theme === t ? "bg-accent" : ""}
          >
            {t}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

const ModeToggle = () => {
  const { ytMode, toggleYtMode } = useAppStore();
  const { cleanup } = useAudioCaptureStore();

  const handleToggle = () => {
    cleanup();
    toggleYtMode();
  };

  return (
    <Button variant="outline" onClick={handleToggle} className="gap-2">
      {ytMode ? (
        <Video className="w-4 h-4 text-red-500" />
      ) : (
        <Laptop className="w-4 h-4" />
      )}
      {ytMode ? "YT Mode" : "Capture Mode"}
    </Button>
  );
};

const Seeker = () => {
  const { currentTrack } = useAppStore();
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
    <Slider
      className="absolute z-50 top-0 left-0 w-full bg-foreground/3 cursor-pointer"
      value={[seeking ? localSeek : progress]}
      max={100}
      step={0.1}
      onValueChange={handleSeekChange}
      onValueCommit={handleSeekCommit}
    />
  );
};

const ControlBar = ({ cursorIdle }: { cursorIdle?: boolean }) => {
  const { isCapturing } = useAudioCaptureStore();
  const { ytMode } = useAppStore();

  return (
    <div
      className={`fixed z-50 bottom-0 w-full p-4 backdrop-blur-md bg-background/30 transition-opacity duration-300 ${cursorIdle ? "opacity-0 pointer-events-none" : "opacity-100"}`}
    >
      <div className="flex justify-between gap-4 items-center">
        <div className="flex items-center gap-2">
          <ModeToggle />
          <VisualizerSwitcher />
          <ColorThemeSwitcher />
          <VisualizerSettings />

          <Separator
            orientation="vertical"
            className="data-[orientation=vertical]:h-8 w-1 bg-border"
          />

          <CaptureAudioBtn />
          <span className="text-sm italic text-muted-foreground">
            {isCapturing ? "Capturing Audio" : "Not Capturing Audio"}
          </span>
        </div>
        {ytMode && (
          <div className="flex items-center gap-4">
            <DynamicIsland />
          </div>
        )}
      </div>

      {ytMode && <Seeker />}
    </div>
  );
};

export default ControlBar;
