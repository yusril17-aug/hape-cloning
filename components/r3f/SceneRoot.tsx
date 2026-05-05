'use client';

import type { RefObject } from 'react';
import { Canvas } from '@react-three/fiber';
import MainLights from './lights/MainLights';
import HeroKnot from './objects/HeroKnot';

type SceneRootProps = {
  eventSourceRef: RefObject<HTMLElement>;
  scrollProxyRef: RefObject<HTMLDivElement | null>;
};

export default function SceneRoot({ eventSourceRef, scrollProxyRef }: SceneRootProps) {
  return (
    <Canvas
      dpr={[1, 1.5]}
      camera={{ position: [0, 0, 6], fov: 45 }}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      eventSource={eventSourceRef}
      eventPrefix="client"
    >
      <color attach="background" args={['#09090b']} />
      <MainLights />
      <HeroKnot scrollProxyRef={scrollProxyRef} />
    </Canvas>
  );
}
