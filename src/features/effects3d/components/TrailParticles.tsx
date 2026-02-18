import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface TrailParticlesProps {
    brushRef?: React.MutableRefObject<{ x: number; y: number } | null>;
    isDrawing: boolean;
}

export const TrailParticles: React.FC<TrailParticlesProps> = ({ brushRef, isDrawing }) => {
    const mesh = useRef<THREE.InstancedMesh>(null);
    const count = 100;

    // Use a circular buffer for particles
    const particles = useMemo(() => {
        return new Array(count).fill(0).map(() => ({
            position: new THREE.Vector3(0, -1000, 0),
            scale: 0,
            life: 0,
            velocity: new THREE.Vector3()
        }));
    }, []);

    const currentIdx = useRef(0);


    // Convert 2D brush (0-1000 likely?) to 3D world space
    // We need to know the mapping. For now, we'll assume the 2D canvas 
    // maps to a certain range in 3D or we need to unproject.
    // Since we don't have the exact mapping here, we might need to rely on 
    // passed-in NORMALIZED coordinates (-1 to 1) or similar.
    // Let's assume brushPosition is passed in World Coordinates or we convert it.
    // BUT: The 2D canvas is separate. The R3F camera is fixed.
    // We'll need a way to map screen 2D to World 3D.
    // For this MV, let's assume brushPosition is normalized 0-1 from the hook.

    useFrame((_, delta) => {
        if (!mesh.current) return;

        // Spawn new particle if drawing
        if (isDrawing && brushRef && brushRef.current) {
            // Convert screen space to world space (Approximate)
            // Assuming brushRef.current is {x, y} in canvas pixels 
            // and 2D canvas is overlaid centrally.

            // const { width: viewportW, height: viewportH } = state.viewport;
            // Native resolution of the canvas (from DrawingCanvas props, usually window inner)
            // We don't have it here. Let's assume standard 1000ish width for now or tune.
            // Better: use Three's unproject if we had camera and Z depth.

            // Temporary normalization assumed 0-1 from LessonView? 
            // No, DrawingCanvas sends raw pixels.

            // Visual approximation factor:
            const zoomFactor = 0.01;
            const x = (brushRef.current.x - 500) * zoomFactor; // Centering (assuming 1000px width)
            const y = -(brushRef.current.y - 300) * zoomFactor; // Centering (assuming 600px height)

            // Circular buffer logic
            const p = particles[currentIdx.current];
            p.position.set(x, y, 0); // Z=0
            p.life = 1.0;
            p.scale = 0.5;
            p.velocity.set(
                (Math.random() - 0.5) * 5,
                (Math.random() - 0.5) * 5,
                0
            );

            currentIdx.current = (currentIdx.current + 1) % count;
        }

        const dummy = new THREE.Object3D();

        particles.forEach((p, i) => {
            if (p.life > 0) {
                p.life -= delta * 2; // Fade out speed
                p.scale = p.life * 0.2;
                p.position.addScaledVector(p.velocity, delta);

                dummy.position.copy(p.position);
                dummy.scale.set(p.scale, p.scale, p.scale);
                dummy.updateMatrix();
                mesh.current!.setMatrixAt(i, dummy.matrix);
            } else {
                // Hide
                dummy.position.set(0, -1000, 0);
                dummy.updateMatrix();
                mesh.current!.setMatrixAt(i, dummy.matrix);
            }
        });

        mesh.current.instanceMatrix.needsUpdate = true;
    });

    // Expose a method or use effect to spawn?
    // Actually, useFrame allows us to spawn if drawing state implies movement
    // But without a robust coordinate conversion, this is decorative.
    // Let's keep it simple: 
    // The integration step will handle passing the correct Ref or Coordinates.

    return (
        <instancedMesh ref={mesh} args={[undefined, undefined, count]}>
            <sphereGeometry args={[0.5, 8, 8]} />
            <meshBasicMaterial color="#fbbf24" transparent opacity={0.8} />
        </instancedMesh>
    );
};
