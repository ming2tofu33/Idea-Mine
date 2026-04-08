"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Environment } from "@react-three/drei";
import type { VeinRarity } from "@/types/api";
import * as THREE from "three";

const RARITY_COLORS: Record<VeinRarity, string> = {
    common: "#9AAAC0", // Steel gray
    rare: "#8B5CF6", // Violet glow
    golden: "#C4B07A", // Gold
    legend: "#5CCDE5", // Cold Cyan (Legendary Terminal)
};

function Asteroid({ rarity }: { rarity: VeinRarity }) {
    const meshRef = useRef<THREE.Group>(null);
    const color = RARITY_COLORS[rarity];
    const isLegend = rarity === "legend";

    // Procedurally generate a rough natural meteorite geometry
    const geometries = useMemo(() => {
        // High-poly icosahedron as base
        const baseGeo = new THREE.IcosahedronGeometry(1.5, 8);
        const pos = baseGeo.attributes.position;

        // Apply pseudo-random noise to vertices
        for (let i = 0; i < pos.count; i++) {
            const v = new THREE.Vector3().fromBufferAttribute(pos, i);
            // organic bumps using sin/cos combinations
            const n1 = Math.sin(v.x * 3 + v.y * 3) * 0.15;
            const n2 = Math.cos(v.z * 4 + v.x * 4) * 0.15;
            const n3 = Math.sin(v.y * 6 + v.z * 6) * 0.1;
            // Deterministic pseudo-noise keeps the rock shape irregular without
            // introducing render-time randomness.
            const noiseSeed =
                Math.sin(v.x * 12.9898 + v.y * 78.233 + v.z * 37.719) * 43758.5453;
            const randomNoise = (noiseSeed - Math.floor(noiseSeed) - 0.5) * 0.08;

            const totalDistortion = n1 + n2 + n3 + randomNoise;

            v.normalize().multiplyScalar(1.5 + totalDistortion);
            pos.setXYZ(i, v.x, v.y, v.z);
        }

        baseGeo.computeVertexNormals();

        // Create a slightly larger wireframe mesh using the exact same shape
        const wireGeo = baseGeo.clone();
        wireGeo.scale(isLegend ? 1.08 : 1.03, isLegend ? 1.08 : 1.03, isLegend ? 1.08 : 1.03);

        return { baseGeo, wireGeo };
    }, [isLegend]);

    useFrame((state, delta) => {
        if (meshRef.current) {
            meshRef.current.rotation.x += delta * 0.12;
            meshRef.current.rotation.y += delta * 0.18;
        }
    });

    return (
        <group ref={meshRef}>
            {/* Inner Core (Rough Rock) */}
            <mesh geometry={geometries.baseGeo}>
                <meshStandardMaterial
                    color={color}
                    emissive={isLegend ? color : "#000000"}
                    emissiveIntensity={isLegend ? 1.2 : 0}
                    transparent={isLegend}
                    opacity={isLegend ? 0.9 : 1}
                    metalness={0.7}
                    roughness={0.6}
                    flatShading={false}
                />
            </mesh>

            {/* Outer Wireframe (Terminal UI Vibe) */}
            <mesh geometry={geometries.wireGeo}>
                <meshBasicMaterial
                    color={color}
                    wireframe
                    transparent
                    opacity={isLegend ? 0.3 : 0.1}
                />
            </mesh>
        </group>
    );
}

export function Meteorite3D({ rarity }: { rarity: VeinRarity }) {
    // Moved camera significantly closer to fill the screen/card bounds
    return (
        <Canvas camera={{ position: [0, 0, 3.2], fov: 45 }} gl={{ alpha: true }}>
            <ambientLight intensity={0.6} />
            <directionalLight position={[10, 10, 5]} intensity={1.5} color="#ffffff" />
            <directionalLight position={[-10, 5, -5]} intensity={0.5} color={RARITY_COLORS[rarity]} />
            <pointLight position={[0, -10, 0]} intensity={2} color="#FF3B93" distance={20} />

            <Float
                speed={1.5}
                rotationIntensity={1.2}
                floatIntensity={1.5}
            >
                <Asteroid rarity={rarity} />
            </Float>

            <Environment preset="city" />
        </Canvas>
    );
}
