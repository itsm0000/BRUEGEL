import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from '@/store/game';

interface ConfettiProps {
    isExploding: boolean;
    colors?: string[];
    count?: number;
}

const DESK_Y = -4.5; // Desk surface Y position for collision
const BOUNCE_RESTITUTION = 0.3; // Energy retention on bounce
const SETTLE_VELOCITY = 0.15; // Below this, confetti settles
const MAX_SETTLED = 500; // Max persistent confetti on desk

export const Confetti: React.FC<ConfettiProps> = ({
    isExploding,
    colors = ['#f8c7cc', '#f7d794', '#c3e0e5', '#d4b8e0'],
    count = 200
}) => {
    const mesh = useRef<THREE.InstancedMesh>(null);
    const particles = useMemo(() => {
        // Extra capacity for jackpot (2x)
        const totalCapacity = count * 2;
        return new Array(totalCapacity).fill(0).map(() => ({
            position: new THREE.Vector3(0, -1000, 0),
            velocity: new THREE.Vector3(),
            rotation: new THREE.Vector3(),
            rotationSpeed: new THREE.Vector3(),
            color: new THREE.Color(colors[Math.floor(Math.random() * colors.length)]),
            scale: Math.random() * 0.12 + 0.04,
            active: false,
            settled: false,
        }));
    }, [count, colors]);

    const dummy = useMemo(() => new THREE.Object3D(), []);
    const settledCount = useRef(0);

    useEffect(() => {
        if (isExploding) {
            const gameState = useGameStore.getState();
            const isJackpot = gameState.lastRewardType === 'jackpot';
            const spawnCount = isJackpot ? count * 2 : count;

            // Jackpot colors: golden palette
            const jackpotColors = ['#ffd700', '#ffb700', '#fff4b5', '#ffe066'];

            for (let i = 0; i < spawnCount && i < particles.length; i++) {
                const p = particles[i];
                if (p.settled) continue; // Don't disturb settled confetti

                // Explode from center
                p.position.set(
                    (Math.random() - 0.5) * 2,
                    1 + Math.random() * 2,
                    (Math.random() - 0.5) * 1
                );

                p.velocity.set(
                    (Math.random() - 0.5) * 12,
                    Math.random() * 8 + 3,
                    (Math.random() - 0.5) * 6
                );

                p.rotation.set(
                    Math.random() * Math.PI * 2,
                    Math.random() * Math.PI * 2,
                    Math.random() * Math.PI * 2
                );
                p.rotationSpeed.set(
                    (Math.random() - 0.5) * 0.4,
                    (Math.random() - 0.5) * 0.4,
                    (Math.random() - 0.5) * 0.4
                );

                // Color selection
                const colorSet = isJackpot ? jackpotColors : colors;
                p.color.set(colorSet[Math.floor(Math.random() * colorSet.length)]);

                p.scale = Math.random() * 0.12 + 0.04;
                p.active = true;
                p.settled = false;
            }
        }
    }, [isExploding, particles, count, colors]);

    useFrame((_, delta) => {
        if (!mesh.current || useGameStore.getState().isPaused) return;

        particles.forEach((p, i) => {
            if (p.settled) {
                // Settled confetti — just render at its position, no physics
                dummy.position.copy(p.position);
                dummy.rotation.set(p.rotation.x, p.rotation.y, p.rotation.z);
                dummy.scale.set(p.scale, p.scale * 0.3, p.scale); // Flatten on desk
                dummy.updateMatrix();
                mesh.current!.setMatrixAt(i, dummy.matrix);
                mesh.current!.setColorAt(i, p.color);
                return;
            }

            if (!p.active) {
                dummy.position.set(0, -1000, 0);
                dummy.scale.set(0, 0, 0);
                dummy.updateMatrix();
                mesh.current!.setMatrixAt(i, dummy.matrix);
                return;
            }

            // Physics: gravity + air resistance
            p.velocity.y -= 15 * delta; // Gravity (slightly reduced for floaty feel)
            p.velocity.x *= (1 - 0.5 * delta); // Air resistance X
            p.velocity.z *= (1 - 0.5 * delta); // Air resistance Z

            p.position.addScaledVector(p.velocity, delta);

            // Rotation
            p.rotation.x += p.rotationSpeed.x;
            p.rotation.y += p.rotationSpeed.y;
            p.rotation.z += p.rotationSpeed.z;

            // Floor collision — bounce and settle
            if (p.position.y <= DESK_Y + p.scale) {
                p.position.y = DESK_Y + p.scale;
                p.velocity.y *= -BOUNCE_RESTITUTION;

                // Friction on bounce
                p.velocity.x *= 0.7;
                p.velocity.z *= 0.7;
                p.rotationSpeed.multiplyScalar(0.5);

                // Check if should settle
                if (Math.abs(p.velocity.y) < SETTLE_VELOCITY) {
                    p.settled = true;
                    p.velocity.set(0, 0, 0);
                    p.position.y = DESK_Y + p.scale * 0.15; // Sit flat on desk
                    settledCount.current++;

                    // Object pooling: recycle oldest settled if over limit
                    if (settledCount.current > MAX_SETTLED) {
                        const oldestSettled = particles.find(
                            (pp, idx) => pp.settled && idx !== i
                        );
                        if (oldestSettled) {
                            oldestSettled.settled = false;
                            oldestSettled.active = false;
                            settledCount.current--;
                        }
                    }
                }
            }

            // Kill if way out of bounds (shouldn't happen with floor collision)
            if (p.position.y < -20 || Math.abs(p.position.x) > 30) {
                p.active = false;
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
        <instancedMesh ref={mesh} args={[undefined, undefined, count * 2]}>
            <planeGeometry args={[1, 0.5]} />
            <meshStandardMaterial
                side={THREE.DoubleSide}
                roughness={0.5}
                metalness={0.1}
            />
        </instancedMesh>
    );
};

