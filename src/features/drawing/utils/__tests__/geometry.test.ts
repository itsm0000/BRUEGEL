import { describe, it, expect } from 'vitest';
import {
    distance,
    lerp,
    generateLinePath,
    calculateDeviation,
    calculateScore
} from '../geometry';

describe('Geometry Utilities', () => {
    describe('distance', () => {
        it('should calculate Euclidean distance correctly', () => {
            const p1 = { x: 0, y: 0 };
            const p2 = { x: 3, y: 4 };
            expect(distance(p1, p2)).toBe(5);
        });

        it('should return 0 for same point', () => {
            const p = { x: 10, y: 10 };
            expect(distance(p, p)).toBe(0);
        });
    });

    describe('lerp', () => {
        it('should interpolate correctly', () => {
            expect(lerp(0, 10, 0.5)).toBe(5);
            expect(lerp(0, 10, 0)).toBe(0);
            expect(lerp(0, 10, 1)).toBe(10);
        });
    });

    describe('generateLinePath', () => {
        it('should generate a path with correct start and end points', () => {
            const path = generateLinePath(0, 0, 100, 100, 10);
            expect(path.points).toHaveLength(11); // 0 to 10 inclusive
            expect(path.points[0]).toMatchObject({ x: 0, y: 0 });
            expect(path.points[10]).toMatchObject({ x: 100, y: 100 });
        });
    });

    describe('calculateDeviation', () => {
        it('should find minimum distance to path', () => {
            // Horizontal line from 0,0 to 100,0
            const path = generateLinePath(0, 0, 100, 0, 10);
            const point = { x: 50, y: 10 };

            // Should be exactly 10 units away (at x=50, y=0)
            const dev = calculateDeviation(point, path);
            expect(dev).toBeCloseTo(10);
        });
    });

    describe('calculateScore', () => {
        // Create a standard test path (vertical line)
        const ghostPath = generateLinePath(0, 0, 0, 100, 100);

        it('should return 100 for perfect match', () => {
            // User draws exactly the same points
            const userPoints = ghostPath.points.map(p => ({ x: p.x, y: p.y }));
            const score = calculateScore(userPoints, ghostPath);
            // Floating point math might make it 99.999...
            expect(score).toBeGreaterThanOrEqual(99);
        });

        it('should return 0 for empty input', () => {
            expect(calculateScore([], ghostPath)).toBe(0);
        });

        it('should penalize deviation', () => {
            // User draws line offset by 20px
            const userPoints = ghostPath.points.map(p => ({ x: p.x + 20, y: p.y }));
            const score = calculateScore(userPoints, ghostPath);

            // Expected penalty:
            // Precision: Avg dist = 20. Score = 100 - (20 * 2.5) = 50
            // Coverage: 100% (if threshold > 20) -> Threshold is 20 in code.
            // If distance is exactly 20, it checks < 20, so might fail coverage?
            // Let's use offset 10px just to be safe on coverage but hit precision penalty.
            // Offset 10px: Precision = 100 - (10 * 2.5) = 75. 
            // Coverage should be 100%. 
            // Final = (75 * 0.4) + (100 * 0.6) = 30 + 60 = 90.

            const offset10Points = ghostPath.points.map(p => ({ x: p.x + 10, y: p.y }));
            const score10 = calculateScore(offset10Points, ghostPath);

            expect(score10).toBeLessThan(100);
            expect(score10).toBeGreaterThan(50);
            expect(score).toBeLessThan(score10); // Higher deviation = lower score
        });
    });
});
