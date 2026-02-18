
import { ThemeConfig } from '../ThemeSystem';

export const SKETCHPAD_THEME: ThemeConfig = {
    id: 'sketchpad',
    description: 'The Sketchpad - Creativity Unleashed',
    colors: {
        background: 'bg-[#f0f0f0]', // Light gray/paper texture base
        text: 'text-gray-800',
        accent: 'text-amber-700', // Wood tone
        node: {
            bg: 'bg-[#fdfbf7]', // Warm paper
            border: 'border-amber-900/20',
            shadow: 'shadow-sm',
            text: 'text-gray-900'
        },
        path: '#57534e', // Warm grey (Charcoal/Graphite)
        primaryButton: 'bg-amber-800 hover:bg-amber-900 text-white',
        nodeShape: 'circle'
    },
    backgroundPattern: {
        type: 'noise', // Paper texture feel
        opacity: 0.05,
        color: '#000000'
    },
    typography: {
        headerfont: 'font-sans font-bold',
        bodyFont: 'font-sans'
    },
    effects: {
        dust: true,
        inkSplat: true,
        magicGlow: true
    }
};
