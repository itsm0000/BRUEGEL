import React, { useRef, useEffect, useCallback } from 'react';
import { useFrame, ThreeEvent } from '@react-three/fiber';
import * as THREE from 'three';
import { DrawingPoint, calculateScore, isSentinel } from '~features/drawing/utils/geometry';
import { AudioEngine } from '~features/audio/AudioEngine';

interface DrawingCanvasTextureProps {
    width: number;
    height: number;
    ghostPath: { points: DrawingPoint[]; isClosed: boolean };
    onDrawStart: () => void;
    onDrawEnd: (score: number) => void;
    onPathUpdate: (path: DrawingPoint[]) => void;
    onBrushMove: (point: DrawingPoint) => void;
    clearTrigger?: number; // Used to trigger clears from parent
}

export const DrawingCanvasTexture: React.FC<DrawingCanvasTextureProps> = ({
    width,
    height,
    ghostPath,
    onDrawStart,
    onDrawEnd,
    onPathUpdate,
    onBrushMove,
    clearTrigger = 0
}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const textureRef = useRef<THREE.CanvasTexture>(null);
    const materialRef = useRef<THREE.MeshBasicMaterial>(null);

    const isDrawing = useRef(false);
    const currentPath = useRef<DrawingPoint[]>([]);

    // Smoothing buffer
    const pointsBuffer = useRef<DrawingPoint[]>([]);
    const lastDrawnIndex = useRef(0);
    const needsUpdate = useRef(false);

    // Speed tracking for audio pitch modulation
    const lastPointTime = useRef(0);
    const lastPointPos = useRef<{ x: number; y: number } | null>(null);

    // Initial setup of canvas and texture
    useEffect(() => {
        if (!canvasRef.current) {
            canvasRef.current = document.createElement('canvas');
        }
        canvasRef.current.width = width;
        canvasRef.current.height = height;

        const ctx = canvasRef.current.getContext('2d');
        if (ctx) {
            // Clear background to be transparent
            ctx.clearRect(0, 0, width, height);

            // Draw Ghost Path
            if (ghostPath.points.length > 0) {
                ctx.beginPath();
                ctx.strokeStyle = 'rgba(168, 162, 158, 0.5)'; // stone-400 with 50% opacity
                ctx.lineWidth = 15;
                ctx.lineCap = 'round';
                ctx.lineJoin = 'round';

                let isFirstPoint = true;
                ghostPath.points.forEach((p) => {
                    if (isSentinel(p)) {
                        isFirstPoint = true;
                    } else if (isFirstPoint) {
                        ctx.moveTo(p.x, p.y);
                        isFirstPoint = false;
                    } else {
                        ctx.lineTo(p.x, p.y);
                    }
                });
                ctx.stroke();
            }
        }

        if (!textureRef.current) {
            textureRef.current = new THREE.CanvasTexture(canvasRef.current);
            textureRef.current.minFilter = THREE.LinearFilter;
            textureRef.current.magFilter = THREE.LinearFilter;
            textureRef.current.colorSpace = THREE.SRGBColorSpace;

            // Attach texture to material since we don't trigger React renders
            if (materialRef.current) {
                materialRef.current.map = textureRef.current;
                materialRef.current.needsUpdate = true;
            }
        } else {
            textureRef.current.image = canvasRef.current;
            textureRef.current.needsUpdate = true;
        }

    }, [width, height, ghostPath]);

    // Handle clear trigger and ghost path initialization
    useEffect(() => {
        currentPath.current = [];
        pointsBuffer.current = [];
        lastDrawnIndex.current = 0;

        // Full redraw of background + ghost
        const ctx = canvasRef.current?.getContext('2d');
        if (ctx && canvasRef.current) {
            ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

            if (ghostPath.points.length > 0) {
                ctx.beginPath();
                ctx.strokeStyle = 'rgba(168, 162, 158, 0.5)'; // stone-400 with 50% opacity
                ctx.lineWidth = 15;
                ctx.lineCap = 'round';
                ctx.lineJoin = 'round';

                let isFirstPoint = true;
                ghostPath.points.forEach((p) => {
                    if (isSentinel(p)) {
                        isFirstPoint = true;
                    } else if (isFirstPoint) {
                        ctx.moveTo(p.x, p.y);
                        isFirstPoint = false;
                    } else {
                        ctx.lineTo(p.x, p.y);
                    }
                });
                ctx.stroke();
            }
        }
        if (textureRef.current) textureRef.current.needsUpdate = true;
    }, [clearTrigger, ghostPath]);

    // Render loop for smooth drawing
    useFrame(() => {
        if (!needsUpdate.current || !canvasRef.current || !textureRef.current) return;

        const ctx = canvasRef.current.getContext('2d');
        if (!ctx) return;

        const pts = pointsBuffer.current;
        if (pts.length > lastDrawnIndex.current) {
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctx.strokeStyle = '#292524'; // Stone-900

            // Draw new segments
            for (let i = Math.max(1, lastDrawnIndex.current); i < pts.length; i++) {
                const prev = pts[i - 1];
                const curr = pts[i];

                if (isSentinel(prev) || isSentinel(curr)) continue;

                ctx.beginPath();
                ctx.moveTo(prev.x, prev.y);
                ctx.lineTo(curr.x, curr.y);

                // Pressure sensitive width based on simulated pressure
                const pressure = curr.pressure || 0.5;
                const minW = 2;
                const maxW = 8;
                ctx.lineWidth = minW + pressure * (maxW - minW);

                ctx.stroke();
            }

            lastDrawnIndex.current = pts.length - 1;
            textureRef.current.needsUpdate = true;
        }
        needsUpdate.current = false;
    });

    // 3D Interaction Handlers
    const handlePointerDown = useCallback((e: ThreeEvent<PointerEvent>) => {
        e.stopPropagation();
        isDrawing.current = true;
        onDrawStart();

        // Start brush audio
        AudioEngine.startBrushSound();

        // UV to Pixel coords
        const x = e.uv!.x * width;
        const y = (1 - e.uv!.y) * height; // Invert Y for 2D canvas

        const newPoint = { x, y, pressure: e.pressure || 0.5 };

        currentPath.current = [newPoint];
        pointsBuffer.current = [...pointsBuffer.current, newPoint];
        lastPointPos.current = { x, y };
        lastPointTime.current = performance.now();
        onBrushMove(newPoint);
    }, [width, height, onDrawStart, onBrushMove]);

    const handlePointerMove = useCallback((e: ThreeEvent<PointerEvent>) => {
        if (!isDrawing.current) return;
        e.stopPropagation();

        const x = e.uv!.x * width;
        const y = (1 - e.uv!.y) * height;
        const newPoint = { x, y, pressure: e.pressure || 0.5 };

        // Calculate drawing speed for audio pitch modulation
        const now = performance.now();
        if (lastPointPos.current) {
            const dx = x - lastPointPos.current.x;
            const dy = y - lastPointPos.current.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const dt = Math.max(now - lastPointTime.current, 1);
            const speed = dist / dt; // pixels per ms
            const normalizedSpeed = Math.min(speed / 3, 1); // Normalize: 3 px/ms = max
            AudioEngine.updateBrushPitch(normalizedSpeed);
        }
        lastPointPos.current = { x, y };
        lastPointTime.current = now;

        currentPath.current.push(newPoint);
        pointsBuffer.current.push(newPoint);

        needsUpdate.current = true;
        onPathUpdate(currentPath.current);
        onBrushMove(newPoint);
    }, [width, height, onPathUpdate, onBrushMove]);

    const handlePointerUp = useCallback((e: ThreeEvent<PointerEvent>) => {
        e.stopPropagation();
        if (!isDrawing.current) return;
        isDrawing.current = false;

        // Stop brush audio
        AudioEngine.stopBrushSound();
        lastPointPos.current = null;

        pointsBuffer.current.push({ x: -1, y: -1, pressure: 0 }); // Add Sentinel
        currentPath.current.push({ x: -1, y: -1, pressure: 0 });

        const score = calculateScore(
            currentPath.current,
            { points: ghostPath.points, isClosed: ghostPath.isClosed }
        );
        onDrawEnd(score);
    }, [ghostPath.points, onDrawEnd]);

    return (
        <mesh
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerOut={handlePointerUp}
            position={[0, 0, 0]}
        >
            <planeGeometry args={[12, 9]} /> {/* 4:3 Aspect Ratio for desk pad */}
            <meshStandardMaterial
                ref={materialRef}
                map={textureRef.current}
                side={THREE.DoubleSide}
                transparent={true}
                roughness={0.6}
            />
        </mesh>
    );
};

export default DrawingCanvasTexture;
