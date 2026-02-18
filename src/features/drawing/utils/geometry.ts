export interface Point {
    x: number;
    y: number;
}

// Support pressure in points for drawing
export interface DrawingPoint {
    x: number;
    y: number;
    pressure: number;
}

export interface Path {
    points: DrawingPoint[];
    isClosed?: boolean;
    color?: string; // Optional hex color override
    width?: number; // Optional width override
}

// Calculate distance between two points
export const distance = (p1: Point, p2: Point): number => {
    return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
};

// Simple linear interpolation
export const lerp = (start: number, end: number, t: number): number => {
    return start * (1 - t) + end * t;
};

export const isSentinel = (p: Point): boolean => {
    return p.x < 0 && p.y < 0;
};

// Generate a sample lesson path (a circle)
export const generateCirclePath = (centerX: number, centerY: number, radius: number, points: number = 100): Path => {
    const path: DrawingPoint[] = [];
    for (let i = 0; i <= points; i++) {
        const angle = (i / points) * Math.PI * 2;
        path.push({
            x: centerX + Math.cos(angle) * radius,
            y: centerY + Math.sin(angle) * radius,
            pressure: 0.5
        });
    }
    return { points: path };
};

// Generate a sample lesson path (a straight line)
export const generateLinePath = (startX: number, startY: number, endX: number, endY: number, points: number = 50): Path => {
    const path: DrawingPoint[] = [];
    for (let i = 0; i <= points; i++) {
        const t = i / points;
        path.push({
            x: lerp(startX, endX, t),
            y: lerp(startY, endY, t),
            pressure: 0.5
        });
    }
    return { points: path };
};

export const generatePolygonPath = (centerX: number, centerY: number, radius: number, sides: number): Path => {
    const path: DrawingPoint[] = [];
    const pointsPerSide = 20; // Resolution per side

    for (let s = 0; s < sides; s++) {
        const angleStart = (s / sides) * Math.PI * 2 - Math.PI / 2; // Start at top
        const angleEnd = ((s + 1) / sides) * Math.PI * 2 - Math.PI / 2;

        const p1 = {
            x: centerX + Math.cos(angleStart) * radius,
            y: centerY + Math.sin(angleStart) * radius
        };
        const p2 = {
            x: centerX + Math.cos(angleEnd) * radius,
            y: centerY + Math.sin(angleEnd) * radius
        };

        for (let i = 0; i < pointsPerSide; i++) {
            const t = i / pointsPerSide;
            path.push({
                x: lerp(p1.x, p2.x, t),
                y: lerp(p1.y, p2.y, t),
                pressure: 0.5
            });
        }
    }
    // Close the loop
    const pStart = path[0];
    path.push({ ...pStart });

    return { points: path, isClosed: true };
};

// Helper: Distance from point P to segment AB
const distanceToSegment = (p: Point, a: Point, b: Point): number => {
    const l2 = Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2);
    if (l2 === 0) return distance(p, a); // A and B are the same

    // Projection of P onto line AB, parameterized as t
    let t = ((p.x - a.x) * (b.x - a.x) + (p.y - a.y) * (b.y - a.y)) / l2;
    t = Math.max(0, Math.min(1, t)); // Clamp t to segment [0, 1]

    const projection = {
        x: a.x + t * (b.x - a.x),
        y: a.y + t * (b.y - a.y)
    };

    return distance(p, projection);
};

export const calculateDeviation = (point: Point, path: Path): number => {
    if (path.points.length < 2) {
        if (path.points.length === 1) return distance(point, path.points[0]);
        return 0;
    }

    let minDistance = Infinity;

    // Check distance to each segment
    for (let i = 0; i < path.points.length - 1; i++) {
        const p1 = path.points[i];
        const p2 = path.points[i + 1];

        if (isSentinel(p1) || isSentinel(p2)) continue;

        const dist = distanceToSegment(point, p1, p2);
        if (dist < minDistance) minDistance = dist;
    }

    // If path is closed, check closing segment (last -> first)
    if (path.isClosed) {
        const pLast = path.points[path.points.length - 1];
        const pFirst = path.points[0];

        if (!isSentinel(pLast) && !isSentinel(pFirst)) {
            const dist = distanceToSegment(point, pLast, pFirst);
            if (dist < minDistance) minDistance = dist;
        }
    }

    return minDistance;
};

export const calculateScore = (userPoints: Point[], ghostPath: Path): number => {
    if (userPoints.length === 0) return 0;

    // Algorithm: 
    // 1. Precision: Average distance of user points to nearest path point.
    // 2. Coverage: Percentage of path points that are "covered" by user points (within a threshold).
    // Final Score = (Precision * 0.5) + (Coverage * 0.5)

    // --- 1. Precision ---
    let totalDistance = 0;
    const userStep = Math.max(1, Math.floor(userPoints.length / 100));
    let userCount = 0;

    for (let i = 0; i < userPoints.length; i += userStep) {
        const p = userPoints[i];
        totalDistance += calculateDeviation(p, ghostPath);
        userCount++;
    }

    const avgDistance = userCount > 0 ? totalDistance / userCount : 100;
    const precisionScore = Math.max(0, 100 - (avgDistance * 2.5)); // Tuned: Slightly more forgiving (was 3)

    // --- 2. Coverage ---
    // Check how many ghost points are close to ANY user point
    let coveredPoints = 0;
    const pathStep = Math.max(1, Math.floor(ghostPath.points.length / 50));
    const coverageThreshold = 20; // Distance to search

    for (let i = 0; i < ghostPath.points.length; i += pathStep) {
        const gp = ghostPath.points[i];
        if (isSentinel(gp)) continue;

        // naive check: is this ghost point close to any user point?
        // optimization: we just need to find ONE close user point
        let isCovered = false;
        // We can sample user points here too for perf
        for (let j = 0; j < userPoints.length; j += 5) {
            const dist = distance(gp, userPoints[j]);
            if (dist < coverageThreshold) {
                isCovered = true;
                break;
            }
        }
        if (isCovered) coveredPoints++;
    }

    const totalPathSamples = Math.ceil(ghostPath.points.length / pathStep);
    const coverageScore = (coveredPoints / totalPathSamples) * 100;

    // Weighting
    // If coverage is very low (< 50%), penalty is harsh
    const finalScore = (precisionScore * 0.4) + (coverageScore * 0.6);

    return Math.round(finalScore);
};
