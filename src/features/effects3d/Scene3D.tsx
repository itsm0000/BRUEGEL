import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Particles } from './components/Particles';
import { SunRays } from './components/SunRays';
import { PencilMascot } from './components/PencilMascot';
import { Confetti } from './components/Confetti';
import { TrailParticles } from './components/TrailParticles';

interface Scene3DProps {
    isLevelComplete?: boolean;
    isDrawing?: boolean;
    brushRef?: React.MutableRefObject<{ x: number; y: number } | null>;
}

export const Scene3D: React.FC<Scene3DProps> = ({ isLevelComplete, isDrawing, brushRef }) => {
    return (
        <div className="absolute inset-0 pointer-events-none z-0">
            <Canvas camera={{ position: [0, 0, 5], fov: 75 }} gl={{ alpha: true }}>
                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} intensity={1} />

                <Suspense fallback={null}>
                    <Particles color="#e5e7eb" count={300} />
                    <SunRays />
                    <PencilMascot isDrawing={isDrawing} isLevelComplete={isLevelComplete} />
                    <Confetti isExploding={!!isLevelComplete} />
                    <TrailParticles isDrawing={!!isDrawing} brushRef={brushRef} />
                </Suspense>
            </Canvas>
        </div>
    );
};
