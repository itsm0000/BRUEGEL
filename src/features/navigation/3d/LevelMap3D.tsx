import React, { useMemo } from 'react';
import { useProgressStore } from '@/store/progress';
import { Level } from '@/types/level';
import { Html, Text } from '@react-three/drei';
import * as THREE from 'three';

interface LevelMap3DProps {
    levels: Level[];
    onSelectLevel: (level: Level) => void;
}

export const LevelMap3D: React.FC<LevelMap3DProps> = ({ levels, onSelectLevel }) => {
    const { progress, currentLevelId } = useProgressStore();

    // Layout configuration
    const cols = 5;
    const spacingX = 3;
    const spacingY = -2.5;

    // Day/Night ambient cycle based on total completed levels
    const completedCount = useMemo(() => {
        return Object.values(progress).filter(p => p.score > 0).length;
    }, [progress]);

    const ambientColor = useMemo(() => {
        if (completedCount <= 10) return new THREE.Color('#fffbeb');  // Dawn — warm amber
        if (completedCount <= 20) return new THREE.Color('#fafaf9');  // Bright day — neutral
        if (completedCount <= 30) return new THREE.Color('#fed7aa');  // Sunset — warm orange
        return new THREE.Color('#c7d2fe');                            // Night — cool indigo
    }, [completedCount]);

    return (
        <group position={[-6, 4, 0]}>
            {/* Day/Night ambient light based on progression */}
            <pointLight position={[6, 5, 5]} intensity={1.5} color={ambientColor} distance={40} />

            <Text
                position={[6, 2, -1]}
                fontSize={1.5}
                color="#78716c" // stone-500
                anchorX="center"
                anchorY="middle"
                maxWidth={20}
                textAlign="center"
            >
                AI Drawing Tutor Gallery
            </Text>

            {levels.map((level, index) => {
                const row = Math.floor(index / cols);
                const col = index % cols;

                const posX = col * spacingX;
                const posY = row * spacingY;
                const posZ = 0;

                const status = progress[level.id];
                const isUnlocked = status?.unlocked;
                const isCurrent = currentLevelId === level.id;

                // Colors based on state
                const frameColor = isCurrent ? '#fbbf24' : isUnlocked ? '#f5f5f4' : '#d6d3d1';

                return (
                    <LevelNode3D
                        key={level.id}
                        level={level}
                        position={[posX, posY, posZ]}
                        isUnlocked={!!isUnlocked}
                        isCurrent={isCurrent}
                        frameColor={frameColor}
                        onClick={() => {
                            if (isUnlocked) onSelectLevel(level);
                        }}
                    />
                );
            })}
        </group>
    );
};

interface LevelNodeProps {
    level: Level;
    position: [number, number, number];
    isUnlocked: boolean;
    isCurrent: boolean;
    frameColor: string;
    onClick: () => void;
}

const LevelNode3D: React.FC<LevelNodeProps> = ({ level, position, isUnlocked, isCurrent, frameColor, onClick }) => {
    const [hovered, setHovered] = React.useState(false);

    return (
        <group position={position}>
            {/* The Frame / Canvas */}
            <mesh
                onClick={onClick}
                onPointerOver={() => isUnlocked && setHovered(true)}
                onPointerOut={() => isUnlocked && setHovered(false)}
                scale={hovered ? 1.05 : 1}
            >
                <boxGeometry args={[2.2, 1.8, 0.2]} />
                <meshStandardMaterial
                    color={frameColor}
                    roughness={0.7}
                    metalness={0.1}
                    emissive={isCurrent ? '#fcd34d' : '#000000'}
                    emissiveIntensity={isCurrent ? 0.2 : 0}
                />
            </mesh>

            {/* The inner dark canvas area */}
            <mesh position={[0, 0, 0.11]}>
                <planeGeometry args={[1.9, 1.5]} />
                <meshBasicMaterial color="#fafaf9" />
            </mesh>

            {/* Title Overlay in HTML for crisp text */}
            <Html position={[0, -0.2, 0.12]} transform scale={0.5} pointerEvents="none">
                <div className="flex flex-col items-center justify-center w-40 text-center">
                    <span
                        className={`font-serif tracking-tight font-bold ${isUnlocked ? 'text-stone-800' : 'text-stone-400'}`}
                        style={{ fontSize: '24px', lineHeight: '1.2' }}
                    >
                        {level.title}
                    </span>
                    {!isUnlocked && (
                        <span className="text-stone-400 text-sm mt-1">Locked</span>
                    )}
                </div>
            </Html>
        </group>
    );
};

export default LevelMap3D;
