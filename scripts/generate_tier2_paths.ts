import fs from 'fs';
import path from 'path';

// Re-import existing paths to avoid overwrite
import { LEVEL_PATHS } from '../src/data/levelPaths';

// Types
interface Point { x: number; y: number; pressure: number; }
interface LevelPathData { id: string; points: Point[]; isClosed: boolean; }

const CANVAS_SIZE = 1000;
const CENTER = CANVAS_SIZE / 2;
const PADDING = 200;

// Helpers
const createParametric = (
    steps: number,
    fn: (t: number) => { x: number, y: number, pressure?: number }
): Point[] => {
    const points: Point[] = [];
    for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        const p = fn(t);
        points.push({
            x: p.x,
            y: p.y,
            pressure: p.pressure ?? 0.5
        });
    }
    return points;
};

// 11. The Arc (Simple Curve)
const level11: LevelPathData = {
    id: 'level-11',
    isClosed: false,
    points: createParametric(50, t => {
        const angle = Math.PI - (t * Math.PI); // 180 to 0
        return {
            x: CENTER + Math.cos(angle) * 300,
            y: CENTER + Math.sin(angle) * 300 - 150 // Offset up
        };
    })
};

// 12. The Wave (Sine)
const level12: LevelPathData = {
    id: 'level-12',
    isClosed: false,
    points: createParametric(100, t => {
        const x = PADDING + t * (CANVAS_SIZE - 2 * PADDING);
        const y = CENTER + Math.sin(t * Math.PI * 4) * 100; // 2 cycles
        return { x, y };
    })
};

// 13. The Circle
const level13: LevelPathData = {
    id: 'level-13',
    isClosed: true,
    points: createParametric(60, t => {
        const angle = t * Math.PI * 2 - Math.PI / 2;
        return {
            x: CENTER + Math.cos(angle) * 300,
            y: CENTER + Math.sin(angle) * 300
        };
    })
};

// 14. The S-Curve
const level14: LevelPathData = {
    id: 'level-14',
    isClosed: false,
    points: createParametric(60, t => {
        // Vertical S
        const angle = Math.PI / 2 + t * Math.PI; // Correct? S is two arcs.
        // Let's use Bezier or simple Sine rotated.
        // Rotated Sine:
        const y = PADDING + t * (CANVAS_SIZE - 2 * PADDING);
        const x = CENTER + Math.sin(t * Math.PI * 2) * 150;
        return { x, y };
    })
};

// 15. The Spiral
const level15: LevelPathData = {
    id: 'level-15',
    isClosed: false,
    points: createParametric(200, t => {
        // Archimedean spiral
        const maxRadius = 350;
        const rotations = 3;
        const angle = t * Math.PI * 2 * rotations;
        const radius = t * maxRadius;
        return {
            x: CENTER + Math.cos(angle) * radius,
            y: CENTER + Math.sin(angle) * radius
        };
    }).reverse() // Draw from outside in? Or inside out. Usually inside out is harder. Let's do outside in (reverse).
        // Actually, drawing outward is more natural for expanding. Drawing inward needs precision. 
        // Let's do Inside Out.
        .reverse()
};

// 16. The Leaf (Pointed Oval)
// Two arcs meeting at points.
const level16: LevelPathData = {
    id: 'level-16',
    isClosed: true,
    points: [
        ...createParametric(30, t => {
            // Right side arc
            const angle = -Math.PI / 2 + t * Math.PI;
            return {
                x: CENTER + Math.cos(angle) * 200,
                y: CENTER + Math.sin(angle) * 400
            };
        }),
        ...createParametric(30, t => {
            // Left side arc
            const angle = Math.PI / 2 + t * Math.PI;
            return {
                x: CENTER + Math.cos(angle) * 200,
                y: CENTER + Math.sin(angle) * 400
            };
        })
    ]
    // Wait, cos(-PI/2) is 0. sin(-PI/2) is -1. Top.
    // cos(PI/2) is 0. sin(PI/2) is 1. Bottom.
    // This creates an oval. We need to pinch x.
    // Let's just use a simple math trick: y = sin, x = cos * width_that_varies?
    // How about two quadratic beziers?
    // Start (500, 100). Control (900, 500). End (500, 900). 
    // Then Start (500, 900). Control (100, 500). End (500, 100).
};

// 17. The Cloud
const level17: LevelPathData = {
    id: 'level-17',
    isClosed: true,
    points: createParametric(100, t => {
        // Epicycloid-ish?
        // Simple distinct blobs?
        // Let's use a flower shape: r = a + b*cos(k*theta)
        const angle = t * Math.PI * 2 - Math.PI / 2;
        const r = 250 + 50 * Math.cos(5 * angle); // 5 bumps
        return {
            x: CENTER + Math.cos(angle) * r,
            y: CENTER + Math.sin(angle) * r
        };
    })
};

// 18. The Ribbon (Infinity)
const level18: LevelPathData = {
    id: 'level-18',
    isClosed: true,
    points: createParametric(100, t => {
        const scale = 2 / (3 - Math.cos(2 * t * Math.PI * 2));
        const x = scale * Math.cos(t * Math.PI * 2);
        const y = scale * Math.sin(2 * t * Math.PI * 2) / 2;
        return {
            x: CENTER + x * 400,
            y: CENTER + y * 400
        }
    })
};

// 19. Pressure: Fade
const level19: LevelPathData = {
    id: 'level-19',
    isClosed: false,
    points: createParametric(50, t => {
        return {
            x: PADDING + t * (CANVAS_SIZE - 2 * PADDING),
            y: CENTER,
            pressure: 1.0 - t // High to Low pressure
        };
    })
};

// 20. Mastery: The Eye
const level20: LevelPathData = {
    id: 'level-20',
    isClosed: true,
    points: createParametric(100, t => {
        // Just an eye shape?
        const angle = t * Math.PI * 2;
        const x = 400 * Math.cos(angle);
        const y = 200 * Math.sin(angle) * (Math.cos(angle / 2)); // Some squashing?
        // Simplest: Lemon shape again?
        // Let's use Almond shape: x = cos(t), y = sin(t) * (1 - abs(x)*0.5)
        // ...
        return {
            x: CENTER + Math.cos(angle) * 350,
            y: CENTER + Math.sin(angle) * 200
        };
    })
};


// MERGE
// Since we CANNOT easily import the existing object in Node execution context without enabling module interop/transpilation of the TS file,
// We will simply read the file text, strip the last brace, and append.
// OR, we just use the LEVEL_PATHS we have if we run via vite-node which handles imports? 
// Yes, vite-node handles imports.

const newLevels = {
    ...LEVEL_PATHS, // Previous Tier 1
    // New Tier 2
    'level-11': level11,
    'level-12': level12,
    'level-13': level13,
    'level-14': level14,
    'level-15': level15,
    'level-16': level16, // Todo: fix logic
    'level-17': level17,
    'level-18': level18,
    'level-19': level19,
    'level-20': level20,
};

// Write
const content = `import { DrawingPoint } from '~utils/geometry';

export interface LevelPathData {
    id: string;
    points: DrawingPoint[];
    isClosed: boolean;
}

export const LEVEL_PATHS: Record<string, LevelPathData> = {
${Object.entries(newLevels).map(([k, v]) => `    '${k}': ${JSON.stringify(v)}`).join(',\n')}
};
`;

const OUTPUT_PATH = path.join(__dirname, '../src/data/levelPaths.ts');
fs.writeFileSync(OUTPUT_PATH, content);
console.log(`✅ Generated Tier 2 Paths (Merged) at ${OUTPUT_PATH}`);
