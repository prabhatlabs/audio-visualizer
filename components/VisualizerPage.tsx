"use client";

import { useAudioAnalysis } from "@/providers/AudioAnalysisProvider";
import { useAppStore } from "@/store/appStore";
import { motion } from "framer-motion";
import { lazy, Suspense, useEffect, useState } from "react";
import LoaderPage from "@/components/LoaderPage";

const CubeViz = lazy(() => import("@/components/visualizers/CubeViz"));
const ImageBoom = lazy(() => import("@/components/visualizers/ImageBoom"));
const Ripple = lazy(() => import("@/components/visualizers/Ripple"));
const LyricsPop = lazy(() => import("@/components/visualizers/LyricsPop"));

function VisualizerPage() {
  const { bandsRef } = useAudioAnalysis();
  const { currVisualizer } = useAppStore();
  const [bandCount, setBandCount] = useState(0);

  useEffect(() => {
    if (bandsRef?.current) {
      setBandCount(bandsRef.current.length);
    }
  }, [bandsRef]);

  if (!bandsRef || !bandCount) return null;

  return (
    <motion.div className="w-dvw h-full flex items-center">
      <Suspense fallback={<LoaderPage />}>
        {currVisualizer === "CubeViz" && (
          <CubeViz audioBands={bandsRef} />
        )}
        {currVisualizer === "Ripple" && (
          <Ripple audioBands={bandsRef} />
        )}
        {currVisualizer === "ImageBoom" && (
          <ImageBoom audioBands={bandsRef} />
        )}
        {currVisualizer === "LyricsPop" && (
          <LyricsPop audioBands={bandsRef} />
        )}
      </Suspense>
    </motion.div>
  );
}

export default VisualizerPage;
