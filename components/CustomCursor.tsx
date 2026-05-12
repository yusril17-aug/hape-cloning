'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';

// ─── Constants ────────────────────────────────────────────────────────────────
/** CSS selector for all elements that trigger the magnetic effect. */
const MAGNETIC_SELECTOR = 'a, button, [data-magnetic]';

/** Ring lag — lower = more lag (0–1). */
const RING_LAG = 0.12;

/** Resting ring dimensions in px. */
const RING_RESTING = { w: 36, h: 36 } as const;

// ─── Helpers ─────────────────────────────────────────────────────────────────
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/**
 * CustomCursor
 * ─────────────────────────────────────────────────
 * • dot  — follows mouse 1:1 via GSAP quickSetter (no layout thrash)
 * • ring — lag-follows via RAF loop; snaps magnetically to interactive elements
 *
 * All event listeners are removed and the RAF is cancelled on unmount.
 */
export default function CustomCursor() {
  const dotRef  = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const dot  = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;

    // ── GSAP quickSetters (bypass React & layout — pure transform) ────────
    const setDotX  = gsap.quickSetter(dot,  'x', 'px');
    const setDotY  = gsap.quickSetter(dot,  'y', 'px');
    const setRingX = gsap.quickSetter(ring, 'x', 'px');
    const setRingY = gsap.quickSetter(ring, 'y', 'px');

    // ── Mutable state (stored in plain objects — no setState calls) ───────
    const mouse    = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const ringPos  = { x: mouse.x, y: mouse.y };
    let magnetic   : Element | null = null;
    let magCenter  : { x: number; y: number } | null = null;
    let rafId      = 0;
    let isVisible  = false;

    // ── RAF loop: ring lag + magnetic snap ───────────────────────────────
    function tick() {
      const tx = magCenter ? magCenter.x : mouse.x;
      const ty = magCenter ? magCenter.y : mouse.y;
      ringPos.x = lerp(ringPos.x, tx, RING_LAG);
      ringPos.y = lerp(ringPos.y, ty, RING_LAG);
      setRingX(ringPos.x);
      setRingY(ringPos.y);
      rafId = requestAnimationFrame(tick);
    }
    rafId = requestAnimationFrame(tick);

    // ── Mouse move: move dot + reveal on first move ───────────────────────
    function onMouseMove(e: MouseEvent) {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      setDotX(mouse.x);
      setDotY(mouse.y);
      if (!isVisible) {
        isVisible = true;
        gsap.to([dot, ring], { opacity: 1, duration: 0.3 });
      }
    }

    // ── Magnetic enter ────────────────────────────────────────────────────
    function onMouseOver(e: MouseEvent) {
      const target = (e.target as Element).closest(MAGNETIC_SELECTOR);
      if (!target || target === magnetic) return;

      magnetic = target;
      const rect = target.getBoundingClientRect();
      magCenter = {
        x: rect.left + rect.width  / 2,
        y: rect.top  + rect.height / 2,
      };

      const size = Math.max(rect.width, rect.height) * 1.3;
      gsap.to(ring, { width: size, height: size, borderColor: '#00f0ff', opacity: 0.7, duration: 0.35, ease: 'power2.out' });
      gsap.to(dot,  { scale: 0.4, backgroundColor: '#00f0ff',            duration: 0.25, ease: 'power2.out' });
    }

    // ── Magnetic leave ────────────────────────────────────────────────────
    function onMouseOut(e: MouseEvent) {
      const target = (e.target as Element).closest(MAGNETIC_SELECTOR);
      if (!target || target !== magnetic) return;

      // Guard: do not reset if moving into a child element
      const related = e.relatedTarget as Element | null;
      if (related && target.contains(related)) return;

      magnetic  = null;
      magCenter = null;

      gsap.to(ring, { width: RING_RESTING.w, height: RING_RESTING.h, borderColor: 'rgba(255,255,255,0.45)', opacity: 1, duration: 0.35, ease: 'power2.out' });
      gsap.to(dot,  { scale: 1, backgroundColor: '#ffffff', duration: 0.25, ease: 'power2.out' });
    }

    // ── Keep magCenter in sync with scroll / resize ───────────────────────
    function updateMagCenter() {
      if (!magnetic) return;
      const rect = magnetic.getBoundingClientRect();
      magCenter = {
        x: rect.left + rect.width  / 2,
        y: rect.top  + rect.height / 2,
      };
    }

    // ── Cursor visibility on document leave / enter ───────────────────────
    function onDocLeave() { gsap.to([dot, ring], { opacity: 0, duration: 0.3 }); isVisible = false; }
    function onDocEnter() { gsap.to([dot, ring], { opacity: 1, duration: 0.3 }); isVisible = true;  }

    // ── Attach listeners ──────────────────────────────────────────────────
    window.addEventListener('mousemove', onMouseMove,     { passive: true });
    window.addEventListener('mouseover', onMouseOver,     { passive: true });
    window.addEventListener('mouseout',  onMouseOut,      { passive: true });
    window.addEventListener('scroll',    updateMagCenter, { passive: true });
    window.addEventListener('resize',    updateMagCenter, { passive: true });
    document.documentElement.addEventListener('mouseleave', onDocLeave);
    document.documentElement.addEventListener('mouseenter', onDocEnter);

    // ── Cleanup: cancel RAF + remove all listeners ────────────────────────
    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseover', onMouseOver);
      window.removeEventListener('mouseout',  onMouseOut);
      window.removeEventListener('scroll',    updateMagCenter);
      window.removeEventListener('resize',    updateMagCenter);
      document.documentElement.removeEventListener('mouseleave', onDocLeave);
      document.documentElement.removeEventListener('mouseenter', onDocEnter);
    };
  }, []);

  return (
    <>
      {/* DOT — 1:1 mouse follower */}
      <div
        ref={dotRef}
        aria-hidden="true"
        style={{
          position:        'fixed',
          top:             0,
          left:            0,
          width:           8,
          height:          8,
          borderRadius:    '50%',
          backgroundColor: '#ffffff',
          pointerEvents:   'none',
          zIndex:          99999,
          opacity:         0,
          transform:       'translate(-50%, -50%)',
          willChange:      'transform',
          mixBlendMode:    'difference',
        }}
      />

      {/* RING — lagging follower with magnetic snap */}
      <div
        ref={ringRef}
        aria-hidden="true"
        style={{
          position:      'fixed',
          top:           0,
          left:          0,
          width:         RING_RESTING.w,
          height:        RING_RESTING.h,
          borderRadius:  '50%',
          border:        '1.5px solid rgba(255,255,255,0.45)',
          pointerEvents: 'none',
          zIndex:        99998,
          opacity:       0,
          transform:     'translate(-50%, -50%)',
          willChange:    'transform, width, height',
        }}
      />
    </>
  );
}
