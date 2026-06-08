"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { useAppStore } from "@/store/appStore";
import { useSettingsStore } from "@/store/settingsStore";
import {
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Settings2,
  Upload,
} from "lucide-react";
import { Button } from "./ui/button";
import { PRESET_IMAGES } from "./visualizers/ImageBoom";

const ShowMetaToggle = () => {
  const { currVisualizer, ytMode } = useAppStore();
  const settings = useSettingsStore((s) => s.settings);
  const updateSetting = useSettingsStore((s) => s.updateSetting);

  if (!ytMode) return null;

  const vizKey = currVisualizer.charAt(0).toLowerCase() + currVisualizer.slice(1) as keyof typeof settings;
  const showMeta = (settings[vizKey] as { showMeta?: boolean }).showMeta ?? true;

  return (
    <Button
      variant="outline"
      onClick={() => updateSetting(vizKey as any, "showMeta", !showMeta)}
      size={"sm"}
    >
      {showMeta ? "Hide Meta" : "Show Meta"}
    </Button>
  );
};

const LyricsToggle = () => {
  const { currVisualizer, ytMode } = useAppStore();
  const settings = useSettingsStore((s) => s.settings);
  const updateSetting = useSettingsStore((s) => s.updateSetting);

  if (!ytMode) return null;

  const vizKey = currVisualizer.charAt(0).toLowerCase() + currVisualizer.slice(1) as keyof typeof settings;
  const showLyrics = (settings[vizKey] as { showLyrics?: boolean }).showLyrics ?? false;

  return (
    <Button
      variant="outline"
      onClick={() => updateSetting(vizKey as any, "showLyrics", !showLyrics)}
      size={"sm"}
    >
      {showLyrics ? "Hide Lyrics" : "Show Lyrics"}
    </Button>
  );
};

const CubeVizSettings = () => {
  const { settings, updateSetting } = useSettingsStore();
  return (
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
          <span className="text-xs text-muted-foreground">
            {settings.cubeViz.rotationSpeed}s
          </span>
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
          <span className="text-xs text-muted-foreground">
            {settings.cubeViz.shakeIntensity}
          </span>
        </div>
        <Slider
          min={0}
          max={50}
          step={1}
          value={[settings.cubeViz.shakeIntensity]}
          onValueChange={([v]) => updateSetting("cubeViz", "shakeIntensity", v)}
        />
      </div>
      <div className="space-y-2">
        <div className="flex justify-between">
          <Label>Kick Sensitivity</Label>
          <span className="text-xs text-muted-foreground">
            {(settings.cubeViz.kickThreshold ?? 0.8).toFixed(2)}
          </span>
        </div>
        <Slider
          min={0.1}
          max={2.0}
          step={0.05}
          value={[settings.cubeViz.kickThreshold ?? 0.8]}
          onValueChange={([v]) => updateSetting("cubeViz", "kickThreshold", v)}
        />
      </div>
    </div>
  );
};

const ImageBoomSettings = () => {
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

  const handleImageSelect = (isIncrement: boolean = false) => {
    updateSetting("imageBoom", "imageSrc", "");
    const noImages = PRESET_IMAGES.length;
    if (isIncrement) {
      updateSetting(
        "imageBoom",
        "selectedImage",
        (settings.imageBoom.selectedImage + 1) % noImages,
      );
    } else {
      updateSetting(
        "imageBoom",
        "selectedImage",
        (settings.imageBoom.selectedImage - 1 + noImages) % noImages,
      );
    }
  };

  return (
    <div className="grid gap-4">
      <div className="space-y-2">
        <Label>Preset Images</Label>
        <div className="flex items-center justify-between gap-1 w-full">
          <Button
            variant="outline"
            size="icon-sm"
            onClick={() => handleImageSelect(false)}
          >
            <ChevronLeft />
          </Button>
          <span className="text-xs font-medium text-center flex-1">
            Image {settings.imageBoom.selectedImage + 1}
          </span>
          <Button
            variant="outline"
            size="icon-sm"
            onClick={() => handleImageSelect(true)}
          >
            <ChevronRight />
          </Button>
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="image-upload">
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
          onChange={(e) =>
            updateSetting("imageBoom", "centerText", e.target.value)
          }
          placeholder="Enter custom text..."
        />
      </div>
    </div>
  );
};

const RippleSettings = () => {
  const { settings, updateSetting } = useSettingsStore();
  return (
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
          <span className="text-xs text-muted-foreground">
            {settings.ripple.rippleSpeed.toFixed(1)}
          </span>
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
          <span className="text-xs text-muted-foreground">
            {settings.ripple.strobeIntensity.toFixed(1)}
          </span>
        </div>
        <Slider
          min={0}
          max={1}
          step={0.1}
          value={[settings.ripple.strobeIntensity]}
          onValueChange={([v]) => updateSetting("ripple", "strobeIntensity", v)}
        />
      </div>
      <div className="space-y-2">
        <div className="flex justify-between">
          <Label>Kick Sensitivity</Label>
          <span className="text-xs text-muted-foreground">
            {(settings.ripple.kickThreshold ?? 0.5).toFixed(2)}
          </span>
        </div>
        <Slider
          min={0.1}
          max={2.0}
          step={0.05}
          value={[settings.ripple.kickThreshold ?? 0.5]}
          onValueChange={([v]) => updateSetting("ripple", "kickThreshold", v)}
        />
      </div>
    </div>
  );
};

const LyricsPopSettings = () => {
  const { settings, updateSetting } = useSettingsStore();
  return (
    <div className="grid gap-4">
      <div className="space-y-2">
        <div className="flex justify-between">
          <Label>Kick Sensitivity</Label>
          <span className="text-xs text-muted-foreground">
            {(settings.lyricsPop.kickThreshold ?? 0.6).toFixed(2)}
          </span>
        </div>
        <Slider
          min={0.1}
          max={2.0}
          step={0.05}
          value={[settings.lyricsPop.kickThreshold ?? 0.6]}
          onValueChange={([v]) => updateSetting("lyricsPop", "kickThreshold", v)}
        />
      </div>
    </div>
  );
};

const VisualizerSettings = () => {
  const { currVisualizer } = useAppStore();
  const { resetSettings } = useSettingsStore();

  const currentSettingsKey = (currVisualizer.charAt(0).toLowerCase() +
    currVisualizer.slice(1)) as any;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Settings2 className="w-4 h-4" />
          <span className="hidden lg:inline">Settings</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="grid gap-2">
          <div className="space-y-2">
            <h4 className="font-medium leading-none capitalize">
              {currVisualizer} Settings
            </h4>
            <p className="text-sm text-muted-foreground">
              Adjust the visualizer parameters.
            </p>
          </div>

          <div className="grid gap-4 py-2">
            {currVisualizer === "CubeViz" && <CubeVizSettings />}
            {currVisualizer === "ImageBoom" && <ImageBoomSettings />}
            {currVisualizer === "Ripple" && <RippleSettings />}
            {currVisualizer === "LyricsPop" && <LyricsPopSettings />}
          </div>

          <Separator />

          <Button
            variant="default"
            size="sm"
            onClick={() => resetSettings(currentSettingsKey)}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset to Default
          </Button>
          {currVisualizer !== "ImageBoom" && (
            <div className="grid grid-cols-2 gap-2">
              <ShowMetaToggle />
              <LyricsToggle />
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default VisualizerSettings;
