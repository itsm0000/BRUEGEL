import { DrawingPoint } from '../features/drawing/utils/geometry';

export interface Level {
    id: string;
    title: string;
    description: string;
    points: DrawingPoint[]; // Explicit path data
    isClosed: boolean;      // Closed shape vs open line
    requiredScore: number;
    position: { x: number; y: number };
    tier: number;
    subTier: 'i' | 'ii' | 'iii';
}

export interface SubTier {
    id: 'i' | 'ii' | 'iii';
    title: string;
    description: string;
    levels: Level[];
}

export interface Tier {
    id: number;
    title: string;
    description: string;
    subTiers: SubTier[];
}
