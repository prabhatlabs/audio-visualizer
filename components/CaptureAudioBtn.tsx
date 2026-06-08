"use client";

import { useAudioCaptureStore } from "@/store/audioCapture";
import { useAppStore } from "@/store/appStore";
import { Button } from "./ui/button";

const CaptureAudioBtn = () => {
  const { startScreenCapture, startTabCapture, isCapturing, autoTriggered, cleanup } = useAudioCaptureStore();
  const { ytMode } = useAppStore();
  const handleClick = () => {
    if (isCapturing) {
      cleanup();
    } else if (ytMode) {
      startTabCapture();
    } else {
      startScreenCapture();
    }
  };
  const label = isCapturing ? "Stop" : autoTriggered ? "Retry Capture" : "Capture";
  return (
    <Button variant="outline" className="gap-2" onClick={handleClick}>
      {label}
    </Button>
  );
};

export default CaptureAudioBtn;
