import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ThemeConfig, getThemeForSubTier } from './ThemeSystem';

interface ThemeContextType {
    subTier: 'i' | 'ii' | 'iii' | 'tier-1-1' | 'tier-1-2' | 'tier-1-3';
    setSubTier: (tier: 'i' | 'ii' | 'iii' | 'tier-1-1' | 'tier-1-2' | 'tier-1-3') => void;
    theme: ThemeConfig;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
    children: ReactNode;
    initialSubTier?: 'i' | 'ii' | 'iii' | 'tier-1-1' | 'tier-1-2' | 'tier-1-3';
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children, initialSubTier = 'i' }) => {
    const [subTier, setSubTier] = useState<'i' | 'ii' | 'iii' | 'tier-1-1' | 'tier-1-2' | 'tier-1-3'>(initialSubTier);

    // Derived state - instant calculation based on subTier
    const theme = getThemeForSubTier(subTier);

    // Optional: Effect to update body background to match theme immediately
    // This prevents white flashes when the inner App div hasn't loaded yet
    useEffect(() => {
        // Extract the hex color if it's in the tailwind class string 'bg-[#...]'
        // or just apply a class to the body
        // For now, simpler is better: components handle their own styling via the 'theme' object.
        // But adjusting body class is a nice touch.

        // Example: logic to parse 'bg-[#fdfbf7]' -> '#fdfbf7' could go here if we wanted strict body sync
    }, [theme]);

    return (
        <ThemeContext.Provider value={{ subTier, setSubTier, theme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};
