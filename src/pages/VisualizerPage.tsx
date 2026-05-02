import { useAudioAnalysis } from "@/providers/AudioAnalysisProvider";
import { useAppStore } from "@/store/appStore";
import { motion } from "framer-motion";
import { lazy, Suspense } from "react";

const CubeViz = lazy(() => import("@/components/visualizers/CubeViz"));
const ImageBoom = lazy(() => import("@/components/visualizers/ImageBoom"));
const InfinitySquares = lazy(
    () => import("@/components/visualizers/InfinitySquares"),
);
const Ripple = lazy(() => import("@/components/visualizers/Ripple"));

function VisualizerPage() {
    const { bandsRef } = useAudioAnalysis();
    const { currVisualizer } = useAppStore();
    const BAND_COUNT = bandsRef?.current.length;

    if (!bandsRef || !BAND_COUNT) return null;

    return (
        <motion.div className="w-dvw h-full">
            <Suspense fallback={<div>Loading...</div>}>
                {currVisualizer === "InfinitySquares" && (
                    <InfinitySquares audioBands={bandsRef} />
                )}
                {currVisualizer === "CubeViz" && (
                    <CubeViz
                        audioBands={bandsRef}
                    />
                )}
                {currVisualizer === "Ripple" && (
                    <Ripple audioBands={bandsRef} />
                )}
                {currVisualizer === "ImageBoom" && (
                    <ImageBoom audioBands={bandsRef} />
                )}
            </Suspense>
        </motion.div>
    );
}

export default VisualizerPage;
