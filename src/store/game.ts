import { create } from 'zustand';

// Streak threshold: accuracy (0-100) above which a stroke counts as "perfect"
export const STREAK_THRESHOLD = 85;

interface GameState {
    // Phase 1: Core Crunch
    isPaused: boolean;
    pauseDuration: number;
    shakeIntensity: number;

    // Phase 3: Streaks
    streak: number;
    maxStreak: number;

    // Phase 5: Variable Rewards
    lastRewardType: 'standard' | 'bonus' | 'jackpot';

    // Real-time drawing state (avoids React renders)
    isDrawing: boolean;
    currentAccuracy: number;
    cumulativeAccuracy: number; // Running average for ambient music layers

    // Derived getters (computed from streak)
    // These are accessed via getState() not subscribed
    // streak >= 3 = fire trail, streak >= 5 = canvas glow

    // Actions
    triggerHitStop: (durationMs: number) => void;
    addShake: (intensity: number) => void;
    incrementStreak: () => void;
    breakStreak: () => void;
    setIsDrawing: (drawing: boolean) => void;
    setCurrentAccuracy: (accuracy: number) => void;
    updateCumulativeAccuracy: (strokeAccuracy: number) => void;
    setLastRewardType: (type: 'standard' | 'bonus' | 'jackpot') => void;
    resetGameState: () => void;
}

export const useGameStore = create<GameState>((set) => ({
    isPaused: false,
    pauseDuration: 0,
    shakeIntensity: 0,
    streak: 0,
    maxStreak: 0,
    lastRewardType: 'standard',
    isDrawing: false,
    currentAccuracy: 0,
    cumulativeAccuracy: 0,

    triggerHitStop: (durationMs) => {
        set({ isPaused: true, pauseDuration: durationMs });
        setTimeout(() => {
            set({ isPaused: false });
        }, durationMs);
    },
    addShake: (intensity) => set((state) => ({ shakeIntensity: Math.min(state.shakeIntensity + intensity, 1.0) })),
    incrementStreak: () => set((state) => ({
        streak: state.streak + 1,
        maxStreak: Math.max(state.maxStreak, state.streak + 1),
    })),
    breakStreak: () => set({ streak: 0 }),
    setIsDrawing: (drawing) => set({ isDrawing: drawing }),
    setCurrentAccuracy: (accuracy) => set({ currentAccuracy: accuracy }),
    updateCumulativeAccuracy: (strokeAccuracy) => set((state) => ({
        cumulativeAccuracy: state.cumulativeAccuracy === 0
            ? strokeAccuracy
            : state.cumulativeAccuracy * 0.7 + strokeAccuracy * 0.3, // Exponential moving average
    })),
    setLastRewardType: (type) => set({ lastRewardType: type }),
    resetGameState: () => set({
        streak: 0,
        maxStreak: 0,
        cumulativeAccuracy: 0,
        lastRewardType: 'standard',
    }),
}));

// Helper to check fire/glow state without subscribing
export const isOnFire = () => useGameStore.getState().streak >= 3;
export const isGlowing = () => useGameStore.getState().streak >= 5;
