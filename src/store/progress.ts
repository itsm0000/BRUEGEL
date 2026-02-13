import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { TIERS } from '@/data/tiers';

export interface LevelProgress {
    score: number;
    stars: 0 | 1 | 2 | 3;
    unlocked: boolean;
}

interface ProgressState {
    progress: Record<string, LevelProgress>;
    currentLevelId: string;
    currentTier: number; // New: Track current tier

    // Actions
    completeLevel: (levelId: string, score: number) => void;
    unlockLevel: (levelId: string) => void;
    unlockAll: () => void;
    setCurrentLevel: (levelId: string) => void;
    resetProgress: () => void;
}

// Helper to get all level IDs
const getAllLevelIds = () => {
    return TIERS.flatMap(t => t.subTiers.flatMap(st => st.levels.map(l => l.id)));
};

export const useProgressStore = create<ProgressState>()(
    persist(
        (set) => ({
            progress: {
                'level-1': { score: 0, stars: 0, unlocked: true } // Level 1 always unlocked
            },
            currentLevelId: 'level-1',
            currentTier: 1,

            completeLevel: (levelId, score) => {
                set((state) => {
                    const prev = state.progress[levelId] || { score: 0, stars: 0, unlocked: false };

                    // Calculate stars based on score
                    // TODO: Custom thresholds per level? For now, global.
                    let stars: 0 | 1 | 2 | 3 = 0;
                    if (score >= 95) stars = 3; // Stricter for mastery? 
                    // Let's keep it standard for now: 90, 80, 60?
                    // Tier 1 uses 90/85/80. Tier 2 uses 90/85/80. 
                    // Let's use the level's own requiredScore for passing (1 star), 
                    // but we don't have level data here. 
                    // We'll stick to a generic "Gold/Silver/Bronze" for now.
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
                getAllLevelIds().forEach(id => {
                    allLevels[id] = { score: 0, stars: 3, unlocked: true };
                });
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
