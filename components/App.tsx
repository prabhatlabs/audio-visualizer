"use client";

import { AudioAnalysisProvider } from "@/providers/AudioAnalysisProvider";
import { useAppStore } from "@/store/appStore";
import { useAudioCaptureStore } from "@/store/audioCapture";
import { useCallback, useEffect, useRef, useState } from "react";
import ControlBar from "./ControlBar";
import VisualizerPage from "./VisualizerPage";

const IDLE_TIMEOUT = 5000;

const Title = () => {
  return (
    <div className="fixed top-4 right-6 z-50">
      <h1 className="text-2xl font-semibold text-foreground/40">MUZK</h1>
    </div>
  );
};

const App = () => {
  const ytMode = useAppStore((state) => state.ytMode);
  const playing = useAppStore((state) => state.playing);
  const currentTrack = useAppStore((state) => state.currentTrack);
  const {
    isCapturing,
    autoTriggered,
    setAutoTriggered,
    startTabCapture,
    cleanup,
  } = useAudioCaptureStore();
  const [cursorIdle, setCursorIdle] = useState(false);
  const idleTimer = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );

  const resetIdleTimer = useCallback(() => {
    clearTimeout(idleTimer.current);
    if (cursorIdle) setCursorIdle(false);
    idleTimer.current = setTimeout(() => setCursorIdle(true), IDLE_TIMEOUT);
  }, [cursorIdle]);

  useEffect(() => {
    idleTimer.current = setTimeout(() => setCursorIdle(true), IDLE_TIMEOUT);
    addEventListener("mousemove", resetIdleTimer);
    addEventListener("keydown", resetIdleTimer);
    return () => {
      clearTimeout(idleTimer.current);
      removeEventListener("mousemove", resetIdleTimer);
      removeEventListener("keydown", resetIdleTimer);
    };
  }, [resetIdleTimer]);

  useEffect(() => {
    if (!ytMode) return;

    if (!currentTrack) {
      if (isCapturing) cleanup();
      setAutoTriggered(false);
      return;
    }

    if (playing && !isCapturing && !autoTriggered) {
      setAutoTriggered(true);
      startTabCapture();
    }
  }, [
    ytMode,
    playing,
    currentTrack,
    isCapturing,
    autoTriggered,
    startTabCapture,
    cleanup,
    setAutoTriggered,
  ]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") return;

      if (e.key === " " && ytMode) {
        e.preventDefault();
        useAppStore.getState().togglePlaying();
      }

      if (e.key === "f" || e.key === "F") {
        e.preventDefault();
        if (!document.fullscreenElement) {
          document.documentElement.requestFullscreen();
        } else {
          document.exitFullscreen();
        }
      }
    },
    [ytMode],
  );

  useEffect(() => {
    addEventListener("keydown", handleKeyDown);
    return () => removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div
      className={`w-dvw h-dvh flex items-center justify-center ${cursorIdle ? "cursor-none" : ""}`}
    >
      <Title />
      <AudioAnalysisProvider noOfBands={40} children={<VisualizerPage />} />
      <ControlBar cursorIdle={cursorIdle} />
    </div>
  );
};

export default App;
