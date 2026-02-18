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
    subTier: 'i' | 'ii' | 'iii' | 'tier-1-1' | 'tier-1-2' | 'tier-1-3';
}

export interface SubTier {
    id: 'i' | 'ii' | 'iii' | 'tier-1-1' | 'tier-1-2' | 'tier-1-3';
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
