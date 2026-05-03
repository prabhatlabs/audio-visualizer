import { useAudioAnalysis } from "@/providers/AudioAnalysisProvider";
import { useAppStore } from "@/store/appStore";
import { useSettingsStore } from "@/store/settingsStore";
import { motion } from "framer-motion";
import { lazy, Suspense, useEffect, useState } from "react";
import LyricsInlinePanel from "@/components/LyricsInlinePanel";

const CubeViz = lazy(() => import("@/components/visualizers/CubeViz"));
const ImageBoom = lazy(() => import("@/components/visualizers/ImageBoom"));
const InfinitySquares = lazy(
    () => import("@/components/visualizers/InfinitySquares"),
);
const Ripple = lazy(() => import("@/components/visualizers/Ripple"));

function VisualizerPage() {
    const { bandsRef } = useAudioAnalysis();
    const { currVisualizer, ytMode } = useAppStore();
    const showLyrics = useSettingsStore((s) => s.settings.youtube.showLyrics);
    const [bandCount, setBandCount] = useState(0);

    useEffect(() => {
        if (bandsRef?.current) {
            setBandCount(bandsRef.current.length);
        }
    }, [bandsRef]);

    if (!bandsRef || !bandCount) return null;

    return (
        <motion.div className="w-dvw h-full flex items-center px-6">
            {ytMode && showLyrics && (
                <div className="w-1/3">
                    <LyricsInlinePanel className="h-[calc(100dvh-200px)] py-[calc(50dvh-100px)]" />
                </div>
            )}
            <div className={ytMode && showLyrics ? "w-2/3" : "w-full"}>
                <Suspense fallback={<div>Loading...</div>}>
                    {currVisualizer === "InfinitySquares" && (
                        <InfinitySquares audioBands={bandsRef} />
                    )}
                    {currVisualizer === "CubeViz" && (
                        <CubeViz audioBands={bandsRef} />
                    )}
                    {currVisualizer === "Ripple" && (
                        <Ripple audioBands={bandsRef} />
                    )}
                    {currVisualizer === "ImageBoom" && (
                        <ImageBoom audioBands={bandsRef} />
                    )}
                </Suspense>
            </div>
        </motion.div>
    );
}

export default VisualizerPage;
