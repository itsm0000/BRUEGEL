import React, { useState, useMemo, Suspense, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { CameraControls } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import { useProgressStore } from '@/store/progress';
import { TIERS } from '@/data/tiers';
import { Level } from '@/types/level';
import { LevelMap3D } from '~features/navigation/3d/LevelMap3D';
import { Lesson3D } from '~features/progression/components/Lesson3D';
import { ThemeProvider } from '~features/theming/ThemeContext';
import { Particles } from '~features/effects3d/components/Particles';

// Camera Manager for smooth viewing transitions
const CameraManager = ({ view, isCompleted }: { view: 'map' | 'lesson'; isCompleted?: boolean }) => {
    const controls = React.useRef<CameraControls>(null);

    useEffect(() => {
        if (!controls.current) return;

        controls.current.smoothTime = 0.4;
        controls.current.draggingDampingFactor = 1;

        if (view === 'map') {
            // Map view: slight angle
            controls.current.setLookAt(0, -5, 14, 0, 0, 0, true);
        } else {
            // Desk View for Drawing
            if (isCompleted) {
                // Cinematic orbit - pull back and look at the center
                controls.current.setLookAt(0, -10, 10, 0, 0, 0, true);
            } else {
                // Active drawing: 10 units high, 4 units back, looking at center
                controls.current.setLookAt(0, -4, 10, 0, 0, 0, true);
            }
        }
    }, [view, isCompleted]);

    useFrame((_: any, delta: number) => {
        if (isCompleted && controls.current) {
            // Slowly orbit the camera during win state
            controls.current.azimuthAngle += 0.2 * delta;
        }
    });

    return <CameraControls ref={controls} touches={{ one: 0, two: 0, three: 0 }} mouseButtons={{ left: 0, middle: 0, right: 0, wheel: 0 }} />;
};

export const MainScene = () => {
    const [view, setView] = useState<'map' | 'lesson'>('map');
    const [currentLevel, setCurrentLevel] = useState<Level | null>(null);
    const [isLessonCompleted, setIsLessonCompleted] = useState(false);
    const { completeLevel, unlockAll, unlockLevel } = useProgressStore();

    // Flatten levels
    const allLevels = useMemo(() => {
        return TIERS.flatMap(t => t.subTiers.flatMap(st => st.levels));
    }, []);

    const handleLevelSelect = (level: Level) => {
        setCurrentLevel(level);
        setIsLessonCompleted(false);
        setView('lesson');
    };

    // Unlock all levels to allow testing of Phase 1 mechanics easily
    useEffect(() => {
        unlockAll();
    }, [unlockAll]);

    const handleBackToMap = () => {
        setView('map');
        setIsLessonCompleted(false);
        setTimeout(() => setCurrentLevel(null), 800); // Wait for camera to pan out
    };

    const handleLevelComplete = (score: number) => {
        if (currentLevel) {
            completeLevel(currentLevel.id, score);
            const currentIdNum = parseInt(currentLevel.id.split('-')[1]);
            const nextLevelId = `level-${currentIdNum + 1}`;

            if (score >= currentLevel.requiredScore) {
                setIsLessonCompleted(true);
                unlockLevel(nextLevelId);
            }
        }
    };

    const handleNextLevel = () => {
        if (currentLevel) {
            const currentIdNum = parseInt(currentLevel.id.split('-')[1]);
            const nextLevelId = `level-${currentIdNum + 1}`;
            const nextLevel = allLevels.find(l => l.id === nextLevelId);

            if (nextLevel) {
                // Whip out to map, swap level, then whip back in
                setView('map');
                setIsLessonCompleted(false);
                setTimeout(() => {
                    setCurrentLevel(nextLevel);
                    setView('lesson');
                }, 600);
            } else {
                handleBackToMap();
            }
        }
    };

    return (
        <ThemeProvider>
            <div className="w-full h-screen bg-stone-100 touch-none select-none">
                <Canvas shadows camera={{ position: [0, 0, 15], fov: 50 }}>
                    <Suspense fallback={null}>
                        {/* Soft aesthetic lighting */}
                        <ambientLight intensity={0.6} color="#fafaf9" />
                        <spotLight position={[10, 15, 10]} angle={0.3} penumbra={1} intensity={1.5} color="#fffbeb" castShadow />
                        <pointLight position={[-10, -10, 5]} intensity={0.5} color="#e0e7ff" />

                        {/* Post-processing Bloom for glowing elements */}
                        <EffectComposer>
                            <Bloom luminanceThreshold={1} mipmapBlur intensity={1.5} />
                        </EffectComposer>

                        {/* Persistent Background Effects */}
                        <Particles count={200} color="#fbbf24" />

                        {view === 'map' && (
                            <group>
                                <LevelMap3D levels={allLevels} onSelectLevel={handleLevelSelect} />
                            </group>
                        )}

                        {view === 'lesson' && currentLevel && (
                            <group>
                                <Lesson3D
                                    level={currentLevel}
                                    onBack={handleBackToMap}
                                    onComplete={handleLevelComplete}
                                    onNext={handleNextLevel}
                                />
                            </group>
                        )}

                        <CameraManager view={view} isCompleted={isLessonCompleted} />
                    </Suspense>
                </Canvas>
            </div>
        </ThemeProvider>
    );
};

export default MainScene;
