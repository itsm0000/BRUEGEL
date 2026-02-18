import React, { useEffect, useRef } from 'react';
import { Path, isSentinel } from '~utils/geometry';

interface GhostOverlayProps {
    path: Path;
    width: number;
    height: number;
}

const GhostOverlay: React.FC<GhostOverlayProps> = ({ path, width, height }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const applyStrokeStyles = (ctx: CanvasRenderingContext2D) => {
        ctx.setLineDash([8, 8]); // Distinct dash
        ctx.strokeStyle = '#a8a29e'; // Stone-400
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
    };

    const drawGhostPath = () => {
        const canvas = canvasRef.current;
        if (!canvas || !path.points.length || width === 0 || height === 0) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Note: Canvas buffer size is set in the useEffect below
        // Here we just draw.
        // Clearing is safe because we redraw everything
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw path segments
        ctx.beginPath();
        applyStrokeStyles(ctx);

        let isPenDown = false;

        for (let i = 0; i < path.points.length; i++) {
            const p = path.points[i];

            if (isSentinel(p)) {
                if (isPenDown) {
                    ctx.stroke();
                    isPenDown = false;
                }
            } else {
                if (!isPenDown) {
                    ctx.beginPath();
                    applyStrokeStyles(ctx);
                    ctx.moveTo(p.x, p.y);
                    isPenDown = true;
                } else {
                    ctx.lineTo(p.x, p.y);
                }
            }
        }
        if (isPenDown) ctx.stroke();

        // Draw start indicator (if first point is valid)
        if (path.points.length > 0 && !isSentinel(path.points[0])) {
            ctx.beginPath();
            ctx.setLineDash([]); // Reset dash
            ctx.arc(path.points[0].x, path.points[0].y, 6, 0, Math.PI * 2);
            ctx.fillStyle = '#10b981'; // Emerald-500
            ctx.fill();
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 2;
            ctx.stroke();
        }
    };

    // React to size or path changes
    useEffect(() => {
        const canvas = canvasRef.current;
        if (canvas && width > 0 && height > 0) {
            // DEBUG: Force DPR 1 to check centering
            const dpr = 1; // window.devicePixelRatio || 1;

            canvas.width = width * dpr;
            canvas.height = height * dpr;

            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.scale(dpr, dpr);
                drawGhostPath();
            }
        }
    }, [width, height, path]);

    return (
        <canvas
            ref={canvasRef}
            className="absolute inset-0 pointer-events-none z-10"
        />
    );
};

export default GhostOverlay;
