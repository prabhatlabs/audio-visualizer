"use client";

import Duration from "@/components/Duration";
import { useAppStore } from "@/store/appStore";
import { colorObj, useColorStore } from "@/store/colorStore";
import { usePlaybackStore } from "@/store/playbackStore";
import { useSettingsStore } from "@/store/settingsStore";
import React, { useEffect, useRef } from "react";
import LyricsInlinePanel from "../LyricsInlinePanel";

interface RippleProps {
  audioBands?: React.MutableRefObject<Float32Array>;
}

const Ripple: React.FC<RippleProps> = ({ audioBands }) => {
  const {
    enableRipple,
    enableStrobe,
    enableShake,
    shakeIntensity,
    rippleSpeed,
    kickThreshold,
  } = useSettingsStore((state) => state.settings.ripple);
  const { showLyrics } = useSettingsStore((state) => state.settings.youtube);
  const { ytMode, currentTrack } = useAppStore();
  const { currentTime } = usePlaybackStore();
  const kickCooldown = 0;
  const theme = useColorStore((state) => state.theme);
  const colors = colorObj[theme];

  const shakeIntensityRef = useRef(shakeIntensity);
  const rippleSpeedRef = useRef(rippleSpeed);

  useEffect(() => {
    shakeIntensityRef.current = shakeIntensity;
    rippleSpeedRef.current = rippleSpeed;
  }, [shakeIntensity, rippleSpeed]);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const ripplesRef = useRef<
    { radius: number; color: string; alpha: number; maxRadius: number }[]
  >([]);
  const lastKickTimeRef = useRef(0);
  const strobeRef = useRef({ alpha: 0, color: "" });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;

    const resizeCanvas = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    const maxDiagonal = Math.sqrt(width * width + height * height);

    const triggerKick = () => {
      const colorIndex = Math.floor(Math.random() * colors.length);
      const color = colors[colorIndex].main;

      if (enableRipple) {
        ripplesRef.current.push({
          radius: 0,
          color,
          alpha: 1,
          maxRadius: maxDiagonal,
        });
      }

      if (enableStrobe) {
        strobeRef.current = { alpha: 1, color };
      }
    };

    const animate = () => {
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

      const now = Date.now();
      const isKick = kickLevel > kickThreshold;
      const withinCooldown =
        kickCooldown > 0 && now - lastKickTimeRef.current <= kickCooldown;

      if (isKick && !withinCooldown) {
        triggerKick();
        lastKickTimeRef.current = now;
      }

      ctx.fillStyle = "black";
      ctx.fillRect(0, 0, width, height);

      let shakeX = 0;
      let shakeY = 0;
      if (enableShake) {
        shakeX = (Math.random() - 0.5) * kickLevel * shakeIntensityRef.current;
        shakeY = (Math.random() - 0.5) * kickLevel * shakeIntensityRef.current;
      }

      const centerX = width / 2 + shakeX;
      const centerY = height / 2 + shakeY;

      ripplesRef.current = ripplesRef.current.filter((ripple) => {
        ripple.radius +=
          (15 + bassLevel * 80) * rippleSpeedRef.current;
        ripple.alpha = Math.max(
          0,
          1 - ripple.radius / ripple.maxRadius,
        );

        if (ripple.alpha <= 0.01) return false;

        ctx.beginPath();
        ctx.arc(centerX, centerY, ripple.radius, 0, Math.PI * 2);
        ctx.strokeStyle = ripple.color;
        ctx.lineWidth = 80 * ripple.alpha;
        ctx.globalAlpha = ripple.alpha;
        ctx.stroke();
        ctx.globalAlpha = 1;

        ctx.beginPath();
        ctx.arc(centerX, centerY, ripple.radius * 0.7, 0, Math.PI * 2);
        ctx.strokeStyle = ripple.color;
        ctx.lineWidth = 40 * ripple.alpha;
        ctx.globalAlpha = ripple.alpha * 0.5;
        ctx.stroke();
        ctx.globalAlpha = 1;

        return true;
      });

      if (enableStrobe && strobeRef.current.alpha > 0) {
        strobeRef.current.alpha = Math.max(0, 1 - (Date.now() - lastKickTimeRef.current) / 600);

        ctx.fillStyle = strobeRef.current.color;
        ctx.globalAlpha = strobeRef.current.alpha * 0.3;
        ctx.fillRect(0, 0, width, height);
        ctx.globalAlpha = 1;
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [audioBands, enableRipple, enableStrobe, enableShake, theme]);

  const isLyricsVisible = ytMode && showLyrics;

  const rawTitle = currentTrack?.title || "";
  const sep = rawTitle.indexOf(" - ");
  const displayArtist =
    sep !== -1 ? rawTitle.slice(0, sep) : currentTrack?.author || "";
  const displayTitle = sep !== -1 ? rawTitle.slice(sep + 3) : rawTitle;

  return (
    <div className="relative">
      {isLyricsVisible && (
        <div className="absolute top-0 left-0 px-12 mt-10">
          <div className="max-w-sm">
            <div className="text-2xl font-bold text-white truncate drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
              {displayTitle}
            </div>
            <div className="flex gap-4 items-center justify-between">
              <div className="text-lg font-bold text-white truncate drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                {displayArtist}
              </div>
              <Duration
                seconds={currentTime}
                className="text-lg font-bold text-white/50 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]"
              />
            </div>
          </div>
          <LyricsInlinePanel
            className="h-[30dvh] py-[7dvh] text-start"
            hideScrollbar
            activeFontSize="32px"
            fontSize="24px"
          />
        </div>
      )}
      <canvas ref={canvasRef} className="w-full h-dvh object-cover block" />
    </div>
  );
};

export default Ripple;
