"use client";

import { useEffect, useMemo, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { Float, MeshTransmissionMaterial, OrbitControls } from "@react-three/drei";
import * as THREE from "three";

function Shard() {
    const geo = useMemo(() => {
        const geometry = new THREE.BufferGeometry();
        
        const H1 = 1.6; // polar height
        const H2 = 0.4; // equatorial height offset
        const R = 0.6;  // radius
        
        // 10 vertices defining the tetragonal trapezohedron
        const vertices = new Float32Array([
            0, H1, 0,                                             // 0: Top pole
            R, H2, 0,                                             // 1: A0 (0 rad)
            R * Math.cos(Math.PI/4), -H2, R * Math.sin(Math.PI/4), // 2: B0 (pi/4 rad)
            0, H2, R,                                             // 3: A1 (pi/2 rad)
            R * Math.cos(3*Math.PI/4), -H2, R * Math.sin(3*Math.PI/4), // 4: B1 (3pi/4 rad)
            -R, H2, 0,                                            // 5: A2 (pi rad)
            R * Math.cos(5*Math.PI/4), -H2, R * Math.sin(5*Math.PI/4), // 6: B2 (5pi/4 rad)
            0, H2, -R,                                            // 7: A3 (3pi/2 rad)
            R * Math.cos(7*Math.PI/4), -H2, R * Math.sin(7*Math.PI/4), // 8: B3 (7pi/4 rad)
            0, -H1, 0                                             // 9: Bottom pole
        ]);
        
        const indices = [];
        for (let k = 0; k < 4; k++) {
            const a0 = 1 + k * 2;
            const b0 = 2 + k * 2;
            const a1 = 1 + ((k + 1) % 4) * 2;
            const b1 = 2 + ((k + 1) % 4) * 2;
            
            // Upper kite faces (split into 2 triangles)
            indices.push(0, a0, b0);
            indices.push(0, b0, a1);
            
            // Lower kite faces (split into 2 triangles)
            indices.push(9, b0, a1);
            indices.push(9, b1, a1);
        }
        
        geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
        geometry.setIndex(indices);
        geometry.computeVertexNormals();
        return geometry;
    }, []);

    return (
        <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.5}>
            <mesh geometry={geo}>
                <MeshTransmissionMaterial
                    backside
                    side={THREE.DoubleSide}
                    thickness={0.8}
                    roughness={0.1}
                    transmission={0.9}
                    ior={1.7}
                    chromaticAberration={0.06}
                    color="#ef4444"
                    emissive="#991b1b"
                    emissiveIntensity={0.3}
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
                <ambientLight intensity={0.4} />
                {/* Directional light to cast strong specular highlights on edges */}
                <directionalLight position={[5, 5, 5]} intensity={1.5} color="#ffffff" />
                <directionalLight position={[-5, 3, -2]} intensity={0.8} color="#fca5a5" />
                <pointLight position={[0, 0, 5]} intensity={0.8} color="#fca5a5" />
                <pointLight position={[-5, 0, 0]} intensity={0.8} color="#f87171" />
                <pointLight position={[4, -3, -4]} intensity={1.0} color="#ef4444" />
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
