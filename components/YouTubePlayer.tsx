"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import ReactPlayer from "react-player";
import { useAppStore } from "@/store/appStore";
import { usePlaybackStore } from "@/store/playbackStore";
import { useSettingsStore } from "@/store/settingsStore";

const YouTubePlayer: React.FC = () => {
  const playerRef = useRef<HTMLVideoElement | null>(null);
  const urlInputRef = useRef<HTMLInputElement | null>(null);

  const {
    playing,
    setPlaying,
    togglePlaying,
    currentTrack,
    setCurrentTrack,
    playNext,
  } = useAppStore();

  const {
    setCurrentTime,
    seeking,
    setSeeking,
    localSeek,
    setLoaded: setBufferLoaded,
    duration,
    setDuration,
    loop,
    setLoop,
  } = usePlaybackStore();

  const prevSeekingRef = useRef(seeking);
  useEffect(() => {
    if (prevSeekingRef.current && !seeking && playerRef.current) {
      playerRef.current.currentTime =
        playerRef.current.duration * (localSeek / 100);
    }
    prevSeekingRef.current = seeking;
  }, [seeking, localSeek]);

  useEffect(() => {
    if (currentTrack) {
      setPlayed(0);
      setLoaded(0);
      setCurrentTime(0);
    }
  }, [currentTrack, setCurrentTime]);

  const volume = useSettingsStore((s) => s.settings.youtube.volume);
  const updateSetting = useSettingsStore((s) => s.updateSetting);

  const [muted, setMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1.0);
  const [played, setPlayed] = useState(0);
  const [loaded, setLoaded] = useState(0);

  const setPlayerRef = useCallback((player: HTMLVideoElement) => {
    if (!player) return;
    playerRef.current = player;
  }, []);

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

  const handleProgress = () => {
    const player = playerRef.current;
    if (!player || seeking || !player.buffered?.length) return;
    const bufferedEnd = player.buffered.end(player.buffered.length - 1);
    const loadedRatio = bufferedEnd / player.duration;
    setLoaded(loadedRatio);
    setBufferLoaded(loadedRatio * 100);
  };

  const handleTimeUpdate = () => {
    const player = playerRef.current;
    if (!player || seeking || !player.duration) return;
    const ratio = player.currentTime / player.duration;
    setPlayed(ratio);
    setCurrentTime(player.currentTime);
  };

  const handleDurationChange = () => {
    const player = playerRef.current;
    if (!player) return;
    setDuration(player.duration);
  };

  const handleEnded = () => {
    if (loop) {
      setPlaying(true);
    } else {
      playNext();
    }
  };

  const handleLoadUrl = () => {
    const url = urlInputRef.current?.value;
    if (!url) return;
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
    <div className="absolute -translate-y-full p-4 max-w-[800px] mx-auto">
      <h2>YouTube Player</h2>

      <div className="w-full aspect-video bg-black">
        <ReactPlayer
          ref={setPlayerRef}
          src={src}
          playing={playing}
          volume={volume}
          muted={muted}
          loop={loop}
          playbackRate={playbackRate}
          controls={false}
          className="w-full h-auto aspect-video"
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

      <table className="mt-3 w-full text-xs">
        <tbody>
          <tr>
            <th className="pr-2">Controls</th>
            <td>
              <button type="button" onClick={handleStop}>Stop</button>
              <button type="button" onClick={togglePlaying} className="ml-1">{playing ? "Pause" : "Play"}</button>
              <button type="button" onClick={() => setMuted((m) => !m)} className="ml-1">{muted ? "Unmute" : "Mute"}</button>
            </td>
          </tr>
          <tr>
            <th className="pr-2">Speed</th>
            <td>
              <button type="button" onClick={handleSetPlaybackRate} data-value={1}>1x</button>
              <button type="button" onClick={handleSetPlaybackRate} data-value={1.5} className="ml-1">1.5x</button>
              <button type="button" onClick={handleSetPlaybackRate} data-value={2} className="ml-1">2x</button>
            </td>
          </tr>
          <tr>
            <th className="pr-2">Seek</th>
            <td>
              <input id="seek" type="range" min={0} max={0.999999} step="any" value={played}
                onMouseDown={handleSeekMouseDown} onChange={handleSeekChange} onMouseUp={handleSeekMouseUp} />
            </td>
          </tr>
          <tr>
            <th className="pr-2">Volume</th>
            <td>
              <input id="volume" type="range" min={0} max={1} step="any" value={volume} onChange={handleVolumeChange} />
            </td>
          </tr>
          <tr>
            <th className="pr-2">Loop</th>
            <td>
              <input type="checkbox" checked={loop} onChange={() => setLoop(!loop)} />
            </td>
          </tr>
          <tr>
            <th className="pr-2">Played</th>
            <td><progress max={1} value={played} /></td>
          </tr>
          <tr>
            <th className="pr-2">Loaded</th>
            <td><progress max={1} value={loaded} /></td>
          </tr>
          <tr>
            <th className="pr-2">Time</th>
            <td>{Math.round(played * duration)}s / {Math.round(duration)}s</td>
          </tr>
        </tbody>
      </table>

      <table className="mt-4 w-full text-xs">
        <tbody>
          <tr>
            <th className="pr-2">YouTube</th>
            <td>
              <button type="button" onClick={() => setCurrentTrack({ videoId: "oUFJJNQGwhk", title: "Test A", thumbnail: "", timestamp: "", author: "" })}>Test A</button>
              <button type="button" onClick={() => setCurrentTrack({ videoId: "jNgP6d9HraI", title: "Test B", thumbnail: "", timestamp: "", author: "" })} className="ml-1">Test B</button>
            </td>
          </tr>
          <tr>
            <th className="pr-2">Custom</th>
            <td>
              <input ref={urlInputRef} type="text" placeholder="Enter YouTube URL" />
              <button type="button" onClick={handleLoadUrl} className="ml-1">Load</button>
            </td>
          </tr>
        </tbody>
      </table>

      {currentTrack && (
        <div className="mt-3 text-xs opacity-70">
          <strong>{currentTrack.title}</strong>
          {currentTrack.author && <> — {currentTrack.author}</>}
        </div>
      )}
    </div>
  );
};

export default YouTubePlayer;
