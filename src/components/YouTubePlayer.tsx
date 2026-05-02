// biome-ignore lint/style/useImportType:
import React, { useState, useRef, useCallback } from "react";
import ReactPlayer from "react-player";
import { useAppStore } from "@/store/appStore";
import { usePlaybackStore } from "@/store/playbackStore";
import { useSettingsStore } from "@/store/settingsStore";

const YouTubePlayer: React.FC = () => {
    const playerRef = useRef<HTMLVideoElement | null>(null);
    const urlInputRef = useRef<HTMLInputElement | null>(null);

    // ── Stores ────────────────────────────────────────────────────────────────
    const {
        playing,
        setPlaying,
        togglePlaying,
        currentTrack,
        setCurrentTrack,
    } = useAppStore();

    const { setCurrentTime } = usePlaybackStore();

    const volume = useSettingsStore((s) => s.settings.youtube.volume);
    const updateSetting = useSettingsStore((s) => s.updateSetting);

    // ── Local UI state (not worth putting in a store) ─────────────────────────
    const [muted, setMuted] = useState(false);
    const [loop, setLoop] = useState(false);
    const [playbackRate, setPlaybackRate] = useState(1.0);
    const [played, setPlayed] = useState(0);
    const [loaded, setLoaded] = useState(0);
    const [duration, setDuration] = useState(0);
    const [seeking, setSeeking] = useState(false);

    // ── Ref ───────────────────────────────────────────────────────────────────
    const setPlayerRef = useCallback((player: HTMLVideoElement) => {
        if (!player) return;
        playerRef.current = player;
    }, []);

    // ── Handlers ──────────────────────────────────────────────────────────────
    const handleStop = () => {
        setCurrentTrack(null);
        setPlaying(false);
        setPlayed(0);
        setLoaded(0);
        setDuration(0);
    };

    const handleVolumeChange = (e: React.SyntheticEvent<HTMLInputElement>) => {
        updateSetting(
            "youtube",
            "volume",
            Number.parseFloat((e.target as HTMLInputElement).value),
        );
    };

    const handleSetPlaybackRate = (
        e: React.SyntheticEvent<HTMLButtonElement>,
    ) => {
        setPlaybackRate(
            Number.parseFloat(
                `${(e.target as HTMLButtonElement).dataset.value}`,
            ),
        );
    };

    const handleRateChange = () => {
        const player = playerRef.current;
        if (!player) return;
        setPlaybackRate(player.playbackRate);
    };

    const handleSeekMouseDown = () => setSeeking(true);

    const handleSeekChange = (e: React.SyntheticEvent<HTMLInputElement>) => {
        setPlayed(Number.parseFloat((e.target as HTMLInputElement).value));
    };

    const handleSeekMouseUp = (e: React.SyntheticEvent<HTMLInputElement>) => {
        const val = Number.parseFloat((e.target as HTMLInputElement).value);
        setSeeking(false);
        if (playerRef.current) {
            playerRef.current.currentTime = val * playerRef.current.duration;
        }
    };

    // Mirror App's onProgress — buffered loaded progress
    const handleProgress = () => {
        const player = playerRef.current;
        if (!player || seeking || !player.buffered?.length) return;
        const bufferedEnd = player.buffered.end(player.buffered.length - 1);
        setLoaded(bufferedEnd / player.duration);
    };

    // Mirror App's onTimeUpdate — drives seek slider + playbackStore
    const handleTimeUpdate = () => {
        const player = playerRef.current;
        if (!player || seeking || !player.duration) return;
        const ratio = player.currentTime / player.duration;
        setPlayed(ratio);
        setCurrentTime(player.currentTime); // → playbackStore (drives lyrics sync etc.)
    };

    const handleDurationChange = () => {
        const player = playerRef.current;
        if (!player) return;
        setDuration(player.duration);
    };

    const handleEnded = () => {
        setPlaying(loop);
    };

    const handleLoadUrl = () => {
        const url = urlInputRef.current?.value;
        if (!url) return;
        // Extract videoId from YouTube URL
        const videoId = new URL(url).searchParams.get("v") ?? url;
        setCurrentTrack({
            videoId,
            title: url,
            thumbnail: "",
            timestamp: "",
            author: "",
        });
    };

    const src = currentTrack
        ? `https://www.youtube.com/watch?v=${currentTrack.videoId}`
        : undefined;

    return (
        <div
            style={{ padding: 16, maxWidth: 800, margin: "0 auto" }}
            className="absolute -translate-y-full"
        >
            <h2>YouTube Player</h2>

            {/* ── Player ───────────────────────────────────────────────────── */}
            <div
                style={{
                    width: "100%",
                    aspectRatio: "16/9",
                    background: "#000",
                }}
            >
                <ReactPlayer
                    ref={setPlayerRef}
                    src={src}
                    playing={playing}
                    volume={volume}
                    muted={muted}
                    loop={loop}
                    playbackRate={playbackRate}
                    controls={false}
                    style={{
                        width: "100%",
                        height: "auto",
                        aspectRatio: "16/9",
                    }}
                    config={{ youtube: { color: "white" } }}
                    onPlay={() => setPlaying(true)}
                    onPause={() => setPlaying(false)}
                    onEnded={handleEnded}
                    onRateChange={handleRateChange}
                    onTimeUpdate={handleTimeUpdate}
                    onProgress={handleProgress}
                    onDurationChange={handleDurationChange}
                    onError={(e) => console.error("onError", e)}
                    onReady={() => console.log("onReady")}
                />
            </div>

            {/* ── Controls ─────────────────────────────────────────────────── */}
            <table style={{ marginTop: 12, width: "100%" }}>
                <tbody>
                    <tr>
                        <th>Controls</th>
                        <td>
                            <button type="button" onClick={handleStop}>
                                Stop
                            </button>
                            <button type="button" onClick={togglePlaying}>
                                {playing ? "Pause" : "Play"}
                            </button>
                            <button
                                type="button"
                                onClick={() => setMuted((m) => !m)}
                            >
                                {muted ? "Unmute" : "Mute"}
                            </button>
                        </td>
                    </tr>
                    <tr>
                        <th>Speed</th>
                        <td>
                            <button
                                type="button"
                                onClick={handleSetPlaybackRate}
                                data-value={1}
                            >
                                1x
                            </button>
                            <button
                                type="button"
                                onClick={handleSetPlaybackRate}
                                data-value={1.5}
                            >
                                1.5x
                            </button>
                            <button
                                type="button"
                                onClick={handleSetPlaybackRate}
                                data-value={2}
                            >
                                2x
                            </button>
                        </td>
                    </tr>
                    <tr>
                        <th>
                            <label htmlFor="seek">Seek</label>
                        </th>
                        <td>
                            <input
                                id="seek"
                                type="range"
                                min={0}
                                max={0.999999}
                                step="any"
                                value={played}
                                onMouseDown={handleSeekMouseDown}
                                onChange={handleSeekChange}
                                onMouseUp={handleSeekMouseUp}
                            />
                        </td>
                    </tr>
                    <tr>
                        <th>
                            <label htmlFor="volume">Volume</label>
                        </th>
                        <td>
                            <input
                                id="volume"
                                type="range"
                                min={0}
                                max={1}
                                step="any"
                                value={volume}
                                onChange={handleVolumeChange}
                            />
                        </td>
                    </tr>
                    <tr>
                        <th>Loop</th>
                        <td>
                            <input
                                type="checkbox"
                                checked={loop}
                                onChange={() => setLoop((l) => !l)}
                            />
                        </td>
                    </tr>
                    <tr>
                        <th>Played</th>
                        <td>
                            <progress max={1} value={played} />
                        </td>
                    </tr>
                    <tr>
                        <th>Loaded</th>
                        <td>
                            <progress max={1} value={loaded} />
                        </td>
                    </tr>
                    <tr>
                        <th>Time</th>
                        <td>
                            {Math.round(played * duration)}s /{" "}
                            {Math.round(duration)}s
                        </td>
                    </tr>
                </tbody>
            </table>

            {/* ── URL Loader ───────────────────────────────────────────────── */}
            <table style={{ marginTop: 16, width: "100%" }}>
                <tbody>
                    <tr>
                        <th>YouTube</th>
                        <td>
                            <button
                                type="button"
                                onClick={() =>
                                    setCurrentTrack({
                                        videoId: "oUFJJNQGwhk",
                                        title: "Test A",
                                        thumbnail: "",
                                        timestamp: "",
                                        author: "",
                                    })
                                }
                            >
                                Test A
                            </button>
                            <button
                                type="button"
                                onClick={() =>
                                    setCurrentTrack({
                                        videoId: "jNgP6d9HraI",
                                        title: "Test B",
                                        thumbnail: "",
                                        timestamp: "",
                                        author: "",
                                    })
                                }
                            >
                                Test B
                            </button>
                        </td>
                    </tr>
                    <tr>
                        <th>Custom</th>
                        <td>
                            <input
                                ref={urlInputRef}
                                type="text"
                                placeholder="Enter YouTube URL"
                            />
                            <button type="button" onClick={handleLoadUrl}>
                                Load
                            </button>
                        </td>
                    </tr>
                </tbody>
            </table>

            {/* ── Track info ───────────────────────────────────────────────── */}
            {currentTrack && (
                <div style={{ marginTop: 12, fontSize: 13, opacity: 0.7 }}>
                    <strong>{currentTrack.title}</strong>
                    {currentTrack.author && <> — {currentTrack.author}</>}
                </div>
            )}
        </div>
    );
};

export default YouTubePlayer;
