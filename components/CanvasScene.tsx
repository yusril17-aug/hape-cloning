'use client';

import type { RefObject } from 'react';
import SceneRoot from './r3f/SceneRoot';

type CanvasSceneProps = {
  eventSourceRef: RefObject<HTMLElement>;
  scrollProxyRef: RefObject<HTMLDivElement | null>;
};

/**
 * CanvasScene
 * Thin wrapper that pins the WebGL canvas to the viewport with `fixed` positioning.
 * Must be `fixed` (not `absolute`) so the canvas stays on screen during scroll.
 */
export default function CanvasScene({ eventSourceRef, scrollProxyRef }: CanvasSceneProps) {
  return (
    <div className="pointer-events-none fixed inset-0 z-10 h-[100dvh]">
      <SceneRoot eventSourceRef={eventSourceRef} scrollProxyRef={scrollProxyRef} />
    </div>
  );
}
