import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { useAudioCaptureStore } from "@/store/audioCapture";
import {
    colorObj,
    useColorStore,
    type ColorThemeType,
} from "@/store/colorStore";
import { useSettingsStore } from "@/store/settingsStore";
import {
    Laptop,
    MonitorPlay,
    Palette,
    Radio,
    RotateCcw,
    Settings2,
    Upload,
    Youtube,
} from "lucide-react";
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
                        className={
                            currVisualizer === viz.type ? "bg-accent" : ""
                        }
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

const VisualizerSettings = () => {
    const { currVisualizer } = useAppStore();
    const { settings, updateSetting, resetSettings } = useSettingsStore();

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
                <div className="grid gap-4">
                    <div className="space-y-2">
                        <h4 className="font-medium leading-none capitalize">
                            {currVisualizer} Settings
                        </h4>
                        <p className="text-sm text-muted-foreground">
                            Adjust the visualizer parameters.
                        </p>
                    </div>

                    <div className="grid gap-4 py-2">
                        {currVisualizer === "CubeViz" && (
                            <div className="grid gap-4">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="rotate">
                                        Enable Rotation
                                    </Label>
                                    <Switch
                                        id="rotate"
                                        checked={settings.cubeViz.enableRotate}
                                        onCheckedChange={(v) =>
                                            updateSetting(
                                                "cubeViz",
                                                "enableRotate",
                                                v,
                                            )
                                        }
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
                                        onValueChange={([v]) =>
                                            updateSetting(
                                                "cubeViz",
                                                "rotationSpeed",
                                                v,
                                            )
                                        }
                                    />
                                </div>
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="shake">Enable Shake</Label>
                                    <Switch
                                        id="shake"
                                        checked={settings.cubeViz.enableShake}
                                        onCheckedChange={(v) =>
                                            updateSetting(
                                                "cubeViz",
                                                "enableShake",
                                                v,
                                            )
                                        }
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
                                        value={[
                                            settings.cubeViz.shakeIntensity,
                                        ]}
                                        onValueChange={([v]) =>
                                            updateSetting(
                                                "cubeViz",
                                                "shakeIntensity",
                                                v,
                                            )
                                        }
                                    />
                                </div>
                            </div>
                        )}

                        {currVisualizer === "ImageBoom" && (
                            <div className="grid gap-4">
                                <div className="space-y-2">
                                    <Label
                                        htmlFor="image-upload"
                                        className="flex items-center gap-2"
                                    >
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
                                        Best with PNGs or transparent
                                        backgrounds.
                                    </p>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="center-text">
                                        Center Text
                                    </Label>
                                    <Input
                                        id="center-text"
                                        type="text"
                                        value={settings.imageBoom.centerText}
                                        onChange={(e) =>
                                            updateSetting(
                                                "imageBoom",
                                                "centerText",
                                                e.target.value,
                                            )
                                        }
                                        placeholder="Enter custom text..."
                                    />
                                </div>
                            </div>
                        )}

                        <Separator />

                        <div className="grid gap-4">
                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <Label>Player Volume</Label>
                                    <span className="text-xs text-muted-foreground">
                                        {(
                                            (settings.youtube?.volume ?? 0.8) *
                                            100
                                        ).toFixed(0)}
                                        %
                                    </span>
                                </div>
                                <Slider
                                    min={0}
                                    max={1}
                                    step={0.05}
                                    value={[settings.youtube?.volume ?? 0.8]}
                                    onValueChange={([v]) =>
                                        updateSetting("youtube", "volume", v)
                                    }
                                />
                            </div>
                        </div>

                        <Separator />
                        {currVisualizer === "Ripple" && (
                            <div className="grid gap-4">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="r-ripple">
                                        Enable Ripple
                                    </Label>
                                    <Switch
                                        id="r-ripple"
                                        checked={settings.ripple.enableRipple}
                                        onCheckedChange={(v) =>
                                            updateSetting(
                                                "ripple",
                                                "enableRipple",
                                                v,
                                            )
                                        }
                                    />
                                </div>
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="r-strobe">
                                        Enable Strobe
                                    </Label>
                                    <Switch
                                        id="r-strobe"
                                        checked={settings.ripple.enableStrobe}
                                        onCheckedChange={(v) =>
                                            updateSetting(
                                                "ripple",
                                                "enableStrobe",
                                                v,
                                            )
                                        }
                                    />
                                </div>
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <Label>Ripple Speed</Label>
                                        <span className="text-xs text-muted-foreground">
                                            {settings.ripple.rippleSpeed.toFixed(
                                                1,
                                            )}
                                        </span>
                                    </div>
                                    <Slider
                                        min={0.1}
                                        max={5}
                                        step={0.1}
                                        value={[settings.ripple.rippleSpeed]}
                                        onValueChange={([v]) =>
                                            updateSetting(
                                                "ripple",
                                                "rippleSpeed",
                                                v,
                                            )
                                        }
                                    />
                                </div>
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <Label>Strobe Intensity</Label>
                                        <span className="text-xs text-muted-foreground">
                                            {settings.ripple.strobeIntensity.toFixed(
                                                1,
                                            )}
                                        </span>
                                    </div>
                                    <Slider
                                        min={0}
                                        max={1}
                                        step={0.1}
                                        value={[
                                            settings.ripple.strobeIntensity,
                                        ]}
                                        onValueChange={([v]) =>
                                            updateSetting(
                                                "ripple",
                                                "strobeIntensity",
                                                v,
                                            )
                                        }
                                    />
                                </div>
                            </div>
                        )}

                        {currVisualizer === "InfinitySquares" && (
                            <div className="grid gap-4">
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <Label>Square Count</Label>
                                        <span className="text-xs text-muted-foreground">
                                            {
                                                settings.infinitySquares
                                                    .squareCount
                                            }
                                        </span>
                                    </div>
                                    <Slider
                                        min={10}
                                        max={100}
                                        step={1}
                                        value={[
                                            settings.infinitySquares
                                                .squareCount,
                                        ]}
                                        onValueChange={([v]) =>
                                            updateSetting(
                                                "infinitySquares",
                                                "squareCount",
                                                v,
                                            )
                                        }
                                    />
                                </div>
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <Label>Base Size</Label>
                                        <span className="text-xs text-muted-foreground">
                                            {settings.infinitySquares.baseSize}
                                        </span>
                                    </div>
                                    <Slider
                                        min={100}
                                        max={1000}
                                        step={50}
                                        value={[
                                            settings.infinitySquares
                                                .baseSize,
                                        ]}
                                        onValueChange={([v]) =>
                                            updateSetting(
                                                "infinitySquares",
                                                "baseSize",
                                                v,
                                            )
                                        }
                                    />
                                </div>
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <Label>Speed</Label>
                                        <span className="text-xs text-muted-foreground">
                                            {settings.infinitySquares.speed}
                                        </span>
                                    </div>
                                    <Slider
                                        min={1}
                                        max={20}
                                        step={1}
                                        value={[settings.infinitySquares.speed]}
                                        onValueChange={([v]) =>
                                            updateSetting(
                                                "infinitySquares",
                                                "speed",
                                                v,
                                            )
                                        }
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    <Separator />

                    <Button
                        variant="default"
                        size="sm"
                        className="w-fit gap-2"
                        onClick={() => resetSettings(currentSettingsKey)}
                    >
                        <RotateCcw className="w-3.5 h-3.5" />
                        Reset to Default
                    </Button>
                </div>
            </PopoverContent>
        </Popover>
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
                <Youtube className="w-4 h-4 text-red-500" />
            ) : (
                <Laptop className="w-4 h-4" />
            )}
            {ytMode ? "YT Mode" : "Capture Mode"}
        </Button>
    );
};

const LyricsToggle = () => {
    const { ytMode } = useAppStore();
    const showLyrics = useSettingsStore((s) => s.settings.youtube.showLyrics);
    const updateSetting = useSettingsStore((s) => s.updateSetting);

    if (!ytMode) return null;

    return (
        <Button
            variant="outline"
            onClick={() => updateSetting("youtube", "showLyrics", !showLyrics)}
            className="gap-2"
        >
            {showLyrics ? "Hide Lyrics" : "Show Lyrics"}
        </Button>
    );
};

const ControlBar = () => {
    const { isCapturing, startCapture } = useAudioCaptureStore();
    const { ytMode } = useAppStore();

    return (
        <div className="fixed z-50 bottom-0 w-full p-4 backdrop-blur-xs">
            <div className="flex justify-between gap-4 items-center">
                <div className="flex items-center gap-2">
                    <ModeToggle />
                    <LyricsToggle />
                    <VisualizerSwitcher />
                    <ColorThemeSwitcher />
                    <VisualizerSettings />

                    <Separator orientation="vertical" className="h-8 mx-1" />

                    {!ytMode ? (
                        <>
                            <CaptureAudioBtn />
                            <span className="text-sm italic text-muted-foreground">
                                {isCapturing
                                    ? "Capturing Audio"
                                    : "Not Capturing Audio"}
                            </span>
                        </>
                    ) : (
                        <>
                            {!isCapturing && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => startCapture()}
                                    className="gap-2 text-yellow-500 hover:text-yellow-600 hover:bg-yellow-500/10"
                                >
                                    <Radio className="w-4 h-4" />
                                    Connect Visualizer
                                </Button>
                            )}
                        </>
                    )}
                </div>
                <div className="flex items-center gap-2">
                </div>
            </div>
        </div>
    );
};


export default ControlBar;
