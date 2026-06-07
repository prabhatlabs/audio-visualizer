"use client";

import { useAudioCaptureStore } from "@/store/audioCapture";
import { useAppStore } from "@/store/appStore";
import { Button } from "./ui/button";

const CaptureAudioBtn = () => {
  const { startScreenCapture, startTabCapture, isCapturing, cleanup } = useAudioCaptureStore();
  const { ytMode } = useAppStore();
  const handleToggleBtn = () => (isCapturing ? cleanup() : (ytMode ? startTabCapture() : startScreenCapture()));
  return (
    <Button variant="outline" className="gap-2" onClick={handleToggleBtn}>
      {isCapturing ? "Stop" : "Capture"}
    </Button>
  );
};

export default CaptureAudioBtn;
