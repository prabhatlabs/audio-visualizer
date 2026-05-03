import { useLyricsStore } from "@/store/lyricsStore";
import { usePlaybackStore } from "@/store/playbackStore";
import React, { useEffect, useRef, useState } from "react";

const LyricsInlinePanel: React.FC = () => {
    const { lyrics } = useLyricsStore();
    const { currentTime, setSeeking, setLocalSeek, duration } =
        usePlaybackStore();
    const [currentLineIndex, setCurrentLineIndex] = useState<number | null>(
        null,
    );
    const containerRef = useRef<HTMLDivElement>(null);
    const activeLineRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!lyrics?.lines.length) return;

        function handle() {
            if (!lyrics) return;
            const currentTimeMs = currentTime * 1000;

            let lineIndex = -1;
            for (let i = 0; i < lyrics.lines.length; i++) {
                if (lyrics.lines[i].time <= currentTimeMs) {
                    lineIndex = i;
                }
            }

            setCurrentLineIndex(lineIndex === -1 ? null : lineIndex);
        }

        handle();
    }, [currentTime, lyrics]);

    useEffect(() => {
        if (activeLineRef.current && containerRef.current) {
            const container = containerRef.current;
            const activeEl = activeLineRef.current;
            const containerRect = container.getBoundingClientRect();
            const activeRect = activeEl.getBoundingClientRect();
            const offset =
                activeRect.top - containerRect.top - containerRect.height / 2.5;
            container.scrollBy({ top: offset, behavior: "smooth" });
        }
    }, [currentLineIndex]);

    const handleLineClick = (timeMs: number) => {
        const durationSeconds = duration;
        const progressPercent = (timeMs / 1000 / durationSeconds) * 100;
        setSeeking(true);
        setLocalSeek(progressPercent);
        requestAnimationFrame(() => setSeeking(false));
    };

    return (
        <div
            ref={containerRef}
            className="pr-2 py-30 overflow-y-auto h-55 mask-y-from-80% text-center"
        >
            {!lyrics && (
                <div className="p-4 text-sm text-muted-foreground">
                    No lyrics loaded
                </div>
            )}
            {lyrics?.lines.map((line, i) => {
                const isActive = i === currentLineIndex;
                return (
                    <div
                        key={i}
                        ref={isActive ? activeLineRef : null}
                        onClick={() => handleLineClick(line.time)}
                        style={{
                            padding: "6px 0",
                            color: isActive
                                ? "var(--foreground)"
                                : "var(--muted-foreground)",
                            fontWeight: isActive ? 700 : 400,
                            fontSize: isActive ? "24px" : "18px",
                            opacity: isActive ? 1 : 0.6,
                            transition: "all 0.2s ease",
                            cursor: "pointer",
                        }}
                    >
                        {line.text}
                    </div>
                );
            })}
        </div>
    );
};

export default LyricsInlinePanel;
