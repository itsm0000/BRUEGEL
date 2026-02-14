import { Tier } from '../types/level';
import { LEVEL_PATHS } from './levelPaths';

export const TIERS: Tier[] = [
    {
        id: 1,
        title: "The Foundation",
        description: "Mastering the basics of form and control.",
        subTiers: [
            {
                id: 'i',
                title: "The Scratch",
                description: "Basic shapes and lines.",
                levels: [
                    {
                        ...LEVEL_PATHS['level-1'],
                        title: 'First Steps',
                        description: 'The journey begins with a single line.',
                        requiredScore: 90,
                        position: { x: 50, y: 90 },
                        tier: 1,
                        subTier: 'i'
                    },
                    {
                        ...LEVEL_PATHS['level-2'],
                        title: 'Horizon',
                        description: 'Steady your hand across the plane.',
                        requiredScore: 90,
                        position: { x: 40, y: 82 },
                        tier: 1,
                        subTier: 'i'
                    },
                    {
                        ...LEVEL_PATHS['level-3'],
                        title: 'The Corner',
                        description: 'Precision in changing direction.',
                        requiredScore: 85,
                        position: { x: 60, y: 75 },
                        tier: 1,
                        subTier: 'i'
                    },
                    {
                        ...LEVEL_PATHS['level-4'],
                        title: 'The Box',
                        description: 'Enclosing space perfectly.',
                        requiredScore: 85,
                        position: { x: 45, y: 68 },
                        tier: 1,
                        subTier: 'i'
                    },
                    {
                        ...LEVEL_PATHS['level-5'],
                        title: 'Triangulate',
                        description: 'Three points, absolute balance.',
                        requiredScore: 85,
                        position: { x: 55, y: 60 },
                        tier: 1,
                        subTier: 'i'
                    },
                    {
                        ...LEVEL_PATHS['level-6'],
                        title: 'The Peak',
                        description: 'Ascend and descend sharply.',
                        requiredScore: 85,
                        position: { x: 35, y: 55 },
                        tier: 1,
                        subTier: 'i'
                    },
                    {
                        ...LEVEL_PATHS['level-7'],
                        title: 'Parallelism',
                        description: 'Maintain the gap.',
                        requiredScore: 80,
                        tier: 1,
                        subTier: 'i',
                        position: { x: 65, y: 48 }
                    },
                    {
                        ...LEVEL_PATHS['level-8'],
                        title: 'The Grid',
                        description: 'Intersecting paths.',
                        requiredScore: 80,
                        tier: 1,
                        subTier: 'i',
                        position: { x: 50, y: 40 }
                    },
                    {
                        ...LEVEL_PATHS['level-9'],
                        title: 'Hexagon',
                        description: 'Complex polygon mastery.',
                        requiredScore: 80,
                        tier: 1,
                        subTier: 'i',
                        position: { x: 30, y: 30 }
                    },
                    {
                        ...LEVEL_PATHS['level-10'],
                        title: 'The Star',
                        description: 'The first true test of coordination.',
                        requiredScore: 75,
                        tier: 1,
                        subTier: 'i',
                        position: { x: 70, y: 20 }
                    }
                ]
            },
            {
                id: 'ii',
                title: "The Shape",
                description: "Intermediate forms.",
                levels: [
                    {
                        ...LEVEL_PATHS['level-11'],
                        title: 'The Arc',
                        description: 'A simple curve. Rotate your wrist.',
                        requiredScore: 80,
                        position: { x: 50, y: 90 },
                        tier: 1,
                        subTier: 'ii'
                    },
                    {
                        ...LEVEL_PATHS['level-12'],
                        title: 'The Wave',
                        description: 'Find your flow. Rhythm is key.',
                        requiredScore: 80,
                        position: { x: 30, y: 82 },
                        tier: 1,
                        subTier: 'ii'
                    },
                    {
                        ...LEVEL_PATHS['level-13'],
                        title: 'The Circle',
                        description: 'The perfect loop. No corners.',
                        requiredScore: 85,
                        position: { x: 70, y: 74 },
                        tier: 1,
                        subTier: 'ii'
                    },
                    {
                        ...LEVEL_PATHS['level-14'],
                        title: 'The S-Curve',
                        description: 'Change direction smoothly.',
                        requiredScore: 85,
                        position: { x: 40, y: 66 },
                        tier: 1,
                        subTier: 'ii'
                    },
                    {
                        ...LEVEL_PATHS['level-15'],
                        title: 'The Spiral',
                        description: 'Tightening radius. Focus.',
                        requiredScore: 85,
                        position: { x: 60, y: 58 },
                        tier: 1,
                        subTier: 'ii'
                    },
                    {
                        ...LEVEL_PATHS['level-16'],
                        title: 'The Leaf',
                        description: 'Curve meets point.',
                        requiredScore: 90,
                        position: { x: 50, y: 50 },
                        tier: 1,
                        subTier: 'ii'
                    },
                    {
                        ...LEVEL_PATHS['level-17'],
                        title: 'The Cloud',
                        description: 'Linking arcs together.',
                        requiredScore: 90,
                        tier: 1,
                        subTier: 'ii',
                        position: { x: 30, y: 42 }
                    },
                    {
                        ...LEVEL_PATHS['level-18'],
                        title: 'The Ribbon',
                        description: 'Overlapping lines creating depth.',
                        requiredScore: 90,
                        tier: 1,
                        subTier: 'ii',
                        position: { x: 70, y: 34 }
                    },
                    {
                        ...LEVEL_PATHS['level-19'],
                        title: 'Pressure: Fade',
                        description: 'Control your weight.',
                        requiredScore: 95,
                        tier: 1,
                        subTier: 'ii',
                        position: { x: 50, y: 26 }
                    },
                    {
                        ...LEVEL_PATHS['level-20'],
                        title: 'Mastery: The Eye',
                        description: 'The final test of Tier II.',
                        requiredScore: 95,
                        tier: 1,
                        subTier: 'ii',
                        position: { x: 30, y: 18 }
                    }
                ]
            }
        ]
    }
];
