import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from '@/store/game';

interface TrailParticlesProps {
    brushRef: React.MutableRefObject<THREE.Vector3>;
    isDrawing: boolean;
}

export const TrailParticles: React.FC<TrailParticlesProps> = ({ brushRef, isDrawing }) => {
    const mesh = useRef<THREE.InstancedMesh>(null);
    const count = 150; // Increased pool for fire mode

    const particles = useMemo(() => {
        return new Array(count).fill(0).map(() => ({
            position: new THREE.Vector3(0, -1000, 0),
            scale: 0,
            life: 0,
            velocity: new THREE.Vector3(),
            color: new THREE.Color('#fbbf24'),
        }));
    }, []);

    const currentIdx = useRef(0);
    const spawnAccumulator = useRef(0);
    const dummy = useMemo(() => new THREE.Object3D(), []);

    useFrame((_, delta) => {
        if (!mesh.current || useGameStore.getState().isPaused) return;

        const gameState = useGameStore.getState();
        const streak = gameState.streak;
        const isFireMode = streak >= 3;

        // Spawn rate: normal = 1 per frame, fire = 3 per frame
        const spawnRate = isFireMode ? 3 : 1;

        // Spawn new particles if drawing
        if (isDrawing && brushRef.current) {
            spawnAccumulator.current += spawnRate;

            while (spawnAccumulator.current >= 1) {
                spawnAccumulator.current -= 1;

                const p = particles[currentIdx.current];
                // Use the brush's 3D world position directly
                p.position.copy(brushRef.current);
                // Add slight random offset
                p.position.x += (Math.random() - 0.5) * 0.3;
                p.position.y += (Math.random() - 0.5) * 0.3;
                p.position.z += 0.1;

                p.life = 1.0;
                p.scale = isFireMode ? 0.4 : 0.2;

                // Fire mode: upward velocity for flame effect
                if (isFireMode) {
                    p.velocity.set(
                        (Math.random() - 0.5) * 2,
                        Math.random() * 4 + 1, // Strong upward
                        (Math.random() - 0.5) * 0.5
                    );
                    // Orange to red gradient based on streak intensity
                    const fireIntensity = Math.min((streak - 3) / 5, 1);
                    p.color.setHSL(0.08 - fireIntensity * 0.06, 1, 0.5 + Math.random() * 0.2);
                } else {
                    p.velocity.set(
                        (Math.random() - 0.5) * 1.5,
                        (Math.random() - 0.5) * 1.5,
                        0
                    );
                    p.color.set('#fbbf24'); // Default amber
                }

                currentIdx.current = (currentIdx.current + 1) % count;
            }
        } else {
            spawnAccumulator.current = 0;
        }

        // Update all particles
        particles.forEach((p, i) => {
            if (p.life > 0) {
                p.life -= delta * 2.5;
                p.scale = Math.max(p.life, 0) * 0.25;
                p.position.addScaledVector(p.velocity, delta);

                // Slow down velocity over time
                p.velocity.multiplyScalar(0.97);

                dummy.position.copy(p.position);
                dummy.scale.set(p.scale, p.scale, p.scale);
                dummy.updateMatrix();
                mesh.current!.setMatrixAt(i, dummy.matrix);
                mesh.current!.setColorAt(i, p.color);
            } else {
                dummy.position.set(0, -1000, 0);
                dummy.scale.set(0, 0, 0);
                dummy.updateMatrix();
                mesh.current!.setMatrixAt(i, dummy.matrix);
            }
        });

        mesh.current.instanceMatrix.needsUpdate = true;
        if (mesh.current.instanceColor) mesh.current.instanceColor.needsUpdate = true;
    });

    const streak = useGameStore((s) => s.streak);
    const isFireMode = streak >= 3;

    return (
        <instancedMesh ref={mesh} args={[undefined, undefined, count]}>
            <sphereGeometry args={[0.5, 8, 8]} />
            <meshStandardMaterial
                color={isFireMode ? '#ff6b35' : '#fbbf24'}
                transparent
                opacity={0.85}
                emissive={isFireMode ? '#ff4500' : '#000000'}
                emissiveIntensity={isFireMode ? 2.0 : 0}
                toneMapped={false}
            />
        </instancedMesh>
    );
};

