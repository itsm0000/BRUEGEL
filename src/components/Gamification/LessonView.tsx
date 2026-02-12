import React, { useState, useCallback, useEffect, useMemo, useRef } from 'react'
import DrawingCanvas from '../Canvas/DrawingCanvas'
import GhostOverlay from '../Canvas/GhostOverlay'
import Toolbar from '../UI/Toolbar'
import GenerativeReward from './GenerativeReward'
import { generateLessonPath } from '../../utils/pathGenerator'
import { playSound } from '../../utils/sound'
import { Level } from '../../data/levels'
import { ArrowLeft } from 'lucide-react';
import { DrawingPoint } from '../../utils/geometry';

interface LessonViewProps {
    level: Level;
    onComplete: (score: number) => void;
    onBack: () => void;
    onNext?: () => void;
}

const LessonView: React.FC<LessonViewProps> = ({ level, onComplete, onBack, onNext }) => {
    // Generate path based on level type and params
    const lessonPath = useMemo(() => {
        const width = window.innerWidth;
        const height = window.innerHeight;
        return generateLessonPath(level.type, width, height, level.parameters);
    }, [level]);

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
        <div className="w-full h-full relative bg-zinc-50 overflow-hidden touch-none selection:bg-none">
            {/* Background Grid */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.03]"
                style={{
                    backgroundImage: 'radial-gradient(#000 1px, transparent 1px)',
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
                    <div className="bg-white/80 backdrop-blur-md shadow-sm border border-black/5 rounded-2xl p-4 inline-flex flex-col gap-1">
                        <h1 className="text-lg font-bold text-zinc-800">{level.title}</h1>
                        <p className="text-sm text-zinc-500">{level.description}</p>
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
