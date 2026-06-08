"use client";

import { useEffect, useMemo, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { Float, MeshTransmissionMaterial, OrbitControls } from "@react-three/drei";
import * as THREE from "three";

function Shard() {
    const geo = useMemo(() => {
        const g = new THREE.OctahedronGeometry(0.6, 0);
        const pos = g.attributes.position;
        for (let i = 0; i < pos.count; i++) {
            const y = pos.getY(i);
            pos.setY(i, y * 3.5);
        }
        pos.needsUpdate = true;
        g.computeVertexNormals();
        return g;
    }, []);

    return (
        <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.5}>
            <mesh geometry={geo}>
                <MeshTransmissionMaterial
                    backside
                    thickness={0.5}
                    roughness={0.05}
                    metalness={0.1}
                    ior={1.5}
                    color="#8b5cf6"
                    emissive="#6d28d9"
                    emissiveIntensity={0.15}
                />
            </mesh>
        </Float>
    );
}

export default function CrystalShard() {
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);
    if (!mounted) return <div className="w-full h-full" />;
    return (
        <div className="w-full h-full">
            <Canvas camera={{ position: [0, 0, 5], fov: 45 }} dpr={[1, 2]} gl={{ toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.5 }}>
                <ambientLight intensity={0.3} />
                <pointLight position={[0, 5, 0]} intensity={0.8} color="#ffffff" />
                <pointLight position={[0, 0, 5]} intensity={0.6} color="#a78bfa" />
                <pointLight position={[-5, 0, 0]} intensity={0.6} color="#f9a8d4" />
                <pointLight position={[4, -3, -4]} intensity={0.8} color="#ffffff" />
                <Shard />
                <OrbitControls
                    enablePan={false}
                    enableZoom={false}
                    autoRotate
                    autoRotateSpeed={2}
                />
            </Canvas>
        </div>
    );
}
