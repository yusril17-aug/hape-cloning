'use client';

import { useRef } from 'react';
import type { RefObject } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(ScrollTrigger, useGSAP);

const aboutLines = [
  'Building immersive digital worlds for bold brands.',
  'We blend motion, storytelling, and high-end interfaces.',
  'Designed for future-ready products in Web3 culture.',
];

const contactLinks = ['X / TWITTER', 'INSTAGRAM', 'DISCORD', 'BEHANCE'];

type OverlayUIProps = {
  scrollProxyRef: RefObject<HTMLDivElement | null>;
};

export default function OverlayUI({ scrollProxyRef }: OverlayUIProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const aboutRef = useRef<HTMLDivElement>(null);
  const contactRef = useRef<HTMLDivElement>(null);
  const aboutLineRefs = useRef<(HTMLParagraphElement | null)[]>([]);
  const contactLinkRefs = useRef<(HTMLAnchorElement | null)[]>([]);

  useGSAP(
    () => {
      if (!scrollProxyRef.current) return;

      gsap.set([aboutRef.current, contactRef.current], { autoAlpha: 0 });
      gsap.set(aboutLineRefs.current, { y: 50, autoAlpha: 0 });
      gsap.set(contactLinkRefs.current, { y: 40, autoAlpha: 0 });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: scrollProxyRef.current,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 1,
        },
      });

      tl.to(heroRef.current, {
        scale: 1.2,
        autoAlpha: 0,
        ease: 'none',
        duration: 1.2,
      })
        .to(
          aboutRef.current,
          {
            autoAlpha: 1,
            duration: 0.2,
          },
          '>-0.2',
        )
        .to(
          aboutLineRefs.current,
          {
            y: 0,
            autoAlpha: 1,
            stagger: 0.1,
            ease: 'power2.out',
            duration: 0.8,
          },
          '<',
        )
        .to(aboutRef.current, {
          x: -120,
          y: 40,
          autoAlpha: 0,
          ease: 'power2.inOut',
          duration: 0.8,
        })
        .to(
          contactRef.current,
          {
            autoAlpha: 1,
            duration: 0.2,
          },
          '<0.2',
        )
        .to(
          contactLinkRefs.current,
          {
            y: 0,
            autoAlpha: 1,
            stagger: 0.08,
            ease: 'power2.out',
            duration: 0.8,
          },
          '<',
        );
    },
    { scope: rootRef },
  );

  return (
    <div
      ref={rootRef}
      className="absolute inset-0 z-20 h-[100dvh] pointer-events-none flex flex-col justify-between overflow-hidden text-white"
    >
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

      <section className="absolute inset-0 z-0">
        <div
          ref={heroRef}
          className="pointer-events-none select-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center text-[25vw] md:text-[15vw] font-black uppercase leading-[0.86] tracking-tight text-zinc-800/10"
        >
          HAPE
          <br />
          STUDIO
        </div>
      </section>

      <section className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
        <div className="h-[56vmin] w-[56vmin] rounded-full border border-dashed border-zinc-700/40 bg-transparent" />
      </section>

      <div className="pointer-events-none absolute inset-0 z-20">
        <section
          ref={aboutRef}
          className="absolute bottom-20 left-6 pointer-events-auto max-w-sm md:bottom-8 md:left-8"
        >
          <h2 className="mb-4 text-sm font-bold uppercase tracking-[0.2em] text-zinc-400">About</h2>
          <div className="space-y-2 text-zinc-300 text-xs md:text-sm leading-relaxed">
            {aboutLines.map((line, index) => (
              <p
                key={line}
                ref={(el) => {
                  aboutLineRefs.current[index] = el;
                }}
              >
                {line}
              </p>
            ))}
          </div>
        </section>

        <section
          ref={contactRef}
          className="absolute top-24 right-6 pointer-events-auto text-right md:top-auto md:bottom-8 md:right-8"
        >
          <h2 className="mb-5 text-sm font-bold uppercase tracking-[0.2em] text-zinc-400">Studio / Contact</h2>
          <div className="flex flex-col gap-2 md:gap-3">
            {contactLinks.map((label, index) => (
              <a
                key={label}
                href="#"
                ref={(el) => {
                  contactLinkRefs.current[index] = el;
                }}
                className="text-xl font-black uppercase tracking-tight text-zinc-200 transition-colors hover:text-white md:text-3xl"
              >
                {label}
              </a>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
