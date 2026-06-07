"use client";

import React, { useEffect, useRef } from "react";
import LyricsInlinePanel from "@/components/LyricsInlinePanel";

interface LyricsPopProps {
  audioBands?: React.MutableRefObject<Float32Array>;
}

const LyricsPop: React.FC<LyricsPopProps> = ({ audioBands }) => {
  const boxRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>(0);
  const lastKickTimeRef = useRef(0);
  const currentScaleRef = useRef(1);
  const boxTimeRef = useRef(0);
  const boxXRef = useRef(0);
  const boxYRef = useRef(0);
  const boxRotateRef = useRef(0);

  const kickThreshold = 0.6;
  const kickCooldown = 200;
  const bassThreshold = 0.5;

  useEffect(() => {
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
        ? (bassLevel - bassThreshold) * 0.6
        : 0;
      const kickScaleBoost = kickStrength * 0.2;
      const targetScale = baseScale + bassScaleBoost + kickScaleBoost;
      currentScaleRef.current +=
        (targetScale - currentScaleRef.current) * 0.2;

      boxTimeRef.current += 0.014;
      const idleX = Math.sin(boxTimeRef.current) * 9.6;
      const idleY = Math.sin(boxTimeRef.current * 0.7 + 1) * 6.4;
      const idleRotate = Math.sin(boxTimeRef.current * 0.5 + 2) * 2.4;
      boxXRef.current += (idleX - boxXRef.current) * 0.08;
      boxYRef.current += (idleY - boxYRef.current) * 0.08;
      boxRotateRef.current += (idleRotate - boxRotateRef.current) * 0.08;

      if (boxRef.current) {
        boxRef.current.style.transform = `translate(-50%, -50%) translate(${boxXRef.current}px, ${boxYRef.current}px) rotate(${boxRotateRef.current}deg) scale(${currentScaleRef.current})`;
      }

      animationRef.current = requestAnimationFrame(render);
    };

    animationRef.current = requestAnimationFrame(render);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [audioBands]);

  return (
    <div className="relative w-full h-dvh bg-black flex items-center justify-center overflow-hidden">
      <div
        ref={boxRef}
        className="absolute top-1/2 left-1/2 w-180 bg-black/80 backdrop-blur-sm rounded-xl p-8"
      >
        <LyricsInlinePanel oneLineMode hideScrollbar activeFontSize="62px" className="h-full" />
      </div>
    </div>
  );
};

export default LyricsPop;
