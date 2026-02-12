import React, { useEffect, useRef } from 'react';
import { Path } from '../../utils/geometry';

interface GhostOverlayProps {
    path: Path;
}

const GhostOverlay: React.FC<GhostOverlayProps> = ({ path }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const handleResize = () => {
            const parent = canvas.parentElement;
            if (parent) {
                canvas.width = parent.clientWidth;
                canvas.height = parent.clientHeight;
                drawGhostPath();
            }
        };

        window.addEventListener('resize', handleResize);
        handleResize();

        return () => window.removeEventListener('resize', handleResize);
    }, [path]);

    const drawGhostPath = () => {
        const canvas = canvasRef.current;
        if (!canvas || !path.points.length) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw the ghost line
        ctx.beginPath();
        ctx.setLineDash([5, 5]); // Dashed line
        ctx.strokeStyle = '#3b82f6'; // Blue-500
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        // Move to first point
        ctx.moveTo(path.points[0].x, path.points[0].y);

        // Draw lines to subsequent points
        for (let i = 1; i < path.points.length; i++) {
            ctx.lineTo(path.points[i].x, path.points[i].y);
        }

        ctx.stroke();

        // Draw start indicator
        ctx.beginPath();
        ctx.arc(path.points[0].x, path.points[0].y, 4, 0, Math.PI * 2);
        ctx.fillStyle = '#22c55e'; // Green-500
        ctx.fill();
    };

    useEffect(() => {
        drawGhostPath();
    }, [path]);

    return (
        <canvas
            ref={canvasRef}
            className="absolute inset-0 pointer-events-none z-10 opacity-50"
        />
    );
};

export default GhostOverlay;
