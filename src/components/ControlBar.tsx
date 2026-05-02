import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useAppStore } from "@/store/appStore";
import { useAudioCaptureStore } from "@/store/audioCapture";
import { colorObj, useColorStore, type ColorThemeType } from "@/store/colorStore";
import { useSettingsStore } from "@/store/settingsStore";
import { MonitorPlay, Palette, Settings2, Upload } from "lucide-react";
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

const VisualizerSettings = () => {
  const { currVisualizer } = useAppStore();
  const { settings, updateSetting } = useSettingsStore();

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        updateSetting("imageBoom", "imageSrc", reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="icon">
          <Settings2 className="w-4 h-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="grid gap-4">
          <div className="space-y-2">
            <h4 className="font-medium leading-none capitalize">
              {currVisualizer} Settings
            </h4>
            <p className="text-sm text-muted-foreground">
              Adjust the visualizer parameters.
            </p>
          </div>

          {currVisualizer === "CubeViz" && (
            <div className="grid gap-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="rotate">Enable Rotation</Label>
                <Switch
                  id="rotate"
                  checked={settings.cubeViz.enableRotate}
                  onCheckedChange={(v) => updateSetting("cubeViz", "enableRotate", v)}
                />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label>Rotation Speed</Label>
                  <span className="text-xs text-muted-foreground">{settings.cubeViz.rotationSpeed}s</span>
                </div>
                <Slider
                  min={5}
                  max={60}
                  step={1}
                  value={[settings.cubeViz.rotationSpeed]}
                  onValueChange={([v]) => updateSetting("cubeViz", "rotationSpeed", v)}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="shake">Enable Shake</Label>
                <Switch
                  id="shake"
                  checked={settings.cubeViz.enableShake}
                  onCheckedChange={(v) => updateSetting("cubeViz", "enableShake", v)}
                />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label>Shake Intensity</Label>
                  <span className="text-xs text-muted-foreground">{settings.cubeViz.shakeIntensity}</span>
                </div>
                <Slider
                  min={0}
                  max={50}
                  step={1}
                  value={[settings.cubeViz.shakeIntensity]}
                  onValueChange={([v]) => updateSetting("cubeViz", "shakeIntensity", v)}
                />
              </div>
            </div>
          )}

          {currVisualizer === "ImageBoom" && (
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="image-upload" className="flex items-center gap-2">
                  <Upload className="w-4 h-4" />
                  Custom Image
                </Label>
                <Input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="cursor-pointer"
                />
                <p className="text-xs text-muted-foreground italic">
                  Best with PNGs or transparent backgrounds.
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="center-text">Center Text</Label>
                <Input
                  id="center-text"
                  type="text"
                  value={settings.imageBoom.centerText}
                  onChange={(e) => updateSetting("imageBoom", "centerText", e.target.value)}
                  placeholder="Enter custom text..."
                />
              </div>
            </div>
          )}

          {currVisualizer === "Ripple" && (
            <div className="grid gap-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="r-ripple">Enable Ripple</Label>
                <Switch
                  id="r-ripple"
                  checked={settings.ripple.enableRipple}
                  onCheckedChange={(v) => updateSetting("ripple", "enableRipple", v)}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="r-strobe">Enable Strobe</Label>
                <Switch
                  id="r-strobe"
                  checked={settings.ripple.enableStrobe}
                  onCheckedChange={(v) => updateSetting("ripple", "enableStrobe", v)}
                />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label>Ripple Speed</Label>
                  <span className="text-xs text-muted-foreground">{settings.ripple.rippleSpeed.toFixed(1)}</span>
                </div>
                <Slider
                  min={0.1}
                  max={5}
                  step={0.1}
                  value={[settings.ripple.rippleSpeed]}
                  onValueChange={([v]) => updateSetting("ripple", "rippleSpeed", v)}
                />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label>Strobe Intensity</Label>
                  <span className="text-xs text-muted-foreground">{settings.ripple.strobeIntensity.toFixed(1)}</span>
                </div>
                <Slider
                  min={0}
                  max={1}
                  step={0.1}
                  value={[settings.ripple.strobeIntensity]}
                  onValueChange={([v]) => updateSetting("ripple", "strobeIntensity", v)}
                />
              </div>
            </div>
          )}

          {currVisualizer === "InfinitySquares" && (
            <div className="grid gap-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label>Square Count</Label>
                  <span className="text-xs text-muted-foreground">{settings.infinitySquares.squareCount}</span>
                </div>
                <Slider
                  min={10}
                  max={100}
                  step={1}
                  value={[settings.infinitySquares.squareCount]}
                  onValueChange={([v]) => updateSetting("infinitySquares", "squareCount", v)}
                />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label>Base Size</Label>
                  <span className="text-xs text-muted-foreground">{settings.infinitySquares.baseSize}</span>
                </div>
                <Slider
                  min={100}
                  max={1000}
                  step={50}
                  value={[settings.infinitySquares.baseSize]}
                  onValueChange={([v]) => updateSetting("infinitySquares", "baseSize", v)}
                />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label>Speed</Label>
                  <span className="text-xs text-muted-foreground">{settings.infinitySquares.speed}</span>
                </div>
                <Slider
                  min={1}
                  max={20}
                  step={1}
                  value={[settings.infinitySquares.speed]}
                  onValueChange={([v]) => updateSetting("infinitySquares", "speed", v)}
                />
              </div>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
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
          <VisualizerSettings />
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
