import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars, Text, Float, Line } from '@react-three/drei';
import * as THREE from 'three';
import { UnitState } from '../lib/engine';
import type { Unit } from '../lib/engine';

const COL = {
    COLLAPSED: '#ff004c',
    STRESSED: '#ffa500',
    STABLE: '#00ffca'
};

const Node = ({ unit, onSelect }: { unit: Unit, onSelect: (u: Unit) => void }) => {
    const mesh = useRef<THREE.Mesh>(null);

    const c = useMemo(() => {
        if (unit.state === UnitState.COLLAPSED) return COL.COLLAPSED;
        if (unit.state === UnitState.STRESSED) return COL.STRESSED;
        return COL.STABLE;
    }, [unit.state]);

    useFrame((state: any) => {
        if (mesh.current) {
            const t = state.clock.getElapsedTime();
            mesh.current.position.y = unit.position[1] + Math.sin(t + unit.position[0]) * 0.1;
            if (unit.state === UnitState.STRESSED) {
                mesh.current.scale.setScalar(1 + Math.sin(t * 10) * 0.05);
            }
        }
    });

    return (
        <group position={unit.position} onClick={() => onSelect(unit)}>
            <mesh ref={mesh}>
                <sphereGeometry args={[0.2, 32, 32]} />
                <meshStandardMaterial color={c} emissive={c} emissiveIntensity={unit.state === UnitState.COLLAPSED ? 2 : 0.5} toneMapped={false} />
            </mesh>
            <pointLight distance={1} intensity={0.5} color={c} />
            <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
                <Text position={[0, 0.4, 0]} fontSize={0.12} color="white" anchorX="center" anchorY="middle">
                    {unit.id}
                </Text>
            </Float>
        </group>
    );
};

const Connection = ({ start, end, active }: { start: [number, number, number], end: [number, number, number], active: boolean }) => (
    <Line points={[start, end]} color={active ? COL.COLLAPSED : "#1a1a1a"} lineWidth={active ? 2 : 1} transparent opacity={active ? 1 : 0.3} />
);

export const NetworkGraph = ({ units, connections, onSelectUnit }: { units: Unit[], connections: [string, string][], onSelectUnit: (u: Unit) => void }) => {
    return (
        <div style={{ width: '100%', height: '100%', background: '#050505' }}>
            <Canvas camera={{ position: [5, 5, 5], fov: 45 }}>
                <color attach="background" args={['#050505']} />
                <fog attach="fog" args={['#050505', 5, 20]} />
                <ambientLight intensity={0.2} />
                <pointLight position={[10, 10, 10]} intensity={1} />
                <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />

                {units.map(u => <Node key={u.id} unit={u} onSelect={onSelectUnit} />)}

                {connections.map(([a, b], idx) => {
                    const u1 = units.find(u => u.id === a);
                    const u2 = units.find(u => u.id === b);
                    if (!u1 || !u2) return null;
                    return <Connection key={idx} start={u1.position} end={u2.position} active={u1.state === UnitState.COLLAPSED || u2.state === UnitState.COLLAPSED} />;
                })}

                <OrbitControls makeDefault />
            </Canvas>
        </div>
    );
};
