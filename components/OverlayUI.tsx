'use client';

import { useRef } from 'react';
import type { RefObject } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(ScrollTrigger);

// ─── Static Data (separated from animation logic) ─────────────────────────────
const aboutLines = [
  "We don't just build websites; we architect digital dimensions.",
  "At YSRL.Studio, we merge high-performance engineering with immersive 3D interactions to redefine the web experience.",
];

const contactLinks = ['X / TWITTER', 'INSTAGRAM', 'DISCORD', 'TELEGRAM'];

const worksProjects = [
  { id: 1, title: 'Aurora Protocol', description: 'Web3 interactive dashboard with real-time data visualization' },
  { id: 2, title: 'Nexus Experience', description: 'Immersive brand experience combining 3D and motion design' },
  { id: 3, title: 'Quantum UI', description: 'Advanced interface design for next-gen applications' },
  { id: 4, title: 'MotionFlow', description: 'Animation framework for seamless digital interactions' },
];

// ─── Scroll Zone Constants ────────────────────────────────────────────────────
// These mirror the KnotState zones in HeroKnot.tsx.
const ZONE = {
  HERO_OUT_START: 20,
  ABOUT_IN_START: 25,
  ABOUT_OUT_START: 45,
  WORKS_IN_START: 50,
  WORKS_SCROLL_END: 85,   // also works-out start
  CONTACT_IN_START: 90,
  TIMELINE_END: 100,
} as const;

// ─── Types ────────────────────────────────────────────────────────────────────
type OverlayUIProps = {
  scrollProxyRef: RefObject<HTMLDivElement | null>;
};

// ─── Component ────────────────────────────────────────────────────────────────
export default function OverlayUI({ scrollProxyRef }: OverlayUIProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const aboutRef = useRef<HTMLDivElement>(null);
  const contactRef = useRef<HTMLDivElement>(null);
  const worksContainerRef = useRef<HTMLDivElement>(null);
  const worksTrackRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      // ── Safety check ──────────────────────────────────────────────────────
      if (
        !scrollProxyRef.current ||
        !heroRef.current ||
        !aboutRef.current ||
        !worksContainerRef.current ||
        !worksTrackRef.current ||
        !contactRef.current
      ) return;

      // ── Master Timeline (0–100 maps to scroll 0%–100%) ─────────────────
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: scrollProxyRef.current,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 1,
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
      tl.addLabel('end', ZONE.TIMELINE_END);

      // ── ZONA 1 → 2: Hero text out ───────────────────────────────────────
      tl.to(heroRef.current, {
        opacity: 0,
        scale: 0.85,
        y: -30,
        duration: 5,
        ease: 'power2.inOut',
      }, ZONE.HERO_OUT_START);

      // ── ZONA 2: About in ────────────────────────────────────────────────
      tl.set(aboutRef.current, { visibility: 'visible' }, ZONE.ABOUT_IN_START);
      tl.fromTo(
        aboutRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 5, ease: 'power2.out' },
        ZONE.ABOUT_IN_START,
      );

      const aboutRevealElements = gsap.utils.toArray('.about-reveal', aboutRef.current);
      if (aboutRevealElements.length) {
        tl.fromTo(
          aboutRevealElements,
          { y: 30, opacity: 0 },
          { y: 0, opacity: 1, duration: 5, stagger: 1, ease: 'power3.out' },
          ZONE.ABOUT_IN_START + 1
        );
      }

      // About out
      tl.to(aboutRef.current, {
        opacity: 0,
        visibility: 'hidden',
        duration: 5,
        ease: 'power2.inOut',
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
        ease: 'none',
      }, ZONE.WORKS_IN_START);

      // Works out
      tl.to(worksContainerRef.current, {
        opacity: 0,
        visibility: 'hidden',
        duration: 5,
        ease: 'power2.inOut',
      }, ZONE.WORKS_SCROLL_END);

      // ── ZONA 4: Contact in ──────────────────────────────────────────────
      tl.set(contactRef.current, { visibility: 'visible' }, ZONE.CONTACT_IN_START);
      tl.fromTo(
        contactRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 4, ease: 'power2.out' },
        ZONE.CONTACT_IN_START,
      );

      const contactRevealElements = gsap.utils.toArray('.contact-reveal', contactRef.current);
      if (contactRevealElements.length) {
        tl.fromTo(
          contactRevealElements,
          { y: 30, opacity: 0 },
          { y: 0, opacity: 1, duration: 6, stagger: 1.2, ease: 'power3.out' },
          ZONE.CONTACT_IN_START + 1
        );
      }
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
          <a href="#" className="font-display font-extrabold tracking-tighter text-xl text-zinc-100">
            YSRL.Studio
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
          className="pointer-events-auto select-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center flex flex-col items-center justify-center w-full"
        >
          <div className="font-display text-[12vw] md:text-[9vw] font-black uppercase leading-[0.85] tracking-tighter text-zinc-800/20 whitespace-nowrap">
            YSRL.Studio
          </div>
          <div className="mt-6 md:mt-8 text-zinc-400 text-xs md:text-sm tracking-[0.2em] uppercase font-semibold font-sans">
            Ysrl — Lead Creative Developer & Digital Architect.
          </div>
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
          className="absolute inset-0 flex flex-col justify-center bg-transparent opacity-0 invisible pointer-events-none px-8 md:px-[10vw]"
        >
          <div className="w-full max-w-xl flex flex-col about-reveal">
            <h2 className="font-sans text-5xl md:text-[4.5rem] font-black uppercase leading-[0.85] tracking-tighter text-zinc-100 mb-6">
              THE ARCHITECTURE<br />OF CODE
            </h2>
            <div className="text-zinc-400 font-sans text-xs md:text-sm tracking-[0.2em] uppercase font-semibold leading-relaxed text-left max-w-xl">
              WE DON'T JUST BUILD WEBSITES; WE ARCHITECT DIGITAL DIMENSIONS. AT YSRL.STUDIO, WE MERGE HIGH-PERFORMANCE ENGINEERING WITH IMMERSIVE 3D INTERACTIONS TO REDEFINE THE WEB EXPERIENCE.
            </div>
          </div>
        </section>

        {/* ZONA 4: Contact / Footer */}
        <section
          ref={contactRef}
          className="absolute inset-x-0 bottom-0 px-8 md:px-16 pt-16 pb-8 bg-zinc-950/20 backdrop-blur-xl border-t border-zinc-800 opacity-0 invisible pointer-events-none flex flex-col"
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 w-full mx-auto">
            {/* KOLOM 1: Brand Quote */}
            <div className="col-span-1 md:col-span-2 flex flex-col justify-between contact-reveal">
              <h2 className="font-sans text-2xl md:text-3xl font-extrabold uppercase leading-tight tracking-tighter text-zinc-100">
                WE CODE, WE DESIGN,<br />WE ARCHITECT. WE ACT.
              </h2>
              <div className="mt-8 text-zinc-500 font-sans text-sm font-medium">
                YSRL.Studio / 2026
              </div>
            </div>

            {/* KOLOM 2: Call to Action */}
            <div className="contact-reveal flex flex-col">
              <h3 className="font-sans text-2xl md:text-3xl font-extrabold uppercase leading-tight tracking-tighter text-zinc-100">
                CONNECT<br />WITH<br />US
              </h3>
            </div>

            {/* KOLOM 3 & 4: Links */}
            <div className="contact-reveal flex flex-col gap-y-1.5">
              {['Instagram', 'X / Twitter', 'Telegram', 'Discord', 'Linkedin'].map((link) => (
                <a
                  key={link}
                  href="#"
                  className="group flex items-center gap-2 text-xs text-zinc-400 hover:text-white transition-colors w-fit font-sans uppercase font-semibold tracking-wider"
                >
                  {link}
                  <svg className="w-3 h-3 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
                  </svg>
                </a>
              ))}
            </div>
          </div>

          {/* BOTTOM BAR: Legals */}
          <div className="mt-16 pt-6 border-t border-zinc-900 flex flex-col md:flex-row justify-between items-center gap-6 text-xs text-zinc-600 font-sans contact-reveal">
            <div>© 2026 YSRL.Studio</div>
            <div className="flex flex-wrap justify-center gap-6 uppercase tracking-widest font-medium">
              <a href="#" className="hover:text-zinc-300 transition-colors">STYLED BY @YSRL.STUDIO</a>
              <a href="#" className="hover:text-zinc-300 transition-colors">TERMS & CONDITIONS</a>
              <a href="#" className="hover:text-zinc-300 transition-colors">PRIVACY POLICY</a>
            </div>
            <svg className="w-4 h-4 text-zinc-500 hidden md:block" viewBox="0 0 24 24" fill="currentColor">
              <rect x="3" y="14" width="4" height="7" rx="1" />
              <rect x="10" y="10" width="4" height="11" rx="1" />
              <rect x="17" y="4" width="4" height="17" rx="1" />
            </svg>
          </div>
        </section>

        {/* ZONA 3: Works */}
        <section
          ref={worksContainerRef}
          className="absolute inset-0 overflow-hidden opacity-0 invisible pointer-events-none"
        >
          <div className="absolute inset-0 flex flex-col justify-start pt-12 md:pt-20">
            <h2 className="px-6 md:px-8 mb-12 font-display text-sm font-bold uppercase tracking-[0.2em] text-zinc-400">
              Selected Works
            </h2>

            {/* Horizontal Scroll Track */}
            <div
              ref={worksTrackRef}
              className="flex gap-16 px-[10vw] will-change-transform w-max"
            >
              {worksProjects.map((project, index) => (
                <div key={project.id} className="flex-shrink-0 w-80 flex flex-col gap-4">
                  {/* Thumbnail placeholder - Cyber-Wireframe */}
                  <div className="w-80 h-48 rounded-2xl border border-zinc-800 bg-zinc-950/30 backdrop-blur-md flex items-center justify-center transition-all duration-500 hover:border-zinc-500 hover:bg-zinc-900/50">
                    <div className="text-center flex flex-col items-center">
                      <div className="text-zinc-600 text-xs tracking-widest font-mono">[ ASSET PENDING ]</div>
                      <div className="mt-2 text-zinc-400 text-sm font-mono">INDEX_0{index + 1}</div>
                    </div>
                  </div>

                  {/* Project info */}
                  <div className="flex flex-col gap-2">
                    <h3 className="font-display text-lg font-black uppercase tracking-tight text-zinc-100">
                      {project.title}
                    </h3>
                    <p className="text-xs text-zinc-400 leading-relaxed font-sans">{project.description}</p>
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
