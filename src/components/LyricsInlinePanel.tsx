import React from "react";
import { useLyricsStore } from "@/store/lyricsStore";
import { usePlaybackStore } from "@/store/playbackStore";

const LyricsInlinePanel: React.FC = () => {
    const { lyrics } = useLyricsStore();

    const { currentTime } = usePlaybackStore();

    console.log(lyrics);
    if (!lyrics) {
        return (
            <div className="p-4 text-sm text-muted-foreground">
                No lyrics loaded
            </div>
        );
    }

    const currentLineIndex = lyrics.lines.findIndex((line, idx) => {
        const next = lyrics.lines[idx + 1];
        return currentTime >= line.time && (!next || currentTime < next.time);
    });

    return (
        <div style={{ padding: 12, height: "100%", overflowY: "auto" }}>
            {lyrics.lines.map((line, i) => {
                const isActive = i === currentLineIndex;
                return (
                    <div
                        key={i}
                        style={{
                            padding: "6px 0",
                            color: isActive ? "white" : "#ddd",
                            fontWeight: isActive ? 700 : 500,
                            opacity: isActive ? 1 : 0.6,
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
