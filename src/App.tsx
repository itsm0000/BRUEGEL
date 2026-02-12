import { useState } from 'react';
import LevelMap from './components/Gamification/LevelMap';
import LessonView from './components/Gamification/LessonView';
import { useProgressStore } from './store/progress';
import { Level, LEVELS } from './data/levels';

import FreeDraw from './components/Gamification/FreeDraw';
import ErrorBoundary from './components/ErrorBoundary';


function App() {
    const [view, setView] = useState<'map' | 'lesson' | 'freedraw'>('map');
    const [currentLevel, setCurrentLevel] = useState<Level | null>(null);
    const { completeLevel, unlockLevel } = useProgressStore();

    const handleLevelSelect = (level: Level) => {
        setCurrentLevel(level);
        setView('lesson');
    };


    const handleBackToMap = () => { // Renamed handleBack to handleBackToMap for clarity with new view state
        setCurrentLevel(null);
        setView('map'); // Set view to map
    };

    const handleLevelComplete = (score: number) => { // New handler for lesson completion
        if (currentLevel) {
            completeLevel(currentLevel.id, score);
            const currentIdNum = parseInt(currentLevel.id.split('-')[1]);
            const nextLevelId = `level-${currentIdNum + 1}`;

            if (score >= currentLevel.requiredScore) {
                unlockLevel(nextLevelId);
            }
            setView('map'); // Go back to map after completion
            setCurrentLevel(null);
        }
    };

    const handleNextLevel = () => { // New handler for navigating to the next level
        if (currentLevel) {
            const currentIdNum = parseInt(currentLevel.id.split('-')[1]);
            const nextLevel = LEVELS.find(l => l.id === `level-${currentIdNum + 1}`);
            if (nextLevel) {
                setCurrentLevel(nextLevel);
            } else {
                setView('map'); // If no next level, go back to map
                setCurrentLevel(null);
            }
        }
    };

    return (
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
    );
}

export default App;
