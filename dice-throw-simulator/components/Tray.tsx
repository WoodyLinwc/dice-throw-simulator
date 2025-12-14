import React from 'react';
import { useBox } from '@react-three/cannon';
import * as THREE from 'three';

const Tray: React.FC = () => {
  // Floor
  const [floorRef] = useBox(() => ({
    type: 'Static',
    args: [15, 1, 15],
    position: [0, -0.5, 0],
    friction: 0.5,
    restitution: 0.3,
  }));

  // Visual Walls
  const wallThickness = 1;
  const wallHeight = 4;
  const size = 15;
  const offset = size / 2 + wallThickness / 2;

  const [northWall] = useBox(() => ({
    type: 'Static',
    args: [size + wallThickness * 2, wallHeight, wallThickness],
    position: [0, wallHeight / 2 - 0.5, -offset],
  }));

  const [southWall] = useBox(() => ({
    type: 'Static',
    args: [size + wallThickness * 2, wallHeight, wallThickness],
    position: [0, wallHeight / 2 - 0.5, offset],
  }));

  const [eastWall] = useBox(() => ({
    type: 'Static',
    args: [wallThickness, wallHeight, size],
    position: [offset, wallHeight / 2 - 0.5, 0],
  }));

  const [westWall] = useBox(() => ({
    type: 'Static',
    args: [wallThickness, wallHeight, size],
    position: [-offset, wallHeight / 2 - 0.5, 0],
  }));

  // Invisible Containment Walls (Taller to catch high throws)
  const invisibleHeight = 20;
  const [invNorth] = useBox(() => ({
    type: 'Static',
    args: [size + 4, invisibleHeight, 1], // Slightly wider to cover corners
    position: [0, invisibleHeight / 2, -offset],
    visible: false
  }));

  const [invSouth] = useBox(() => ({
    type: 'Static',
    args: [size + 4, invisibleHeight, 1],
    position: [0, invisibleHeight / 2, offset],
    visible: false
  }));

  const [invEast] = useBox(() => ({
    type: 'Static',
    args: [1, invisibleHeight, size + 4],
    position: [offset, invisibleHeight / 2, 0],
    visible: false
  }));

  const [invWest] = useBox(() => ({
    type: 'Static',
    args: [1, invisibleHeight, size + 4],
    position: [-offset, invisibleHeight / 2, 0],
    visible: false
  }));

  const woodMaterial = new THREE.MeshStandardMaterial({
    color: '#5d4037', // Dark wood
    roughness: 0.8,
    metalness: 0.1,
  });

  return (
    <group>
      <mesh ref={floorRef as any} receiveShadow material={woodMaterial}>
        <boxGeometry args={[15, 1, 15]} />
      </mesh>
      <mesh ref={northWall as any} castShadow receiveShadow material={woodMaterial}>
        <boxGeometry args={[size + wallThickness * 2, wallHeight, wallThickness]} />
      </mesh>
      <mesh ref={southWall as any} castShadow receiveShadow material={woodMaterial}>
        <boxGeometry args={[size + wallThickness * 2, wallHeight, wallThickness]} />
      </mesh>
      <mesh ref={eastWall as any} castShadow receiveShadow material={woodMaterial}>
        <boxGeometry args={[wallThickness, wallHeight, size]} />
      </mesh>
      <mesh ref={westWall as any} castShadow receiveShadow material={woodMaterial}>
        <boxGeometry args={[wallThickness, wallHeight, size]} />
      </mesh>
      
      {/* Invisible Colliders don't need meshes, but we render nothing for them */}
    </group>
  );
};

export default Tray;