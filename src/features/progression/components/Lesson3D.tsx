import React, { useState, useEffect } from 'react';
import { Level } from '@/types/level';
import { isSentinel } from '~features/drawing/utils/geometry';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import DrawingCanvasTexture from '~features/drawing/3d/DrawingCanvasTexture';
import Toolbar from '~features/drawing/components/Toolbar';
import { ArrowLeft } from 'lucide-react';
import { AudioEngine } from '~features/audio/AudioEngine';
import { PencilMascot } from '~features/effects3d/components/PencilMascot';
import { Confetti } from '~features/effects3d/components/Confetti';
import { TrailParticles } from '~features/effects3d/components/TrailParticles';
import { StreakCounter } from '~features/effects3d/components/StreakCounter';
import { ScoreDisplay3D } from '~features/effects3d/components/ScoreDisplay3D';
import { useGameStore, STREAK_THRESHOLD } from '@/store/game';
import { rollReward } from '~features/rewards/RewardEngine';
import { useFrame } from '@react-three/fiber';

interface Lesson3DProps {
    level: Level;
    onComplete: (score: number) => void;
    onBack: () => void;
    onNext?: () => void;
}

export const Lesson3D: React.FC<Lesson3DProps> = ({ level, onComplete, onBack, onNext }) => {
    const [isUIHidden, setIsUIHidden] = useState(false);
    const [score, setScore] = useState<number | null>(null);
    const [clearTrigger, setClearTrigger] = useState(0);
    const [rewardMessage, setRewardMessage] = useState('');
    const brushRef = React.useRef<THREE.Vector3 | null>(new THREE.Vector3(0, 0, 0));
    const rootGroupRef = React.useRef<THREE.Group>(null);

    // Start/stop ambient music when lesson mounts/unmounts
    useEffect(() => {
        AudioEngine.startAmbientMusic();
        return () => AudioEngine.stopAmbientMusic();
    }, []);

    useFrame((_, delta) => {
        if (!rootGroupRef.current) return;
        const state = useGameStore.getState();
        // Constant shake regardless of pause state for maximum "Crunch" during hit-stop
        if (state.shakeIntensity > 0) {
            const shakeOffX = (Math.random() - 0.5) * state.shakeIntensity;
            const shakeOffY = (Math.random() - 0.5) * state.shakeIntensity;
            rootGroupRef.current.position.set(shakeOffX, shakeOffY, 0);

            // Only decay the shake if time is passing normally (not in hit-stop)
            if (!state.isPaused) {
                useGameStore.setState({ shakeIntensity: Math.max(0, state.shakeIntensity - delta * 2) });
            }
        } else {
            rootGroupRef.current.position.set(0, 0, 0);
        }
    });

    const handleDrawStart = () => {
        setIsUIHidden(true);
        setScore(null);
    };

    const handleDrawEnd = (finalScore: number) => {
        // Trigger hit stop and shake regardless of pass/fail to give impact to the end of a drawing
        useGameStore.getState().triggerHitStop(150); // 150ms freeze for a noticeable "Crunch"

        // Streak management
        if (finalScore >= STREAK_THRESHOLD) {
            useGameStore.getState().incrementStreak();
            // Play perfect chime for high accuracy
            AudioEngine.playPerfectChime();
        } else {
            const hadStreak = useGameStore.getState().streak > 0;
            useGameStore.getState().breakStreak();
            if (hadStreak) {
                AudioEngine.playStreakBreak();
            }
        }

        // Update cumulative accuracy for ambient music layers
        useGameStore.getState().updateCumulativeAccuracy(finalScore);
        AudioEngine.updateAmbientLayers(useGameStore.getState().cumulativeAccuracy);

        if (finalScore >= level.requiredScore) {
            useGameStore.getState().addShake(0.6); // Intense shake on win
        } else {
            useGameStore.getState().addShake(0.2); // Small bump on fail
        }

        // Delay the UI popping up so the player can actually see the hit-stop, shake, and their finished drawing
        setTimeout(() => {
            setIsUIHidden(false);
            setScore(finalScore);
            if (finalScore >= level.requiredScore) {
                // Roll variable reward
                const reward = rollReward();
                useGameStore.getState().setLastRewardType(reward.type);
                setRewardMessage(reward.message);

                // Extra shake for special rewards
                if (reward.extraShake > 0) {
                    useGameStore.getState().addShake(reward.extraShake);
                }

                // Audio based on reward type
                if (reward.type === 'jackpot') {
                    AudioEngine.playJackpot();
                } else {
                    AudioEngine.playVictoryFanfare();
                }
                onComplete(finalScore);
            } else {
                setRewardMessage('');
                AudioEngine.playFailure();
            }
        }, 1500); // 1.5 seconds of cinematic "cooling off" before UI
    };

    const handleClear = () => {
        AudioEngine.playClear();
        setClearTrigger(prev => prev + 1);
        setScore(null);
    };

    const handleSkip = () => {
        AudioEngine.playClick();
        if (onNext) onNext();
        else onBack();
    };

    // Calculate ghost path bounds and scale to fit our 12x9 3D plane
    const mappedGhostPath = React.useMemo(() => {
        if (!level.points.length) return { points: [], isClosed: false };

        let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
        level.points.forEach(p => {
            if (isSentinel(p)) return;
            minX = Math.min(minX, p.x);
            maxX = Math.max(maxX, p.x);
            minY = Math.min(minY, p.y);
            maxY = Math.max(maxY, p.y);
        });

        // Our 3D canvas is physically 12 units wide, 9 units high. We'll map to a 1200x900 pixel equivalent.
        const dimW = 1200;
        const dimH = 900;

        const paddingX = 0.2;
        const paddingTop = 0.15;
        const paddingBottom = 0.35;

        const availW = dimW * (1 - paddingX);
        const availH = dimH * (1 - (paddingTop + paddingBottom));

        let cw = maxX - minX;
        let ch = maxY - minY;

        // If it's a straight line, fake a logical width/height so it scales gracefully
        if (cw === 0) cw = 1;
        if (ch === 0) ch = 1;

        const scaleX = availW / cw;
        const scaleY = availH / ch;
        let scale = Math.min(scaleX, scaleY);

        // Prevent simple small shapes or lines from scaling to massive sizes
        if (scale > 2) scale = 2;

        const drawnW = cw * scale;
        const drawnH = ch * scale;

        // Center on X
        const offsetX = (dimW - drawnW) / 2 - (minX * scale);

        // Center on Y, factoring in top padding
        const offsetY = (dimH * paddingTop) + ((availH - drawnH) / 2) - (minY * scale);

        return {
            points: level.points.map(p => ({
                x: p.x * scale + offsetX,
                y: p.y * scale + offsetY,
                pressure: p.pressure
            })),
            isClosed: level.isClosed
        };
    }, [level]);

    return (
        <group ref={rootGroupRef}>
            {/* The Wooden Desk Base */}
            <mesh position={[0, -0.1, 0]}>
                <boxGeometry args={[14, 11, 0.2]} />
                <meshStandardMaterial color="#8B5A2B" roughness={0.9} />
            </mesh>

            {/* Mascot stationed next to the desk */}
            <group position={[-5, 0.5, 0.5]}>
                <PencilMascot isDrawing={isUIHidden} isLevelComplete={score !== null && score >= level.requiredScore} />
            </group>

            {/* Confetti Explosion on Success */}
            <Confetti isExploding={score !== null && score >= level.requiredScore} />

            {/* Ambient Drawing Particle Trails */}
            <TrailParticles isDrawing={isUIHidden} brushRef={brushRef as React.MutableRefObject<THREE.Vector3>} />

            {/* Streak Counter */}
            <StreakCounter brushRef={brushRef as React.MutableRefObject<THREE.Vector3>} />

            {/* The Paper / Canvas Area */}
            <group position={[0, 0, 0.11]}>
                <DrawingCanvasTexture
                    width={1200}
                    height={900}
                    ghostPath={mappedGhostPath}
                    onDrawStart={handleDrawStart}
                    onDrawEnd={handleDrawEnd}
                    onPathUpdate={() => { }} // Used for effects if needed
                    onBrushMove={(p) => {
                        // Project 2D mapped coordinates back into 3D local space (-6 to +6 X, -4.5 to +4.5 Y)
                        if (brushRef.current) {
                            const localX = (p.x / 1200) * 12 - 6;
                            const localY = (1 - (p.y / 900)) * 9 - 4.5;
                            brushRef.current.set(localX, localY, 0.2);
                        }
                    }}
                    clearTrigger={clearTrigger}
                />
            </group>

            {/* 3D Score Display (replaces HTML score modal) */}
            {!isUIHidden && (
                <ScoreDisplay3D
                    score={score}
                    requiredScore={level.requiredScore}
                    rewardMessage={rewardMessage}
                />
            )}

            {/* 3D HTML Overlay for Crisp UI (Back, Title, Toolbar) */}
            <Html center position={[0, 0, 0.2]} style={{ width: '1200px', height: '900px', pointerEvents: 'none' }} className={`transition-all duration-1000 ease-in-out ${isUIHidden ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
                <div className="w-full h-full relative">
                    <div className="absolute top-8 left-8 pointer-events-auto">
                        <button onClick={onBack} className="p-4 bg-white/90 rounded-full shadow-lg border border-zinc-200 hover:bg-zinc-100 hover:scale-105 transition-all">
                            <ArrowLeft className="text-zinc-800" size={32} />
                        </button>
                    </div>

                    <div className="absolute top-8 left-1/2 transform -translate-x-1/2 text-center pointer-events-auto">
                        <div className="bg-white/95 backdrop-blur-md shadow-lg border border-stone-200 rounded-3xl p-6 px-10 inline-flex flex-col gap-2">
                            <h1 className="text-3xl font-bold text-stone-800 font-serif">{level.title}</h1>
                            <p className="text-lg text-stone-500">{level.description}</p>
                        </div>
                    </div>

                    <div className="absolute bottom-12 left-1/2 transform -translate-x-1/2 pointer-events-auto scale-125 origin-bottom">
                        <Toolbar onClear={handleClear} onNext={handleSkip} />
                    </div>
                </div>
            </Html>
        </group>
    );
};

export default Lesson3D;
