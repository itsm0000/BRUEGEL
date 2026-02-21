import React, { useState, useMemo, Suspense, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { CameraControls } from '@react-three/drei';
import { useProgressStore } from '@/store/progress';
import { TIERS } from '@/data/tiers';
import { Level } from '@/types/level';
import { LevelMap3D } from '~features/navigation/3d/LevelMap3D';
import { Lesson3D } from '~features/progression/components/Lesson3D';
import { ThemeProvider } from '~features/theming/ThemeContext';
import { Particles } from '~features/effects3d/components/Particles';

// Camera Manager for smooth viewing transitions
const CameraManager = ({ view }: { view: 'map' | 'lesson' }) => {
    const controls = React.useRef<CameraControls>(null);

    useEffect(() => {
        if (!controls.current) return;

        // Configure a fast, snappy "whip" feel
        controls.current.smoothTime = 0.4;
        controls.current.draggingDampingFactor = 1;

        if (view === 'map') {
            controls.current.setLookAt(0, 0, 15, 0, 0, 0, true);
        } else {
            // Desk View for Drawing (whip down)
            controls.current.setLookAt(0, -1, 9, 0, -1, 0, true);
        }
    }, [view]);

    return <CameraControls ref={controls} touches={{ one: 0, two: 0, three: 0 }} mouseButtons={{ left: 0, middle: 0, right: 0, wheel: 0 }} />;
};

export const MainScene = () => {
    const [view, setView] = useState<'map' | 'lesson'>('map');
    const [currentLevel, setCurrentLevel] = useState<Level | null>(null);
    const { completeLevel, unlockAll, unlockLevel } = useProgressStore();

    // Flatten levels
    const allLevels = useMemo(() => {
        return TIERS.flatMap(t => t.subTiers.flatMap(st => st.levels));
    }, []);

    const handleLevelSelect = (level: Level) => {
        setCurrentLevel(level);
        setView('lesson');
    };

    // Unlock all levels to allow testing of Phase 1 mechanics easily
    useEffect(() => {
        unlockAll();
    }, [unlockAll]);

    const handleBackToMap = () => {
        setView('map');
        setTimeout(() => setCurrentLevel(null), 800); // Wait for camera to pan out
    };

    const handleLevelComplete = (score: number) => {
        if (currentLevel) {
            completeLevel(currentLevel.id, score);
            const currentIdNum = parseInt(currentLevel.id.split('-')[1]);
            const nextLevelId = `level-${currentIdNum + 1}`;

            if (score >= currentLevel.requiredScore) {
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

                        <CameraManager view={view} />
                    </Suspense>
                </Canvas>
            </div>
        </ThemeProvider>
    );
};

export default MainScene;
