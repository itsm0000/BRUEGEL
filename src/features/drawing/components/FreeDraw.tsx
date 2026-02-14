import React, { useState, useCallback, useRef, useEffect } from 'react';
import DrawingCanvas from './DrawingCanvas';
import { ArrowLeft, Eraser, PenTool, Download } from 'lucide-react';
import { playSound } from '~utils/sound';
import { exportCanvasToImage } from '~utils/exportUtils';
import { DrawingPoint } from '~utils/geometry';

interface FreeDrawProps {
    onBack: () => void;
}

const FreeDraw: React.FC<FreeDrawProps> = ({ onBack }) => {
    const [canvasKey, setCanvasKey] = useState(0);
    const [isUIHidden, setIsUIHidden] = useState(false);
    const userPathRef = useRef<DrawingPoint[]>([]);

    // Container measurement
    const containerRef = useRef<HTMLDivElement>(null);
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

    useEffect(() => {
        const updateDimensions = () => {
            if (containerRef.current) {
                const { clientWidth, clientHeight } = containerRef.current;
                if (clientWidth > 0 && clientHeight > 0) {
                    setDimensions({ width: clientWidth, height: clientHeight });
                }
            }
        };

        const observer = new ResizeObserver(updateDimensions);
        if (containerRef.current) observer.observe(containerRef.current);

        updateDimensions();

        return () => observer.disconnect();
    }, []);


    const handlePathUpdate = useCallback((path: DrawingPoint[]) => {
        userPathRef.current = path;
    }, []);

    // Auto-hide UI logic
    const handleDrawStart = useCallback(() => {
        setIsUIHidden(true);
    }, []);

    const handleDrawEnd = useCallback(() => {
        setTimeout(() => setIsUIHidden(false), 500);
    }, []);

    const handleClear = useCallback(() => {
        playSound.clear();
        setCanvasKey(prev => prev + 1);
        userPathRef.current = [];
    }, []);

    const handleSave = useCallback(() => {
        const canvas = document.querySelector('canvas');
        if (canvas && userPathRef.current.length > 0) {
            exportCanvasToImage(canvas, userPathRef.current);
            playSound.success();
        }
    }, []);

    return (
        <div ref={containerRef} className="w-full h-full relative bg-zinc-50 overflow-hidden touch-none selection:bg-none">
            {/* Background Grid - slightly different pattern for Free Draw */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.05]"
                style={{
                    backgroundImage: `
                        linear-gradient(#000 1px, transparent 1px),
                        linear-gradient(90deg, #000 1px, transparent 1px)
                    `,
                    backgroundSize: '40px 40px'
                }}
            />

            {dimensions.width > 0 && dimensions.height > 0 && (
                <DrawingCanvas
                    key={canvasKey}
                    width={dimensions.width}
                    height={dimensions.height}
                    onDrawStart={handleDrawStart}
                    onDrawEnd={handleDrawEnd}
                    onPathUpdate={handlePathUpdate}
                />
            )}

            {/* UI Overlay */}
            <div className={`absolute inset-0 pointer-events-none transition-opacity duration-500 ease-in-out z-50 ${isUIHidden ? 'opacity-0' : 'opacity-100'}`}>

                {/* Back Button */}
                <div className="absolute top-6 left-6 pointer-events-auto">
                    <button onClick={onBack} className="p-3 bg-white/80 rounded-full shadow-sm border border-zinc-200 hover:bg-zinc-100 transition-colors">
                        <ArrowLeft className="text-zinc-700" size={24} />
                    </button>
                </div>

                {/* Header */}
                <div className="absolute top-6 left-1/2 transform -translate-x-1/2">
                    <div className="bg-white/80 backdrop-blur-md shadow-sm border border-black/5 rounded-2xl px-6 py-3 flex items-center gap-2">
                        <PenTool className="w-5 h-5 text-indigo-500" />
                        <h1 className="text-lg font-bold text-zinc-800">Free Draw</h1>
                    </div>
                </div>

                {/* Simple Toolbar */}
                <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 pointer-events-auto flex gap-4">
                    <button
                        onClick={handleClear}
                        className="p-4 bg-white rounded-full shadow-lg hover:scale-110 transition-transform active:scale-95 text-rose-500"
                        title="Clear"
                    >
                        <Eraser size={28} />
                    </button>
                    <button
                        onClick={handleSave}
                        className="p-4 bg-white rounded-full shadow-lg hover:scale-110 transition-transform active:scale-95 text-sky-500"
                        title="Save Art"
                    >
                        <Download size={28} />
                    </button>
                </div>
            </div>
        </div>
    )
}

export default React.memo(FreeDraw);
