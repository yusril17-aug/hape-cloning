'use client';

import { useRef } from 'react';
import CanvasScene from '../components/CanvasScene';
import OverlayUI from '../components/OverlayUI';

export default function Page() {
  const pageRef = useRef<HTMLElement>(null!);
  const scrollProxyRef = useRef<HTMLDivElement>(null);

  return (
    <main ref={pageRef} className="relative min-h-[600vh] bg-zinc-950 text-white">
      <div
        ref={scrollProxyRef}
        className="pointer-events-none absolute inset-x-0 top-0 h-[600vh]"
        aria-hidden
      />
      <CanvasScene eventSourceRef={pageRef} scrollProxyRef={scrollProxyRef} />
      <OverlayUI scrollProxyRef={scrollProxyRef} />
    </main>
  );
}
