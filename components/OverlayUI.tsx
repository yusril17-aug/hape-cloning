'use client';

import { useRef } from 'react';
import type { RefObject } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(ScrollTrigger, useGSAP);

// ─── Static Data (separated from animation logic) ─────────────────────────────
const aboutLines = [
  'Building immersive digital worlds for bold brands.',
  'We blend motion, storytelling, and high-end interfaces.',
  'Designed for future-ready products in Web3 culture.',
];

const contactLinks = ['X / TWITTER', 'INSTAGRAM', 'DISCORD', 'BEHANCE'];

const worksProjects = [
  { id: 1, title: 'Aurora Protocol',  description: 'Web3 interactive dashboard with real-time data visualization' },
  { id: 2, title: 'Nexus Experience', description: 'Immersive brand experience combining 3D and motion design' },
  { id: 3, title: 'Quantum UI',       description: 'Advanced interface design for next-gen applications' },
  { id: 4, title: 'MotionFlow',       description: 'Animation framework for seamless digital interactions' },
];

// ─── Scroll Zone Constants ────────────────────────────────────────────────────
// These mirror the KnotState zones in HeroKnot.tsx.
const ZONE = {
  HERO_OUT_START:    20,
  ABOUT_IN_START:    25,
  ABOUT_OUT_START:   45,
  WORKS_IN_START:    50,
  WORKS_SCROLL_END:  85,   // also works-out start
  CONTACT_IN_START:  90,
  TIMELINE_END:     100,
} as const;

// ─── Types ────────────────────────────────────────────────────────────────────
type OverlayUIProps = {
  scrollProxyRef: RefObject<HTMLDivElement | null>;
};

// ─── Component ────────────────────────────────────────────────────────────────
export default function OverlayUI({ scrollProxyRef }: OverlayUIProps) {
  const rootRef           = useRef<HTMLDivElement>(null);
  const heroRef           = useRef<HTMLDivElement>(null);
  const aboutRef          = useRef<HTMLDivElement>(null);
  const contactRef        = useRef<HTMLDivElement>(null);
  const worksContainerRef = useRef<HTMLDivElement>(null);
  const worksTrackRef     = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      // ── Safety check ──────────────────────────────────────────────────────
      if (
        !scrollProxyRef.current   ||
        !heroRef.current          ||
        !aboutRef.current         ||
        !worksContainerRef.current ||
        !worksTrackRef.current    ||
        !contactRef.current
      ) return;

      // ── GSAP Context: scopes all animations; auto-cleans on unmount ───────
      const ctx = gsap.context(() => {
        // ── Master Timeline (0–100 maps to scroll 0%–100%) ─────────────────
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger:            scrollProxyRef.current,
            start:              'top top',
            end:                'bottom bottom',
            scrub:              1,
            invalidateOnRefresh: true,
            onUpdate(self) {
              // Toggle pointer-events based on each section's current opacity.
              // Only the visible section should be interactive.
              const refs = [
                heroRef.current,
                aboutRef.current,
                worksContainerRef.current,
                contactRef.current,
              ];
              refs.forEach((el) => {
                if (!el) return;
                const opacity = gsap.getProperty(el, 'opacity') as number;
                el.style.pointerEvents = opacity > 0.5 ? 'auto' : 'none';
              });
              void self; // satisfy linter — self used implicitly via closure
            },
          },
        });

        // Extend timeline to exactly 100 units so positions map to percentages
        tl.addLabel('start', 0);
        tl.addLabel('end',   ZONE.TIMELINE_END);

        // ── ZONA 1 → 2: Hero text out ───────────────────────────────────────
        tl.to(heroRef.current, {
          opacity:  0,
          scale:    0.85,
          y:        -30,
          duration: 5,
          ease:     'power2.inOut',
        }, ZONE.HERO_OUT_START);

        // ── ZONA 2: About in ────────────────────────────────────────────────
        tl.fromTo(
          aboutRef.current,
          { opacity: 0, visibility: 'hidden', y: 50 },
          { opacity: 1, visibility: 'visible', y: 0, duration: 5, ease: 'power2.out' },
          ZONE.ABOUT_IN_START,
        );

        // About out
        tl.to(aboutRef.current, {
          opacity:    0,
          visibility: 'hidden',
          y:          -50,
          duration:   5,
          ease:       'power2.inOut',
        }, ZONE.ABOUT_OUT_START);

        // ── ZONA 3: Works in ────────────────────────────────────────────────
        tl.fromTo(
          worksContainerRef.current,
          { opacity: 0, visibility: 'hidden' },
          { opacity: 1, visibility: 'visible', duration: 5, ease: 'power2.out' },
          ZONE.WORKS_IN_START,
        );

        // Horizontal scroll track
        tl.to(worksTrackRef.current, {
          x: () =>
            worksTrackRef.current
              ? -(worksTrackRef.current.scrollWidth) + window.innerWidth
              : 0,
          duration: ZONE.WORKS_SCROLL_END - ZONE.WORKS_IN_START, // 35 units
          ease:     'none',
        }, ZONE.WORKS_IN_START);

        // Works out
        tl.to(worksContainerRef.current, {
          opacity:    0,
          visibility: 'hidden',
          duration:   5,
          ease:       'power2.inOut',
        }, ZONE.WORKS_SCROLL_END);

        // ── ZONA 4: Contact in ──────────────────────────────────────────────
        tl.fromTo(
          contactRef.current,
          { opacity: 0, visibility: 'hidden' },
          { opacity: 1, visibility: 'visible', duration: 10, ease: 'power2.out' },
          ZONE.CONTACT_IN_START,
        );
      }); // end gsap.context

      // ── Cleanup: GSAP Context reverts all tweens & kills ScrollTrigger ────
      return () => ctx.revert();
    },
    { scope: rootRef, dependencies: [scrollProxyRef] },
  );

  // ────────────────────────────────────────────────────────────────────────────
  // JSX
  // ────────────────────────────────────────────────────────────────────────────
  return (
    <div
      ref={rootRef}
      className="fixed inset-0 z-20 h-[100dvh] pointer-events-none flex flex-col justify-between overflow-hidden text-white"
    >
      {/* ── Site Header ─────────────────────────────────────────────────── */}
      <header className="w-full p-6 md:p-8 flex justify-between items-center pointer-events-auto">
        <nav className="w-full flex items-center justify-between">
          <a href="#" className="text-lg font-black uppercase tracking-[0.2em] text-zinc-100">
            HAPE.CLONE
          </a>
          <ul className="flex items-center gap-8 text-xs font-semibold uppercase tracking-[0.18em] text-zinc-300">
            {['About', 'Works', 'Contact'].map((item) => (
              <li key={item}>
                <a href="#" className="transition-colors duration-300 hover:text-[#00f0ff]">
                  {item}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </header>

      {/* ── ZONA 1: Hero Text ─────────────────────────────────────────────── */}
      <section className="absolute inset-0 z-0">
        <div
          ref={heroRef}
          className="pointer-events-auto select-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center text-[25vw] md:text-[15vw] font-black uppercase leading-[0.86] tracking-tight text-zinc-800/10"
        >
          HAPE
          <br />
          STUDIO
        </div>
      </section>

      {/* ── Decorative ring (always visible) ─────────────────────────────── */}
      <section className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
        <div className="h-[56vmin] w-[56vmin] rounded-full border border-dashed border-zinc-700/40 bg-transparent" />
      </section>

      {/* ── Overlay Sections (z-20) ───────────────────────────────────────── */}
      <div className="pointer-events-none absolute inset-0 z-20">

        {/* ZONA 2: About */}
        <section
          ref={aboutRef}
          className="absolute bottom-20 left-6 max-w-sm md:bottom-8 md:left-8 opacity-0 invisible pointer-events-none"
        >
          <h2 className="mb-4 text-sm font-bold uppercase tracking-[0.2em] text-zinc-400">About</h2>
          <div className="space-y-2 text-zinc-300 text-xs md:text-sm leading-relaxed">
            {aboutLines.map((line) => (
              <p key={line}>{line}</p>
            ))}
          </div>
        </section>

        {/* ZONA 4: Contact */}
        <section
          ref={contactRef}
          className="absolute top-24 right-6 text-right md:top-auto md:bottom-8 md:right-8 opacity-0 invisible pointer-events-none"
        >
          <h2 className="mb-5 text-sm font-bold uppercase tracking-[0.2em] text-zinc-400">Studio / Contact</h2>
          <div className="flex flex-col gap-2 md:gap-3">
            {contactLinks.map((label) => (
              <a
                key={label}
                href="#"
                className="text-xl font-black uppercase tracking-tight text-zinc-200 transition-colors hover:text-white md:text-3xl"
              >
                {label}
              </a>
            ))}
          </div>
        </section>

        {/* ZONA 3: Works */}
        <section
          ref={worksContainerRef}
          className="absolute inset-0 overflow-hidden opacity-0 invisible pointer-events-none"
        >
          <div className="absolute inset-0 flex flex-col justify-start pt-12 md:pt-20">
            <h2 className="px-6 md:px-8 mb-12 text-sm font-bold uppercase tracking-[0.2em] text-zinc-400">
              Selected Works
            </h2>

            {/* Horizontal Scroll Track */}
            <div
              ref={worksTrackRef}
              className="flex gap-16 px-[10vw] will-change-transform w-max"
            >
              {worksProjects.map((project) => (
                <div key={project.id} className="flex-shrink-0 w-80 flex flex-col gap-4">
                  {/* Thumbnail placeholder */}
                  <div className="w-80 h-48 bg-gradient-to-br from-zinc-800 to-zinc-900 rounded-2xl border border-zinc-700/50 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-zinc-600 text-sm font-semibold">Project Visual</div>
                      <div className="text-zinc-700 text-xs mt-1">[ Imagery ]</div>
                    </div>
                  </div>

                  {/* Project info */}
                  <div className="flex flex-col gap-2">
                    <h3 className="text-lg font-black uppercase tracking-tight text-zinc-100">
                      {project.title}
                    </h3>
                    <p className="text-xs text-zinc-400 leading-relaxed">{project.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
