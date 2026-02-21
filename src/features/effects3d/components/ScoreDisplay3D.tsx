import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, Float } from '@react-three/drei';
import * as THREE from 'three';
import { useGameStore } from '@/store/game';

/**
 * ScoreDisplay3D — Replaces static HTML score modal with an animated 3D score.
 * 
 * - Uses drei/Text for crisp 3D text rendering
 * - Scales up with spring animation on appear
 * - Gentle float/bob via drei/Float
 * - Emissive glow on success, red tint on failure
 * - Shows reward message on jackpot/bonus
 */

interface ScoreDisplay3DProps {
    score: number | null;
    requiredScore: number;
    rewardMessage?: string;
}

export const ScoreDisplay3D: React.FC<ScoreDisplay3DProps> = ({
    score,
    requiredScore,
    rewardMessage = '',
}) => {
    const groupRef = useRef<THREE.Group>(null);
    const scaleRef = useRef(0);
    const targetScale = useRef(0);

    useFrame(() => {
        if (!groupRef.current) return;
        const isPaused = useGameStore.getState().isPaused;
        if (isPaused) return;

        // Target: scale up when score is shown, scale down when null
        targetScale.current = score !== null ? 1 : 0;
        scaleRef.current += (targetScale.current - scaleRef.current) * 0.12;

        const s = scaleRef.current;
        groupRef.current.scale.set(s, s, s);
    });

    if (score === null) return null;

    const isSuccess = score >= requiredScore;
    const rewardType = useGameStore((s) => s.lastRewardType);
    const isJackpot = rewardType === 'jackpot';

    return (
        <group ref={groupRef} position={[0, 1, 2]}>
            <Float speed={2} rotationIntensity={0.05} floatIntensity={0.3}>
                {/* Main Score */}
                <Text
                    fontSize={2}
                    color={isSuccess ? (isJackpot ? '#ffd700' : '#22c55e') : '#ef4444'}
                    anchorX="center"
                    anchorY="middle"
                    outlineWidth={0.08}
                    outlineColor="#000000"
                    material-toneMapped={false}
                >
                    {score}%
                </Text>

                {/* Label below */}
                <Text
                    position={[0, -1.5, 0]}
                    fontSize={0.5}
                    color={isSuccess ? '#a7f3d0' : '#fca5a5'}
                    anchorX="center"
                    anchorY="middle"
                    outlineWidth={0.03}
                    outlineColor="#000000"
                >
                    {isSuccess ? 'COMPLETE!' : `Target: ${requiredScore}%`}
                </Text>

                {/* Reward message */}
                {rewardMessage && (
                    <Text
                        position={[0, -2.5, 0]}
                        fontSize={0.7}
                        color="#ffd700"
                        anchorX="center"
                        anchorY="middle"
                        outlineWidth={0.04}
                        outlineColor="#000000"
                        material-toneMapped={false}
                    >
                        {rewardMessage}
                    </Text>
                )}

                {/* Try Again text for failures */}
                {!isSuccess && (
                    <Text
                        position={[0, -2.5, 0]}
                        fontSize={0.6}
                        color="#9ca3af"
                        anchorX="center"
                        anchorY="middle"
                        outlineWidth={0.02}
                        outlineColor="#000000"
                    >
                        Try Again
                    </Text>
                )}
            </Float>
        </group>
    );
};
