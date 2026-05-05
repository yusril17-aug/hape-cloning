'use client';

import { useRef } from 'react';
import type { RefObject } from 'react';
import * as THREE from 'three';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(ScrollTrigger, useGSAP);

type HeroKnotProps = {
  scrollProxyRef: RefObject<HTMLDivElement | null>;
};

export default function HeroKnot({ scrollProxyRef }: HeroKnotProps) {
  const meshRef = useRef<THREE.Mesh>(null);

  useGSAP(() => {
    if (!scrollProxyRef?.current || !meshRef.current) return;

    gsap.set(meshRef.current.rotation, { x: 0.2, y: 0.45, z: 0 });
    gsap.set(meshRef.current.position, { y: 0 });

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: scrollProxyRef.current,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 1,
      },
    });

    tl.to(meshRef.current.rotation, {
      x: 1.05,
      y: 3.2,
      z: 0.35,
      ease: 'none',
      duration: 1.2,
    }).to(
      meshRef.current.position,
      {
        y: -1.1,
        ease: 'none',
        duration: 1.2,
      },
      0,
    );
  }, { dependencies: [scrollProxyRef] });

  return (
    <mesh ref={meshRef}>
      <torusKnotGeometry args={[1, 0.28, 192, 28]} />
      <meshPhysicalMaterial color="#111111" metalness={1} roughness={0.15} clearcoat={1} />
    </mesh>
  );
}
