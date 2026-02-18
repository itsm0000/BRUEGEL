import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Particles } from './components/Particles';
import { SunRays } from './components/SunRays';
import { PencilMascot } from './components/PencilMascot';
import { Confetti } from './components/Confetti';
import { TrailParticles } from './components/TrailParticles';

import { EffectComposer, Bloom } from '@react-three/postprocessing';

interface Scene3DProps {
    isLevelComplete?: boolean;
    isDrawing?: boolean;
    brushRef?: React.MutableRefObject<{ x: number; y: number } | null>;
}

export const Scene3D: React.FC<Scene3DProps> = ({ isLevelComplete, isDrawing, brushRef }) => {
    return (
        <div className="absolute inset-0 pointer-events-none z-0">
            <Canvas
                camera={{ position: [0, 0, 10], fov: 50 }}
                gl={{ alpha: true }}
                style={{ background: 'transparent' }}
            >
                <ambientLight intensity={0.8} />
                <pointLight position={[10, 10, 10]} intensity={1} />

                <Suspense fallback={null}>
                    {isLevelComplete && (
                        <EffectComposer>
                            <Bloom
                                intensity={1.5}
                                luminanceThreshold={0.2}
                                luminanceSmoothing={0.9}
                            />
                        </EffectComposer>
                    )}
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
