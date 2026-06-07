"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import ControlBar from "./ControlBar";
import DynamicIsland from "./DynamicIsland";
import VisualizerPage from "./VisualizerPage";
import { AudioAnalysisProvider } from "@/providers/AudioAnalysisProvider";
import { useAppStore } from "@/store/appStore";

const IDLE_TIMEOUT = 5000;

const App = () => {
  const ytMode = useAppStore((state) => state.ytMode);
  const [cursorIdle, setCursorIdle] = useState(false);
  const idleTimer = useRef<ReturnType<typeof setTimeout>>();

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
    <div className={`w-dvw h-dvh flex items-center justify-center ${cursorIdle ? "cursor-none" : ""}`}>
      {ytMode && <DynamicIsland cursorIdle={cursorIdle} />}
      <AudioAnalysisProvider
        noOfBands={40}
        children={<VisualizerPage />}
      />
      <ControlBar cursorIdle={cursorIdle} />
    </div>
  );
};

export default App;
