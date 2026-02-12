import React from 'react';
import { Trash2, ArrowRight, Download, PenTool } from 'lucide-react';

interface ToolbarProps {
    onClear: () => void;
    onNext?: () => void;
    onSave?: () => void;
    canGoNext?: boolean;
}

const Toolbar: React.FC<ToolbarProps> = ({ onClear, onNext, onSave }) => {
    return (
        <div className="flex items-center gap-3 p-2 bg-white/80 backdrop-blur-xl shadow-2xl border border-white/20 rounded-full ring-1 ring-black/5">

            {/* Clear Button */}
            <button
                onClick={onClear}
                className="p-3 bg-white rounded-full shadow-lg text-rose-500 hover:scale-110 active:scale-95 transition-transform"
                title="Clear (Backspace)"
            >
                <Trash2 size={24} />
            </button>

            {onSave && (
                <button
                    onClick={onSave}
                    className="p-3 bg-white rounded-full shadow-lg text-sky-500 hover:scale-110 active:scale-95 transition-transform"
                    title="Save to Gallery"
                >
                    <Download size={24} />
                </button>
            )}

            {/* Divider */}
            <div className="w-px h-6 bg-zinc-200"></div>

            {/* Center Decoration (Logo/Status) */}
            <div className="w-12 h-12 flex items-center justify-center rounded-full bg-zinc-50 border border-zinc-100">
                <PenTool size={20} className="text-zinc-400" />
            </div>

            {/* Divider */}
            <div className="w-px h-6 bg-zinc-200"></div>

            {/* Next Button */}
            <button
                onClick={onNext}
                className="group relative flex flex-col items-center justify-center w-12 h-12 rounded-full hover:bg-zinc-100 active:scale-95 transition-all outline-none focus:ring-2 focus:ring-zinc-200"
                title="Next Lesson"
            >
                <ArrowRight size={20} className="text-zinc-600 group-hover:text-blue-600 transition-colors" />
                <span className="sr-only">Next</span>
            </button>
        </div>
    );
};

export default Toolbar;
