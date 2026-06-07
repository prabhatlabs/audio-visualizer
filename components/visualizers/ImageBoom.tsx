"use client";

import React, { useEffect, useRef } from "react";
import { useSettingsStore } from "@/store/settingsStore";
import { useAppStore } from "@/store/appStore";
import LyricsInlinePanel from "../LyricsInlinePanel";

interface ImageBoomProps {
  audioBands?: React.MutableRefObject<Float32Array>;
}

const ImageBoom: React.FC<ImageBoomProps> = ({ audioBands }) => {
  const { imageSrc, centerText } = useSettingsStore(
    (state) => state.settings.imageBoom,
  );
  const { showLyrics } = useSettingsStore((state) => state.settings.youtube);
  const { ytMode, currentTrack } = useAppStore();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const lastKickTimeRef = useRef(0);
  const kickThreshold = 0.6;
  const kickCooldown = 200;
  const bassThreshold = 0.5;

  const imageRef = useRef<HTMLImageElement | null>(null);
  const currentScaleRef = useRef(1);
  const currentSaturationRef = useRef(0.5);

  const maxHeight = 240;
  const currentHeightRef = useRef(maxHeight);
  const maxSplit = 6;
  const currentSplitRef = useRef(0);
  const shakeIntensity = 5;

  const logoRedRef = useRef<HTMLDivElement>(null);
  const logoGreenRef = useRef<HTMLDivElement>(null);
  const logoBlueRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const mainTextRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const img = new Image();
    img.src = `/api/proxy/thumbnail?url=${encodeURIComponent(currentTrack?.thumbnail || "")}`;
    img.onload = () => {
      imageRef.current = img;
    };
  }, [currentTrack]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const render = () => {
      let bassLevel = 0;
      let kickLevel = 0;

      if (audioBands?.current && audioBands.current.length >= 40) {
        for (let i = 0; i < 7; i++) {
          bassLevel += audioBands.current[i];
        }
        bassLevel /= 7;

        for (let i = 2; i < 9; i++) {
          kickLevel += audioBands.current[i];
        }
        kickLevel /= 7;
      }

      const isBassActive = bassLevel > bassThreshold;
      const isKick = kickLevel > kickThreshold;

      const now = Date.now();
      const withinCooldown =
        now - lastKickTimeRef.current <= kickCooldown;

      const kickStrength =
        isKick && !withinCooldown ? Math.min(kickLevel, 1) : 0;

      if (kickStrength > 0) {
        lastKickTimeRef.current = now;
      }

      const baseScale = 1;
      const bassScaleBoost = isBassActive
        ? (bassLevel - bassThreshold) * 0.3
        : 0;
      const kickScaleBoost = kickStrength * 0.08;

      const targetScale = baseScale + bassScaleBoost + kickScaleBoost;
      currentScaleRef.current +=
        (targetScale - currentScaleRef.current) * 0.15;

      const targetSaturation =
        0.2 + Math.max(0, bassLevel - bassThreshold) * 1.6;
      const clampedSaturation = Math.min(targetSaturation, 1);
      currentSaturationRef.current +=
        (clampedSaturation - currentSaturationRef.current) * 0.1;

      currentHeightRef.current = maxHeight - bassLevel * 80;
      currentSplitRef.current = bassLevel * maxSplit;

      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;

      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const img = imageRef.current;

      if (img && img.complete) {
        const imgAspect = img.width / img.height;
        const canvasAspect = canvas.width / canvas.height;

        let drawWidth, drawHeight;
        if (imgAspect > canvasAspect) {
          drawHeight = canvas.height * currentScaleRef.current;
          drawWidth = drawHeight * imgAspect;
        } else {
          drawWidth = canvas.width * currentScaleRef.current;
          drawHeight = drawWidth / imgAspect;
        }

        const drawX = centerX - drawWidth / 2;
        const drawY = centerY - drawHeight / 2;

        ctx.globalCompositeOperation = "source-over";
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        ctx.globalCompositeOperation = "screen";
        ctx.filter = `saturate(${currentSaturationRef.current}) blur(20px)`;
        ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);
      }

      if (containerRef.current) {
        const isLyrics = ytMode && showLyrics;
        const baseHeight = isLyrics ? 400 : maxHeight;
        containerRef.current.style.height = `${baseHeight - bassLevel * 80}px`;
      }
      if (mainTextRef.current) {
        const shakeX = Math.random() * bassLevel * shakeIntensity;
        const shakeY = Math.random() * bassLevel * shakeIntensity;
        mainTextRef.current.style.transform = `translate(${shakeX}px, ${shakeY}px)`;
        mainTextRef.current.style.setProperty(
          "--lyric-split",
          currentSplitRef.current.toFixed(2),
        );
      }

      if (
        logoRedRef.current &&
        logoGreenRef.current &&
        logoBlueRef.current
      ) {
        const split = currentSplitRef.current;
        const opacity = split / maxSplit;

        logoRedRef.current.style.transform = `translate(${-split}px, 0)`;
        logoRedRef.current.style.opacity = opacity.toString();

        logoGreenRef.current.style.transform = `translate(0, ${-split}px)`;
        logoGreenRef.current.style.opacity = opacity.toString();

        logoBlueRef.current.style.transform = `translate(${split}px, ${split}px)`;
        logoBlueRef.current.style.opacity = opacity.toString();
      }

      animationRef.current = requestAnimationFrame(render);
    };

    animationRef.current = requestAnimationFrame(render);

    const handleResize = () => {
      if (canvasRef.current) {
        canvasRef.current.width = window.innerWidth;
        canvasRef.current.height = window.innerHeight;
      }
    };

    window.addEventListener("resize", handleResize);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      window.removeEventListener("resize", handleResize);
    };
  }, [audioBands, imageSrc, ytMode, showLyrics]);

  const isLyricsVisible = ytMode && showLyrics;

  return (
    <div className="relative overflow-hidden">
      <style>{`
        .boom-lyrics-effect div {
          text-shadow: 0 0 20px rgba(255, 255, 255, 0.5),
                       calc(-1px * var(--lyric-split, 0)) 0px rgba(239, 68, 68, 0.65),
                       0px calc(-1px * var(--lyric-split, 0)) rgba(34, 197, 94, 0.45),
                       calc(1px * var(--lyric-split, 0)) calc(1px * var(--lyric-split, 0)) rgba(59, 130, 246, 0.65) !important;
          letter-spacing: 0.05em;
        }
      `}</style>
      <div
        ref={containerRef}
        className="absolute z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-60 inset-0 flex items-center justify-center pointer-events-none backdrop-blur-sm transition-all duration-75 bg-black/5"
      >
        <div
          className="relative text-5xl font-bold tracking-wider font-mono w-full flex justify-center"
          ref={mainTextRef}
        >
          {isLyricsVisible ? (
            <div className="w-full max-w-4xl pointer-events-auto boom-lyrics-effect">
              <LyricsInlinePanel
                className="h-full py-[10dvh]"
                hideScrollbar
                fontSize="24px"
                activeFontSize="40px"
                oneLineMode={true}
                onelineClassName={
                  "flex item-center justify-center"
                }
              />
            </div>
          ) : (
            <>
              <div className="text-foreground/90 drop-shadow-[0_0_20px_rgba(255,255,255,0.5)]">
                {centerText}
              </div>
              <div
                ref={logoRedRef}
                className="absolute -z-10 top-0 left-1/2 -translate-x-1/2 text-red-500/65 opacity-0 transition-opacity drop-shadow-[0_0_15px_rgba(239,68,68,0.9)]"
              >
                {centerText}
              </div>
              <div
                ref={logoGreenRef}
                className="absolute -z-10 top-0 left-1/2 -translate-x-1/2 text-green-500/45 opacity-0 transition-opacity drop-shadow-[0_0_15px_rgba(34,197,94,0.9)]"
              >
                {centerText}
              </div>
              <div
                ref={logoBlueRef}
                className="absolute -z-10 top-0 left-1/2 -translate-x-1/2 text-blue-500/65 opacity-0 transition-opacity drop-shadow-[0_0_15px_rgba(59,130,246,0.9)]"
              >
                {centerText}
              </div>
            </>
          )}
        </div>
      </div>
      <canvas
        ref={canvasRef}
        className="w-full h-dvh block bg-black opacity-50 object-cover"
      />
    </div>
  );
};

export default ImageBoom;
