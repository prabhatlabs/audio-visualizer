"use client";

import React, { useEffect, useRef } from "react";
import { colorObj, useColorStore } from "@/store/colorStore";
import { useSettingsStore } from "@/store/settingsStore";
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
    strobeIntensity,
    rippleSpeed,
  } = useSettingsStore((state) => state.settings.ripple);
  const { showLyrics } = useSettingsStore((state) => state.settings.youtube);
  const kickThreshold = 0.6;
  const kickCooldown = 80;
  const theme = useColorStore((state) => state.theme);
  const colors = colorObj[theme];

  const shakeIntensityRef = useRef(shakeIntensity);
  const strobeIntensityRef = useRef(strobeIntensity);
  const rippleSpeedRef = useRef(rippleSpeed);

  useEffect(() => {
    shakeIntensityRef.current = shakeIntensity;
    strobeIntensityRef.current = strobeIntensity;
    rippleSpeedRef.current = rippleSpeed;
  }, [shakeIntensity, strobeIntensity, rippleSpeed]);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const ripplesRef = useRef<
    { radius: number; color: string; alpha: number; maxRadius: number }[]
  >([]);
  const lastKickTimeRef = useRef(0);
  const currentColorIndexRef = useRef(0);

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
      currentColorIndexRef.current = colorIndex;

      ripplesRef.current.push({
        radius: 0,
        color: colors[colorIndex].main,
        alpha: 1,
        maxRadius: maxDiagonal * 0.8,
      });
    };

    const animate = () => {
      let subBassLevel = 0;
      let kickLevel = 0;
      if (audioBands?.current && audioBands.current.length >= 40) {
        for (let i = 0; i < 7; i++) {
          subBassLevel += audioBands.current[i];
        }
        subBassLevel /= 7;

        for (let i = 4; i < 9; i++) {
          kickLevel += audioBands.current[i];
        }
        kickLevel /= 5;
      }

      const now = Date.now();
      const isKick = kickLevel > kickThreshold;
      const withinCooldown =
        now - lastKickTimeRef.current <= kickCooldown;

      if (isKick && !withinCooldown) {
        if (enableRipple) {
          triggerKick();
        }
        lastKickTimeRef.current = now;
      }

      ctx.fillStyle = "black";
      ctx.fillRect(0, 0, width, height);

      let shakeX = 0;
      let shakeY = 0;
      if (enableShake) {
        shakeX =
          (Math.random() - 0.5) *
          kickLevel *
          shakeIntensityRef.current;
        shakeY =
          (Math.random() - 0.5) *
          kickLevel *
          shakeIntensityRef.current;
      }

      const centerX = width / 2 + shakeX;
      const centerY = height / 2 + shakeY;

      ripplesRef.current = ripplesRef.current.filter((ripple) => {
        ripple.radius +=
          15 * rippleSpeedRef.current +
          kickLevel * 20 * rippleSpeedRef.current;
        ripple.alpha = Math.max(
          0,
          1 - (ripple.radius / ripple.maxRadius) * 1.2,
        );
        ripple.alpha *= 0.98;

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

      if (enableStrobe && subBassLevel > 0.5) {
        const strobeColor = colors[currentColorIndexRef.current].main;
        ctx.fillStyle = strobeColor;
        ctx.globalAlpha = subBassLevel * strobeIntensityRef.current;
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

  return (
    <div className="relative">
      {showLyrics && (
        <div className="absolute bottom-0 left-0 px-6 mb-10">
          <LyricsInlinePanel
            className="h-[40dvh] py-[15dvh] text-start [mask-image:linear-gradient(to_bottom,transparent_0%,black_60%,black_100%)] px-6"
            hideScrollbar
            activeFontSize="32px"
            fontSize="24px"
          />
        </div>
      )}
      <canvas
        ref={canvasRef}
        className="w-full h-dvh object-cover block"
      />
    </div>
  );
};

export default Ripple;
