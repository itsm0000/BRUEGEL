import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export const SunRays: React.FC = () => {
    const mesh = useRef<THREE.Mesh>(null);

    // vertex shader
    const vertexShader = `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `;

    // fragment shader - radial gradients for rays
    const fragmentShader = `
    varying vec2 vUv;
    uniform float iTime;
    
    void main() {
      vec2 p = vUv - 0.5;
      float angle = atan(p.y, p.x);
      float dist = length(p);
      
      // Generate rays based on angle
      float rays = sin(angle * 8.0 + iTime * 0.2) * 0.5 + 0.5;
      
      // Fade out at edges and center
      float alpha = rays * (1.0 - dist * 2.0) * smoothstep(0.0, 0.2, dist);
      
      // Warm amber color
      vec3 color = vec3(1.0, 0.9, 0.7);
      
      gl_FragColor = vec4(color, alpha * 0.15); // Low opacity for subtlety
    }
  `;

    const uniforms = useRef({
        iTime: { value: 0 },
    });

    useFrame((state) => {
        if (mesh.current) {
            // Rotate the whole mesh slowly for extra movement
            mesh.current.rotation.z -= 0.001;
            uniforms.current.iTime.value = state.clock.elapsedTime;
        }
    });

    return (
        <mesh ref={mesh} position={[0, 0, -2]} scale={[15, 15, 1]}>
            <planeGeometry />
            <shaderMaterial
                vertexShader={vertexShader}
                fragmentShader={fragmentShader}
                uniforms={uniforms.current}
                transparent
                depthWrite={false}
            />
        </mesh>
    );
};
