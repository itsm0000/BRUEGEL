import * as fs from 'fs';
import * as path from 'path';
import { generateLessonPath } from '../src/features/drawing/utils/pathGenerator';
import { LEVELS } from '../src/data/levels';

// Mock window/canvas if needed, or ensure pathGenerator is pure (it seems pure)
// pathGenerator uses geometry.ts which is pure.

const OUTPUT_PATH = path.join(__dirname, '../src/data/levelPaths.ts');

const extractedLevels = LEVELS.map(level => {
    // We assume a standard canvas size for 'baking' the data.
    // The game uses responsive resizing, which might be an issue if we bake strict points.
    // However, the current pathGenerator takes width/height.
    // If we switch to static paths, we usually define them in a 'normalized' 100x100 or 1000x1000 coordinate space
    // and then scale them at runtime.

    // Let's generate in a 1000x1000 box.
    const pathData = generateLessonPath(level.type, 1000, 1000, level.parameters);

    return {
        id: level.id,
        points: pathData.points, // Array of {x, y, pressure}
        isClosed: pathData.isClosed
    };
});

const content = `import { DrawingPoint } from '~utils/geometry';

export interface LevelPathData {
    id: string;
    points: DrawingPoint[];
    isClosed: boolean;
}

export const LEVEL_PATHS: Record<string, LevelPathData> = {
${extractedLevels.map(l => `    '${l.id}': ${JSON.stringify(l)}`).join(',\n')}
};
`;

fs.writeFileSync(OUTPUT_PATH, content);
console.log(`Generated ${OUTPUT_PATH}`);
