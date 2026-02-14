import { describe, it, expect } from 'vitest';
import { TIERS } from '../tiers';
import { LEVEL_PATHS } from '../levelPaths';

describe('Data Integrity', () => {
    describe('TIERS Configuration', () => {
        it('should have valid tiers defined', () => {
            expect(TIERS).toBeInstanceOf(Array);
            expect(TIERS.length).toBeGreaterThan(0);
        });

        it('should have unique level IDs across all tiers', () => {
            const levelIds = new Set<string>();
            const duplicates: string[] = [];

            TIERS.forEach(tier => {
                tier.subTiers.forEach(subTier => {
                    subTier.levels.forEach(level => {
                        if (levelIds.has(level.id)) {
                            duplicates.push(level.id);
                        }
                        levelIds.add(level.id);
                    });
                });
            });

            expect(duplicates).toHaveLength(0);
        });
    });

    describe('Level Paths', () => {
        it('should have points for every level in TIERS', () => {
            TIERS.forEach(tier => {
                tier.subTiers.forEach(subTier => {
                    subTier.levels.forEach(level => {
                        // Because TIERS spreads LEVEL_PATHS, if it was missing, level.points might be undefined
                        expect(level.points).toBeDefined();
                        expect(Array.isArray(level.points)).toBe(true);
                        expect(level.points.length).toBeGreaterThan(0);
                    });
                });
            });
        });

        it('should not contain NaN coordinates', () => {
            Object.entries(LEVEL_PATHS).forEach(([id, data]) => {
                data.points.forEach((p, idx) => {
                    if (Number.isNaN(p.x) || Number.isNaN(p.y)) {
                        throw new Error(`Level ${id} has NaN at point index ${idx}: ${JSON.stringify(p)}`);
                    }
                });
            });
        });
    });
});
