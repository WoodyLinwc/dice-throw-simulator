import * as THREE from 'three';

/**
 * Generates a canvas texture for a specific die face (1-6).
 */
export const createDieFaceTexture = (number: number, color: string = 'white', dotColor: string = 'black'): THREE.CanvasTexture => {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  if (!ctx) throw new Error("Could not create canvas context");

  // Background
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, size, size);

  // Border/Edge simulation (soft shadow)
  ctx.strokeStyle = '#e0e0e0';
  ctx.lineWidth = 10;
  ctx.strokeRect(0, 0, size, size);

  // Dots
  ctx.fillStyle = dotColor;
  const radius = size * 0.1;
  const center = size / 2;
  const offset = size * 0.25;

  const drawDot = (x: number, y: number) => {
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
  };

  if (number % 2 === 1) {
    drawDot(center, center); // Center dot for 1, 3, 5
  }
  if (number > 1) {
    drawDot(center - offset, center - offset); // Top-left
    drawDot(center + offset, center + offset); // Bottom-right
  }
  if (number > 3) {
    drawDot(center + offset, center - offset); // Top-right
    drawDot(center - offset, center + offset); // Bottom-left
  }
  if (number === 6) {
    drawDot(center - offset, center); // Middle-left
    drawDot(center + offset, center); // Middle-right
  }

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
};

// Pre-generate materials map
export const getDiceMaterials = () => {
  const materials = [
    new THREE.MeshStandardMaterial({ map: createDieFaceTexture(1), roughness: 0.1, metalness: 0 }), // Right
    new THREE.MeshStandardMaterial({ map: createDieFaceTexture(6), roughness: 0.1, metalness: 0 }), // Left
    new THREE.MeshStandardMaterial({ map: createDieFaceTexture(2), roughness: 0.1, metalness: 0 }), // Top
    new THREE.MeshStandardMaterial({ map: createDieFaceTexture(5), roughness: 0.1, metalness: 0 }), // Bottom
    new THREE.MeshStandardMaterial({ map: createDieFaceTexture(3), roughness: 0.1, metalness: 0 }), // Front
    new THREE.MeshStandardMaterial({ map: createDieFaceTexture(4), roughness: 0.1, metalness: 0 }), // Back
  ];
  return materials;
};
