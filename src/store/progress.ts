import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface LevelProgress {
    score: number;
    stars: 0 | 1 | 2 | 3;
    unlocked: boolean;
}

interface ProgressState {
    progress: Record<string, LevelProgress>;
    currentLevelId: string;

    // Actions
    completeLevel: (levelId: string, score: number) => void;
    unlockLevel: (levelId: string) => void;
    unlockAll: () => void;
    setCurrentLevel: (levelId: string) => void;
    resetProgress: () => void;
}

export const useProgressStore = create<ProgressState>()(
    persist(
        (set) => ({
            progress: {
                'level-1': { score: 0, stars: 0, unlocked: true } // Level 1 always unlocked
            },
            currentLevelId: 'level-1',

            completeLevel: (levelId, score) => {
                set((state) => {
                    const prev = state.progress[levelId] || { score: 0, stars: 0, unlocked: false };

                    // Calculate stars based on score
                    let stars: 0 | 1 | 2 | 3 = 0;
                    if (score >= 90) stars = 3;
                    else if (score >= 80) stars = 2;
                    else if (score >= 60) stars = 1;

                    // Only update if better score
                    if (score > prev.score) {
                        return {
                            progress: {
                                ...state.progress,
                                [levelId]: { ...prev, score, stars }
                            }
                        };
                    }
                    return {};
                });
            },

            unlockLevel: (levelId) => {
                set((state) => ({
                    progress: {
                        ...state.progress,
                        [levelId]: {
                            ...(state.progress[levelId] || { score: 0, stars: 0 }),
                            unlocked: true
                        }
                    }
                }));
            },

            unlockAll: () => {
                const allLevels: Record<string, LevelProgress> = {};
                // Unlock levels 1 to 10
                for (let i = 1; i <= 10; i++) {
                    allLevels[`level-${i}`] = { score: 0, stars: 3, unlocked: true };
                }
                set({ progress: allLevels });
            },

            setCurrentLevel: (levelId) => set({ currentLevelId: levelId }),

            resetProgress: () => set({
                progress: { 'level-1': { score: 0, stars: 0, unlocked: true } },
                currentLevelId: 'level-1'
            })
        }),
        {
            name: 'ghostflow-progress', // LocalStorage key
        }
    )
);
