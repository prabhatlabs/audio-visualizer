import { cn } from "@/lib/utils";
import { useLyricsStore } from "@/store/lyricsStore";
import { usePlaybackStore } from "@/store/playbackStore";
import React, { useEffect, useRef, useState } from "react";

const LyricsInlinePanel: React.FC<{
    className?: string;
    hideScrollbar?: boolean;
    fontSize?: string;
    activeFontSize?: string;
}> = ({
    className,
    hideScrollbar = false,
    fontSize = "18px",
    activeFontSize = "24px",
}) => {
    const { lyrics, isLoading } = useLyricsStore();
    const { currentTime, setSeeking, setLocalSeek } = usePlaybackStore();
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
        const durationMs = lyrics?.lines[lyrics.lines.length - 1]?.time;
        const progressPercent = (timeMs / (durationMs || 1)) * 100;
        setSeeking(true);
        setLocalSeek(progressPercent);
        requestAnimationFrame(() => setSeeking(false));
    };

    return (
        <div
            ref={containerRef}
            className={cn(
                "pr-2 py-20 overflow-y-auto h-55 mask-y-from-80% text-center",
                hideScrollbar && "no-scrollbar",
                className,
            )}
        >
            {isLoading && (
                <div className="space-y-4 py-8 flex flex-col items-center w-full">
                    <div className="h-6 w-3/4 bg-muted animate-pulse rounded-md" />
                    <div className="h-8 w-1/2 bg-muted animate-pulse rounded-md" />
                    <div className="h-6 w-2/3 bg-muted animate-pulse rounded-md" />
                </div>
            )}
            {!isLoading && (!lyrics || (lyrics.lines.length === 0 && !lyrics.plainLyrics)) && (
                <div className="p-4 text-sm text-muted-foreground">
                    No lyrics found!
                </div>
            )}
            {!isLoading &&
                lyrics &&
                lyrics.lines.length === 0 &&
                lyrics.plainLyrics && (
                    <div
                        className="whitespace-pre-wrap py-4 px-4 text-muted-foreground leading-relaxed"
                        style={{ fontSize }}
                    >
                        {lyrics.plainLyrics}
                    </div>
                )}
            {!isLoading &&
                lyrics?.lines.map((line, i) => {
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
                                fontSize: isActive ? activeFontSize : fontSize,
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
