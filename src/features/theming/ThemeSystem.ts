export interface ThemeConfig {
    id: string;
    description: string;
    colors: {
        background: string;
        text: string;
        accent: string;
        node: {
            bg: string;
            border: string;
            shadow: string;
            text: string;
        };
        path: string;
        primaryButton: string;
    };
    backgroundPattern: {
        type: 'grid' | 'dots' | 'noise';
        opacity: number;
        color: string;
    };
    typography: {
        headerfont: string; // Tailwind class
        bodyFont: string;   // Tailwind class
    };
}

export const THEMES: Record<string, ThemeConfig> = {
    'i': {
        id: 'museum',
        description: 'The Gallery - The Foundation',
        colors: {
            background: 'bg-[#FDFBF7]', // Warm Paper White
            text: 'text-stone-900',
            accent: 'text-stone-500',
            node: {
                bg: 'bg-white',
                border: 'border-stone-200',
                shadow: 'shadow-md shadow-stone-200/50',
                text: 'text-stone-800'
            },
            path: '#d6d3d1', // stone-300
            primaryButton: 'bg-stone-900 hover:bg-stone-800 transition-colors'
        },
        backgroundPattern: {
            type: 'dots',
            opacity: 0.15,
            color: '#a8a29e' // stone-400
        },
        typography: {
            headerfont: 'font-serif tracking-tight', // Playfair Display via index.css mapping
            bodyFont: 'font-sans tracking-wide'     // Inter via index.css mapping
        }
    },
    'ii': {
        id: 'academy',
        description: 'A Diamond in the Rough - The Shape',
        colors: {
            background: 'bg-[#1e293b]', // Slate-800 (Blueprint Blue/Dark)
            text: 'text-slate-100',
            accent: 'text-slate-400',
            node: {
                bg: 'bg-[#0f172a]', // Slate-900
                border: 'border-slate-600',
                shadow: 'shadow-lg shadow-blue-900/20',
                text: 'text-blue-100'
            },
            path: '#475569', // Slate-600
            primaryButton: 'bg-blue-600'
        },
        backgroundPattern: {
            type: 'grid',
            opacity: 0.1,
            color: '#bae6fd' // Sky-200 (Blueprint line color)
        },
        typography: {
            headerfont: 'font-mono uppercase', // Technical look
            bodyFont: 'font-mono'
        }
    }
};

export const getThemeForSubTier = (subTier: string): ThemeConfig => {
    return THEMES[subTier] || THEMES['i'];
};
