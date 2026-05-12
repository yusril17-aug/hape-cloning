'use client';

import { useRef, useState, useEffect } from 'react';
import type { RefObject } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

// ─── Math Helpers ─────────────────────────────────────────────────────────────
const lerp    = (a: number, b: number, t: number) => a + (b - a) * t;
const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const mapRange = (p: number, lo: number, hi: number) => clamp01((p - lo) / (hi - lo));

// ─── Keyframe State Type ─────────────────────────────────────────────────────
// Defined OUTSIDE useFrame so it is never re-created per tick.
interface KnotState {
  sx: number; sy: number; sz: number;  // scale xyz
  px: number; py: number; pz: number;  // position xyz (3D units)
  er: number; eg: number; eb: number;  // emissive RGB (0–1)
  wire: boolean;                       // wireframe mode
  spin: number;                        // auto-rotate speed (rad/frame)
}

// ─── Section Keyframes ────────────────────────────────────────────────────────
// Progress zones: HERO 0–0.20 | ABOUT 0.20–0.50 | WORKS 0.50–0.85 | CONTACT 0.85–1.00
const HERO: KnotState    = { sx:1.00,sy:1.00,sz:1.00, px:0,  py:0,  pz:0, er:0,    eg:0,    eb:0,    wire:false, spin:0.002 };
const ABOUT: KnotState   = { sx:0.60,sy:0.60,sz:0.60, px:2.0,py:0,  pz:0, er:0.04, eg:0.06, eb:0.14, wire:false, spin:0.004 };
const WORKS: KnotState   = { sx:0.35,sy:0.35,sz:0.35, px:0,  py:1.6,pz:0, er:0,    eg:0.20, eb:0.25, wire:true,  spin:0.008 };
const CONTACT: KnotState = { sx:1.10,sy:1.10,sz:1.10, px:0,  py:0,  pz:0, er:0.16, eg:0,    eb:0.22, wire:false, spin:0.04  };

// ─── Transition Zones ─────────────────────────────────────────────────────────
const ZONE_HERO_END      = 0.20;
const ZONE_ABOUT_TRANS   = 0.30;
const ZONE_ABOUT_END     = 0.50;
const ZONE_WORKS_TRANS   = 0.60;
const ZONE_WORKS_END     = 0.85;
const ZONE_CONTACT_TRANS = 0.94;

/** Linearly interpolate all numeric fields between two KnotState keyframes. */
function blendState(a: KnotState, b: KnotState, t: number, wire: boolean): KnotState {
  return {
    sx: lerp(a.sx, b.sx, t), sy: lerp(a.sy, b.sy, t), sz: lerp(a.sz, b.sz, t),
    px: lerp(a.px, b.px, t), py: lerp(a.py, b.py, t), pz: lerp(a.pz, b.pz, t),
    er: lerp(a.er, b.er, t), eg: lerp(a.eg, b.eg, t), eb: lerp(a.eb, b.eb, t),
    wire,
    spin: lerp(a.spin, b.spin, t),
  };
}

/** Resolve which KnotState to target given scroll progress [0–1]. */
function resolveTarget(p: number): KnotState {
  if (p < ZONE_HERO_END)      return HERO;
  if (p < ZONE_ABOUT_TRANS)   return blendState(HERO,  ABOUT,   mapRange(p, ZONE_HERO_END, ZONE_ABOUT_TRANS),   false);
  if (p < ZONE_ABOUT_END)     return ABOUT;
  if (p < ZONE_WORKS_TRANS)   { const t = mapRange(p, ZONE_ABOUT_END, ZONE_WORKS_TRANS); return blendState(ABOUT, WORKS,   t, t > 0.5); }
  if (p < ZONE_WORKS_END)     return WORKS;
  if (p < ZONE_CONTACT_TRANS) { const t = mapRange(p, ZONE_WORKS_END, ZONE_CONTACT_TRANS); return blendState(WORKS, CONTACT, t, t < 0.5); }
  return CONTACT;
}

// ─── Component ────────────────────────────────────────────────────────────────
type HeroKnotProps = {
  scrollProxyRef: RefObject<HTMLDivElement | null>;
};

export default function HeroKnot({ scrollProxyRef }: HeroKnotProps) {
  const meshRef      = useRef<THREE.Mesh>(null);
  const materialRef  = useRef<THREE.MeshPhysicalMaterial>(null);
  const mouseRotRef  = useRef({ x: 0, y: 0 });
  const autoSpeedRef = useRef(0);
  // isHovering stored in ref to avoid re-renders on pointer enter/leave
  const isHoveringRef = useRef(false);

  // ─── Dispose Three.js resources on unmount ────────────────────────────────
  useEffect(() => {
    return () => {
      meshRef.current?.geometry?.dispose();
      if (materialRef.current) {
        materialRef.current.dispose();
      }
    };
  }, []);

  // ─── Per-frame animation (zero React re-renders) ──────────────────────────
  useFrame(({ mouse }) => {
    const mesh = meshRef.current;
    const mat  = materialRef.current;
    if (!mesh || !mat) return;

    // Read scroll progress directly from DOM (no GSAP dependency needed here)
    const proxy     = scrollProxyRef.current;
    const maxScroll = proxy ? proxy.scrollHeight - window.innerHeight : 1;
    const p         = clamp01(maxScroll > 0 ? window.scrollY / maxScroll : 0);

    const target = resolveTarget(p);
    const S = 0.07; // smoothing factor

    // Position & scale
    mesh.scale.x    += (target.sx - mesh.scale.x)    * S;
    mesh.scale.y    += (target.sy - mesh.scale.y)    * S;
    mesh.scale.z    += (target.sz - mesh.scale.z)    * S;
    mesh.position.x += (target.px - mesh.position.x) * S;
    mesh.position.y += (target.py - mesh.position.y) * S;
    mesh.position.z += (target.pz - mesh.position.z) * S;

    // Emissive color
    mat.emissive.r += (target.er - mat.emissive.r) * S;
    mat.emissive.g += (target.eg - mat.emissive.g) * S;
    mat.emissive.b += (target.eb - mat.emissive.b) * S;

    // Wireframe (boolean — just set directly)
    mat.wireframe = target.wire;

    // Auto-rotation
    autoSpeedRef.current += (target.spin - autoSpeedRef.current) * S;
    mesh.rotation.y += autoSpeedRef.current;

    // Mouse parallax (additive, only when hovering)
    const targetMX = isHoveringRef.current ? mouse.y * 0.4 : 0;
    const targetMY = isHoveringRef.current ? mouse.x * 0.4 : 0;
    mouseRotRef.current.x += (targetMX - mouseRotRef.current.x) * 0.08;
    mouseRotRef.current.y += (targetMY - mouseRotRef.current.y) * 0.08;
    mesh.rotation.x += mouseRotRef.current.x * 0.05;
  });

  return (
    <mesh
      ref={meshRef}
      onPointerEnter={() => { isHoveringRef.current = true;  }}
      onPointerLeave={() => { isHoveringRef.current = false; }}
    >
      <torusKnotGeometry args={[1, 0.28, 192, 28]} />
      <meshPhysicalMaterial
        ref={materialRef}
        color="#2a2a3e"
        metalness={1}
        roughness={0.08}
        clearcoat={1}
        clearcoatRoughness={0.1}
        emissive="#000000"
        emissiveIntensity={1}
      />
    </mesh>
  );
}
