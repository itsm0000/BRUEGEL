import { describe, it, expect, beforeEach } from 'vitest';
import { useProgressStore } from '../progress';

describe('Progress Store', () => {
    // Reset store before each test
    beforeEach(() => {
        useProgressStore.persist.clearStorage();
        useProgressStore.setState({
            progress: {
                'level-1': { score: 0, stars: 0, unlocked: true }
            },
            currentLevelId: 'level-1',
            currentTier: 1
        });
    });

    it('should have initial state correct', () => {
        const state = useProgressStore.getState();
        expect(state.progress['level-1'].unlocked).toBe(true);
        expect(state.progress['level-2']).toBeUndefined();
    });

    it('should unlock a level', () => {
        useProgressStore.getState().unlockLevel('level-2');
        const state = useProgressStore.getState();
        expect(state.progress['level-2']).toBeDefined();
        expect(state.progress['level-2'].unlocked).toBe(true);
    });

    it('should update score and stars on completion', () => {
        // High score
        useProgressStore.getState().completeLevel('level-1', 95);
        let state = useProgressStore.getState();
        expect(state.progress['level-1'].score).toBe(95);
        expect(state.progress['level-1'].stars).toBe(3);

        // Lower score shouldn't overwrite
        useProgressStore.getState().completeLevel('level-1', 50);
        state = useProgressStore.getState();
        expect(state.progress['level-1'].score).toBe(95);
    });

    it('should reset progress', () => {
        // Change state
        useProgressStore.getState().completeLevel('level-1', 100);
        useProgressStore.getState().unlockLevel('level-2');

        // Reset
        useProgressStore.getState().resetProgress();

        const state = useProgressStore.getState();
        expect(state.progress['level-1'].score).toBe(0);
        expect(state.progress['level-2']).toBeUndefined();
    });
});
