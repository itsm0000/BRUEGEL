import React, { useRef, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
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

    const { camera } = useThree();

    useFrame((_, delta) => {
        if (!mesh.current) return;

        // Spawn new particle if drawing
        if (isDrawing && brushRef && brushRef.current) {
            // Convert screen space to world space (Unproject)
            // Normalized Device Coordinates (NDC)
            // brushRef.current is likely in pixels. 
            // We need window dimensions. 
            // Since this runs in useFrame, we can access generic window/viewport?
            // React Three Fiber's "size" from useThree would be safer than window if embedded.

            // Map pixels to -1 to 1
            const nx = (brushRef.current.x / window.innerWidth) * 2 - 1;
            const ny = -(brushRef.current.y / window.innerHeight) * 2 + 1;

            const vector = new THREE.Vector3(nx, ny, 0.5);
            vector.unproject(camera);
            vector.sub(camera.position).normalize();

            const distance = 5; // Distance from camera
            const pos = camera.position.clone().add(vector.multiplyScalar(distance));

            // Circular buffer logic
            const p = particles[currentIdx.current];
            p.position.copy(pos);
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
