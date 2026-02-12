// Path removed

import { LessonType } from '../utils/pathGenerator';

// Removed local LessonType definition to use the centralized one

export interface Level {
    id: string;
    title: string;
    description: string;
    type: LessonType;
    parameters?: any; // Specific params for generation (e.g. radius, sides)
    requiredScore: number; // Score needed to unlock next
    position: { x: number; y: number }; // For map layout (0-100%)
}

export const LEVELS: Level[] = [
    {
        id: 'level-1',
        title: 'First Steps',
        description: 'Draw a straight line to connect the dots.',
        type: 'line',
        requiredScore: 70,
        position: { x: 50, y: 90 }
    },
    {
        id: 'level-2',
        title: 'The Trinity',
        description: 'Master the three corners of a triangle.',
        type: 'triangle',
        requiredScore: 75,
        position: { x: 30, y: 72 }
    },
    {
        id: 'level-3',
        title: 'Four Walls',
        description: 'Draw a perfect square. Keep corners sharp.',
        type: 'square',
        requiredScore: 75,
        position: { x: 70, y: 55 }
    },
    {
        id: 'level-4',
        title: 'Circle of Life',
        description: 'The hardest shape. Trace the circle continuously.',
        type: 'circle',
        requiredScore: 80,
        position: { x: 40, y: 38 }
    },
    {
        id: 'level-5',
        title: 'Pentagon Power',
        description: 'Advance to 5-sided polygons.',
        type: 'polygon',
        parameters: { sides: 5 },
        requiredScore: 80,
        position: { x: 60, y: 22 }
    },
    {
        id: 'level-6',
        title: 'The Wave',
        description: 'Find your flow. Trace the sine wave.',
        type: 'wave',
        requiredScore: 80,
        position: { x: 50, y: 5 }
    },
    {
        id: 'level-7',
        title: 'Star Power',
        description: 'Sharp angles and intersecting lines.',
        type: 'star',
        requiredScore: 85,
        position: { x: 30, y: -15 }
    },
    {
        id: 'level-8',
        title: 'Hypnotic Spiral',
        description: 'Control your radius. Don\'t get dizzy.',
        type: 'spiral',
        requiredScore: 85,
        position: { x: 70, y: -35 }
    },
    {
        id: 'level-9',
        title: 'Heart of Gold',
        description: 'Feel the rhythm. Trace the symmetry.',
        type: 'heart',
        requiredScore: 90,
        position: { x: 50, y: -55 }
    },
    {
        id: 'level-10',
        title: 'Infinity & Beyond',
        description: 'The loop that never ends.',
        type: 'loop',
        requiredScore: 90,
        position: { x: 30, y: -75 }
    }
];
