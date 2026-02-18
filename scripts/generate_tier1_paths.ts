import fs from 'fs';
import path from 'path';

// Types
interface Point { x: number; y: number; pressure: number; }
interface LevelPathData { id: string; points: Point[]; isClosed: boolean; }

// Configuration
const CANVAS_SIZE = 1000;
const CENTER = CANVAS_SIZE / 2;
const PADDING = 200;

// Sentinel Value for "Pen Lift" / "Move To"
const SENTINEL: Point = { x: -1, y: -1, pressure: 0 };

// Helpers
const createLine = (start: { x: number, y: number, pressure?: number }, end: { x: number, y: number, pressure?: number }, steps = 20): Point[] => {
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

const createPoly = (sides: number, radius: number, rotationDeg = 0, center: { x: number, y: number, pressure?: number } = { x: CENTER, y: CENTER }): Point[] => {
    const points: Point[] = [];
    const step = (Math.PI * 2) / sides;
    const startAngle = (rotationDeg * Math.PI) / 180 - Math.PI / 2;

    for (let i = 0; i <= sides; i++) {
        const angle = startAngle + step * i;
        points.push({
            x: center.x + Math.cos(angle) * radius,
            y: center.y + Math.sin(angle) * radius,
            pressure: 0.5
        });
    }
    return points;
};

const createCircle = (radius: number, center: { x: number, y: number, pressure?: number } = { x: CENTER, y: CENTER }, steps = 60): Point[] => {
    const points: Point[] = [];
    for (let i = 0; i <= steps; i++) {
        const angle = (i / steps) * Math.PI * 2 - Math.PI / 2;
        points.push({
            x: center.x + Math.cos(angle) * radius,
            y: center.y + Math.sin(angle) * radius,
            pressure: 0.5
        });
    }
    return points;
};

const createArc = (start: { x: number, y: number, pressure?: number }, control: { x: number, y: number, pressure?: number }, end: { x: number, y: number, pressure?: number }, steps = 30): Point[] => {
    const points: Point[] = [];
    for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        // Quadratic Bezier
        const x = (1 - t) * (1 - t) * start.x + 2 * (1 - t) * t * control.x + t * t * end.x;
        const y = (1 - t) * (1 - t) * start.y + 2 * (1 - t) * t * control.y + t * t * end.y;
        points.push({ x, y, pressure: 0.5 });
    }
    return points;
};

// Level Generators
const levels: LevelPathData[] = [];

// --- SubTier 1.1: First Marks (Levels 1-10) ---

// 1. Horizontal Line
levels.push({
    id: 't1-l1',
    isClosed: false,
    points: createLine({ x: 100, y: 500, pressure: 0.5 }, { x: 900, y: 500, pressure: 0.5 })
});

// 2. Vertical Line
levels.push({
    id: 't1-l2',
    isClosed: false,
    points: createLine({ x: 500, y: 100, pressure: 0.5 }, { x: 500, y: 900, pressure: 0.5 })
});

// 3. Diagonal TL-BR
levels.push({
    id: 't1-l3',
    isClosed: false,
    points: createLine({ x: 150, y: 150, pressure: 0.5 }, { x: 850, y: 850, pressure: 0.5 })
});

// 4. Diagonal TR-BL
levels.push({
    id: 't1-l4',
    isClosed: false,
    points: createLine({ x: 850, y: 150, pressure: 0.5 }, { x: 150, y: 850, pressure: 0.5 })
});

// 5. Simple Arc (Smile)
levels.push({
    id: 't1-l5',
    isClosed: false,
    points: createArc({ x: 200, y: 700, pressure: 0.5 }, { x: 500, y: 300, pressure: 0.5 }, { x: 800, y: 700, pressure: 0.5 })
});

// 6. Wave
levels.push({
    id: 't1-l6',
    isClosed: false,
    points: [
        ...createArc({ x: 200, y: 500, pressure: 0.5 }, { x: 300, y: 300, pressure: 0.5 }, { x: 400, y: 500, pressure: 0.5 }),
        ...createArc({ x: 400, y: 500, pressure: 0.5 }, { x: 500, y: 700, pressure: 0.5 }, { x: 600, y: 500, pressure: 0.5 }).slice(1),
        ...createArc({ x: 600, y: 500, pressure: 0.5 }, { x: 700, y: 300, pressure: 0.5 }, { x: 800, y: 500, pressure: 0.5 }).slice(1)
    ]
});

// 7. Zigzag
levels.push({
    id: 't1-l7',
    isClosed: false,
    points: [
        ...createLine({ x: 200, y: 300, pressure: 0.5 }, { x: 400, y: 700, pressure: 0.5 }),
        ...createLine({ x: 400, y: 700, pressure: 0.5 }, { x: 600, y: 300, pressure: 0.5 }).slice(1),
        ...createLine({ x: 600, y: 300, pressure: 0.5 }, { x: 800, y: 700, pressure: 0.5 }).slice(1)
    ]
});

// 8. Spiral (Archimedean)
const createSpiral = (startRadius: number, turns: number, center: { x: number, y: number, pressure?: number }): Point[] => {
    const points: Point[] = [];
    const steps = 100;
    const maxAngle = turns * Math.PI * 2;
    for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        const angle = t * maxAngle;
        const radius = startRadius + t * 400; // expand by 400
        points.push({
            x: center.x + Math.cos(angle) * radius,
            y: center.y + Math.sin(angle) * radius,
            pressure: 0.5
        });
    }
    return points;
};
levels.push({
    id: 't1-l8',
    isClosed: false,
    points: createSpiral(50, 2.5, { x: 500, y: 500 })
});

// 9. Triangle (Outline)
levels.push({
    id: 't1-l9',
    isClosed: true,
    points: [
        ...createLine({ x: 300, y: 200, pressure: 0.5 }, { x: 700, y: 200, pressure: 0.5 }),
        ...createLine({ x: 700, y: 200, pressure: 0.5 }, { x: 500, y: 700, pressure: 0.5 }).slice(1),
        ...createLine({ x: 500, y: 700, pressure: 0.5 }, { x: 300, y: 200, pressure: 0.5 }).slice(1)
    ]
});

// 10. Free Practice (Star Outline)
const createStarPoints = (center: { x: number, y: number, pressure?: number }, outerR: number, innerR: number, pointsCount = 5): Point[] => {
    const points: Point[] = [];
    const step = Math.PI / pointsCount;
    // -PI/2 to start top
    for (let i = 0; i <= pointsCount * 2; i++) {
        const angle = -Math.PI / 2 + i * step;
        const r = i % 2 === 0 ? outerR : innerR;
        points.push({
            x: center.x + Math.cos(angle) * r,
            y: center.y + Math.sin(angle) * r,
            pressure: 0.5
        });
    }
    return points;
}
levels.push({
    id: 't1-l10',
    isClosed: true,
    points: createStarPoints({ x: 500, y: 500 }, 350, 150)
});

// --- SubTier 1.2: Simple Shapes (Levels 11-20) ---

// 11. Circle
levels.push({
    id: 't1-l11',
    isClosed: true,
    points: createCircle(300)
});

// 12. Square
levels.push({
    id: 't1-l12',
    isClosed: true,
    points: createPoly(4, 300, 45) // 45 deg rot for square orientation
});

// 13. Triangle (Equilateral)
levels.push({
    id: 't1-l13',
    isClosed: true,
    points: createPoly(3, 300, 0)
});

// 14. Oval
const createEllipse = (center: { x: number, y: number, pressure?: number }, rx: number, ry: number): Point[] => {
    const points: Point[] = [];
    const steps = 60;
    for (let i = 0; i <= steps; i++) {
        const angle = (i / steps) * Math.PI * 2 - Math.PI / 2;
        points.push({
            x: center.x + Math.cos(angle) * rx,
            y: center.y + Math.sin(angle) * ry,
            pressure: 0.5
        });
    }
    return points;
}
levels.push({
    id: 't1-l14',
    isClosed: true,
    points: createEllipse({ x: 500, y: 500 }, 350, 200)
});

// 15. Rectangle
levels.push({
    id: 't1-l15',
    isClosed: true,
    points: [
        ...createLine({ x: 250, y: 300, pressure: 0.5 }, { x: 750, y: 300, pressure: 0.5 }),
        ...createLine({ x: 750, y: 300, pressure: 0.5 }, { x: 750, y: 700, pressure: 0.5 }).slice(1),
        ...createLine({ x: 750, y: 700, pressure: 0.5 }, { x: 250, y: 700, pressure: 0.5 }).slice(1),
        ...createLine({ x: 250, y: 700, pressure: 0.5 }, { x: 250, y: 300, pressure: 0.5 }).slice(1)
    ]
});

// 16. Star (Connections)
levels.push({
    id: 't1-l16',
    isClosed: true,
    points: createStarPoints({ x: 500, y: 500 }, 300, 150)
});

// 17. Heart
// Two bezier curves mirrored.
const heartPoints = [
    // Left half: Bottom tip (500, 800) to Top Center (500, 300) via control points
    ...createArc({ x: 500, y: 800, pressure: 0.5 }, { x: 100, y: 300, pressure: 0.5 }, { x: 500, y: 300, pressure: 0.5 }),
    // Right half
    ...createArc({ x: 500, y: 300, pressure: 0.5 }, { x: 900, y: 300, pressure: 0.5 }, { x: 500, y: 800, pressure: 0.5 }).slice(1)
];
levels.push({
    id: 't1-l17',
    isClosed: true,
    points: heartPoints
});

// 18. Crescent Moon
levels.push({
    id: 't1-l18',
    isClosed: true,
    points: [
        // Outer arc
        ...createArc({ x: 400, y: 200, pressure: 0.5 }, { x: 100, y: 500, pressure: 0.5 }, { x: 400, y: 800, pressure: 0.5 }),
        // Inner arc
        ...createArc({ x: 400, y: 800, pressure: 0.5 }, { x: 250, y: 500, pressure: 0.5 }, { x: 400, y: 200, pressure: 0.5 }).slice(1)
    ]
});

// 19. Cloud
levels.push({
    id: 't1-l19',
    isClosed: true,
    points: [
        // Bottom flat-ish
        ...createLine({ x: 300, y: 600, pressure: 0.5 }, { x: 700, y: 600, pressure: 0.5 }),
        // Right puff
        ...createArc({ x: 700, y: 600, pressure: 0.5 }, { x: 800, y: 500, pressure: 0.5 }, { x: 700, y: 400, pressure: 0.5 }),
        // Top puff
        ...createArc({ x: 700, y: 400, pressure: 0.5 }, { x: 500, y: 200, pressure: 0.5 }, { x: 300, y: 400, pressure: 0.5 }),
        // Left puff
        ...createArc({ x: 300, y: 400, pressure: 0.5 }, { x: 200, y: 500, pressure: 0.5 }, { x: 300, y: 600, pressure: 0.5 })
    ]
});

// 20. Diamond (Memory)
levels.push({
    id: 't1-l20',
    isClosed: true,
    points: createPoly(4, 300, 0) // Vertex at top (diamond)
});

// --- SubTier 1.3: Combining Shapes (Levels 21-30) ---
// Using SENTINEL for pen lifts

// 21. Snowman
levels.push({
    id: 't1-l21',
    isClosed: false,
    points: [
        ...createCircle(80, { x: 500, y: 250 }),
        SENTINEL,
        ...createCircle(120, { x: 500, y: 450 }),
        SENTINEL,
        ...createCircle(150, { x: 500, y: 700 })
    ]
});

// 22. House
levels.push({
    id: 't1-l22',
    isClosed: false,
    points: [
        // Body
        ...createLine({ x: 300, y: 400, pressure: 0.5 }, { x: 700, y: 400, pressure: 0.5 }),
        ...createLine({ x: 700, y: 400, pressure: 0.5 }, { x: 700, y: 800, pressure: 0.5 }).slice(1),
        ...createLine({ x: 700, y: 800, pressure: 0.5 }, { x: 300, y: 800, pressure: 0.5 }).slice(1),
        ...createLine({ x: 300, y: 800, pressure: 0.5 }, { x: 300, y: 400, pressure: 0.5 }).slice(1),
        SENTINEL,
        // Roof
        ...createLine({ x: 300, y: 400, pressure: 0.5 }, { x: 500, y: 150, pressure: 0.5 }),
        ...createLine({ x: 500, y: 150, pressure: 0.5 }, { x: 700, y: 400, pressure: 0.5 }).slice(1),
        SENTINEL,
        // Door
        ...createLine({ x: 450, y: 800, pressure: 0.5 }, { x: 450, y: 600, pressure: 0.5 }),
        ...createLine({ x: 450, y: 600, pressure: 0.5 }, { x: 550, y: 600, pressure: 0.5 }).slice(1),
        ...createLine({ x: 550, y: 600, pressure: 0.5 }, { x: 550, y: 800, pressure: 0.5 }).slice(1)
    ]
});

// 23. Tree
levels.push({
    id: 't1-l23',
    isClosed: false,
    points: [
        // Trunk
        ...createLine({ x: 450, y: 600, pressure: 0.5 }, { x: 550, y: 600, pressure: 0.5 }),
        ...createLine({ x: 550, y: 600, pressure: 0.5 }, { x: 550, y: 900, pressure: 0.5 }).slice(1),
        ...createLine({ x: 550, y: 900, pressure: 0.5 }, { x: 450, y: 900, pressure: 0.5 }).slice(1),
        ...createLine({ x: 450, y: 900, pressure: 0.5 }, { x: 450, y: 600, pressure: 0.5 }).slice(1),
        SENTINEL,
        // Foliage
        ...createCircle(150, { x: 500, y: 400 })
    ]
});

// 24. Flower
levels.push({
    id: 't1-l24',
    isClosed: false,
    points: [
        // Center
        ...createCircle(60, { x: 500, y: 500 }),
        SENTINEL,
        // Petal Top
        ...createEllipse({ x: 500, y: 350 }, 40, 80),
        SENTINEL,
        // Petal Bottom
        ...createEllipse({ x: 500, y: 650 }, 40, 80),
        SENTINEL,
        // Petal Left
        ...createEllipse({ x: 350, y: 500 }, 80, 40),
        SENTINEL,
        // Petal Right
        ...createEllipse({ x: 650, y: 500 }, 80, 40),
        SENTINEL,
        // Stem
        ...createLine({ x: 500, y: 580, pressure: 0.5 }, { x: 500, y: 800, pressure: 0.5 })
    ]
});

// 25. Car
levels.push({
    id: 't1-l25',
    isClosed: false,
    points: [
        // Body
        ...createLine({ x: 250, y: 600, pressure: 0.5 }, { x: 750, y: 600, pressure: 0.5 }),
        ...createLine({ x: 750, y: 600, pressure: 0.5 }, { x: 750, y: 800, pressure: 0.5 }).slice(1),
        ...createLine({ x: 750, y: 800, pressure: 0.5 }, { x: 250, y: 800, pressure: 0.5 }).slice(1),
        ...createLine({ x: 250, y: 800, pressure: 0.5 }, { x: 250, y: 600, pressure: 0.5 }).slice(1),
        SENTINEL,
        // Wheels
        ...createCircle(60, { x: 350, y: 800 }),
        SENTINEL,
        ...createCircle(60, { x: 650, y: 800 }),
        SENTINEL,
        // Window
        ...createLine({ x: 500, y: 500, pressure: 0.5 }, { x: 700, y: 500, pressure: 0.5 }),
        ...createLine({ x: 700, y: 500, pressure: 0.5 }, { x: 700, y: 600, pressure: 0.5 }).slice(1),
        ...createLine({ x: 700, y: 600, pressure: 0.5 }, { x: 500, y: 600, pressure: 0.5 }).slice(1),
        ...createLine({ x: 500, y: 600, pressure: 0.5 }, { x: 500, y: 500, pressure: 0.5 }).slice(1)
    ]
});

// 26. Fish
levels.push({
    id: 't1-l26',
    isClosed: false,
    points: [
        // Body
        ...createEllipse({ x: 500, y: 500 }, 200, 100),
        SENTINEL,
        // Tail
        ...createLine({ x: 700, y: 500, pressure: 0.5 }, { x: 800, y: 400, pressure: 0.5 }),
        ...createLine({ x: 800, y: 400, pressure: 0.5 }, { x: 800, y: 600, pressure: 0.5 }).slice(1),
        ...createLine({ x: 800, y: 600, pressure: 0.5 }, { x: 700, y: 500, pressure: 0.5 }).slice(1),
        SENTINEL,
        // Eye
        ...createCircle(10, { x: 400, y: 480 })
    ]
});

// 27. Bird
levels.push({
    id: 't1-l27',
    isClosed: false,
    points: [
        // Body
        ...createCircle(100, { x: 500, y: 500 }),
        SENTINEL,
        // Head
        ...createCircle(50, { x: 400, y: 400 }),
        SENTINEL,
        // Beak
        ...createLine({ x: 350, y: 400, pressure: 0.5 }, { x: 300, y: 420, pressure: 0.5 }),
        ...createLine({ x: 300, y: 420, pressure: 0.5 }, { x: 350, y: 440, pressure: 0.5 }).slice(1),
        SENTINEL,
        // Wing
        ...createEllipse({ x: 450, y: 500 }, 50, 30)
    ]
});

// 28. Boat
levels.push({
    id: 't1-l28',
    isClosed: false,
    points: [
        // Hull
        ...createLine({ x: 200, y: 700, pressure: 0.5 }, { x: 800, y: 700, pressure: 0.5 }),
        ...createLine({ x: 800, y: 700, pressure: 0.5 }, { x: 700, y: 800, pressure: 0.5 }).slice(1),
        ...createLine({ x: 700, y: 800, pressure: 0.5 }, { x: 300, y: 800, pressure: 0.5 }).slice(1),
        ...createLine({ x: 300, y: 800, pressure: 0.5 }, { x: 200, y: 700, pressure: 0.5 }).slice(1),
        SENTINEL,
        // Mast
        ...createLine({ x: 500, y: 400, pressure: 0.5 }, { x: 500, y: 700, pressure: 0.5 }),
        SENTINEL,
        // Sail
        ...createLine({ x: 500, y: 400, pressure: 0.5 }, { x: 600, y: 550, pressure: 0.5 }),
        ...createLine({ x: 600, y: 550, pressure: 0.5 }, { x: 500, y: 550, pressure: 0.5 }).slice(1)
    ]
});

// 29. Face
levels.push({
    id: 't1-l29',
    isClosed: false,
    points: [
        // Head
        ...createCircle(250, { x: 500, y: 500 }),
        SENTINEL,
        // Left Eye
        ...createCircle(20, { x: 400, y: 400 }),
        SENTINEL,
        // Right Eye
        ...createCircle(20, { x: 600, y: 400 }),
        SENTINEL,
        // Smile
        ...createArc({ x: 400, y: 600, pressure: 0.5 }, { x: 500, y: 700, pressure: 0.5 }, { x: 600, y: 600, pressure: 0.5 })
    ]
});

// 30. First Scene (Custom - Placeholder Shapes)
levels.push({
    id: 't1-l30',
    isClosed: false,
    points: [
        // Sun
        ...createCircle(60, { x: 800, y: 200 }),
        SENTINEL,
        // House
        ...createPoly(4, 150, 45, { x: 300, y: 600 }), // Not perfect house, but a diamond. Good enough for free draw.
        SENTINEL,
        // Tree Outline
        ...createLine({ x: 600, y: 500, pressure: 0.5 }, { x: 600, y: 800, pressure: 0.5 })
    ]
});


// Output File Content
const content = `import { DrawingPoint } from '../src/features/drawing/utils/geometry';

export interface LevelPathData {
    id: string;
    points: DrawingPoint[];
    isClosed: boolean;
}

export const LEVEL_PATHS: Record<string, LevelPathData> = {
${levels.map(l => `    '${l.id}': ${JSON.stringify(l)}`).join(',\n')}
};
`;

const OUTPUT_PATH = path.join(process.cwd(), 'src/data/tier1_paths_generated.ts');
fs.writeFileSync(OUTPUT_PATH, content);
console.log(`✅ Generated Tier 1 Paths at ${OUTPUT_PATH}`);
