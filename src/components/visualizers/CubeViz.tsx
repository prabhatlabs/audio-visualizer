import gsap from "gsap";
import React, { useEffect, useRef } from "react";
import { colorObj, useColorStore } from "../../store/colorStore";
import { useSettingsStore } from "../../store/settingsStore";

interface CubeVizProps {
    audioBands?: React.MutableRefObject<Float32Array>;
}

const CubeViz: React.FC<CubeVizProps> = ({
    audioBands,
}) => {
    const { rotationSpeed, enableRotate, enableShake, shakeIntensity } = useSettingsStore((state) => state.settings.cubeViz);
    const theme = useColorStore((state) => state.theme);
    const cubeWrapperRef = useRef<HTMLDivElement>(null);
    const cubeRef = useRef<HTMLDivElement>(null);
    const faceRefs = useRef<(HTMLDivElement | null)[]>([]);
    const animationRef = useRef<number>(0);
    const translateZStateRef = useRef({ z: 112 });
    const lastKickTimeRef = useRef(0);
    const lastFaceIndexRef = useRef(-1);
    const kickThreshold = 0.6;
    const kickCooldown = 0;
    const colors = colorObj[theme];

    useEffect(() => {
        const ctx = gsap.context(() => {
            if (enableRotate) {
                gsap.to(cubeRef.current, {
                    rotationY: 360,
                    rotationX: 360,
                    duration: rotationSpeed,
                    repeat: -1,
                    ease: "none",
                });
            } else {
                gsap.to(cubeRef.current, {
                    rotationY: 0,
                    rotationX: 0,
                    duration: 0.5,
                    ease: "power2.out",
                });
            }
        }, cubeRef);

        return () => ctx.revert();
    }, [rotationSpeed, enableRotate]);

    useEffect(() => {
        const updateFaces = (z: number) => {
            faceRefs.current.forEach((face, index) => {
                if (face) {
                    const transforms = [
                        `translateZ(${z}px)`,
                        `rotateY(90deg) translateZ(${z}px)`,
                        `rotateY(-90deg) translateZ(${z}px)`,
                        `rotateX(90deg) translateZ(${z}px)`,
                        `rotateX(-90deg) translateZ(${z}px)`,
                        `translateZ(-${z}px) rotateY(180deg)`,
                    ];
                    face.style.transform = transforms[index];
                }
            });
        };

        const triggerKickEffect = (faceIndex: number) => {
            const colorIndex = Math.floor(Math.random() * colors.length);
            const face = faceRefs.current[faceIndex];

            if (face) {
                gsap.to(face, {
                    backgroundColor: colors[colorIndex].main,
                    boxShadow: `inset 0 0 30px ${colors[colorIndex].glow}80, 0 0 20px ${colors[colorIndex].glow}40`,
                    borderColor: colors[colorIndex].glow,
                    duration: 0.1,
                    ease: "power2.out",
                    onComplete: () => {
                        setTimeout(() => {
                            gsap.to(face, {
                                backgroundColor: "var(--secondary)",
                                boxShadow: "none",
                                borderColor: "var(--border)",
                                duration: 0.3,
                                ease: "power2.out",
                            });
                        }, 800);
                    },
                });
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

            const targetTranslateZ = 112 + bassLevel * 80;
            // Simple lerp for smooth transition without creating tweens every frame
            translateZStateRef.current.z += (targetTranslateZ - translateZStateRef.current.z) * 0.15;
            updateFaces(translateZStateRef.current.z);

            if (enableShake && cubeWrapperRef.current) {
                const shakeX =
                    (Math.random() - 0.5) * bassLevel * shakeIntensity;
                const shakeY =
                    (Math.random() - 0.5) * bassLevel * shakeIntensity;
                cubeWrapperRef.current.style.transform = `translate(${shakeX}px, ${shakeY}px)`;
            } else if (cubeWrapperRef.current) {
                cubeWrapperRef.current.style.transform = "none";
            }

            const now = Date.now();
            const isKick = kickLevel > kickThreshold;
            const withinCooldown =
                kickCooldown > 0 &&
                now - lastKickTimeRef.current <= kickCooldown;

            if (isKick && !withinCooldown) {
                let faceIndex = Math.floor(Math.random() * 6);
                while (faceIndex === lastFaceIndexRef.current) {
                    faceIndex = Math.floor(Math.random() * 6);
                }
                triggerKickEffect(faceIndex);
                lastFaceIndexRef.current = faceIndex;
                lastKickTimeRef.current = now;
            }

            animationRef.current = requestAnimationFrame(animate);
        };

        animationRef.current = requestAnimationFrame(animate);

        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, [audioBands, enableShake, shakeIntensity, theme]);

    return (
        <div className="w-full h-dvh flex items-center justify-center overflow-hidden">
            <div className="w-72 h-72 flex items-center justify-center">
                <div
                    ref={cubeWrapperRef}
                    className="shrink-0 w-56 h-56 p-0"
                    style={{ perspective: "1000px" }}
                >
                    <div
                        ref={cubeRef}
                        className="relative w-full h-full"
                        style={{ transformStyle: "preserve-3d" }}
                    >
                        {Array.from({ length: 6 }).map((_, index) => (
                            <div
                                key={index}
                                ref={(el) => {
                                    faceRefs.current[index] = el;
                                }}
                                className="absolute w-full h-full bg-secondary rounded-lg"
                                style={{
                                    opacity: 0.7,
                                    transform: [
                                        `translateZ(112px)`,
                                        `rotateY(90deg) translateZ(112px)`,
                                        `rotateY(-90deg) translateZ(112px)`,
                                        `rotateX(90deg) translateZ(112px)`,
                                        `rotateX(-90deg) translateZ(112px)`,
                                        `translateZ(-112px) rotateY(180deg)`,
                                    ][index],
                                    border: "3px solid var(--border)",
                                    transition: "box-shadow 0.3s ease",
                                }}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CubeViz;
