import React, { useEffect, useRef, useState, useMemo } from 'react';
import { useProgressStore } from '@/store/progress';
import { Level } from '@/types/level'; // Type only
import { useLevelLoader } from '~features/progression/hooks/useLevelLoader';
import { playSound } from '~utils/sound';
import { Lock, ChevronRight, ChevronLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '~features/theming/ThemeContext';
import { Skeleton } from '~components/ui/Skeleton';
import { announce } from '~components/a11y/A11yAnnouncer';

interface LevelMapProps {
    onSelectLevel: (level: Level) => void;
    onFreeDraw: () => void;
}

const ITEMS_PER_PAGE = 10;
const MAP_HEIGHT_VH = 300; // Increased Height for less clutter

const LevelMap: React.FC<LevelMapProps> = ({ onSelectLevel, onFreeDraw }) => {
    const { progress, currentLevelId, unlockAll } = useProgressStore();
    const { isLoading, getFlatLevels } = useLevelLoader();
    const { theme, setSubTier } = useTheme();

    const containerRef = useRef<HTMLDivElement>(null);

    const levels = useMemo(() => getFlatLevels(), [getFlatLevels]);

    // Calculate initial page based on current level
    const initialPage = useMemo(() => {
        if (!levels.length) return 0;
        const index = levels.findIndex(l => l.id === currentLevelId);
        return index >= 0 ? Math.floor(index / ITEMS_PER_PAGE) : 0;
    }, [currentLevelId, levels]);

    const [page, setPage] = useState(initialPage);

    // Filter levels for current page
    const visibleLevels = useMemo(() => {
        const start = page * ITEMS_PER_PAGE;
        return levels.slice(start, start + ITEMS_PER_PAGE);
    }, [page, levels]);

    const totalPages = Math.ceil(levels.length / ITEMS_PER_PAGE);

    // Sync Theme with current page
    const currentSubTierInfo = visibleLevels[0] ? { tier: visibleLevels[0].tier, subTier: visibleLevels[0].subTier } : { tier: '1', subTier: 'i' };

    useEffect(() => {
        if (currentSubTierInfo.subTier) {
            setSubTier(currentSubTierInfo.subTier as 'i' | 'ii' | 'iii');
        }
    }, [currentSubTierInfo.subTier, setSubTier]);

    // Announce page changes
    useEffect(() => {
        announce(`Showing levels ${page * ITEMS_PER_PAGE + 1} to ${Math.min((page + 1) * ITEMS_PER_PAGE, levels.length)}`, 'polite');
    }, [page, levels.length]);

    // Auto-scroll to current level on mount (if on current page)
    useEffect(() => {
        if (isLoading) return;

        if (containerRef.current && page === initialPage) {
            const level = levels.find(l => l.id === currentLevelId) || visibleLevels[0];
            if (!level) return;

            // Only scroll if level is on this page
            if (visibleLevels.find(l => l.id === level.id)) {
                const scrollHeight = containerRef.current.scrollHeight;
                const clientHeight = containerRef.current.clientHeight;

                // Adjust for the fact that positions are 0-120% roughly
                const targetY = (level.position.y / 100) * (scrollHeight - clientHeight / 2); // Better approximation?
                const scrollPos = targetY - (clientHeight / 2);

                setTimeout(() => {
                    if (containerRef.current) {
                        containerRef.current.scrollTo({
                            top: scrollPos,
                            behavior: 'smooth'
                        });
                    }
                }, 300);
            }
        }
    }, [currentLevelId, page, initialPage, visibleLevels, isLoading, levels]);

    const handleNextPage = () => {
        if (page < totalPages - 1) {
            playSound.click();
            setPage(p => p + 1);
        }
    };

    const handlePrevPage = () => {
        if (page > 0) {
            playSound.click();
            setPage(p => p - 1);
        }
    };

    if (isLoading) {
        return (
            <div className="h-screen w-full relative bg-[#fdfbf7] overflow-hidden">
                {/* Header Skeleton */}
                <div className="p-6 border-b border-stone-100 flex justify-between items-center">
                    <div className="space-y-2">
                        <Skeleton className="h-8 w-48" />
                        <Skeleton className="h-3 w-32" />
                    </div>
                    <Skeleton className="h-8 w-24 rounded-full" />
                </div>

                {/* Map Skeleton */}
                <div className="max-w-lg mx-auto mt-32 relative h-[60vh]">
                    {/* Simulate path */}
                    <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20" viewBox="0 0 100 130" preserveAspectRatio="none">
                        <path d="M 50 10 C 50 25, 50 40, 50 55" stroke="#e7e5e4" strokeWidth="1" fill="none" strokeDasharray="4 4" />
                        <path d="M 50 55 C 50 70, 70 85, 30 100" stroke="#e7e5e4" strokeWidth="1" fill="none" strokeDasharray="4 4" />
                    </svg>

                    {/* Node Skeletons */}
                    <div className="absolute top-[10%] left-[50%] transform -translate-x-1/2">
                        <Skeleton className="w-48 h-32 rounded-sm" />
                    </div>
                    <div className="absolute top-[40%] left-[50%] transform -translate-x-1/2">
                        <Skeleton className="w-48 h-32 rounded-sm bg-stone-100/50" />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div
            ref={containerRef}
            className={`h-screen relative overflow-y-auto overflow-x-hidden scroll-smooth selection:bg-amber-100 transition-colors duration-1000 ${theme.colors.background}`}
        >
            {/* Dynamic Background Pattern */}
            <div className="absolute inset-0 pointer-events-none z-0"
                style={{
                    height: `${MAP_HEIGHT_VH}vh`,
                    opacity: theme.backgroundPattern.opacity,
                    backgroundImage: theme.backgroundPattern.type === 'grid' ? `
                        linear-gradient(to right, ${theme.backgroundPattern.color} 1px, transparent 1px),
                        linear-gradient(to bottom, ${theme.backgroundPattern.color} 1px, transparent 1px)
                    ` : theme.backgroundPattern.type === 'dots' ? `
                         radial-gradient(${theme.backgroundPattern.color} 1px, transparent 1px)
                    ` : 'none',
                    backgroundSize: '40px 40px'
                }}
            />

            {/* Museum Header */}
            <motion.div
                initial={{ y: -50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className={`fixed top-0 left-0 right-0 z-50 backdrop-blur-md p-6 border-b flex justify-between items-center transition-colors duration-1000 ${theme.colors.background}/90 ${theme.colors.node.border}`}
            >
                <div>
                    <h1 className={`text-3xl tracking-tight ${theme.typography.headerfont} ${theme.colors.text}`}>
                        BRUEGEL
                    </h1>
                    <p className={`text-xs uppercase tracking-widest mt-1 ${theme.colors.accent}`}>
                        Tier {currentSubTierInfo.tier} . {currentSubTierInfo.subTier} — {theme.description}
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => {
                            if (confirm('Unlock all artifacts?')) {
                                unlockAll();
                                window.location.reload();
                            }
                        }}
                        className={`text-[10px] border px-3 py-1 rounded-full transition-all ${theme.colors.accent} ${theme.colors.node.border} hover:${theme.colors.text}`}
                        aria-label="Unlock all levels (Dev Mode)"
                    >
                        DEV MODE
                    </button>
                </div>
            </motion.div>

            {/* Pagination Controls - Fixed Left/Right */}
            {page > 0 && (
                <motion.button
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    onClick={handlePrevPage}
                    className={`fixed left-6 top-1/2 transform -translate-y-1/2 z-40 p-4 rounded-full backdrop-blur shadow-lg border transition-all hover:scale-110 ${theme.colors.node.bg} ${theme.colors.node.border} ${theme.colors.text}`}
                    aria-label="Previous Gallery"
                >
                    <ChevronLeft size={24} />
                </motion.button>
            )}

            {page < totalPages - 1 && (
                <motion.button
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    onClick={handleNextPage}
                    className={`fixed right-6 top-1/2 transform -translate-y-1/2 z-40 p-4 rounded-full backdrop-blur shadow-lg border transition-all hover:scale-110 ${theme.colors.node.bg} ${theme.colors.node.border} ${theme.colors.text}`}
                    aria-label="Next Gallery"
                >
                    <ChevronRight size={24} />
                </motion.button>
            )}

            {/* Map Container */}
            <div className={`relative max-w-lg mx-auto mt-32 pb-32`} style={{ height: `${MAP_HEIGHT_VH}vh` }}>

                {/* SVG Path - Elegant Curves */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none z-0" viewBox="0 0 100 130" preserveAspectRatio="none" style={{ overflow: 'visible' }}>
                    {visibleLevels.map((level, i) => {
                        if (i === visibleLevels.length - 1) return null;
                        const next = visibleLevels[i + 1];

                        return (
                            <motion.path
                                key={`path-${level.id}`}
                                d={`M ${level.position.x} ${level.position.y} C ${level.position.x} ${(level.position.y + next.position.y) / 2}, ${next.position.x} ${(level.position.y + next.position.y) / 2}, ${next.position.x} ${next.position.y}`}
                                stroke={theme.colors.path}
                                strokeWidth="0.5" // Relative to 100 width, 0.5 is 0.5% ~ 2-3px on desktop. Good.
                                strokeDasharray={theme.id === 'academy' ? "2,2" : "none"} // Dashed for blueprint
                                fill="none"
                                vectorEffect="non-scaling-stroke"
                                initial={{ pathLength: 0, opacity: 0 }}
                                animate={{ pathLength: 1, opacity: 1 }}
                                transition={{ duration: 1.5, delay: i * 0.2, ease: "easeInOut" }}
                            />
                        );
                    })}
                </svg>

                {/* Level Nodes */}
                <AnimatePresence mode="wait">
                    {visibleLevels.map((level, index) => {
                        const status = progress[level.id];
                        const isUnlocked = status?.unlocked;
                        const stars = status?.stars || 0;
                        const isCurrent = currentLevelId === level.id;

                        return (
                            <motion.div
                                key={level.id}
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: isCurrent ? 1 : 0.95, opacity: isCurrent ? 1 : 0.8 }}
                                exit={{ scale: 0, opacity: 0 }}
                                transition={{
                                    duration: 0.5,
                                    delay: index * 0.1,
                                    type: "spring",
                                    stiffness: 260,
                                    damping: 20
                                }}
                                className={`absolute transform -translate-x-1/2 -translate-y-1/2 z-10 flex flex-col items-center gap-4`}
                                style={{ left: `${level.position.x}%`, top: `${level.position.y}%` }}
                            >
                                {/* Number Tag */}
                                <div className={`font-serif text-xs tracking-widest mb-1 ${isUnlocked ? theme.colors.text : theme.colors.accent}`}>
                                    NO. {index + 1 + (page * ITEMS_PER_PAGE)}
                                </div>

                                {/* Main Node Card */}
                                <motion.button
                                    whileHover={isUnlocked ? { scale: 1.05, y: -5 } : {}}
                                    whileTap={isUnlocked ? { scale: 0.95 } : {}}
                                    onClick={() => {
                                        if (isUnlocked) {
                                            playSound.click();
                                            announce(`Starting level: ${level.title}`, 'assertive');
                                            onSelectLevel(level);
                                        } else {
                                            playSound.failure();
                                            announce(`Level ${level.title} is locked. Complete previous levels to unlock.`, 'polite');
                                        }
                                    }}
                                    disabled={!isUnlocked}
                                    aria-label={`Select Level ${level.title}`}
                                    className={`
                                        relative w-48 h-32 rounded-sm border transition-all duration-300 group overflow-hidden
                                        ${theme.colors.node.bg} ${theme.colors.node.border} ${theme.colors.node.shadow}
                                        ${isUnlocked ? 'cursor-pointer' : 'opacity-60 cursor-not-allowed'}
                                        ${isCurrent && isUnlocked ? `ring-2 ring-offset-2 ${theme.colors.text}` : ''}
                                    `}
                                >
                                    {/* Inner Content */}
                                    <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
                                        {isUnlocked ? (
                                            <>
                                                <div className={`text-xl ${theme.typography.headerfont} ${theme.colors.node.text}`}>
                                                    {level.title}
                                                </div>

                                                {/* Star Rating as dots */}
                                                {stars > 0 && (
                                                    <div className="flex gap-1 mt-3" aria-label={`${stars} out of 3 stars`}>
                                                        {[1, 2, 3].map(s => (
                                                            <motion.div
                                                                key={s}
                                                                initial={{ scale: 0 }}
                                                                animate={{ scale: 1 }}
                                                                transition={{ delay: 0.5 + (s * 0.1) }}
                                                                className={`w-1.5 h-1.5 rounded-full ${s <= stars ? theme.colors.text : 'bg-transparent border border-stone-300'}`}
                                                            />
                                                        ))}
                                                    </div>
                                                )}
                                            </>
                                        ) : (
                                            <Lock className={`${theme.colors.accent} w-6 h-6`} aria-hidden="true" />
                                        )}
                                    </div>

                                    {/* Hover Effect line */}
                                    {isUnlocked && (
                                        <motion.div
                                            className={`absolute bottom-0 left-0 h-1 ${theme.colors.text}`}
                                            initial={{ width: "0%" }}
                                            whileHover={{ width: "100%" }}
                                            transition={{ duration: 0.3 }}
                                        />
                                    )}
                                </motion.button>

                                {/* Start Button (only for current) */}
                                <AnimatePresence>
                                    {isCurrent && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: 20 }}
                                            className="absolute -bottom-12"
                                        >
                                            <button
                                                onClick={() => {
                                                    playSound.click();
                                                    announce(`Starting level: ${level.title}`, 'assertive');
                                                    onSelectLevel(level);
                                                }}
                                                className={`${theme.colors.primaryButton} text-white text-xs font-bold px-6 py-2 rounded-full shadow-lg hover:opacity-90 transition-all flex items-center gap-2`}
                                                aria-label={`Start Level ${level.title}`}
                                            >
                                                START <ChevronRight size={12} aria-hidden="true" />
                                            </button>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            </div>

            {/* Free Draw Floating Button - refined */}
            <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 1, type: "spring" }}
                className="fixed bottom-8 right-8 z-40"
            >
                <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => {
                        playSound.click();
                        announce('Entering Free Draw Mode', 'polite');
                        onFreeDraw();
                    }}
                    className={`group ${theme.colors.node.bg} ${theme.colors.text} p-0 rounded-full shadow-2xl border ${theme.colors.node.border} transition-colors duration-300 flex items-center overflow-hidden`}
                    aria-label="Enter Free Draw Mode"
                >
                    <div className={`w-16 h-16 flex items-center justify-center border-r ${theme.colors.node.border}`}>
                        <span className="text-2xl">🎨</span>
                    </div>
                    <span className="max-w-0 overflow-hidden group-hover:max-w-[100px] transition-all duration-300 font-serif italic text-sm whitespace-nowrap">
                        <span className="px-4">Free Mode</span>
                    </span>
                </motion.button>
            </motion.div>
        </div>
    );
};

export default LevelMap;
