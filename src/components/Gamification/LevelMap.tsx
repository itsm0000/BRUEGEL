import React, { useEffect, useRef } from 'react';
import { useProgressStore } from '../../store/progress';
import { LEVELS, Level } from '../../data/levels';
import { playSound } from '../../utils/sound';
import { Lock, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface LevelMapProps {
    onSelectLevel: (level: Level) => void;
    onFreeDraw: () => void;
}

const LevelMap: React.FC<LevelMapProps> = ({ onSelectLevel, onFreeDraw }) => {
    const { progress, currentLevelId, unlockAll } = useProgressStore();
    const containerRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to current level on mount
    useEffect(() => {
        if (containerRef.current) {
            const level = LEVELS.find(l => l.id === currentLevelId) || LEVELS[0];
            const scrollHeight = containerRef.current.scrollHeight;
            const clientHeight = containerRef.current.clientHeight;

            const targetY = (level.position.y / 100) * scrollHeight;
            const scrollPos = targetY - (clientHeight / 2);

            setTimeout(() => {
                if (containerRef.current) {
                    containerRef.current.scrollTo({
                        top: scrollPos,
                        behavior: 'smooth'
                    });
                }
            }, 100);
        }
    }, [currentLevelId]);

    return (
        <div
            ref={containerRef}
            className="h-screen bg-[#fdfbf7] relative overflow-y-auto overflow-x-hidden scroll-smooth selection:bg-amber-100"
        >
            {/* Elegant Background Pattern */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.03] z-0 h-[200vh]"
                style={{
                    backgroundImage: `
                        linear-gradient(to right, #000 1px, transparent 1px),
                        linear-gradient(to bottom, #000 1px, transparent 1px)
                    `,
                    backgroundSize: '40px 40px'
                }}
            />

            {/* Museum Header */}
            <motion.div
                initial={{ y: -50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="fixed top-0 left-0 right-0 z-50 bg-[#fdfbf7]/90 backdrop-blur-md p-6 border-b border-stone-100 flex justify-between items-center"
            >
                <div>
                    <h1 className="text-3xl font-serif italic text-stone-900 tracking-tight">
                        BRUEGEL
                    </h1>
                    <p className="text-xs text-stone-500 uppercase tracking-widest mt-1">Curriculum of Strokes</p>
                </div>
                <button
                    onClick={() => {
                        if (confirm('Unlock all artifacts?')) {
                            unlockAll();
                            window.location.reload();
                        }
                    }}
                    className="text-stone-400 hover:text-stone-800 text-[10px] border border-stone-200 px-3 py-1 rounded-full transition-all"
                    aria-label="Unlock all levels (Dev Mode)"
                >
                    DEV MODE
                </button>
            </motion.div>

            {/* Map Container */}
            <div className="relative max-w-lg mx-auto h-[200vh] mt-32 pb-32">

                {/* SVG Path - Elegant Curves */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none z-0" style={{ overflow: 'visible' }}>
                    {LEVELS.map((level, i) => {
                        if (i === LEVELS.length - 1) return null;
                        const next = LEVELS[i + 1];

                        // Bezier Curve Logic
                        const x1 = level.position.x;
                        const y1 = level.position.y;
                        const x2 = next.position.x;
                        const y2 = next.position.y;

                        const cp1x = x1;
                        const cp1y = y1 + (y2 - y1) * 0.5;
                        const cp2x = x2;
                        const cp2y = y1 + (y2 - y1) * 0.5;

                        return (
                            <motion.path
                                key={`path-${i}`}
                                d={`M ${x1} ${y1} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${x2} ${y2}`}
                                stroke="#e7e5e4"
                                strokeWidth="2"
                                fill="none"
                                vectorEffect="non-scaling-stroke"
                                initial={{ pathLength: 0, opacity: 0 }}
                                animate={{ pathLength: 1, opacity: 1 }}
                                transition={{ duration: 1.5, delay: i * 0.2, ease: "easeInOut" }}
                            />
                        );
                    })}
                </svg>

                {/* Level Nodes - Museum Artifact Style */}
                {LEVELS.map((level, index) => {
                    const status = progress[level.id];
                    const isUnlocked = status?.unlocked;
                    const stars = status?.stars || 0;
                    const isCurrent = currentLevelId === level.id;

                    return (
                        <motion.div
                            key={level.id}
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: isCurrent ? 1 : 0.95, opacity: isCurrent ? 1 : 0.8 }}
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
                            <div className={`font-serif text-xs tracking-widest mb-1 ${isUnlocked ? 'text-stone-400' : 'text-stone-300'}`}>
                                NO. 0{index + 1}
                            </div>

                            {/* Main Node Card */}
                            <motion.button
                                whileHover={isUnlocked ? { scale: 1.05, y: -5 } : {}}
                                whileTap={isUnlocked ? { scale: 0.95 } : {}}
                                onClick={() => {
                                    if (isUnlocked) {
                                        playSound.click();
                                        onSelectLevel(level);
                                    } else {
                                        playSound.failure();
                                    }
                                }}
                                disabled={!isUnlocked}
                                aria-label={`Select Level ${index + 1}: ${level.title}`}
                                className={`
                                    relative w-48 h-32 bg-white rounded-sm shadow-sm border transition-colors duration-300 group overflow-hidden
                                    ${isUnlocked
                                        ? 'border-stone-200 cursor-pointer shadow-md'
                                        : 'border-stone-100 bg-stone-50 cursor-not-allowed opacity-60'}
                                    ${isCurrent && isUnlocked ? 'ring-1 ring-stone-900 shadow-xl' : ''}
                                `}
                            >
                                {/* Inner Content */}
                                <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
                                    {isUnlocked ? (
                                        <>
                                            <div className="font-serif text-xl text-stone-800 italic">
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
                                                            className={`w-1.5 h-1.5 rounded-full ${s <= stars ? 'bg-stone-800' : 'bg-stone-200'}`}
                                                        />
                                                    ))}
                                                </div>
                                            )}
                                        </>
                                    ) : (
                                        <Lock className="text-stone-300 w-6 h-6" aria-hidden="true" />
                                    )}
                                </div>

                                {/* Hover Effect line */}
                                {isUnlocked && (
                                    <motion.div
                                        className="absolute bottom-0 left-0 h-0.5 bg-stone-900"
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
                                            onClick={() => onSelectLevel(level)}
                                            className="bg-stone-900 text-white text-xs font-bold px-6 py-2 rounded-full shadow-lg hover:bg-stone-700 transition-colors flex items-center gap-2"
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
                        onFreeDraw();
                    }}
                    className="group bg-white hover:bg-stone-50 text-stone-900 p-0 rounded-full shadow-2xl border border-stone-100 hover:border-stone-300 transition-colors duration-300 flex items-center overflow-hidden"
                    aria-label="Enter Free Draw Mode"
                >
                    <div className="w-16 h-16 flex items-center justify-center border-r border-stone-100">
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
