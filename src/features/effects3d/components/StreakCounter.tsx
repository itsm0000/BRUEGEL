import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';
import { useGameStore } from '@/store/game';

/**
 * StreakCounter — Floating 3D text that shows the current streak.
 * 
 * - Appears only when streak >= 2 (worth showing)
 * - Scales up with a spring animation on each increment
 * - Positioned near the brush with a gentle float
 * - Fades away when streak breaks (opacity lerp)
 */

interface StreakCounterProps {
    brushRef: React.MutableRefObject<THREE.Vector3 | null>;
}

export const StreakCounter: React.FC<StreakCounterProps> = ({ brushRef }) => {
    const meshRef = useRef<THREE.Group>(null);
    const scaleRef = useRef(1);
    const opacityRef = useRef(0);
    const lastStreak = useRef(0);
    const textRef = useRef<any>(null);

    useFrame((state) => {
        if (!meshRef.current) return;

        const gameState = useGameStore.getState();
        const streak = gameState.streak;
        const isPaused = gameState.isPaused;
        if (isPaused) return;

        const time = state.clock.elapsedTime;

        // Detect streak change for spring animation
        if (streak > lastStreak.current && streak >= 2) {
            scaleRef.current = 1.8; // Pop up big
        }
        lastStreak.current = streak;

        // Spring decay for scale
        scaleRef.current += (1 - scaleRef.current) * 0.08;

        // Opacity: fade in if streak >= 2, fade out if 0
        const targetOpacity = streak >= 2 ? 1 : 0;
        opacityRef.current += (targetOpacity - opacityRef.current) * 0.1;

        // Position: follow brush with offset
        if (brushRef.current && streak >= 2) {
            meshRef.current.position.set(
                brushRef.current.x + 1.5,
                brushRef.current.y + 1.5 + Math.sin(time * 3) * 0.15,
                brushRef.current.z + 0.5
            );
        }

        // Apply scale
        const s = scaleRef.current;
        meshRef.current.scale.set(s, s, s);

        // Update text material opacity
        if (textRef.current && textRef.current.material) {
            textRef.current.material.opacity = opacityRef.current;
        }
    });

    const streak = useGameStore((s) => s.streak);
    const isOnFire = streak >= 3;

    if (streak < 2) return null;

    return (
        <group ref={meshRef}>
            <Text
                ref={textRef}
                fontSize={0.6}
                color={isOnFire ? '#ef4444' : '#fbbf24'} // Red when on fire, amber otherwise
                anchorX="center"
                anchorY="middle"
                font="/fonts/Inter-Bold.woff"
                outlineWidth={0.03}
                outlineColor="#000000"
                material-transparent={true}
                material-depthTest={false}
            >
                {isOnFire ? '🔥' : '⚡'} x{streak}
            </Text>
        </group>
    );
};
