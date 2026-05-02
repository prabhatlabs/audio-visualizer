import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAppStore } from "@/store/appStore";
import { useAudioCaptureStore } from "@/store/audioCapture";
import { colorObj, useColorStore, ColorThemeType } from "@/store/colorStore";
import { MonitorPlay, Palette } from "lucide-react";
import CaptureAudioBtn from "./CaptureAudioBtn";
import { Button } from "./ui/button";

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
          {visualizersNameObj[currVisualizer]}
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
          {theme}
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

const ControlBar = () => {
  const { isCapturing } = useAudioCaptureStore();
  return (
    <div className="fixed z-50 bottom-0 w-full p-4 backdrop-blur-xs">
      <div className="flex justify-between gap-4 items-center">
        <div className="flex items-center gap-2">
          <VisualizerSwitcher />
          <ColorThemeSwitcher />
          <CaptureAudioBtn />
          <span className="text-sm italic text-muted-foreground">
            {isCapturing ? "Capturing Audio" : "Not Capturing Audio"}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {/* <ThemeToggleBtn /> */}
        </div>
      </div>
    </div>
  );
};

export default ControlBar;
