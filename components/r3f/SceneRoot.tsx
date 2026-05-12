'use client';

import type { RefObject } from 'react';
import { Canvas } from '@react-three/fiber';
import { Stars, Sparkles } from '@react-three/drei';
import { EffectComposer, Bloom, Noise, Vignette } from '@react-three/postprocessing';
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
      {/* Background color — matches globals.css body bg */}
      <color attach="background" args={['#09090b']} />

      {/* ── Lighting ──────────────────────────────────────────────────────── */}
      <MainLights />

      {/* ── Primary 3D Object ─────────────────────────────────────────────── */}
      <HeroKnot scrollProxyRef={scrollProxyRef} />

      {/* ── Environment: star field for depth ────────────────────────────── */}
      <Stars
        radius={100}
        depth={50}
        count={5000}
        factor={4}
        saturation={0}
        fade
      />

      {/* ── Sparkles: cosmic dust matched to rim light colours ───────────── */}
      <Sparkles count={60} scale={8}  size={1.8} speed={0.15} color="#00f0ff" opacity={0.55} />
      <Sparkles count={40} scale={10} size={1.2} speed={0.10} color="#b47dff" opacity={0.40} />

      {/* ── Post-processing ───────────────────────────────────────────────── */}
      <EffectComposer>
        {/* luminanceThreshold:0 → stars & sparkles always receive bloom glow */}
        <Bloom
          luminanceThreshold={0}
          luminanceSmoothing={0.9}
          height={300}
          intensity={0.6}
          radius={0.8}
        />
        {/* Film grain for cinematic feel */}
        <Noise opacity={0.03} />
        {/* Vignette draws eye to centre */}
        <Vignette offset={0.3} darkness={0.5} />
      </EffectComposer>
    </Canvas>
  );
}
