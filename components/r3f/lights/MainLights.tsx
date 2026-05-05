'use client';

import { Environment } from '@react-three/drei';

export default function MainLights() {
  return (
    <>
      <ambientLight color="#ffffff" intensity={0.5} />
      <directionalLight position={[5, 10, 5]} intensity={4} color="#ffffff" />
      <pointLight position={[-10, -5, -10]} intensity={15} color="#00f0ff" />
      <pointLight position={[10, -5, 5]} intensity={15} color="#bd00ff" />
      <Environment preset="city" />
    </>
  );
}
