'use client';

import type { RefObject } from 'react';
import SceneRoot from './r3f/SceneRoot';

type CanvasSceneProps = {
  eventSourceRef: RefObject<HTMLElement>;
  scrollProxyRef: RefObject<HTMLDivElement | null>;
};

export default function CanvasScene({ eventSourceRef, scrollProxyRef }: CanvasSceneProps) {
  return (
    <div className="pointer-events-none absolute inset-0 z-10 h-[100dvh]">
      <SceneRoot eventSourceRef={eventSourceRef} scrollProxyRef={scrollProxyRef} />

      <div className="pointer-events-none absolute inset-0 flex items-center justify-center text-white/40">
        <span className="text-xs font-semibold uppercase tracking-[0.3em]">[ R3F CANVAS READY ]</span>
      </div>
    </div>
  );
}
