"use client";

import Duration from "@/components/Duration";
import React, { useEffect, useRef } from "react";
import { useSettingsStore } from "@/store/settingsStore";
import { useAppStore } from "@/store/appStore";
import { usePlaybackStore } from "@/store/playbackStore";

interface ImageBoomProps {
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

export const PRESET_IMAGES = [
  '/imageboom/image-1.webp',
  '/imageboom/image-2.webp',
  '/imageboom/image-3.webp',
  '/imageboom/image-4.webp',
  '/imageboom/image-5.webp',
  '/imageboom/image-6.webp',
];

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

const CenterBox = React.forwardRef<HTMLDivElement, { canvasRef: React.RefObject<HTMLCanvasElement | null>; title: string; artist: string; seconds: number; centerText: string }>(
  ({ canvasRef, title, artist, seconds, centerText }, ref) => {
    const textRef = React.useRef<HTMLSpanElement>(null);
    React.useLayoutEffect(() => {
      const el = textRef.current;
      if (!el || !centerText) return;
      const parent = el.parentElement;
      if (!parent) return;
      const maxW = parent.clientWidth;
      if (maxW === 0) return;
      const measure = document.createElement("span");
      measure.textContent = centerText.toUpperCase();
      const ff = getComputedStyle(el).fontFamily;
      measure.style.cssText = `font-weight:700;font-family:${ff};white-space:nowrap;visibility:hidden;position:absolute;font-size:100px`;
      document.body.appendChild(measure);
      let lo = 4, hi = 200, best = 4;
      while (lo <= hi) {
        const mid = Math.floor((lo + hi) / 2);
        measure.style.fontSize = `${mid}px`;
        if (measure.offsetWidth <= maxW) {
          best = mid;
          lo = mid + 1;
        } else {
          hi = mid - 1;
        }
      }
      el.style.fontSize = `${best}px`;
      document.body.removeChild(measure);
    }, [centerText]);
    return (
    <div
      ref={ref}
      className="absolute top-1/2 left-1/2 w-125 h-40 rounded-xl bg-transparent pointer-events-none z-10"
      style={{ outline: "16px solid rgb(255,255,255)" }}
    >
      <div className="absolute bottom-full left-0 w-full pb-4">
        <div className="flex justify-between items-end">
          <Duration seconds={seconds} className="text-xl font-bold" />
          <div className="text-right">
            <div className="text-4xl font-bold line-clamp-2">{title}</div>
            <div className="text-2xl font-bold truncate">{artist}</div>
          </div>
        </div>
      </div>
      <div className="absolute inset-0 flex items-center justify-center">
        <span ref={textRef} className="font-bold leading-none text-center text-nowrap inline-block">
          {centerText.toUpperCase()}
        </span>
      </div>
      <canvas
        ref={canvasRef}
        className="absolute top-full left-0 w-full h-20"
      />
    </div>
  );
  },
);
CenterBox.displayName = "CenterBox";

const ImageBoom: React.FC<ImageBoomProps> = ({ audioBands }) => {
  const { imageSrc, selectedImage, centerText } = useSettingsStore(
    (state) => state.settings.imageBoom,
  );
  const { currentTrack } = useAppStore();
  const rawTitle = currentTrack?.title || "";
  const sep = rawTitle.indexOf(" - ");
  const displayArtist = sep !== -1 ? rawTitle.slice(0, sep) : currentTrack?.author || "";
  const displayTitle = sep !== -1 ? rawTitle.slice(sep + 3) : rawTitle;
  const { currentTime } = usePlaybackStore();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const lastKickTimeRef = useRef(0);
  const kickThreshold = 0.6;
  const kickCooldown = 200;
  const bassThreshold = 0.5;

  const imageRef = useRef<HTMLImageElement | null>(null);
  const currentScaleRef = useRef(1);
  const currentSaturationRef = useRef(0.5);
  const currentVignetteRef = useRef(0.9);
  const particlesRef = useRef<Particle[]>([]);
  const boxRef = useRef<HTMLDivElement>(null);
  const boxCanvasRef = useRef<HTMLCanvasElement>(null);
  const vignetteOverlayRef = useRef<HTMLDivElement>(null);
  const boxXRef = useRef(0);
  const boxYRef = useRef(0);
  const boxRotateRef = useRef(0);
  const boxTimeRef = useRef(0);

  useEffect(() => {
    const particles: Particle[] = [];
    for (let i = 0; i < BASE_PARTICLE_COUNT; i++) {
      particles.push(createParticle(window.innerWidth, window.innerHeight));
    }
    particlesRef.current = particles;
  }, []);

  useEffect(() => {
    const src = imageSrc && imageSrc !== "/image.png"
      ? imageSrc
      : PRESET_IMAGES[selectedImage] || PRESET_IMAGES[0];

    const img = new Image();
    img.src = src;
    img.onload = () => {
      imageRef.current = img;
    };
  }, [imageSrc, selectedImage]);

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
        ? (bassLevel - bassThreshold) * 0.15
        : 0;
      const kickScaleBoost = kickStrength * 0.04;

      const targetScale = baseScale + bassScaleBoost + kickScaleBoost;
      currentScaleRef.current +=
        (targetScale - currentScaleRef.current) * 0.15;

      const targetSaturation =
        0.2 + Math.max(0, bassLevel - bassThreshold) * 1.6;
      const clampedSaturation = Math.min(targetSaturation, 1);
      currentSaturationRef.current +=
        (clampedSaturation - currentSaturationRef.current) * 0.1;

      const targetVignette = Math.max(0, 0.9 - Math.max(0, bassLevel - bassThreshold) * 1.8);
      currentVignetteRef.current +=
        (targetVignette - currentVignetteRef.current) * 0.1;

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
        ctx.filter = `saturate(${currentSaturationRef.current})`;
        ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);
      }

      const maxR = Math.sqrt(centerX * centerX + centerY * centerY);
      const vignette = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, maxR);
      vignette.addColorStop(0, `rgba(0,0,0,0)`);
      vignette.addColorStop(0.35, `rgba(0,0,0,${currentVignetteRef.current * 0.4})`);
      vignette.addColorStop(0.6, `rgba(0,0,0,${currentVignetteRef.current * 0.8})`);
      vignette.addColorStop(1, `rgba(0,0,0,${currentVignetteRef.current})`);
      ctx.globalCompositeOperation = "source-over";
      ctx.filter = "none";
      ctx.fillStyle = vignette;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      if (vignetteOverlayRef.current) {
        vignetteOverlayRef.current.style.opacity = String(currentVignetteRef.current);
      }

      const targetCount = isBassActive ? BOOSTED_PARTICLE_COUNT : BASE_PARTICLE_COUNT;
      const particles = particlesRef.current;
      while (particles.length < targetCount) {
        particles.push(createParticle(window.innerWidth, window.innerHeight));
      }
      while (particles.length > targetCount) {
        particles.pop();
      }

      const bassBoost = bassLevel * 3;
      for (const p of particlesRef.current) {
        p.drift += 0.015;
        p.x += Math.sin(p.drift) * 1.2 + p.speedX;
        p.y += p.speedY + bassBoost;
        if (p.y > canvas.height + p.size) {
          p.y = -p.size;
          p.x = Math.random() * canvas.width;
        }
        if (p.x > canvas.width + p.size) p.x = -p.size;
        if (p.x < -p.size) p.x = canvas.width + p.size;
      }

      ctx.globalCompositeOperation = "source-over";
      ctx.filter = "none";
      for (const p of particlesRef.current) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${p.opacity})`;
        ctx.fill();
      }

      boxTimeRef.current += 0.014;
      const idleX = Math.sin(boxTimeRef.current) * 9.6;
      const idleY = Math.sin(boxTimeRef.current * 0.7 + 1) * 6.4;
      const idleRotate = Math.sin(boxTimeRef.current * 0.5 + 2) * 2.4;
      boxXRef.current += (idleX - boxXRef.current) * 0.08;
      boxYRef.current += (idleY - boxYRef.current) * 0.08;
      boxRotateRef.current += (idleRotate - boxRotateRef.current) * 0.08;
      if (boxRef.current) {
        boxRef.current.style.transform = `translate(calc(-50% + ${boxXRef.current}px), calc(-50% + ${boxYRef.current}px)) rotate(${boxRotateRef.current}deg)`;
      }

      const boxCanvas = boxCanvasRef.current;
      if (boxCanvas) {
        const boxCtx = boxCanvas.getContext("2d");
        if (boxCtx) {
          const rect = boxCanvas.getBoundingClientRect();
          boxCanvas.width = rect.width * window.devicePixelRatio;
          boxCanvas.height = rect.height * window.devicePixelRatio;
          boxCtx.scale(window.devicePixelRatio, window.devicePixelRatio);

          const w = rect.width;
          const h = rect.height;

          boxCtx.clearRect(0, 0, w, h);

          if (audioBands?.current) {
            const data = audioBands.current;
            const startBand = 7;
            const count = data.length - startBand;

            const xs: number[] = [];
            const ys: number[] = [];
            for (let i = 0; i < count; i++) {
              xs.push(10 + ((i + 1) / (count + 1)) * (w - 20));
              ys.push((data[startBand + i] || 0) * h);
            }

            boxCtx.beginPath();
            boxCtx.moveTo(10, 0);

            const midFirst = (10 + xs[0]) / 2;
            boxCtx.bezierCurveTo(midFirst, 0, midFirst, ys[0], xs[0], ys[0]);

            for (let i = 1; i < count; i++) {
              const cpX = (xs[i - 1] + xs[i]) / 2;
              boxCtx.bezierCurveTo(cpX, ys[i - 1], cpX, ys[i], xs[i], ys[i]);
            }

            const midLast = (xs[count - 1] + w - 10) / 2;
            boxCtx.bezierCurveTo(midLast, ys[count - 1], midLast, 0, w - 10, 0);

            boxCtx.lineTo(10, 0);
            boxCtx.closePath();
            boxCtx.fillStyle = "rgb(255,255,255)";
            boxCtx.fill();

            boxCtx.beginPath();
            boxCtx.moveTo(10, 0);
            boxCtx.bezierCurveTo(midFirst, 0, midFirst, ys[0], xs[0], ys[0]);
            for (let i = 1; i < count; i++) {
              const cpX = (xs[i - 1] + xs[i]) / 2;
              boxCtx.bezierCurveTo(cpX, ys[i - 1], cpX, ys[i], xs[i], ys[i]);
            }
            boxCtx.bezierCurveTo(midLast, ys[count - 1], midLast, 0, w - 10, 0);
            boxCtx.strokeStyle = "rgb(255,255,255)";
            boxCtx.lineWidth = 2;
            boxCtx.stroke();
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
  }, [audioBands, imageSrc, selectedImage]);

  return (
    <div className="relative overflow-hidden">
      <CenterBox ref={boxRef} canvasRef={boxCanvasRef} title={displayTitle} artist={displayArtist} seconds={currentTime} centerText={centerText} />
      <div
        ref={vignetteOverlayRef}
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at center, transparent 35%, rgba(0,0,0,0.9) 100%)",
          opacity: 0.9,
        }}
      />
      <canvas
        ref={canvasRef}
        className="w-full h-dvh block bg-black object-cover"
      />
    </div>
  );
};

export default ImageBoom;
