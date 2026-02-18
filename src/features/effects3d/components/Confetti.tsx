import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface ConfettiProps {
    isExploding: boolean;
    colors?: string[];
    count?: number;
}

export const Confetti: React.FC<ConfettiProps> = ({
    isExploding,
    colors = ['#f8c7cc', '#f7d794', '#c3e0e5', '#d4b8e0'],
    count = 200
}) => {
    const mesh = useRef<THREE.InstancedMesh>(null);
    const particles = useMemo(() => {
        return new Array(count).fill(0).map(() => ({
            position: new THREE.Vector3(),
            velocity: new THREE.Vector3(),
            rotation: new THREE.Vector3(),
            rotationSpeed: new THREE.Vector3(),
            color: new THREE.Color(colors[Math.floor(Math.random() * colors.length)]),
            scale: Math.random() * 0.1 + 0.05,
            active: false,
        }));
    }, [count, colors]);

    const dummy = useMemo(() => new THREE.Object3D(), []);

    useEffect(() => {
        if (isExploding) {
            // Reset and explode
            particles.forEach(p => {
                p.position.set(0, 0, 0); // Start at center
                // Random velocity in a cone upwards
                // Lower starting position (was implicitly 0 or high up)
                // Actually, in this custom implementation, we set pos to 0,0,0
                // We should start them higher up if we want them to fall *into* view
                // Or if the previous logic was "explode from center", that's fine too.
                // The user requested "Lower confetti fallingHeight to 4" (referring to the library, but we wrote custom).
                // Let's adjust the starting Y to be within the camera view.

                p.position.set(0, 4, 0); // Start higher up (y=4) to fall down?
                // Or if it's an explosion, start at 0 and go up.
                // Let's make it explode from center-ish but stay visible.

                p.velocity.set(
                    (Math.random() - 0.5) * 10, // X spread
                    (Math.random() * 5) + 2,   // Y up (lower initial upward velocity so they don't fly off screen)
                    (Math.random() - 0.5) * 5   // Z spread
                );

                p.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
                p.rotationSpeed.set(Math.random() * 0.2, Math.random() * 0.2, Math.random() * 0.2);
                p.active = true;
            });
        }
    }, [isExploding, particles]);

    useFrame((_, delta) => {
        if (!mesh.current || !isExploding) return;

        let activeCount = 0;

        particles.forEach((p, i) => {
            if (!p.active) {
                // Hide inactive particles
                dummy.position.set(0, -1000, 0);
                dummy.updateMatrix();
                mesh.current!.setMatrixAt(i, dummy.matrix);
                return;
            }

            // Physics
            p.velocity.y -= 20 * delta; // Gravity
            p.position.addScaledVector(p.velocity, delta);
            p.rotation.x += p.rotationSpeed.x;
            p.rotation.y += p.rotationSpeed.y;
            p.rotation.z += p.rotationSpeed.z;

            // Floor collision (approximate)
            if (p.position.y < -10) {
                p.active = false;
            } else {
                activeCount++;
            }

            dummy.position.copy(p.position);
            dummy.rotation.set(p.rotation.x, p.rotation.y, p.rotation.z);
            dummy.scale.set(p.scale, p.scale, p.scale);
            dummy.updateMatrix();

            mesh.current!.setMatrixAt(i, dummy.matrix);
            mesh.current!.setColorAt(i, p.color);
        });

        mesh.current.instanceMatrix.needsUpdate = true;
        if (mesh.current.instanceColor) mesh.current.instanceColor.needsUpdate = true;
    });

    return (
        <instancedMesh ref={mesh} args={[undefined, undefined, count]}>
            <planeGeometry args={[1, 0.5]} />
            <meshBasicMaterial side={THREE.DoubleSide} />
        </instancedMesh>
    );
};
