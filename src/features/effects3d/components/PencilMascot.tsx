import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Group } from 'three';

interface PencilMascotProps {
    isDrawing?: boolean;
    isLevelComplete?: boolean;
}

export const PencilMascot: React.FC<PencilMascotProps> = ({ isDrawing, isLevelComplete }) => {
    const group = useRef<Group>(null);

    useFrame((state) => {
        if (!group.current) return;

        const time = state.clock.elapsedTime;

        // Idle animation: gentle floating
        let yOffset = Math.sin(time * 2) * 0.1;
        let rotationZ = Math.sin(time * 1.5) * 0.05;

        if (isDrawing) {
            // Excited wiggle
            rotationZ += Math.sin(time * 15) * 0.1;
            yOffset += Math.sin(time * 10) * 0.05;
        }

        if (isLevelComplete) {
            // Victory jump (simplified)
            yOffset += Math.abs(Math.sin(time * 5)) * 0.5;
            rotationZ += time * 5; // Spin
        }

        group.current.position.y = -2 + yOffset;
        group.current.rotation.z = Math.PI / 4 + rotationZ;
    });

    return (
        <group ref={group} position={[3, -2, 0]} scale={[0.5, 0.5, 0.5]}>
            {/* Body */}
            <mesh position={[0, 0, 0]}>
                <cylinderGeometry args={[0.4, 0.4, 3, 6]} />
                <meshStandardMaterial color="#fbbf24" /> {/* Amber/Yellow */}
            </mesh>

            {/* Eraser Metal */}
            <mesh position={[0, 1.6, 0]}>
                <cylinderGeometry args={[0.42, 0.42, 0.4, 16]} />
                <meshStandardMaterial color="#9ca3af" metalness={0.8} roughness={0.2} />
            </mesh>

            {/* Eraser */}
            <mesh position={[0, 2, 0]}>
                <cylinderGeometry args={[0.4, 0.4, 0.4, 16]} />
                <meshStandardMaterial color="#fca5a5" /> {/* Pink */}
            </mesh>

            {/* Wood Tip */}
            <mesh position={[0, -1.8, 0]}>
                <coneGeometry args={[0.4, 1, 16]} />
                <meshStandardMaterial color="#fde68a" /> {/* Light Wood */}
            </mesh>

            {/* Lead Tip */}
            <mesh position={[0, -2.15, 0]}>
                <coneGeometry args={[0.1, 0.3, 16]} />
                <meshStandardMaterial color="#1f2937" /> {/* Dark Graphics */}
            </mesh>
        </group>
    );
};
