"use client";

import React, { useEffect, useRef } from "react";
import LyricsInlinePanel from "@/components/LyricsInlinePanel";

interface LyricsPopProps {
  audioBands?: React.MutableRefObject<Float32Array>;
}

interface Particle {
  x: number;
  y: number;
  size: number;
  speedY: number;
  speedX: number;
  opacity: number;
  drift: number;
}

const BASE_PARTICLE_COUNT = 70;
const BOOSTED_PARTICLE_COUNT = Math.round(BASE_PARTICLE_COUNT * 1.5);

function createParticle(width: number, height: number): Particle {
  return {
    x: Math.random() * width,
    y: Math.random() * height,
    size: Math.random() * 2.5 + 1,
    speedY: Math.random() * 0.5 + 0.3,
    speedX: (Math.random() - 0.5) * 0.2,
    opacity: Math.random() * 0.4 + 0.3,
    drift: Math.random() * Math.PI * 2,
  };
}

const LyricsPop: React.FC<LyricsPopProps> = ({ audioBands }) => {
  const boxRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const particlesRef = useRef<Particle[]>([]);
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
    const particles: Particle[] = [];
    for (let i = 0; i < BASE_PARTICLE_COUNT; i++) {
      particles.push(createParticle(window.innerWidth, window.innerHeight));
    }
    particlesRef.current = particles;
  }, []);

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

      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;

      const targetCount = isBassActive ? BOOSTED_PARTICLE_COUNT : BASE_PARTICLE_COUNT;
      const particles = particlesRef.current;
      while (particles.length < targetCount) {
        particles.push(createParticle(window.innerWidth, window.innerHeight));
      }
      while (particles.length > targetCount) {
        particles.pop();
      }

      const speedMultiplier = 1 + bassLevel * 5;
      for (const p of particlesRef.current) {
        p.drift += 0.015;
        p.x += Math.sin(p.drift) * 1.2 + p.speedX;
        p.y += p.speedY * speedMultiplier;
        if (p.y > canvas.height + p.size) {
          p.y = -p.size;
          p.x = Math.random() * canvas.width;
        }
        if (p.x > canvas.width + p.size) p.x = -p.size;
        if (p.x < -p.size) p.x = canvas.width + p.size;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const p of particlesRef.current) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${p.opacity})`;
        ctx.fill();
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
