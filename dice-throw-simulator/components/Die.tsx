import React, { useMemo, useEffect, useRef } from 'react';
import { useBox } from '@react-three/cannon';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { getDiceMaterials } from '../utils';
import { DieProps } from '../types';

const Die: React.FC<DieProps> = ({ position, isShaking, throwTrigger, onRollComplete }) => {
  const [ref, api] = useBox(() => ({
    mass: 1,
    position,
    args: [1, 1, 1], // Box size
    friction: 0.1,
    restitution: 0.5, // Bounciness
    sleepSpeedLimit: 0.1, // Sleep threshold
  }));

  const materials = useMemo(() => getDiceMaterials(), []);
  
  // Refs to track physics state
  const velocity = useRef([0, 0, 0]);
  const quaternion = useRef([0, 0, 0, 1]);
  const isRolling = useRef(false);
  const stoppedTime = useRef(0);

  useEffect(() => api.velocity.subscribe((v) => (velocity.current = v)), [api.velocity]);
  useEffect(() => api.quaternion.subscribe((q) => (quaternion.current = q)), [api.quaternion]);

  // Face detection logic
  const getValue = () => {
    const q = new THREE.Quaternion(quaternion.current[0], quaternion.current[1], quaternion.current[2], quaternion.current[3]);
    // The vector (0,1,0) in world space is "up".
    // We want to find which local axis aligns with world "up".
    // Apply inverse quaternion to (0,1,0) to get "up" in local space.
    const up = new THREE.Vector3(0, 1, 0).applyQuaternion(q.invert());

    // Compare with local face normals
    // Right (1): +x, Left (6): -x, Top (2): +y, Bottom (5): -y, Front (3): +z, Back (4): -z
    const faces = [
      { dir: [1, 0, 0], val: 1 },
      { dir: [-1, 0, 0], val: 6 },
      { dir: [0, 1, 0], val: 2 },
      { dir: [0, -1, 0], val: 5 },
      { dir: [0, 0, 1], val: 3 },
      { dir: [0, 0, -1], val: 4 },
    ];

    let bestDot = -Infinity;
    let result = 1;

    for (const { dir, val } of faces) {
      const dot = up.x * dir[0] + up.y * dir[1] + up.z * dir[2];
      if (dot > bestDot) {
        bestDot = dot;
        result = val;
      }
    }
    return result;
  };

  // Handle Shaking and Physics monitoring
  useFrame((state, delta) => {
    if (isShaking) {
      const time = state.clock.getElapsedTime();
      
      const swirlSpeed = 15;
      const swirlRadius = 2.5; 
      const centerX = Math.sin(time * swirlSpeed) * swirlRadius;
      const centerZ = Math.cos(time * swirlSpeed) * swirlRadius;
      
      const jitterSpeed = 30;
      const jitterAmt = 0.5;
      const seed = position[0] * 13.37 + position[2] * 4.2; 

      const jitterX = Math.sin(time * jitterSpeed + seed) * jitterAmt;
      const jitterY = Math.cos(time * jitterSpeed * 1.2 + seed) * jitterAmt;
      const jitterZ = Math.sin(time * jitterSpeed * 0.8 + seed) * jitterAmt;

      const clumpX = position[0] * 0.1;
      const clumpZ = position[2] * 0.1;

      const x = centerX + clumpX + jitterX;
      const y = 5 + jitterY; 
      const z = centerZ + clumpZ + jitterZ;

      api.position.set(x, y, z);
      api.velocity.set(0, 0, 0); 
      
      api.angularVelocity.set(
        Math.sin(time * 20 + seed) * 20,
        Math.cos(time * 25 + seed) * 20,
        Math.sin(time * 30 + seed) * 20
      );
      
      // Reset rolling state while shaking
      isRolling.current = false;
      stoppedTime.current = 0;
    } else if (isRolling.current) {
      // Check if stopped
      const v = velocity.current;
      const speed = Math.sqrt(v[0]**2 + v[1]**2 + v[2]**2);
      
      if (speed < 0.1) {
        stoppedTime.current += delta;
        // If stopped for > 0.5s, confirm result
        if (stoppedTime.current > 0.5) {
          isRolling.current = false;
          const val = getValue();
          onRollComplete(val);
        }
      } else {
        stoppedTime.current = 0;
      }
    }
  });

  // Handle Throw
  useEffect(() => {
    if (throwTrigger > 0 && !isShaking) {
      api.wakeUp();
      api.velocity.set(
        (Math.random() - 0.5) * 10,
        -8 + (Math.random() * 4), 
        (Math.random() - 0.5) * 10
      );
      api.angularVelocity.set(
        (Math.random() - 0.5) * 60,
        (Math.random() - 0.5) * 60,
        (Math.random() - 0.5) * 60
      );
      
      // Start monitoring for result
      isRolling.current = true;
      stoppedTime.current = 0;
    }
  }, [throwTrigger, isShaking, api]);

  return (
    <mesh ref={ref as any} castShadow receiveShadow geometry={new THREE.BoxGeometry(1, 1, 1)} material={materials} />
  );
};

export default Die;