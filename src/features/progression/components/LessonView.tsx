import React, { useState, useCallback, useEffect, useMemo, useRef } from 'react'
import DrawingCanvas from '~features/drawing/components/DrawingCanvas'
import GhostOverlay from '~features/drawing/components/GhostOverlay'
import Toolbar from '~features/drawing/components/Toolbar'
import GenerativeReward from './GenerativeReward'
// import { generateLessonPath } from '~utils/pathGenerator' // Removed
import { playSound } from '~utils/sound'
import { Level } from '@/types/level'
import { ArrowLeft } from 'lucide-react';
import { DrawingPoint, isSentinel } from '~utils/geometry';
import { Scene3D } from '~features/effects3d/Scene3D';

interface LessonViewProps {
    level: Level;
    onComplete: (score: number) => void;
    onBack: () => void;
    onNext?: () => void;
}

import { useTheme } from '~features/theming/ThemeContext';

const LessonView: React.FC<LessonViewProps> = ({ level, onComplete, onBack, onNext }) => {
    // Theme Integration
    const { setSubTier, theme } = useTheme();

    useEffect(() => {
        if (level.subTier) {
            setSubTier(level.subTier);
        }
    }, [level.subTier, setSubTier]);

    // Generate scaled path from level data
    const containerRef = useRef<HTMLDivElement>(null);
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

    useEffect(() => {
        const updateDimensions = () => {
            if (containerRef.current) {
                const { clientWidth, clientHeight } = containerRef.current;
                // Only update if dimensions are valid to prevent "vanishing" path
                if (clientWidth > 0 && clientHeight > 0) {
                    setDimensions({ width: clientWidth, height: clientHeight });
                }
            }
        };

        window.addEventListener('resize', updateDimensions);
        updateDimensions();

        // Use ResizeObserver for accurate container sizing
        const observer = new ResizeObserver(updateDimensions);
        if (containerRef.current) observer.observe(containerRef.current);

        return () => {
            window.removeEventListener('resize', updateDimensions);
            observer.disconnect();
        };
    }, []);

    const lessonPath = useMemo(() => {
        if (!level.points.length) return { points: [], isClosed: false };

        // 1. Calculate Bounds
        let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
        level.points.forEach(p => {
            if (isSentinel(p)) return;
            minX = Math.min(minX, p.x);
            maxX = Math.max(maxX, p.x);
            minY = Math.min(minY, p.y);
            maxY = Math.max(maxY, p.y);
        });

        const contentW = maxX - minX;
        const contentH = maxY - minY;

        // 2. Determine Scale (Fit to container with padding)
        const paddingX = 0.2; // 10% on each side
        const paddingTop = 0.15; // 15% top
        const paddingBottom = 0.35; // 35% bottom for Toolbar clearance

        const availW = dimensions.width * (1 - paddingX);
        const availH = dimensions.height * (1 - (paddingTop + paddingBottom));

        // Handle edge cases like flat lines (width or height is 0)
        // If dimension is 0, we can effectively scale infinitely in that direction, 
        // so we treat "scale" as determined by the other dimension.
        // We use a safe large number instead of Infinity to avoid math issues.
        const scaleX = contentW > 0 ? availW / contentW : 10000;
        const scaleY = contentH > 0 ? availH / contentH : 10000;

        let scale = Math.min(scaleX, scaleY);

        // Sanity check: If both are huge (single point), default to 1
        if (scale > 1000) scale = 1;

        // 3. Center
        // drawnW/H is the size of the bounding box after scaling
        const drawnW = contentW * scale;
        // const drawnH = contentH * scale; // Unused

        // Offset = Center of Available Space - Center of Drawn Content
        // Center of Available X = dim * 0.5 (Standard symmetry)
        // Center of Available Y = dim * paddingTop + availH / 2

        const offsetX = (dimensions.width - drawnW) / 2 - minX * scale;

        // Vertical offset includes the top padding push
        // targetCenterY = dimensions.height * paddingTop + availH / 2
        // currentCenterY = minY * scale + drawnH / 2
        // offset = targetCenterY - currentCenterY
        const targetCenterY = dimensions.height * paddingTop + availH / 2;
        // y_final = y * scale + offset
        // center_final = center_initial * scale + offset
        // offset = center_final - center_initial * scale
        // offset = targetCenterY - (minY + contentH/2) * scale

        const calculatedOffsetY = targetCenterY - (minY + contentH / 2) * scale;

        return {
            points: level.points.map(p => ({
                x: p.x * scale + offsetX,
                y: p.y * scale + calculatedOffsetY,
                pressure: p.pressure
            })),
            isClosed: level.isClosed
        };
    }, [level, dimensions]);

    const [canvasKey, setCanvasKey] = useState(0);
    const [isUIHidden, setIsUIHidden] = useState(false);
    const [lastScore, setLastScore] = useState<number | null>(null);
    const [showReward, setShowReward] = useState(false);

    // Track user path for the reward generation
    const userPathRef = useRef<DrawingPoint[]>([]);
    const brushRef = useRef<{ x: number; y: number } | null>(null);

    const handlePathUpdate = useCallback((path: DrawingPoint[]) => {
        userPathRef.current = path;
    }, []);

    const handleBrushMove = useCallback((point: DrawingPoint) => {
        brushRef.current = { x: point.x, y: point.y };
    }, []);

    // Auto-hide UI logic
    const handleDrawStart = useCallback(() => {
        setIsUIHidden(true);
        setLastScore(null);
        setShowReward(false);
    }, []);

    const handleDrawEnd = useCallback((score: number) => {
        setTimeout(() => {
            setIsUIHidden(false);
            if (score > 0) {
                setLastScore(score);
                if (score >= level.requiredScore) {
                    // Success! Show reward instead of just completing immediately
                    setShowReward(true);

                    // We still notify parent of completion for progress saving, 
                    // but we don't navigate away yet.
                    onComplete(score);
                } else {
                    playSound.failure();
                }
            }
        }, 500);
    }, [level, onComplete]);

    const handleClear = useCallback(() => {
        playSound.clear();
        setCanvasKey(prev => prev + 1);
        setLastScore(null);
        setShowReward(false);
        userPathRef.current = [];
    }, []);

    const handleSkip = useCallback(() => {
        playSound.click();
        onBack();
    }, [onBack]);

    // Hotkeys
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.code === 'KeyC' || e.code === 'Backspace') {
                e.preventDefault();
                handleClear();
            } else if (e.code === 'Escape') {
                e.preventDefault();
                onBack();
            }
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [handleClear, onBack]);

    return (
        <div className={`w-full h-full relative overflow-hidden touch-none selection:bg-none transition-colors duration-700 ${theme.colors.background}`}>
            {/* Background Grid */}
            <div className="absolute inset-0 pointer-events-none"
                style={{
                    opacity: theme.backgroundPattern.opacity,
                    backgroundImage: `radial-gradient(${theme.backgroundPattern.color} 1px, transparent 1px)`,
                    backgroundSize: '24px 24px'
                }}
            />

            {/* 3D Effects Layer */}

            <Scene3D
                isLevelComplete={showReward}
                // isUIHidden is true when drawing logic starts, so it's a good proxy for "drawing active"
                isDrawing={isUIHidden}
                brushRef={brushRef}
            />

            {/* Museum Frame Container */}
            <div className="absolute inset-0 flex items-center justify-center p-8 md:p-12 pointer-events-none">
                <div className="relative w-full h-full max-w-[1600px] max-h-[90vh] bg-white shadow-2xl rounded-sm border-[12px] border-stone-100 ring-1 ring-stone-900/5 overflow-hidden transition-all duration-700 ease-in-out">

                    {/* Inner Matte */}
                    <div className="absolute inset-0 pointer-events-none border-[24px] border-white z-10 opacity-50 shadow-inner"></div>

                    {/* Canvas Layer */}
                    <div ref={containerRef} className="absolute inset-0 pointer-events-auto">
                        {dimensions.width > 0 && dimensions.height > 0 && (
                            <>
                                <GhostOverlay
                                    path={lessonPath}
                                    width={dimensions.width}
                                    height={dimensions.height}
                                />
                                <DrawingCanvas
                                    key={canvasKey}
                                    width={dimensions.width}
                                    height={dimensions.height}
                                    ghostPath={lessonPath}
                                    onDrawStart={handleDrawStart}
                                    onDrawEnd={handleDrawEnd}
                                    onPathUpdate={handlePathUpdate}
                                    onBrushMove={handleBrushMove}
                                    theme={theme}
                                />
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* UI Overlay */}
            <div className={`absolute inset-0 pointer-events-none transition-opacity duration-500 ease-in-out z-50 ${isUIHidden ? 'opacity-0' : 'opacity-100'}`}>


                {/* Back Button */}
                <div className="absolute top-6 left-6 pointer-events-auto">
                    <button onClick={onBack} className="p-3 bg-white/80 rounded-full shadow-sm border border-zinc-200 hover:bg-zinc-100 transition-colors">
                        <ArrowLeft className="text-zinc-700" size={24} />
                    </button>
                </div>

                {/* Header Instruction */}
                <div className="absolute top-6 left-1/2 transform -translate-x-1/2 w-[90%] md:w-auto text-center">
                    <div className={`${theme.colors.node.bg} ${theme.colors.node.border} ${theme.colors.node.shadow} backdrop-blur-md shadow-sm border rounded-2xl p-4 inline-flex flex-col gap-1 transition-all duration-500`}>
                        <h1 className={`text-lg font-bold ${theme.colors.text} ${theme.typography.headerfont}`}>{level.title}</h1>
                        <p className={`text-sm ${theme.colors.accent} ${theme.typography.bodyFont}`}>{level.description}</p>
                    </div>
                </div>

                {/* Toolbar */}
                <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 pointer-events-auto">
                    <Toolbar onClear={handleClear} onNext={onNext || handleSkip} />
                </div>

                {/* Simple Fail Score Popup (Success is handled by GenerativeReward) */}
                {lastScore !== null && lastScore < level.requiredScore && (
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none animate-in fade-in zoom-in duration-300">
                        <div className="bg-white/90 backdrop-blur-xl shadow-2xl border border-white/20 rounded-3xl p-8 flex flex-col items-center gap-2">
                            <div className="text-6xl font-black text-zinc-300">
                                {lastScore}%
                            </div>
                            <div className="text-zinc-500 font-medium">Target: {level.requiredScore}%</div>
                            <div className="text-2xl font-bold text-zinc-400 mt-2">
                                Try Again
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Generative Reward Modal */}
            {showReward && (
                <GenerativeReward
                    userPath={userPathRef.current}
                    levelId={level.id}
                    score={lastScore || 0}
                    onClose={() => {
                        setShowReward(false);
                        if (onNext) onNext();
                        else onBack(); // Or stay? Ideally go to next level or map.
                    }}
                />
            )}
        </div>
    )
}

export default React.memo(LessonView);
