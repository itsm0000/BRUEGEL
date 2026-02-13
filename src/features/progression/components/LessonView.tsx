import React, { useState, useCallback, useEffect, useMemo, useRef } from 'react'
import DrawingCanvas from '~features/drawing/components/DrawingCanvas'
import GhostOverlay from '~features/drawing/components/GhostOverlay'
import Toolbar from '~features/drawing/components/Toolbar'
import GenerativeReward from './GenerativeReward'
// import { generateLessonPath } from '~utils/pathGenerator' // Removed
import { playSound } from '~utils/sound'
import { Level } from '@/types/level'
import { ArrowLeft } from 'lucide-react';
import { DrawingPoint } from '~utils/geometry';

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
    const [dimensions, setDimensions] = useState({ width: window.innerWidth, height: window.innerHeight });

    useEffect(() => {
        const handleResize = () => setDimensions({ width: window.innerWidth, height: window.innerHeight });
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const lessonPath = useMemo(() => {
        const targetSize = 1000; // The size of our source data box
        const scale = Math.min(dimensions.width, dimensions.height) / targetSize * 0.8; // 0.8 for padding

        const offsetX = (dimensions.width - targetSize * scale) / 2;
        const offsetY = (dimensions.height - targetSize * scale) / 2;

        return {
            points: level.points.map(p => ({
                x: p.x * scale + offsetX,
                y: p.y * scale + offsetY,
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

    const handlePathUpdate = useCallback((path: DrawingPoint[]) => {
        userPathRef.current = path;
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

            <GhostOverlay path={lessonPath} />

            <DrawingCanvas
                key={canvasKey}
                ghostPath={lessonPath}
                onDrawStart={handleDrawStart}
                onDrawEnd={handleDrawEnd}
                onPathUpdate={handlePathUpdate}
            />

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
