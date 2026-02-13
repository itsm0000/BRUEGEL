import React, { useRef, useEffect } from 'react';
import { Path, DrawingPoint, calculateDeviation, calculateScore } from '~utils/geometry';

interface DrawingCanvasProps {
    ghostPath?: Path;
    onDrawStart?: () => void;
    onDrawEnd?: (score: number) => void;
    onPathUpdate?: (path: DrawingPoint[]) => void;
}

const DrawingCanvas: React.FC<DrawingCanvasProps> = ({ ghostPath, onDrawStart, onDrawEnd, onPathUpdate }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const isDrawingRef = useRef(false); // Ref for animation loop to avoid closure staleness

    // Stabilization state
    const pointerPos = useRef<DrawingPoint | null>(null); // Current raw pointer position
    const brushPos = useRef<DrawingPoint | null>(null);   // Smoothed brush position
    const rafId = useRef<number | null>(null);

    // Particles for "GhostFlow" aesthetic
    interface Particle {
        x: number;
        y: number;
        vx: number;
        vy: number;
        life: number;
        color: string;
    }
    const particlesRef = useRef<Particle[]>([]);

    // Scoring state
    const userPathRef = useRef<DrawingPoint[]>([]);

    // Resize canvas to fill window
    useEffect(() => {
        const handleResize = () => {
            if (canvasRef.current) {
                const dpr = window.devicePixelRatio || 1;
                canvasRef.current.width = window.innerWidth * dpr;
                canvasRef.current.height = window.innerHeight * dpr;

                const ctx = canvasRef.current.getContext('2d');
                if (ctx) ctx.scale(dpr, dpr);

                canvasRef.current.style.width = `${window.innerWidth}px`;
                canvasRef.current.style.height = `${window.innerHeight}px`;
            }
        };

        window.addEventListener('resize', handleResize);
        handleResize();

        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const getPoint = (e: React.PointerEvent): DrawingPoint => {
        return {
            x: e.clientX,
            y: e.clientY,
            pressure: e.pressure || 0.5,
        };
    };

    // Stabilization loop handled by animate() function below

    // Correct rAF Loop Implementation
    const animate = () => {
        if (!isDrawingRef.current || !pointerPos.current || !canvasRef.current) return;

        const ctx = canvasRef.current.getContext('2d');
        if (!ctx) return;

        if (!brushPos.current) {
            brushPos.current = { ...pointerPos.current };
        }

        const target = pointerPos.current;
        const current = brushPos.current;

        // Smooth Factor
        const factor = 0.4; // 0.1 very lazy, 0.9 very fast

        const nextX = current.x + (target.x - current.x) * factor;
        const nextY = current.y + (target.y - current.y) * factor;
        const nextPressure = current.pressure + (target.pressure - current.pressure) * factor;

        // Draw
        let strokeColor = '#000000';
        if (ghostPath) {
            const deviation = calculateDeviation({ x: nextX, y: nextY }, ghostPath);
            strokeColor = deviation < 15 ? '#22c55e' : '#ef4444';
        }

        ctx.lineWidth = nextPressure * 10;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.strokeStyle = strokeColor;

        ctx.beginPath();
        ctx.moveTo(current.x, current.y);
        ctx.lineTo(nextX, nextY);
        ctx.stroke();

        // Update brush position
        brushPos.current = { x: nextX, y: nextY, pressure: nextPressure };

        // Spawn Particles on movement
        const dist = Math.hypot(nextX - current.x, nextY - current.y);
        if (dist > 2) {
            for (let i = 0; i < 2; i++) {
                particlesRef.current.push({
                    x: nextX + (Math.random() - 0.5) * 10,
                    y: nextY + (Math.random() - 0.5) * 10,
                    vx: (Math.random() - 0.5) * 2,
                    vy: (Math.random() - 0.5) * 2,
                    life: 1.0,
                    color: `hsl(${Math.random() * 60 + 200}, 90%, 60%)` // Blue/Cyan/Purple hues
                });
            }
        }

        // Draw Particles
        for (let i = particlesRef.current.length - 1; i >= 0; i--) {
            const p = particlesRef.current[i];
            p.x += p.vx;
            p.y += p.vy;
            p.life -= 0.05;

            if (p.life <= 0) {
                particlesRef.current.splice(i, 1);
                continue;
            }

            ctx.globalAlpha = p.life;
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(p.x, p.y, 2 * p.life, 0, Math.PI * 2);
            ctx.fill();
            ctx.globalAlpha = 1.0;
        }

        // Collect point for scoring
        userPathRef.current.push(brushPos.current);
        if (onPathUpdate) onPathUpdate(userPathRef.current);

        rafId.current = requestAnimationFrame(animate);
    };

    const startDrawing = (e: React.PointerEvent) => {
        e.preventDefault();
        // setIsDrawing(true); // Removed to prevent re-renders
        isDrawingRef.current = true;

        pointerPos.current = getPoint(e);
        brushPos.current = getPoint(e); // Reset brush to start
        userPathRef.current = []; // Reset user path
        onDrawStart?.();

        if (!rafId.current) {
            rafId.current = requestAnimationFrame(animate);
        }
    };

    const draw = (e: React.PointerEvent) => {
        if (!isDrawingRef.current) return;
        e.preventDefault();
        pointerPos.current = getPoint(e); // Just update target, rAF handles drawing
    };

    const stopDrawing = () => {
        if (isDrawingRef.current) {
            // setIsDrawing(false);
            isDrawingRef.current = false;

            if (rafId.current) {
                cancelAnimationFrame(rafId.current);
                rafId.current = null;
            }

            // Only finish if we have a ghost path and are close to the end
            if (ghostPath && userPathRef.current.length > 0) {
                const lastUserPoint = userPathRef.current[userPathRef.current.length - 1];
                const lastGhostPoint = ghostPath.points[ghostPath.points.length - 1];
                const distToEnd = Math.hypot(lastUserPoint.x - lastGhostPoint.x, lastUserPoint.y - lastGhostPoint.y);

                // Threshold for "finishing" (e.g., within 30px of end)
                if (distToEnd < 30) {
                    const score = calculateScore(userPathRef.current, ghostPath);
                    onDrawEnd?.(score);
                } else {
                    // User lifted pen but didn't finish. 
                    // We effectively "pause" the scoring, but since this is a one-shot drawing app 
                    // (currently), maybe we just let them restart by drawing again?
                    // User request: "Level rating went away and came back..."
                    // Current behavior: `startDrawing` resets the path.
                    // If we want them to continue, we shouldn't reset on startDrawing if it was just a pause.
                    // BUT, implementing full multi-stroke support is complex.
                    // For now, PREVENTING the failure modal is the key fix.
                }
            }

            pointerPos.current = null;
            brushPos.current = null;
        }
    };

    return (
        <canvas
            ref={canvasRef}
            onPointerDown={startDrawing}
            onPointerMove={draw}
            onPointerUp={stopDrawing}
            onPointerLeave={stopDrawing}
            className="touch-none absolute inset-0 cursor-crosshair bg-transparent"
            style={{ zIndex: 20 }}
        />
    );
};

export default DrawingCanvas;
