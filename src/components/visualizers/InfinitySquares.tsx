import React, { useEffect, useRef } from "react";
import { useSettingsStore } from "../../store/settingsStore";
import LyricsInlinePanel from "../LyricsInlinePanel";

interface InfinitySquaresProps {
    audioBands?: React.MutableRefObject<Float32Array>;
}

const InfinitySquares: React.FC<InfinitySquaresProps> = ({ audioBands }) => {
    const { squareCount, baseSize, speed } = useSettingsStore(
        (state) => state.settings.infinitySquares,
    );
    const { showLyrics } = useSettingsStore((state) => state.settings.youtube);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animationRef = useRef<number>(0);
    const zOffsetRef = useRef(0);
    const speedRef = useRef(speed);
    const colorOffsetRef = useRef(0);
    const targetColorOffsetRef = useRef(0);
    const centerOffsetRef = useRef({ x: 0, y: 0 });
    const targetCenterOffsetRef = useRef({ x: 0, y: 0 });
    const lastKickTimeRef = useRef(0);
    const prevBassLevelRef = useRef(0);
    const kickCooldown = 80;

    useEffect(() => {
        speedRef.current = speed;
    }, [speed]);

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

        const squareSpacing = baseSize / 2.5;
        const totalTunnelLength = squareCount * squareSpacing;
        let currentSpeed = speedRef.current;

        const animate = () => {
            ctx.fillStyle = "#0a0a0f";
            ctx.fillRect(0, 0, width, height);

            const centerX = width / 2 + centerOffsetRef.current.x;
            const centerY = height / 2 + centerOffsetRef.current.y;
            const fov = 350;

            let bassLevel = 0;
            if (audioBands?.current && audioBands.current.length >= 40) {
                bassLevel =
                    (audioBands.current[0] +
                        audioBands.current[1] +
                        audioBands.current[2]) /
                    3;
            }

            const targetSpeed = speedRef.current * (1 + bassLevel * 5);
            currentSpeed += (targetSpeed - currentSpeed) * 0.1;

            const now = Date.now();
            const delta = bassLevel - prevBassLevelRef.current;
            const isKick =
                bassLevel > 0.6 &&
                delta > 0.05 &&
                prevBassLevelRef.current < 0.6;
            const withinCooldown =
                now - lastKickTimeRef.current <= kickCooldown;

            if (isKick && !withinCooldown) {
                targetCenterOffsetRef.current = {
                    x: (Math.random() - 0.5) * 180,
                    y: (Math.random() - 0.5) * 180,
                };
                lastKickTimeRef.current = now;
            }

            prevBassLevelRef.current = bassLevel;

            centerOffsetRef.current.x +=
                (targetCenterOffsetRef.current.x - centerOffsetRef.current.x) *
                0.05;
            centerOffsetRef.current.y +=
                (targetCenterOffsetRef.current.y - centerOffsetRef.current.y) *
                0.05;

            if (bassLevel > 0.6) {
                targetColorOffsetRef.current += 0.5 + bassLevel * 0.5;
            }

            colorOffsetRef.current +=
                (targetColorOffsetRef.current - colorOffsetRef.current) * 0.08;

            zOffsetRef.current += currentSpeed;

            for (let i = 0; i < squareCount; i++) {
                const spacing = squareSpacing;
                let zPosition =
                    (zOffsetRef.current - i * spacing) % totalTunnelLength;

                if (zPosition > 300) {
                    zPosition -= totalTunnelLength;
                }

                const depth = fov - zPosition;
                if (depth <= 0) continue;

                const scale = fov / depth;
                const size = baseSize * scale;
                const x2d = centerX;
                const y2d = centerY;

                const distFromCamera = Math.abs(zPosition);
                const maxDist = totalTunnelLength / 2;
                const alpha = Math.max(0, 1 - distFromCamera / maxDist);
                const lineWidth = Math.max(0.5, 2.5 * scale);

                if (alpha > 0.03) {
                    const hue = (colorOffsetRef.current + i * 15) % 360;
                    const saturation = 0.5 + bassLevel * 0.5;
                    const lightness = 0.4 + bassLevel * 0.3;

                    ctx.fillStyle = `hsla(${hue}, ${saturation * 100}%, ${lightness * 100}%, ${alpha * 0.2})`;
                    ctx.fillRect(x2d - size / 2, y2d - size / 2, size, size);

                    ctx.strokeStyle = `hsla(${hue}, ${saturation * 100}%, ${lightness * 100}%, ${alpha})`;
                    ctx.lineWidth = lineWidth;
                    ctx.strokeRect(x2d - size / 2, y2d - size / 2, size, size);
                }
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
    }, [squareCount, baseSize, audioBands]);

    return (
        <div className="relative">
            {showLyrics && (
                <div className="absolute bottom-0 left-0 px-6 mb-10">
                    <LyricsInlinePanel
                        className="h-[40dvh] py-[15dvh] text-start mask-y-from-60% px-6"
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

export default InfinitySquares;
