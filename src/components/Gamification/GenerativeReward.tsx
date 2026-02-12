import { motion, AnimatePresence } from 'framer-motion';

// ... imports

const GenerativeReward: React.FC<GenerativeRewardProps> = ({ userPath, levelId, score, onClose }) => {
    // ... logic

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
        >
            <motion.div
                initial={{ scale: 0.9, y: 20, opacity: 0 }}
                animate={{ scale: 1, y: 0, opacity: 1 }}
                transition={{ type: "spring", duration: 0.5 }}
                className="bg-white rounded-3xl shadow-2xl overflow-hidden max-w-md w-full mx-4 border border-white/20 relative"
            >
                {/* Header */}
                <div className="p-6 border-b border-zinc-100 flex justify-between items-center text-center">
                    <div>
                        <h2 className="text-2xl font-black text-zinc-900 font-serif">Masterpiece Created</h2>
                        <p className="text-zinc-500 text-sm">A visual echo of your performance.</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-zinc-100 rounded-full transition-colors">
                        <X className="text-zinc-400" size={24} />
                    </button>
                </div>

                {/* Art Canvas */}
                <div className="relative aspect-[4/5] bg-[#fdfbf7] m-4 shadow-inner rounded-xl overflow-hidden border border-zinc-100">
                    <canvas
                        ref={canvasRef}
                        className="w-full h-full"
                    />
                </div>

                {/* Footer Actions */}
                <div className="p-6 pt-2 flex gap-3">
                    <button
                        onClick={handleDownload}
                        className="flex-1 bg-zinc-900 text-white font-bold py-3 px-4 rounded-xl shadow-lg hover:bg-zinc-800 transition-transform active:scale-95 flex items-center justify-center gap-2"
                    >
                        <Download size={20} />
                        Collect Artifact
                    </button>
                    <button
                        onClick={onClose}
                        className="flex-1 bg-zinc-100 text-zinc-900 font-bold py-3 px-4 rounded-xl hover:bg-zinc-200 transition-colors"
                    >
                        Continue
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default GenerativeReward;
