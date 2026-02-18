import { Tier } from '../types/level';
import { LEVEL_PATHS } from './levelPaths';

export const TIERS: Tier[] = [
    {
        id: 1,
        title: "The Sketchpad",
        description: "Your creative space. Master the basics of line and form.",
        subTiers: [
            {
                id: 'tier-1-1',
                title: "First Marks",
                description: "Getting comfortable with the pencil.",
                levels: [
                    { ...LEVEL_PATHS['t1-l1'], title: 'Horizontal Line', description: 'Keep it steady.', requiredScore: 90, tier: 1, subTier: 'tier-1-1', position: { x: 50, y: 90 } },
                    { ...LEVEL_PATHS['t1-l2'], title: 'Vertical Line', description: 'Straight down.', requiredScore: 90, tier: 1, subTier: 'tier-1-1', position: { x: 30, y: 82 } },
                    { ...LEVEL_PATHS['t1-l3'], title: 'Diagonal Down', description: 'Corner to corner.', requiredScore: 85, tier: 1, subTier: 'tier-1-1', position: { x: 70, y: 74 } },
                    { ...LEVEL_PATHS['t1-l4'], title: 'Diagonal Up', description: 'Rise up.', requiredScore: 85, tier: 1, subTier: 'tier-1-1', position: { x: 40, y: 66 } },
                    { ...LEVEL_PATHS['t1-l5'], title: 'The Smile', description: 'A gentle curve.', requiredScore: 85, tier: 1, subTier: 'tier-1-1', position: { x: 60, y: 58 } },
                    { ...LEVEL_PATHS['t1-l6'], title: 'The Wave', description: 'Flowing lines.', requiredScore: 85, tier: 1, subTier: 'tier-1-1', position: { x: 20, y: 50 } },
                    { ...LEVEL_PATHS['t1-l7'], title: 'Zigzag', description: 'Sharp turns.', requiredScore: 80, tier: 1, subTier: 'tier-1-1', position: { x: 80, y: 42 } },
                    { ...LEVEL_PATHS['t1-l8'], title: 'The Spiral', description: 'Round and round.', requiredScore: 80, tier: 1, subTier: 'tier-1-1', position: { x: 50, y: 34 } },
                    { ...LEVEL_PATHS['t1-l9'], title: 'Triangle Outline', description: 'Three sides.', requiredScore: 80, tier: 1, subTier: 'tier-1-1', position: { x: 30, y: 26 } },
                    { ...LEVEL_PATHS['t1-l10'], title: 'Star Outline', description: 'Connecting points.', requiredScore: 75, tier: 1, subTier: 'tier-1-1', position: { x: 70, y: 18 } }
                ]
            },
            {
                id: 'tier-1-2',
                title: "Simple Shapes",
                description: "Building blocks of drawing.",
                levels: [
                    { ...LEVEL_PATHS['t1-l11'], title: 'Circle', description: 'Perfectly round.', requiredScore: 80, tier: 1, subTier: 'tier-1-2', position: { x: 50, y: 90 } },
                    { ...LEVEL_PATHS['t1-l12'], title: 'Square', description: 'Equal sides.', requiredScore: 80, tier: 1, subTier: 'tier-1-2', position: { x: 30, y: 82 } },
                    { ...LEVEL_PATHS['t1-l13'], title: 'Triangle', description: 'Stable form.', requiredScore: 85, tier: 1, subTier: 'tier-1-2', position: { x: 70, y: 74 } },
                    { ...LEVEL_PATHS['t1-l14'], title: 'Oval', description: 'Stretched circle.', requiredScore: 85, tier: 1, subTier: 'tier-1-2', position: { x: 40, y: 66 } },
                    { ...LEVEL_PATHS['t1-l15'], title: 'Rectangle', description: 'Long and wide.', requiredScore: 85, tier: 1, subTier: 'tier-1-2', position: { x: 60, y: 58 } },
                    { ...LEVEL_PATHS['t1-l16'], title: 'Star Shape', description: 'Five points.', requiredScore: 90, tier: 1, subTier: 'tier-1-2', position: { x: 20, y: 50 } },
                    { ...LEVEL_PATHS['t1-l17'], title: 'Heart', description: 'Curved symmetry.', requiredScore: 90, tier: 1, subTier: 'tier-1-2', position: { x: 80, y: 42 } },
                    { ...LEVEL_PATHS['t1-l18'], title: 'Crescent', description: 'Moon shape.', requiredScore: 90, tier: 1, subTier: 'tier-1-2', position: { x: 50, y: 34 } },
                    { ...LEVEL_PATHS['t1-l19'], title: 'Cloud', description: 'Fluffy form.', requiredScore: 95, tier: 1, subTier: 'tier-1-2', position: { x: 30, y: 26 } },
                    { ...LEVEL_PATHS['t1-l20'], title: 'Diamond', description: 'Tilted square.', requiredScore: 95, tier: 1, subTier: 'tier-1-2', position: { x: 70, y: 18 } }
                ]
            },
            {
                id: 'tier-1-3',
                title: "Combining Shapes",
                description: "Constructing objects from parts.",
                levels: [
                    { ...LEVEL_PATHS['t1-l21'], title: 'Snowman', description: 'Three circles stacked.', requiredScore: 80, tier: 1, subTier: 'tier-1-3', position: { x: 50, y: 90 } },
                    { ...LEVEL_PATHS['t1-l22'], title: 'House', description: 'Square and triangle.', requiredScore: 80, tier: 1, subTier: 'tier-1-3', position: { x: 30, y: 82 } },
                    { ...LEVEL_PATHS['t1-l23'], title: 'Tree', description: 'Rectangle and circle.', requiredScore: 85, tier: 1, subTier: 'tier-1-3', position: { x: 70, y: 74 } },
                    { ...LEVEL_PATHS['t1-l24'], title: 'Flower', description: 'Circle petals.', requiredScore: 85, tier: 1, subTier: 'tier-1-3', position: { x: 40, y: 66 } },
                    { ...LEVEL_PATHS['t1-l25'], title: 'Car', description: 'Moving shapes.', requiredScore: 85, tier: 1, subTier: 'tier-1-3', position: { x: 60, y: 58 } },
                    { ...LEVEL_PATHS['t1-l26'], title: 'Fish', description: 'Oval and triange.', requiredScore: 90, tier: 1, subTier: 'tier-1-3', position: { x: 20, y: 50 } },
                    { ...LEVEL_PATHS['t1-l27'], title: 'Bird', description: 'Circles and lines.', requiredScore: 90, tier: 1, subTier: 'tier-1-3', position: { x: 80, y: 42 } },
                    { ...LEVEL_PATHS['t1-l28'], title: 'Boat', description: 'Floating on shapes.', requiredScore: 90, tier: 1, subTier: 'tier-1-3', position: { x: 50, y: 34 } },
                    { ...LEVEL_PATHS['t1-l29'], title: 'Face', description: 'Putting it together.', requiredScore: 95, tier: 1, subTier: 'tier-1-3', position: { x: 30, y: 26 } },
                    { ...LEVEL_PATHS['t1-l30'], title: 'Simple Scene', description: 'Your first composition.', requiredScore: 95, tier: 1, subTier: 'tier-1-3', position: { x: 70, y: 18 } }
                ]
            }
        ]
    }
];
