import React, { useMemo, useRef, useEffect } from 'react';
import { Physics } from '@react-three/cannon';
import { OrbitControls, Environment, ContactShadows } from '@react-three/drei';
import Die from './Die';
import Tray from './Tray';

interface GameSceneProps {
  diceCount: number;
  isShaking: boolean;
  throwTrigger: number;
  resetTrigger: number;
  onDieResult: (index: number, value: number) => void;
}

const GameScene: React.FC<GameSceneProps> = ({ diceCount, isShaking, throwTrigger, resetTrigger, onDieResult }) => {
  const controlsRef = useRef<any>(null);

  // Generate initial positions for dice
  const dicePositions = useMemo(() => {
    const pos: [number, number, number][] = [];
    for (let i = 0; i < diceCount; i++) {
      pos.push([
        (Math.random() - 0.5) * 4,
        5 + i * 1.5, // Stack them initially
        (Math.random() - 0.5) * 4
      ]);
    }
    return pos;
  }, [diceCount]);

  // Handle view reset
  useEffect(() => {
    if (controlsRef.current) {
      controlsRef.current.reset();
    }
  }, [resetTrigger]);

  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 20, 10]} intensity={1} castShadow />
      <Environment preset="sunset" />
      
      <OrbitControls 
        ref={controlsRef}
        makeDefault 
        minPolarAngle={0} 
        maxPolarAngle={Math.PI / 2.2} 
      />

      <Physics gravity={[0, -20, 0]} allowSleep>
        <Tray />
        {dicePositions.map((pos, index) => (
          <Die 
            key={index} 
            position={pos} 
            isShaking={isShaking} 
            throwTrigger={throwTrigger} 
            onRollComplete={(val) => onDieResult(index, val)}
          />
        ))}
      </Physics>
      
      <ContactShadows position={[0, -0.5, 0]} opacity={0.4} scale={20} blur={2} far={4} />
    </>
  );
};

export default GameScene;