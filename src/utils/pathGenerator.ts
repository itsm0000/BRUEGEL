import { generateCirclePath, generateLinePath, generatePolygonPath, Path, DrawingPoint } from './geometry';

export type LessonType = 'line' | 'circle' | 'triangle' | 'square' | 'polygon' | 'wave' | 'spiral' | 'star' | 'heart' | 'loop';

export const generateLessonPath = (type: LessonType, width: number, height: number, params?: any): Path => {
    const minDim = Math.min(width, height);
    const cx = width / 2;
    const cy = height / 2;

    switch (type) {
        case 'circle':
            return generateCirclePath(cx, cy, minDim / 4);

        case 'line':
            const margin = 100;
            return generateLinePath(margin, cy, width - margin, cy);

        case 'triangle':
            return generatePolygonPath(cx, cy, minDim / 4, 3);

        case 'square':
            return generatePolygonPath(cx, cy, minDim / 4, 4);

        case 'polygon':
            return generatePolygonPath(cx, cy, minDim / 4, params?.sides || 5);

        case 'wave':
            return generateWavePath(width, height);

        case 'spiral':
            return generateSpiralPath(cx, cy, minDim / 3);

        case 'star':
            return generateStarPath(cx, cy, minDim / 3, 5);

        case 'heart':
            return generateHeartPath(cx, cy, minDim / 2.5);

        case 'loop':
            return generateInfinityLoopPath(cx, cy, minDim / 2.5);

        default:
            return generateCirclePath(cx, cy, minDim / 5);
    }
};

// --- New Generators ---

const generateWavePath = (width: number, height: number): Path => {
    const points: DrawingPoint[] = [];
    const amplitude = height / 6;
    const frequency = 2; // Number of full waves
    const margin = 50;
    const drawWidth = width - 2 * margin;

    for (let i = 0; i <= 100; i++) {
        const t = i / 100;
        const x = margin + t * drawWidth;
        const y = height / 2 + Math.sin(t * Math.PI * 2 * frequency) * amplitude;
        points.push({ x, y, pressure: 0.5 });
    }
    return { points, isClosed: false };
};

const generateSpiralPath = (cx: number, cy: number, maxRadius: number): Path => {
    const points: DrawingPoint[] = [];
    const loops = 3;
    const steps = 200;

    for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        const angle = t * Math.PI * 2 * loops;
        const radius = t * maxRadius;
        const x = cx + Math.cos(angle) * radius;
        const y = cy + Math.sin(angle) * radius;
        points.push({ x, y, pressure: 0.5 });
    }
    return { points, isClosed: false };
};

const generateStarPath = (cx: number, cy: number, outerRadius: number, pointsCount: number): Path => {
    const points: DrawingPoint[] = [];
    const innerRadius = outerRadius * 0.4;
    const angleStep = Math.PI / pointsCount;

    for (let i = 0; i < 2 * pointsCount; i++) {
        const r = i % 2 === 0 ? outerRadius : innerRadius;
        const angle = i * angleStep - Math.PI / 2; // Start at top
        const x = cx + Math.cos(angle) * r;
        const y = cy + Math.sin(angle) * r;
        points.push({ x, y, pressure: 0.5 });
    }

    // Close the loop
    const first = points[0];
    points.push({ ...first });

    return { points, isClosed: true };
};

const generateHeartPath = (cx: number, cy: number, size: number): Path => {
    const points: DrawingPoint[] = [];
    const steps = 100;

    // Parametric Heart Equation
    // x = 16sin^3(t)
    // y = 13cos(t) - 5cos(2t) - 2cos(3t) - cos(4t)
    // Need to flip Y because canvas Y grows downwards

    for (let i = 0; i <= steps; i++) {
        const t = (i / steps) * Math.PI * 2;

        // Basic shape is roughly -16 to +16 in X, -17 to +12 in Y
        // Scale factor needs to align with 'size'
        const scale = size / 35;

        const x = cx + scale * (16 * Math.pow(Math.sin(t), 3));
        const y = cy - scale * (13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));

        points.push({ x, y, pressure: 0.5 });
    }
    return { points, isClosed: true };
};

const generateInfinityLoopPath = (cx: number, cy: number, size: number): Path => {
    const points: DrawingPoint[] = [];
    const steps = 100;

    // Lemniscate of Bernoulli
    // x = (a * cos(t)) / (1 + sin^2(t))
    // y = (a * sin(t) * cos(t)) / (1 + sin^2(t))

    for (let i = 0; i <= steps; i++) {
        const t = (i / steps) * Math.PI * 2;
        const denom = 1 + Math.pow(Math.sin(t), 2);

        // Scale 'a' determines width
        const a = size * 1.5;

        const x = cx + (a * Math.cos(t)) / denom;
        const y = cy + (a * Math.sin(t) * Math.cos(t)) / denom;

        points.push({ x, y, pressure: 0.5 });
    }
    return { points, isClosed: true };
};
