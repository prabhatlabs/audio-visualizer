"use client";

import LyricsInlinePanel from "@/components/LyricsInlinePanel";
import { useAppStore } from "@/store/appStore";
import { usePlaybackStore } from "@/store/playbackStore";
import React, { useEffect, useRef } from "react";
import Duration from "../Duration";

interface LyricsPopProps {
  audioBands?: React.MutableRefObject<Float32Array>;
}

const LyricsPop: React.FC<LyricsPopProps> = ({ audioBands }) => {
  const { currentTrack } = useAppStore();
  const { currentTime } = usePlaybackStore();
  const rawTitle = currentTrack?.title || "";
  const sep = rawTitle.indexOf(" - ");
  const displayArtist =
    sep !== -1 ? rawTitle.slice(0, sep) : currentTrack?.author || "";
  const displayTitle = sep !== -1 ? rawTitle.slice(sep + 3) : rawTitle;
  const boxRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const noiseCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const lastKickTimeRef = useRef(0);
  const currentScaleRef = useRef(1);
  const boxTimeRef = useRef(0);
  const boxXRef = useRef(0);
  const boxYRef = useRef(0);
  const boxRotateRef = useRef(0);
  const rgbOffsetRef = useRef(0);
  const distortRef = useRef(0);
  const glitchXRef = useRef(0);
  const glitchYRef = useRef(0);
  const barYPosRef = useRef(0);
  const barStretchRef = useRef(0);

  const kickThreshold = 0.6;
  const kickCooldown = 200;
  const bassThreshold = 0.5;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const render = () => {
      let bassLevel = 0;
      let kickLevel = 0;

      if (audioBands?.current && audioBands.current.length >= 40) {
        for (let i = 0; i < 14; i++) {
          bassLevel += audioBands.current[i];
        }
        bassLevel /= 14;
        for (let i = 2; i < 9; i++) {
          kickLevel += audioBands.current[i];
        }
        kickLevel /= 7;
      }

      const isKick = kickLevel > kickThreshold;
      const now = Date.now();
      const withinCooldown = now - lastKickTimeRef.current <= kickCooldown;
      const kickStrength =
        isKick && !withinCooldown ? Math.min(kickLevel, 1) : 0;

      if (kickStrength > 0) {
        lastKickTimeRef.current = now;
        glitchXRef.current = (Math.random() - 0.5) * 20;
        glitchYRef.current = (Math.random() - 0.5) * 8;
        barStretchRef.current = Math.max(
          barStretchRef.current,
          1 + kickStrength * 3,
        );
      }

      const baseScale = 1;
      const bassScaleBoost =
        bassLevel > bassThreshold ? (bassLevel - bassThreshold) * 0.6 : 0;
      const kickScaleBoost = kickStrength * 0.2;
      const targetScale = baseScale + bassScaleBoost + kickScaleBoost;
      currentScaleRef.current += (targetScale - currentScaleRef.current) * 0.2;

      boxTimeRef.current += 0.014;
      const idleX = Math.sin(boxTimeRef.current) * 9.6;
      const idleY = Math.sin(boxTimeRef.current * 0.7 + 1) * 6.4;
      const idleRotate = Math.sin(boxTimeRef.current * 0.5 + 2) * 2.4;
      boxXRef.current += (idleX - boxXRef.current) * 0.08;
      boxYRef.current += (idleY - boxYRef.current) * 0.08;
      boxRotateRef.current += (idleRotate - boxRotateRef.current) * 0.08;

      glitchXRef.current *= 0.88;
      glitchYRef.current *= 0.88;
      barStretchRef.current *= 0.88;

      const targetRgbOffset = Math.min(bassLevel * 5, 3);
      rgbOffsetRef.current += (targetRgbOffset - rgbOffsetRef.current) * 0.15;
      const targetDistort = kickStrength * 6;
      distortRef.current += (targetDistort - distortRef.current) * 0.3;

      if (boxRef.current) {
        const skew = distortRef.current;
        const blur = distortRef.current * 0.5;
        const rgb = rgbOffsetRef.current;
        boxRef.current.style.transform = `translate(-50%, -50%) translate(${boxXRef.current + glitchXRef.current}px, ${boxYRef.current + glitchYRef.current}px) rotate(${boxRotateRef.current}deg) scale(${currentScaleRef.current}) skewX(${skew}deg)`;
        boxRef.current.style.filter = `blur(${blur}px)`;
        boxRef.current.style.textShadow =
          rgb > 0.1
            ? `-${rgb}px 0 0 rgba(255,0,0,0.6), ${rgb}px 0 0 rgba(0,255,255,0.6)`
            : "none";
      }

      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;

      const w = canvas.width;
      const h = canvas.height;
      const step = 4;
      const cols = Math.ceil(w / step);
      const rows = Math.ceil(h / step);

      if (
        !noiseCanvasRef.current ||
        noiseCanvasRef.current.width !== cols ||
        noiseCanvasRef.current.height !== rows
      ) {
        noiseCanvasRef.current = document.createElement("canvas");
        noiseCanvasRef.current.width = cols;
        noiseCanvasRef.current.height = rows;
      }

      const noiseCtx = noiseCanvasRef.current.getContext("2d")!;
      const imageData = noiseCtx.createImageData(cols, rows);
      const buf = imageData.data;
      for (let i = 0; i < buf.length; i += 4) {
        const v = Math.random() * 255;
        buf[i] = v;
        buf[i + 1] = v;
        buf[i + 2] = v;
        buf[i + 3] = 255;
      }
      noiseCtx.putImageData(imageData, 0, 0);

      ctx.imageSmoothingEnabled = false;
      ctx.globalAlpha = 0.15 + bassLevel * 0.35;
      ctx.drawImage(noiseCanvasRef.current, 0, 0, w, h);
      ctx.globalAlpha = 1;

      const barH = 80;
      barYPosRef.current -= 1 + bassLevel * 0.3;
      if (barYPosRef.current + barH < 0) {
        barYPosRef.current = h;
      }
      const barY = barYPosRef.current;
      if (barY < h && barY + barH > 0) {
        const stretch = barStretchRef.current;
        const segW = 6;
        const segs = Math.ceil(w / segW);
        const squiggleRange = 3 + stretch * 8;
        const hStretch = barH * (1 + stretch * 0.3);
        for (let i = 0; i < segs; i++) {
          const squiggle = (Math.random() - 0.5) * squiggleRange;
          const tear = Math.random() > 0.92 ? (Math.random() - 0.5) * 24 : 0;
          ctx.fillStyle = "rgba(255,255,255,0.1)";
          ctx.fillRect(i * segW + tear, barY + squiggle, segW + 1, hStretch);
          if (stretch > 1) {
            ctx.fillStyle = "rgba(255,0,0,0.04)";
            ctx.fillRect(i * segW + tear - 1, barY + squiggle, 1, hStretch);
            ctx.fillStyle = "rgba(0,255,255,0.04)";
            ctx.fillRect(i * segW + tear + segW, barY + squiggle, 1, hStretch);
          }
        }
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
  }, [audioBands]);

  return (
    <div className="relative w-full h-dvh bg-black flex items-center justify-center overflow-hidden">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
      />
      <div ref={boxRef} className="absolute top-1/2 left-1/2 w-180 p-8">
        {displayTitle && (
          <div className="mb-4 flex justify-between items-center gap-4 mx-36">
            <Duration seconds={currentTime} className="text-5xl font-bold" />
            <div className="text-right">
              <div className="text-xl font-bold truncate max-w-70 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                {displayTitle}
              </div>
              <div className="text-sm font-bold truncate max-w-70 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                {displayArtist}
              </div>
            </div>
          </div>
        )}
        <LyricsInlinePanel
          oneLineMode
          hideScrollbar
          activeFontSize="62px"
          className="h-full"
        />
      </div>
    </div>
  );
};

export default LyricsPop;
