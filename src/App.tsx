import { useState, useMemo } from 'react';
import LevelMap from '~features/navigation/components/LevelMap';
import LessonView from '~features/progression/components/LessonView';
import { useProgressStore } from '@/store/progress';
import { TIERS } from '@/data/tiers';
import { Level } from '@/types/level';

import FreeDraw from '~features/drawing/components/FreeDraw';
import ErrorBoundary from '~components/ui/ErrorBoundary';
import { ThemeProvider } from '~features/theming/ThemeContext';


function App() {
    const [view, setView] = useState<'map' | 'lesson' | 'freedraw'>('map');
    const [currentLevel, setCurrentLevel] = useState<Level | null>(null);
    const { completeLevel, unlockLevel } = useProgressStore();

    // Flatten levels for easy lookup
    const allLevels = useMemo(() => {
        return TIERS.flatMap(t => t.subTiers.flatMap(st => st.levels));
    }, []);

    const handleLevelSelect = (level: Level) => {
        setCurrentLevel(level);
        setView('lesson');
    };


    const handleBackToMap = () => {
        setCurrentLevel(null);
        setView('map');
    };

    const handleLevelComplete = (score: number) => {
        if (currentLevel) {
            completeLevel(currentLevel.id, score);
            const currentIdNum = parseInt(currentLevel.id.split('-')[1]);
            const nextLevelId = `level-${currentIdNum + 1}`;

            if (score >= currentLevel.requiredScore) {
                unlockLevel(nextLevelId);
            }
            setView('map');
            setCurrentLevel(null);
        }
    };

    const handleNextLevel = () => {
        if (currentLevel) {
            const currentIdNum = parseInt(currentLevel.id.split('-')[1]);
            const nextLevelId = `level-${currentIdNum + 1}`;
            const nextLevel = allLevels.find(l => l.id === nextLevelId);

            if (nextLevel) {
                setCurrentLevel(nextLevel);
            } else {
                setView('map'); // End of content or bug
                setCurrentLevel(null);
            }
        }
    };

    return (
        <ThemeProvider>
            <div className="min-h-screen bg-slate-50 overflow-hidden touch-none select-none">
                {view === 'map' && (
                    <ErrorBoundary>
                        <LevelMap
                            key="map"
                            onSelectLevel={handleLevelSelect}
                            onFreeDraw={() => setView('freedraw')}
                        />
                    </ErrorBoundary>
                )}

                {view === 'lesson' && currentLevel && (
                    <div className="fixed inset-0 z-10 bg-red-500">
                        <ErrorBoundary>
                            <LessonView
                                key="lesson"
                                level={currentLevel}
                                onBack={handleBackToMap}
                                onComplete={handleLevelComplete}
                                onNext={handleNextLevel}
                            />
                        </ErrorBoundary>
                    </div>
                )}

                {view === 'freedraw' && (
                    <div className="fixed inset-0 z-10 bg-white">
                        <ErrorBoundary>
                            <FreeDraw
                                key="freedraw"
                                onBack={handleBackToMap}
                            />
                        </ErrorBoundary>
                    </div>
                )}
                {/* PERSISTENT DEBUGGER */}
                <div className="fixed bottom-0 right-0 p-4 bg-black/80 text-white text-xs font-mono z-50 pointer-events-none">
                    VIEW: {view}<br />
                    LEVEL: {currentLevel ? currentLevel.id : 'null'}
                </div>
            </div>
        </ThemeProvider>
    );
}

export default App;
