import fs from 'fs';
import path from 'path';

// Types
interface Point { x: number; y: number; pressure: number; }
interface LevelPathData { id: string; points: Point[]; isClosed: boolean; }

// Configuration
const CANVAS_SIZE = 1000;
const CENTER = CANVAS_SIZE / 2;
const PADDING = 200;

// Helpers
const createLine = (start: Point, end: Point, steps = 20): Point[] => {
    const points: Point[] = [];
    for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        points.push({
            x: start.x + (end.x - start.x) * t,
            y: start.y + (end.y - start.y) * t,
            pressure: 0.5
        });
    }
    return points;
};

const createPoly = (sides: number, radius: number, rotationDeg = 0): Point[] => {
    const points: Point[] = [];
    const step = (Math.PI * 2) / sides;
    const startAngle = (rotationDeg * Math.PI) / 180 - Math.PI / 2; // -PI/2 to start at top

    for (let i = 0; i <= sides; i++) {
        const angle = startAngle + step * i;
        points.push({
            x: CENTER + Math.cos(angle) * radius,
            y: CENTER + Math.sin(angle) * radius,
            pressure: 0.5
        });
    }
    return points;
};

// Level Generators
const levels: LevelPathData[] = [];

// 01. First Steps (Vertical Line)
levels.push({
    id: 'level-1',
    isClosed: false,
    points: createLine({ x: CENTER, y: PADDING, pressure: 0.5 }, { x: CENTER, y: CANVAS_SIZE - PADDING, pressure: 0.5 })
});

// 02. Horizon (Horizontal Line)
levels.push({
    id: 'level-2',
    isClosed: false,
    points: createLine({ x: PADDING, y: CENTER, pressure: 0.5 }, { x: CANVAS_SIZE - PADDING, y: CENTER, pressure: 0.5 })
});

// 03. The Corner (L Shape)
levels.push({
    id: 'level-3',
    isClosed: false,
    points: [
        ...createLine({ x: PADDING, y: PADDING, pressure: 0.5 }, { x: PADDING, y: CANVAS_SIZE - PADDING, pressure: 0.5 }),
        ...createLine({ x: PADDING, y: CANVAS_SIZE - PADDING, pressure: 0.5 }, { x: CANVAS_SIZE - PADDING, y: CANVAS_SIZE - PADDING, pressure: 0.5 }).slice(1)
    ]
});

// 04. The Box (Square)
levels.push({
    id: 'level-4',
    isClosed: true,
    points: createPoly(4, 300, 45) // 45deg rotation to make it a square not diamond (creates flat top/bottom? No, 45 makes diamond. 0 makes diamond? Let's check logic: cos(-90) = 0, y top. cos(0) x right. Square needs 45 deg offset usually if vertex aligned. Actually, poly logic starts at top. 4 sides = Diamond. 45 deg = Square.)
    // Wait, cos(-90) is 0, sin(-90) is -1 (Top). So vertex at top.
    // 4 sides starting at top = Diamond.
    // To get flat top box, we need to rotate 45 degrees.
});

// 05. Triangulate (Triangle)
levels.push({
    id: 'level-5',
    isClosed: true,
    points: createPoly(3, 300, 0)
});

// 06. The Peak (Chevron / ^ )
// Just top two sides of a triangle? Or explicit path.
levels.push({
    id: 'level-6',
    isClosed: false,
    points: [
        ...createLine({ x: PADDING, y: CANVAS_SIZE - PADDING, pressure: 0.5 }, { x: CENTER, y: PADDING, pressure: 0.5 }),
        ...createLine({ x: CENTER, y: PADDING, pressure: 0.5 }, { x: CANVAS_SIZE - PADDING, y: CANVAS_SIZE - PADDING, pressure: 0.5 }).slice(1)
    ]
});

// 07. Parallelism (Two lines) -> Note: Our engine only supports ONE continuous path currently. 
// We will modify this to be a single U shape or Z shape for now, OR we need to verify if DrawingCanvas supports multi-stroke.
// DrawingCanvas expects `ghostPath` which is one `Path`. 
// Hack: Connect them with a line? No, that ruins the lesson.
// Alt: A "Z" shape or "N" shape. Let's do "N".
levels.push({
    id: 'level-7',
    isClosed: false,
    points: [
        ...createLine({ x: PADDING + 100, y: CANVAS_SIZE - PADDING, pressure: 0.5 }, { x: PADDING + 100, y: PADDING, pressure: 0.5 }),
        ...createLine({ x: PADDING + 100, y: PADDING, pressure: 0.5 }, { x: CANVAS_SIZE - PADDING - 100, y: CANVAS_SIZE - PADDING, pressure: 0.5 }).slice(1),
        ...createLine({ x: CANVAS_SIZE - PADDING - 100, y: CANVAS_SIZE - PADDING, pressure: 0.5 }, { x: CANVAS_SIZE - PADDING - 100, y: PADDING, pressure: 0.5 }).slice(1)
    ]
});

// 08. The Grid (Plus Sign) - Again, multi-stroke issue.
// Convert to a continuous path that traces a cross? Like an "X" without lifting?
// Let's do an "X" shape (Cross). 
levels.push({
    id: 'level-8',
    isClosed: false,
    points: [
        ...createLine({ x: PADDING, y: PADDING, pressure: 0.5 }, { x: CANVAS_SIZE - PADDING, y: CANVAS_SIZE - PADDING, pressure: 0.5 }),
        // We can't jump. We have to retrace or do a different shape.
        // Let's change "The Grid" to "Zig Zag" for continuous contact.
        // Or "The Staircase".
        ...createLine({ x: CANVAS_SIZE - PADDING, y: CANVAS_SIZE - PADDING, pressure: 0.5 }, { x: CANVAS_SIZE - PADDING, y: PADDING, pressure: 0.5 }).slice(1),
        ...createLine({ x: CANVAS_SIZE - PADDING, y: PADDING, pressure: 0.5 }, { x: PADDING, y: CANVAS_SIZE - PADDING, pressure: 0.5 }).slice(1)
    ]
    // This is an hourglass/bow-tie. Good enough for complexity.
});

// 09. Hexagon
levels.push({
    id: 'level-9',
    isClosed: true,
    points: createPoly(6, 300, 0) // Vertex at top
});

// 10. The Star
const createStar = (pointsCount: number, outerRadius: number, innerRadius: number): Point[] => {
    const points: Point[] = [];
    const step = Math.PI / pointsCount;
    const startAngle = -Math.PI / 2;

    for (let i = 0; i <= pointsCount * 2; i++) {
        const angle = startAngle + step * i;
        const radius = i % 2 === 0 ? outerRadius : innerRadius;
        points.push({
            x: CENTER + Math.cos(angle) * radius,
            y: CENTER + Math.sin(angle) * radius,
            pressure: 0.5
        });
    }
    return points;
};

levels.push({
    id: 'level-10',
    isClosed: true,
    points: createStar(5, 300, 150)
});


// Output File Content
const content = `import { DrawingPoint } from '~utils/geometry';

export interface LevelPathData {
    id: string;
    points: DrawingPoint[];
    isClosed: boolean;
}

export const LEVEL_PATHS: Record<string, LevelPathData> = {
${levels.map(l => `    '${l.id}': ${JSON.stringify(l)}`).join(',\n')}
};
`;

const OUTPUT_PATH = path.join(__dirname, '../src/data/levelPaths.ts');
fs.writeFileSync(OUTPUT_PATH, content);
console.log(`✅ Generated Tier 1 Paths at ${OUTPUT_PATH}`);
